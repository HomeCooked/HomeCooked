'use strict';
angular.module('HomeCooked.services')
  .factory('CacheService', ['$window',
    function ($window) {
      var self = this;

      self.getCache = function (key) {
        if ($window.localStorage) {
          var serializedCache = $window.localStorage.getItem(key);
          return deserializeCache(serializedCache);
        }
      };

      self.setCache = function (key, value) {
        if (!$window.localStorage) {
          return;
        }

        if (typeof value === 'undefined') {
          $window.localStorage.removeItem(key);
        }
        else {
          if (typeof value === 'object') {
            value = JSON.stringify(value);
          }
          $window.localStorage.setItem(key, value);
        }
      };

      var deserializeCache = function (json) {
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
