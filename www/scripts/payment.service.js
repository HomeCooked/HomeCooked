(function() {
    'use strict';

    angular.module('HomeCooked.services').factory('PaymentService', PaymentService);

    PaymentService.$inject = ['$http', 'LoginService', 'ChefService', 'ENV'];

    function PaymentService($http, LoginService, ChefService, ENV) {
        var baseUrl = ENV.BASE_URL + '/api/v1/';

        return {
            savePaymentInfo: savePaymentInfo,
            holdBatch: holdBatch,
            deleteBatch: deleteBatch,
            cancelOrder: cancelOrder,
            getCheckoutInfo: getCheckoutInfo,
            checkout: checkout
        };

        function savePaymentInfo(info) {
            if (LoginService.getChefMode()) {
                return saveChefPaymentInfo(info);
            }
            return handleResponses($http.post(baseUrl + 'users/' + LoginService.getUser().id + '/add_payment_method/', info)).then(LoginService.reloadUser);
        }

        function saveChefPaymentInfo(info) {
            return handleResponses($http.post(baseUrl + 'chefs/' + ChefService.getChef().id + '/add_payment_method/', info)).then(ChefService.reloadChef);
        }

        function holdBatch(payload) {
            return handleResponses($http.post(baseUrl + 'batches/' + payload.batchId + '/hold_batch_for_user/', payload));
        }

        function deleteBatch(batches) {
            var payload = {
                portions: batches
            };
            return handleResponses($http.post(baseUrl + 'users/remove_portions_from_cart/', payload));
        }

        function getCheckoutInfo() {
            return handleResponses($http.get(baseUrl + 'users/held_batches/'));
        }

        function cancelOrder() {
            return handleResponses($http.delete(baseUrl + 'users/held_batches/'));
        }

        function checkout(portions, deliveryType, address) {
            var payload = {
                card_id: LoginService.getUser().payment_info.id,
                portions: portions,
                delivery_type: deliveryType,
                address: address
            };
            return handleResponses($http.post(baseUrl + 'orders/order_meal/', payload));
        }

        function handleResponses(httpPromise) {
            return httpPromise.then(function(response) {
                return response.data;
            });
        }
    }
})();
