(function() {
    'use strict';

    angular
        .module('HomeCooked.services')
        .service('SearchService', SearchService);

    SearchService.$inject = ['$http', 'ENV', 'ChefService'];

    function SearchService($http, ENV, ChefService) {
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
                    distance: 50
                }
            }).then(function(resp) {
                var chefs = resp.data || [];
                for (var i = 0; i < chefs.length; i++) {
                  ChefService.enrichChefData(chefs[i]);
                }
                return chefs;
            });
        }
    }
})();
