(function() {
    'use strict';
    angular.module('HomeCooked.services').factory('ChefService', ChefService);

    ChefService.$inject = ['$q', '$http', 'ENV'];
    function ChefService($q, $http, ENV) {
        var baseUrl = ENV.BASE_URL + '/api/v1/';

        return {
            getOrders: getOrders,
            getBatches: getBatches,
            addBatch: addBatch,
            deleteBatch: deleteBatch,
            getChefData: getChefData,
            getChef: getChef,
            setChefBio: setChefBio,
            cancelOrder: cancelOrder,
            getPickupTimes: getPickupTimes
        };


        function handleResponses(httpPromise) {
            return httpPromise.then(function(response) {
                return response.data;
            });
        }

        function getOrders() {
            return handleResponses($http.get(baseUrl + 'orders/current_orders/'));
        }

        function getBatches() {
            return handleResponses($http.get(baseUrl + 'batches/'));
        }

        function addBatch(batch) {
            return handleResponses($http.post(baseUrl + 'batches/', batch)).then(getBatches);
        }

        function deleteBatch(batch) {
            return handleResponses($http.post(baseUrl + 'batches/' + batch.id + '/deactivate_batch/')).then(getBatches);
        }

        function getChefData() {
            //TODO read this from server!!
            var chefData = {
                maxPrice: 100,
                maxQuantity: 25,
                maxBatches: 3
            };
            return $q.when(chefData);
        }

        function getChef(chefId, details) {
            return handleResponses($http.get(baseUrl + 'chefs/' + chefId + '/' + (details ? 'get_chef_details/' : '')));
        }

        function setChefBio(chefId, bio) {
            return handleResponses($http.patch(baseUrl + 'chefs/' + chefId + '/', {user: chefId, bio: bio}));
        }

        function getPickupTimes() {
            return $q.when([
                {'id': 0, 'title': 'Friday (6pm-9pm)'},
                {'id': 24, 'title': 'Saturday (6pm-9pm)'}
            ]);
        }

        function cancelOrder(orderId, reason) {
            return handleResponses($http.post(baseUrl + 'chefs/cancel_order/', {orderId: orderId, reason: reason}));
        }
    }
})();
