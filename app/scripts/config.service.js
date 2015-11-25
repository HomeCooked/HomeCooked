(function() {
    'use strict';
    angular.module('HomeCooked.services').factory('ConfigService', ConfigService);

    ConfigService.$inject = ['$http', 'ENV'];

    function ConfigService($http, ENV) {

        return {
            getConfig: getConfig
        };

        function getConfig() {
            return $http.get(ENV.BASE_URL + '/api/v1/config/').then(function(resp) {
                return resp.data[0];
            }, function() {
                // Capture error, return empty
                return {};
            });
        }
    }
})();
