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
        var orders = [fakeOrder('val', 2, 50), fakeOrder('jon', 1, 7), fakeOrder('max', 1, 12), fakeOrder('marc', 2, 40)];
        return $q.when(orders);
      };

      self.getBatches = function () {
        var batches = [{
          dishImage: 'img/logo.png',
          dishName: 'duck',
          quantity: 1,
          price: 6
        }];
        return $q.when(batches);
      };

      self.getDishes = function () {
        var dishes = [{
          id: '1',
          name: 'mock dish 1',
          description: 'mock description',
          rating: 4.5,
          voters: 200
        }, {
          id: '2',
          name: 'salad',
          description: 'very good',
          rating: 3,
          voters: 42
        }];
        return $q.when(dishes);
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
