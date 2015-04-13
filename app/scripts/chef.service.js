'use strict';
angular.module('HomeCooked.services')
  .factory('ChefService', ['$q', '$http', 'BASE_URL',
    function ($q, $http, BASE_URL) {
      var self = this;

      var fakeOrder = function (n, q, p) {
        var d = new Date();
        return {
          userName: n,
          dishName: 'chicken',
          quantity: q,
          totalPrice: p,
          pickupTimestamp: d.timestamp
        };
      };

      self.getOrders = function () {
        var deferred = $q.defer();
        var orders = [fakeOrder('val', 2, 50), fakeOrder('jon', 1, 7), fakeOrder('max', 1, 12), fakeOrder('marc', 2, 40)];
        deferred.resolve(orders);
        return deferred.promise;
      };

      self.getBatches = function () {
        var deferred = $q.defer();
        var batches = [{
          dishImage: 'img/logo.png',
          dishName: 'duck',
          quantity: 1,
          price: 6
        }];
        deferred.resolve(batches);
        return deferred.promise;
      };

      self.getDishes = function () {
        var deferred = $q.defer();
        var dishes = [{
          name: 'mock dish 1',
          description: 'mock description'
        }, {
          name: 'salad',
          description: 'very good'
        }];
        deferred.resolve(dishes);
        return deferred.promise;
      };

      self.addDish = function (dish) {
        var deferred = $q.defer();
        $http.post(BASE_URL + '/dishes/', dish)
          .success(deferred.resolve)
          .error(function (data) {
            deferred.reject(JSON.stringify(data));
          });
        return deferred.promise;
      };

      return self;
    }]
);
