(function() {
    'use strict';

    angular.module('HomeCooked.services').factory('PaymentService', PaymentService);

    PaymentService.$inject = ['$http', 'LoginService', 'ENV'];
    function PaymentService($http, LoginService, ENV) {
        var baseUrl = ENV.BASE_URL + '/api/v1/';

        return {
            savePaymentInfo: savePaymentInfo,
            holdBatch: holdBatch,
            cancelOrder: cancelOrder,
            getCheckoutDetails: getCheckoutDetails,
            checkout: checkout
        };

        function savePaymentInfo(info) {
            return $http.post(baseUrl + 'users/' + LoginService.getUser().id + '/add_payment_method/', info);
        }

        function holdBatch(payload) {
            return $http.post(baseUrl + 'batches/' + payload.dishId + '/hold_batch_for_user/', payload);
        }

        function getCheckoutDetails(chefId) {
            return $http.get(baseUrl + 'users/' + LoginService.getUser().id + '/held_batches/' + chefId + '/');
        }

        function cancelOrder(chefId) {
            return $http.delete(baseUrl + 'users/' + LoginService.getUser().id + '/held_batches/' + chefId + '/');
        }

        function checkout(payload) {
            return $http.post(baseUrl + 'orders/order_meal', payload);
        }
    }
})();
