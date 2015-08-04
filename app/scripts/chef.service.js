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
            notifyDelivered: notifyDelivered,
            setDishesTutorialDone: setDishesTutorialDone,
            setBatchesTutorialDone:setBatchesTutorialDone
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
            return handleResponses($http.post(baseUrl + 'batches/', batch));
        }

        function deleteBatch(batch) {
            return handleResponses($http.post(baseUrl + 'batches/' + batch.id + '/deactivate_batch/'));
        }

        function getChefData() {
            return handleResponses($http.get(baseUrl + 'chefs/chef_config/'));
        }

        function getChef(chefId, details) {
            return handleResponses($http.get(baseUrl + 'chefs/' + chefId + '/' + (details ? 'get_chef_details/' : '')));
        }

        function setChefBio(chefId, bio) {
            return handleResponses($http.patch(baseUrl + 'chefs/' + chefId + '/', {user: chefId, bio: bio}));
        }

        function cancelOrder(orderId) {
            return handleResponses($http.delete(baseUrl + 'orders/' + orderId + '/'));
        }

        function notifyDelivered(orderId) {
            return handleResponses($http.post(baseUrl + 'chefs/notify_delivered_order/', {orderId: orderId}));
        }

        function setDishesTutorialDone(chefId) {
            return handleResponses($http.patch(baseUrl + 'chefs/' + chefId + '/', {
                dishes_tutorial_completed: true
            }));
        }
        function setBatchesTutorialDone(chefId) {
            return handleResponses($http.patch(baseUrl + 'chefs/' + chefId + '/', {
                batches_tutorial_completed: true
            }));
        }
    }
})();
