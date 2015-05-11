'use strict';
angular.module('HomeCooked.services')
  .factory('ChefService', ['$q', '$http', 'ENV', '_', 'LoginService',
    function($q, $http, ENV, _, LoginService) {
      var self = {};
      var ordersReady, dishesReady, batchesReady;

      var handleResponses = function(httpPromise) {
        return httpPromise
          .then(function(response) {
            return response.data;
          })
          .catch(function(error) {
            throw Error(error.data);
          });
      }

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
        return $q.all([self.getDishes(), self.getBatches()]).then(function(values) {
          var dishes = values[0], batches = values[1];
          //FIXME remove this and call the service
          var oldBatch = _.find(batches, {'dishId': batch.dishId});
          if (oldBatch && oldBatch.price === batch.price) {
            oldBatch.quantity += batch.quantity;
          }
          else {
            var dish = _.find(dishes, {'id': batch.dishId});
            var newBatch = {
              dishImage: 'images/logo.png',
              dishId: batch.dishId,
              dishName: dish.name,
              quantity: batch.quantity,
              quantityOrdered: 0,
              price: batch.price,
              orders: []
            };
            batches.push(newBatch);
          }
          return $q.when(batches);


          //var deferred = $q.defer();
          //$http.post(ENV.BASE_URL + '/batches/', batch)
          //  .success(deferred.resolve)
          //  .error(function (data) {
          //    deferred.reject(JSON.stringify(data));
          //  });
          //return deferred.promise;
        });
      };

      self.removeBatchAvailablePortions = function(batch) {
        return $q.when(batchesReady)
          .then(function(batches) {
            //FIXME remove this and call the service
            var i = _.findIndex(batches, {'dishId': batch.dishId, 'price': batch.price});
            if (i >= 0) {
              var localBatch = batches[i];
              localBatch.quantity = localBatch.quantityOrdered;
              //will remove current batch if empty
              if (localBatch.quantity === 0) {
                batches.splice(i, 1);
              }
            }
            return $q.when(batches);
          });
      };

      self.removeAllAvailablePortions = function() {
        return $q.when(batchesReady)
          .then(function(batches) {
            //FIXME remove this and call the service
            _.remove(batches, function(batch) {
              batch.quantity = batch.quantityOrdered;
              return batch.quantity === 0;
            });
            return $q.when(batches);
          });
      };

      self.becomeChef = function(chefInfo) {
        //FIXME remove this and use real service
        return $q.when('OK', chefInfo);

        //var deferred = $q.defer();
        //$http.post(ENV.BASE_URL + '/enroll/', chefInfo)
        //  .success(deferred.resolve)
        //  .error(function (data) {
        //    deferred.reject(JSON.stringify(data));
        //  });
        //return deferred.promise;
      };

      self.maxBatches = function() {
        //TODO read this from server!!
        return 3;
      };

      return self;
    }]
);
