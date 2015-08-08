'use strict';
angular.module('HomeCooked.services')
    .factory('AuthInterceptor', ['$q', '$rootScope', 'CacheService',
        function($q, $rootScope, CacheService) {
            return {
                request: function(config) {
                    config.headers = config.headers || {};
                    var credential = CacheService.getValue('credential');
                    if (credential) {
                        config.headers.Authorization = credential.token_type + ' ' + credential.access_token;
                    }
                    return config;
                },
                response: function(response) {
                    if (response.status === 401) {
                        $rootScope.$emit('unauthorized');
                    }
                    return response || $q.when(response);
                }
            };
        }]
);
