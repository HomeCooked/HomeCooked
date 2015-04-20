'use strict';
angular.module('HomeCooked.services')
  .factory('ChefService', ['$q', '$http', 'BASE_URL', '_',
    function ($q, $http, BASE_URL, _) {
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
        var batches = [
          {
            dishImage: 'images/logo.png',
            dishName: 'Duck',
            quantity: 6,
            price: 6,
            orders: [{
              userName: 'Val',
              quantity: 1
            }, {
              userName: 'Marc',
              quantity: 2
            }]
          },
          {
            dishImage: 'images/logo.png',
            dishName: 'Mushroom risotto',
            quantity: 3,
            price: 4,
            orders: [{
              userName: 'Max',
              quantity: 2
            }, {
              userName: 'Jon',
              quantity: 1
            }]
          }
        ];
        calculateQtyOrdered(batches);
        return $q.when(batches);
      };

      var calculateQtyOrdered = function (batches) {
        _.forEach(batches, function (batch) {
          batch.quantityOrdered = 0;
          _.forEach(batch.orders, function (order) {
            batch.quantityOrdered += order.quantity;
          });
        });
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

      self.becomeChef = function (chefInfo) {
        return $q.when('OK');
        //TODO make it work server side
        var deferred = $q.defer();
        $http.post(BASE_URL + '/enroll/', chefInfo)
          .success(deferred.resolve)
          .error(function (data) {
            deferred.reject(JSON.stringify(data));
          });
        return deferred.promise;
      };

      return self;
    }]
);
