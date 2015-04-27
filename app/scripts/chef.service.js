'use strict';
angular.module('HomeCooked.services')
  .factory('ChefService', ['$q', '$http', 'BASE_URL', '_',
    function ($q, $http, BASE_URL, _) {
      var self = {};
      var orders, dishes, batches;

      self.getOrders = function () {
        return $http.get('mock/orders.json')
          .then(function (data) {
            orders = data.data;
            return orders;
          });
      };

      self.getBatches = function () {
        return $http.get('mock/batches.json')
          .then(function (data) {
            batches = data.data;
            return batches;
          });
      };

      self.getDishes = function () {
        return $http.get('mock/dishes.json')
          .then(function (data) {
            dishes = data.data;
            return dishes;
          });
      };

      self.addDish = function (dish) {
        //FIXME remove this and call the service
        dish.id = dishes.length + '';
        dishes.push(dish);
        return $q.when(dishes);

        var deferred = $q.defer();
        $http.post(BASE_URL + '/dishes/', dish)
          .success(deferred.resolve)
          .error(function (data) {
            deferred.reject(JSON.stringify(data));
          });
        return deferred.promise;
      };
      self.addBatch = function (batch) {
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


        var deferred = $q.defer();
        $http.post(BASE_URL + '/batches/', batch)
          .success(deferred.resolve)
          .error(function (data) {
            deferred.reject(JSON.stringify(data));
          });
        return deferred.promise;
      };

      self.removeBatchAvailablePortions = function (batch) {
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
      };

      self.removeAllAvailablePortions = function () {
        //FIXME remove this and call the service
        _.remove(batches, function (batch) {
          batch.quantity = batch.quantityOrdered;
          return batch.quantity === 0;
        });
        return $q.when(batches);
      };

      self.becomeChef = function (chefInfo) {
        //FIXME remove this and use real service
        return $q.when('OK');

        var deferred = $q.defer();
        $http.post(BASE_URL + '/enroll/', chefInfo)
          .success(deferred.resolve)
          .error(function (data) {
            deferred.reject(JSON.stringify(data));
          });
        return deferred.promise;
      };

      self.maxBatches = function () {
        //TODO read this from server!!
        return 3;
      };

      return self;
    }]
);
