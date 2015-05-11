'use strict';
angular.module('HomeCooked.services')
  .factory('ChefService', ['$q', '$http', '$timeout', 'ENV', '_', 'LoginService',
    function($q, $http, $timeout, ENV, _, LoginService) {
      var self = {};
      var ordersReady, dishesReady, batchesReady;

      var handleResponses = function(httpPromise) {
        return httpPromise
          .then(function(response) {
            return response.data;
          })
          .catch(function(error) {
            throw new Error(error.data);
          });
      };
      var wait = function(ms) {
        return $timeout(function() {
        }, ms || 0);
      };

      self.getOrders = function() {
        ordersReady = ordersReady || handleResponses($http.get('mock/orders.json'));
        return ordersReady;
      };

      self.getBatches = function() {
        batchesReady = batchesReady || handleResponses($http.get('mock/batches.json'));
        return batchesReady;
      };

      self.getDishes = function() {
        dishesReady = dishesReady || handleResponses($http.get(ENV.BASE_URL + '/dishes/'));
        return dishesReady;
      };

      self.addDish = function(dish) {
        //FIXME should remove the user id from here!
        dish.user = LoginService.getUser().id;
        return handleResponses($http.post(ENV.BASE_URL + '/dishes/', dish))
          .then(function() {
            //invalidate dishes so they will be reloaded
            dishesReady = null;
            return self.getDishes();
          });
      };


      self.addBatch = function(batch) {
        //FIXME remove this and call the service
        return $q.all([self.getDishes(), self.getBatches(), wait(300)]).then(function(values) {
          var dishes = values[0], batches = values[1];
          var oldBatch = _.find(batches, {'dishId': batch.dishId});
          if (oldBatch && oldBatch.price === batch.price) {
            oldBatch.quantity += batch.quantity;
          }
          else {
            var dish = _.find(dishes, {'id': batch.dishId});
            var newBatch = {
              dishImage: 'images/logo.png',
              dishId: batch.dishId,
              dishName: dish.title,
              quantity: batch.quantity,
              quantityOrdered: 0,
              price: batch.price,
              orders: []
            };
            batches.push(newBatch);
          }
          return batches;
        });

        return handleResponses($http.post(ENV.BASE_URL + '/batches/', batch))
          .then(function() {
            //invalidate dishes so they will be reloaded
            batchesReady = null;
            return self.getBatches();
          });
      };

      self.removeBatchAvailablePortions = function(batch) {
        //FIXME remove this and call the service
        return $q.all([self.getBatches(), wait(300)])
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


        return handleResponses($http.post(ENV.BASE_URL + '/batches/remove', batch.id))
          .then(function() {
            //invalidate batches so they will be reloaded
            batchesReady = null;
            return self.getBatches();
          });
      };

      self.getChefData = function() {
        //TODO read this from server!!
        var chefData = {
          maxPrice: 100,
          maxQuantity: 25,
          maxBatches: 3
        };
        return $q.when(chefData);
      };

      return self;
    }]
);
