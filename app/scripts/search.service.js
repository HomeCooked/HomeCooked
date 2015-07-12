(function() {
    'use strict';

    angular
        .module('HomeCooked.services')
        .service('SearchService', SearchService);

    SearchService.$inject = ['$http', 'ENV'];

    function SearchService($http, ENV) {
        var baseUrl = ENV.BASE_URL + '/api/v1/';

        var service = {
            getChefs: getChefs
        };

        return service;


        //////////////////////////////////


        /**
         * Get all chefs at a certain location
         * @param {Object} location, lat/lon
         */

        function getChefs(location) {
            return $http.get('mock/chefs.json', {
                location: location
            }).then(function(resp) {
                return resp.data;
            });
        }
    }
})();