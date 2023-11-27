'use strict';

var server = require('server');
server.extend(module.superModule);

var URLUtils = require('dw/web/URLUtils');
var Resource = require('dw/web/Resource');
var csrfProtection = require('*/cartridge/scripts/middleware/csrf');
/**
 * Address-SaveAddress : Save a new or existing address
 * @name Base/Address-SaveAddress
 * @function
 * @memberof Address
 * @param {middleware} - csrfProtection.validateAjaxRequest
 * @param {querystringparameter} - addressId - a string used to identify the address record
 * @param {httpparameter} - dwfrm_address_addressId - An existing address id (unless new record)
 * @param {httpparameter} - dwfrm_address_firstName - A person’s first name
 * @param {httpparameter} - dwfrm_address_lastName - A person’s last name
 * @param {httpparameter} - dwfrm_address_address1 - A person’s street name
 * @param {httpparameter} - dwfrm_address_address2 -  A person’s apartment number
 * @param {httpparameter} - dwfrm_address_country - A person’s country
 * @param {httpparameter} - dwfrm_address_states_stateCode - A person’s state
 * @param {httpparameter} - dwfrm_address_city - A person’s city
 * @param {httpparameter} - dwfrm_address_postalCode - A person’s united states postel code
 * @param {httpparameter} - dwfrm_address_phone - A person’s phone number
 * @param {httpparameter} - csrf_token - hidden input field CSRF token
 * @param {category} - sensitive
 * @param {returns} - json
 * @param {serverfunction} - post
 */
server.replace('SaveAddress', csrfProtection.validateAjaxRequest, function (req, res, next) {
    var CustomerMgr = require('dw/customer/CustomerMgr');
    var Transaction = require('dw/system/Transaction');
    var HookMgr = require('dw/system/HookMgr');
    var UUIDUtils = require("dw/util/UUIDUtils");

    var formErrors = require('*/cartridge/scripts/formErrors');
    var accountHelpers = require('*/cartridge/scripts/helpers/accountHelpers');
    var addressHelpers = require('*/cartridge/scripts/helpers/addressHelpers');

    var addressForm = server.forms.getForm('address');
    var addressFormObj = addressForm.toObject();
    addressFormObj.addressForm = addressForm;
    var customer = CustomerMgr.getCustomerByCustomerNumber(req.currentCustomer.profile.customerNo);
    var addressBook = customer.getProfile().getAddressBook();

    var profile = customer.getProfile();

    if (addressForm.valid) {
        res.setViewData(addressFormObj);
        this.on('route:BeforeComplete', function () { // eslint-disable-line no-shadow
            var formInfo = res.getViewData();
            var response;

            // external service
            var service = HookMgr.hasHook("external.customers.data");
            if (service && req.querystring.addressId) { 
                var address = addressBook.getAddress(req.querystring.addressId)
                response =  HookMgr.callHook(
                    "external.customers.data",
                    "updateAddress",
                    address.custom.externalAddressID, 
                    formInfo
                );
            } else if (service && !addressBook.getAddress(formInfo.addressId)) {
                var externalAddressID = UUIDUtils.createUUID();
                response = HookMgr.callHook(
                    "external.customers.data",
                    "createAddress",
                    externalAddressID,
                    formInfo
                );
            }

            if(response) {
                Transaction.wrap(function () {
                    var address = null;
                    if (formInfo.addressId.equals(req.querystring.addressId) || !addressBook.getAddress(formInfo.addressId)) {
                        address = req.querystring.addressId
                            ? addressBook.getAddress(req.querystring.addressId)
                            : addressBook.createAddress(formInfo.addressId);
                    }

                    if (address) {
                        if (externalAddressID) address.getCustom().externalAddressID = externalAddressID;
                        if (req.querystring.addressId) {
                            address.setID(formInfo.addressId);
                        }

                        // Save form's address
                        addressHelpers.updateAddressFields(address, formInfo);

                        // Send account edited email
                        accountHelpers.sendAccountEditedEmail(customer.profile);

                        res.json({
                            success: true,
                            redirectUrl: URLUtils.url('Address-List').toString()
                        });
                    } else {
                        formInfo.addressForm.valid = false;
                        formInfo.addressForm.addressId.valid = false;
                        formInfo.addressForm.addressId.error =
                            Resource.msg('error.message.idalreadyexists', 'forms', null);
                        res.json({
                            success: false,
                            fields: formErrors.getFormErrors(addressForm)
                        });
                    }
                });
            } else {
                res.setStatusCode(500);
                res.json({
                    success: false,
                    errorMessage: Resource.msg('subheading.error.general', 'error', null)
                });
            }
             
        });
    } else {
        res.json({
            success: false,
            fields: formErrors.getFormErrors(addressForm)
        });
    }
    return next();
});

module.exports = server.exports();
