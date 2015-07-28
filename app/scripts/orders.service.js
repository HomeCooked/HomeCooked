(function() {
    'use strict';
    angular.module('HomeCooked.services').factory('OrdersService', OrdersService);

    OrdersService.$inject = ['$http', 'ENV'];
    function OrdersService($http, ENV) {
        var baseUrl = ENV.BASE_URL + '/api/v1/';

        return {
            getOrders: getOrders,
            getActiveOrders: getActiveOrders
        };

        function returnData(response) {
            return response.data;
        }

        function getOrders() {
            return $http.get(baseUrl + 'orders/current_orders/').then(returnData);
        }

        function getActiveOrders() {
            return $http.get(baseUrl + 'orders/active_orders/').then(returnData);
        }
    }
})();
