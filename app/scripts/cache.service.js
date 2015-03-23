'use strict';
angular.module('HomeCooked.services')
  .factory('CacheService', ['$window',
    function ($window) {
      var self = this;

      self.getCache = function (key) {
        if ($window.localStorage) {
          var serializedCache = $window.localStorage.getItem(key);
          if (serializedCache && isJSON(serializedCache)) {
            serializedCache = JSON.stringify(serializedCache);
          }
          return serializedCache;
        }
      };

      self.setCache = function (key, value) {
        if (!$window.localStorage) {
          return;
        }

        if (isEmpty(value)) {
          $window.localStorage.removeItem(key);
        }
        else {
          if (typeof value === 'array' || typeof value === 'object') {
            value = JSON.stringify(value);
          }
          $window.localStorage.setItem(key, value);
        }
      };

      var isEmpty = function (obj) {
        var empty = true;
        var type = typeof obj;
        if (type !== 'undefined') {
          if (type === 'object' || type === 'array') {
            for (var i in obj) {
              empty = isEmpty(obj[i]);
              if (!empty) {
                break;
              }
            }
          }
          else {
            empty = false;
          }
        }
        return empty;
      };

      var isJSON = function (json) {
        try {
          JSON.parse(json);
        }
        catch (e) {
          return false;
        }
        return true;
      };

      return self;
    }]
);
