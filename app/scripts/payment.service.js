(function() {
    'use strict';

    angular.module('HomeCooked.services').factory('PaymentService', PaymentService);

    PaymentService.$inject = ['$http', 'LoginService', 'ENV'];
    function PaymentService($http, LoginService, ENV) {
        var baseUrl = ENV.BASE_URL + '/api/v1/';

        return {
            savePaymentInfo: savePaymentInfo,
            order: order
        };

        function savePaymentInfo(info) {
            return $http.post(baseUrl + 'users/' + LoginService.getUser().id + '/add_payment_method/', info);
        }

        function order(payload) {
            return $http.post(baseUrl + ':dishId/order/', payload);
        }
    }
})();
