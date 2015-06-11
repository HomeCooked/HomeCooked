'use strict';
angular.module('HomeCooked.services')
  .factory('AuthInterceptor', ['$q', 'CacheService',
    function ($q, CacheService) {
      return {
        request: function (config) {
          config.headers = config.headers || {};
          var credential = CacheService.getCache('hccredential');
          if (credential) {
            config.headers.Authorization = credential.token_type + ' ' + credential.access_token;
          }
          return config;
        },
        response: function (response) {
          if (response.status === 401) {
            CacheService.emptyCache();
          }
          return response || $q.when(response);
        }
      };
    }]
);
