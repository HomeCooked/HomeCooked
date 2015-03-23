'use strict';
angular.module('HomeCooked.services')
  .factory('AuthInterceptor', ['$q', 'CacheService',
    function ($q, CacheService) {
      return {
        request: function (config) {
          config.headers = config.headers || {};
          var token = CacheService.getCache('hctoken');
          if (token) {
            config.headers.Authorization = 'Bearer ' + token;
          }
          return config;
        },
        response: function (response) {
          if (response.status === 401) {
            //LoginService.logout();
          }
          return response || $q.when(response);
        }
      };
    }]
);
