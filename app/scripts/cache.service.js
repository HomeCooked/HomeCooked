'use strict';
(function () {
  angular.module('HomeCooked.services').factory('CacheService', CacheService);
  CacheService.$inject = ['$window'];
  function CacheService($window) {
    var cacheId = 'hcdata',
      cacheData = getCacheData();

    return {
      getCache: getCache,
      setCache: setCache,
      emptyCache: emptyCache
    };

    function getCache(key) {
      return cacheData[key];
    }

    function setCache(key, value) {
      cacheData[key] = value;
      if (typeof value === 'undefined') {
        delete cacheData[key];
      }
      saveCacheData();
    }

    function emptyCache() {
      cacheData = {};
      saveCacheData();
    }

    function getCacheData() {
      if (!$window.localStorage) {
        return {};
      }
      var serializedCache = $window.localStorage.getItem(cacheId);
      return JSON.parse(serializedCache) || {};
    }

    function saveCacheData() {
      if ($window.localStorage) {
        $window.localStorage.setItem(cacheId, JSON.stringify(cacheData));
      }
    }
  }
})();
