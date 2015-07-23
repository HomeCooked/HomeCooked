'use strict';
angular.module('HomeCooked.services')
  .factory('ChefService', ['$q', '$http', '$timeout', 'ENV', 'CacheService', '_',
    function($q, $http, $timeout, ENV, CacheService, _) {
      var baseUrl = ENV.BASE_URL + '/api/v1/';

      var ordersReady;

      var handleResponses = function(httpPromise) {
        return httpPromise.then(function(response) {
          return response.data;
        });
      };
      var wait = function(ms) {
        return $timeout(function() {
        }, ms || 0);
      };

      var getOrders = function() {
        ordersReady = ordersReady || handleResponses($http.get('mock/orders.json'));
        return ordersReady;
      };

      var getBatches = function() {
        return handleResponses($http.get(baseUrl + 'batches/'));
      };

      var getDishes = function() {
        return handleResponses($http.get(baseUrl + 'dishes/'));
      };

      var addDish = function(dish) {
        return handleResponses($http.post(baseUrl + 'dishes/', dish)).then(getDishes);
      };


      var deleteDish = function(dish) {
        return handleResponses($http.delete(baseUrl + 'dishes/' + dish.id + '/'));
      };


      var addBatch = function(batch) {
        return handleResponses($http.post(baseUrl + 'batches/', batch)).then(getBatches);
      };

      var removeBatchAvailablePortions = function(batch) {
        //FIXME remove this and call the service
        return $q.all([getBatches(), wait(300)])
          .then(function(values) {
            var batches = values[0];
            var i = _.findIndex(batches, {'dishId': batch.dishId, 'price': batch.price});
            if (i >= 0) {
              var localBatch = batches[i];
              localBatch.quantity = localBatch.quantityOrdered;
              //will remove current batch if empty
              if (localBatch.quantity === 0) {
                batches.splice(i, 1);
              }
            }

            return batches;
          });

        //return handleResponses($http.delete(baseUrl + 'batches/' + batch.id)).then(getBatches);
      };

      var getChefData = function() {
        //TODO read this from server!!
        var chefData = {
          maxPrice: 100,
          maxQuantity: 25,
          maxBatches: 3
        };
        return $q.when(chefData);
      };

      var getChefInfo = function(chefId) {
        return handleResponses($http.get(baseUrl + 'chefs/' + chefId + '/'));
      };

      var setChefBio = function(chefId, bio) {
        return handleResponses($http.patch(baseUrl + 'chefs/' + chefId + '/', {user: chefId, bio: bio}));
      };

      var isDishesTutorialDone = function() {
        var tutorialDone = CacheService.getValue('dishesTutorialDone') === true;
        return $q.when(tutorialDone);
      };

      var setDishesTutorialDone = function() {
        CacheService.setValue({'dishesTutorialDone': true});
        return $q.when();
      };

      return {
        getOrders: getOrders,
        getBatches: getBatches,
        getDishes: getDishes,
        addDish: addDish,
        deleteDish: deleteDish,
        addBatch: addBatch,
        removeBatchAvailablePortions: removeBatchAvailablePortions,
        getChefData: getChefData,
        getChefInfo: getChefInfo,
        setChefBio: setChefBio,
        isDishesTutorialDone: isDishesTutorialDone,
        setDishesTutorialDone: setDishesTutorialDone
      };
    }]
);
