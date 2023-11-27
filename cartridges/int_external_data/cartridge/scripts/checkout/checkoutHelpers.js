'use strict';

var base = module.superModule;

var HookMgr = require('dw/system/HookMgr');
var OrderMgr = require('dw/order/OrderMgr');
var Order = require('dw/order/Order');
var Status = require('dw/system/Status');
var Transaction = require('dw/system/Transaction');

/**
 * Attempts to place the order
 * @param {dw.order.Order} order - The order object to be placed
 * @param {Object} fraudDetectionStatus - an Object returned by the fraud detection hook
 * @returns {Object} an error object
 */
function placeOrder(order, fraudDetectionStatus) {
    var result = { error: false };
    
    var response;
    var billingAddress = order.billingAddress;
    var shippingAddress = order.shipments[0].shippingAddress;

    // external service
    if (HookMgr.hasHook("external.customers.data")) {
        response = HookMgr.callHook(
            "external.customers.data",
            "addShippingAndBillingAddresses",
            billingAddress,
            shippingAddress
        );
    } 

    if (response) {
        try {
            Transaction.begin();
            var placeOrderStatus = OrderMgr.placeOrder(order);
            if (placeOrderStatus === Status.ERROR) {
                throw new Error();
            }

            if (fraudDetectionStatus.status === 'flag') {
                order.setConfirmationStatus(Order.CONFIRMATION_STATUS_NOTCONFIRMED);
            } else {
                order.setConfirmationStatus(Order.CONFIRMATION_STATUS_CONFIRMED);
            }

            order.setExportStatus(Order.EXPORT_STATUS_READY);
            Transaction.commit();
        } catch (e) {
            Transaction.wrap(function () { OrderMgr.failOrder(order, true); });
            result.error = true;
        }
    }

    return result;
}

base.placeOrder = placeOrder;

module.exports = base;