'use strict';
angular.module('HomeCooked.services')
  .factory('CacheService', ['$window', '_',
    function($window, _) {
      var self = this;

      self.getCache = function(key) {
        if ($window.localStorage) {
          var serializedCache = $window.localStorage.getItem(key);
          return deserializeCache(serializedCache);
        }
      };

      self.setCache = function(key, value) {
        if (!$window.localStorage) {
          return;
        }

        if (_.isEmpty(value)) {
          $window.localStorage.removeItem(key);
        }
        else {
          if (typeof value === 'object') {
            value = JSON.stringify(value);
          }
          $window.localStorage.setItem(key, value);
        }
      };

      var deserializeCache = function(json) {
        try {
          return JSON.parse(json);
        }
        catch (e) {
          return json;
        }
      };

      return self;
    }]
);
