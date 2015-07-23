(function() {
    'use strict';
    angular.module('HomeCooked.services').factory('ChefService', ChefService);

    ChefService.$inject = ['$q', '$http', 'ENV', 'CacheService'];
    function ChefService($q, $http, ENV, CacheService) {
        var baseUrl = ENV.BASE_URL + '/api/v1/';

        var ordersReady;

        return {
            getOrders: getOrders,
            getBatches: getBatches,
            getDishes: getDishes,
            getDish: getDish,
            addDish: addDish,
            deleteDish: deleteDish,
            addBatch: addBatch,
            deleteBatch: deleteBatch,
            getChefData: getChefData,
            getChef: getChef,
            setChefBio: setChefBio,
            isDishesTutorialDone: isDishesTutorialDone,
            setDishesTutorialDone: setDishesTutorialDone
        };


        function handleResponses(httpPromise) {
            return httpPromise.then(function(response) {
                return response.data;
            });
        }

        function getOrders() {
            ordersReady = ordersReady || handleResponses($http.get('mock/orders.json'));
            return ordersReady;
        }

        function getBatches() {
            return handleResponses($http.get(baseUrl + 'batches/'));
        }

        function getDishes() {
            return handleResponses($http.get(baseUrl + 'dishes/'));
        }

        function getDish(dishId) {
            return handleResponses($http.get(baseUrl + 'dishes/' + dishId));
        }

        function addDish(dish) {
            return handleResponses($http.post(baseUrl + 'dishes/', dish)).then(getDishes);
        }

        function deleteDish(dish) {
            return handleResponses($http.delete(baseUrl + 'dishes/' + dish.id + '/'));
        }

        function addBatch(batch) {
            return handleResponses($http.post(baseUrl + 'batches/', batch)).then(getBatches);
        }

        function deleteBatch(batch) {
            return handleResponses($http.delete(baseUrl + 'batches/' + batch.id + '/')).then(getBatches);
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

        function isDishesTutorialDone() {
            var tutorialDone = CacheService.getValue('dishesTutorialDone') === true;
            return $q.when(tutorialDone);
        }

        function setDishesTutorialDone() {
            CacheService.setValue({'dishesTutorialDone': true});
            return $q.when();
        }
    }
})();
