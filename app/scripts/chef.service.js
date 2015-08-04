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
            notifyDelivered: notifyDelivered
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
            //TODO read this from server!!
            var chefData = {
                maxDishes: 100,
                maxDishPrice: 100,
                maxBatches: 3,
                maxBatchQuantity: 25,
                serviceDays: [   // array of 7 objects --> 7 days of the week
                    {
                        week_day: 0,
                        is_active: false,
                        start_minute: null,
                        end_minute: null
                    }, {
                        week_day: 1,
                        is_active: false,
                        start_minute: null,
                        end_minute: null
                    }, {
                        week_day: 2,
                        is_active: false,
                        start_minute: null,
                        end_minute: null
                    }, {
                        week_day: 3,
                        is_active: true,
                        start_minute: 18 * 60,
                        end_minute: 21 * 60
                    }, {
                        week_day: 4,
                        is_active: true,
                        start_minute: 18 * 60,
                        end_minute: 21 * 60
                    }, {
                        week_day: 5,
                        is_active: false,
                        start_minute: null,
                        end_minute: null
                    }, {
                        week_day: 6,
                        is_active: false,
                        start_minute: null,
                        end_minute: null
                    }
                ]
            };
            return $q.when(chefData);
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
    }
})();
