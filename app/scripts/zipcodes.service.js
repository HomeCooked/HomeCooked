'use strict';
(function() {
    angular.module('HomeCooked.services').factory('ZipcodesService', ZipcodesService);

    ZipcodesService.$inject = ['$q', '$http', 'ENV', '_'];
    function ZipcodesService($q, $http, ENV, _) {
        var baseUrl = ENV.BASE_URL + '/api/v1/';

        return {
            isValidZipcode: isValidZipcode
        };

        function isValidZipcode(zipcode) {
            var deferred = $q.defer();
            var zipcodes = [];
            $http.get(baseUrl + 'zipcodes/')
                .success(function(resp) {
                    zipcodes = resp;
                })
                .finally(function() {
                    deferred.resolve(_.some(zipcodes, {zipcode: zipcode}));
                });
            return deferred.promise;
        }
    }
})();
