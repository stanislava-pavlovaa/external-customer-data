"use strict";

var LocalServiceRegistry = require("dw/svc/LocalServiceRegistry");

function executeService(method, route, body) {
    var service = LocalServiceRegistry.createService("http.customers.service", {
        createRequest: function (svc, args) {
            svc.setRequestMethod(method);
            svc.URL += route;
            svc.addHeader("Content-Type", "application/json");
            return JSON.stringify(body);
        },

        parseResponse: function (svc, client) {
            var response = JSON.parse(client.text);
            return response;
        },

        filterLogMessage: function (msg) {
            return msg.replace(
                /"phone":"\d+"/, "phone:**********"
            );
        },
    });

    var response = service.call().object

    return response;
}

module.exports = {
    executeService: executeService,
};
