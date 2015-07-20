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
            return $http({
                url: baseUrl + 'chefs/',
                method: 'GET',
                params: {
                    location: location,
                    distance: 15
                }
            }).then(function(resp) {
                return resp.data;
            });
        }
    }
})();
