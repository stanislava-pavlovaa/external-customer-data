var customersService = require("*/cartridge/scripts/customersService.js");

function createUser(id, registrationFormObj) {
    var userObject = {
        'id': id,
        'firstName': registrationFormObj.firstName,
        'lastName': registrationFormObj.lastName,
        'phone': registrationFormObj.phone,
        'email': registrationFormObj.email,
    };

    return customersService.executeService("POST", "/customers", userObject);
}

function updateCustomerData(id, form) {
    var userObject = {
        'firstName': form.firstName,
        'lastName': form.lastName,
        'phone': form.phone,
        'email': form.email,
    };

    return customersService.executeService("PATCH", `/customers/${id}`, userObject);
}

function createAddress(addressId, form) {
    var addressObject = {
        'id': addressId,
        'addressId': form.addressId,
        'firstName': form.firstName,
        'lastName': form.lastName,
        'address1': form.address1,
        'address2': form.address2,
        'county': form.county,
        'stateCode': form.states.stateCode,
        'city': form.city,
        'postalCode': form.postalCode,
        'phone': form.phone,
    };

    return customersService.executeService("POST", `/addressBook/`, addressObject);
}

function updateAddress(id, form) {
    var addressObject = {
        'addressId': form.addressId,
        'firstName': form.firstName,
        'lastName': form.lastName,
        'address1': form.address1,
        'address2': form.address2,
        'county': form.county,
        'stateCode': form.states.stateCode,
        'city': form.city,
        'postalCode': form.postalCode,
        'phone': form.phone,
    };

    return customersService.executeService("PATCH", `/addressBook/${id}`, addressObject);
}

function addShippingAndBillingAddresses(billingAddress, shippingAddress) {
    var addressObject = {
        'billingAddress': {
            'address1': billingAddress.address1,
            'address2': billingAddress.address2,
            'city': billingAddress.city,
            'customerFullName': billingAddress.fullName,
            'customerPhone': billingAddress.phone,
            'postalCode': billingAddress.postalCode,
            'countryCode': billingAddress.countryCode,
        },
        'shippingAddress': {
            'address1': shippingAddress.address1,
            'address2': shippingAddress.address2,
            'city': shippingAddress.city,
            'customerFullName': shippingAddress.fullName,
            'customerPhone': shippingAddress.phone,
            'postalCode': shippingAddress.postalCode,
            'countryCode': shippingAddress.countryCode,
        },
    };

    return customersService.executeService("POST", '/shippingAndBillingAddress' , addressObject);
}

module.exports = {
    createUser: createUser,
    updateCustomerData: updateCustomerData,
    createAddress: createAddress,
    updateAddress: updateAddress,
    addShippingAndBillingAddresses: addShippingAndBillingAddresses
};
