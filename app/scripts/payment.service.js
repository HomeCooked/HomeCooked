(function() {
    'use strict';

    angular.module('HomeCooked.services').factory('PaymentService', PaymentService);

    PaymentService.$inject = ['$http', 'ENV'];
    function PaymentService($http, ENV) {
        var baseUrl = ENV.BASE_URL + '/api/v1/';

        return {
            savePaymentInfo: savePaymentInfo,
            order: order
        };

        function savePaymentInfo(info) {
            return $http.post(baseUrl + 'payment-info/', info);
        }

        function order(payload) {
            return $http.post(baseUrl + ':dishId/order/', payload);
        }
    }
})();
