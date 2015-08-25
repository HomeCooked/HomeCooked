(function() {
    'use strict';
    angular.module('HomeCooked.services').factory('ChefService', ChefService);

    ChefService.$inject = ['$q', '$http', 'ENV', 'CacheService', '_'];
    function ChefService($q, $http, ENV, CacheService, _) {
        var chef = {},
            chefDeferred = $q.defer(),
            baseUrl = ENV.BASE_URL + '/api/v1/';
        setChef(CacheService.getValue('chef'));

        return {
            chefReady: chefReady,
            reloadChef: reloadChef,
            getOrders: getOrders,
            getBatches: getBatches,
            addBatch: addBatch,
            deleteBatch: deleteBatch,
            getChefData: getChefData,
            getChef: getChef,
            getChefDetails: getChefDetails,
            cancelOrder: cancelOrder,
            notifyDelivered: notifyDelivered,
            saveChefData: saveChefData
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

        function getChef() {
            return chef;
        }

        function chefReady() {
            return chefDeferred.promise;
        }

        function getChefDetails(chefId) {
            return handleResponses($http.get(baseUrl + 'chefs/' + chefId + '/get_chef_details/'));
        }

        function cancelOrder(orderId) {
            return handleResponses($http.post(baseUrl + 'chefs/cancel_order/', {id: orderId}));
        }

        function notifyDelivered(orderId) {
            return handleResponses($http.post(baseUrl + 'chefs/notify_delivered_order/', {orderId: orderId}));
        }

        function saveChefData(data) {
            data.phone_number = serializePhone(data.phone_number);
            return handleResponses($http.patch(baseUrl + 'chefs/' + chef.id + '/', data)).then(handleChef);
        }


        function serializePhone(phone) {
            if (phone && (phone + '').indexOf('1') !== 0) {
                return '1' + phone;
            }
            return phone;
        }

        function deserializePhone(phone) {
            var res = parseInt(phone, 10);
            if (isNaN(res)) {
                return '';
            }
            return res;
        }

        function reloadChef(user) {
            return handleResponses($http.get(baseUrl + 'users/' + user.id + '/get_chef/')).then(handleChef, invalidateChef);
        }

        function invalidateChef() {
            setChef();
            CacheService.setValue({chef: chef});
            return $q.when(chef);
        }

        function handleChef(newChef) {
            setChef(newChef);
            CacheService.setValue({chef: chef});
            chefDeferred.resolve(chef);
            return chef;
        }

        function setChef(newChef) {
            if (_.isEmpty(newChef)) {
                _.forEach(chef, function(val, key) {
                    chef[key] = undefined;
                    delete chef[key];
                });
            }
            else {
                newChef.phone_number = deserializePhone(newChef.phone_number);
                _.assign(chef, newChef);
            }
        }
    }
})();
