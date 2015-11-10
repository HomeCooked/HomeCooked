'use strict';
(function() {
    angular.module('HomeCooked.services').factory('CacheService', CacheService);
    CacheService.$inject = ['$window', '_'];
    function CacheService($window, _) {
        var cacheId = 'hc-cache',
            welcomeTutorialComplete = 'hc-welcome-tutorial-complete',
            cache = readCache(cacheId) || {};

        return {
            getValue: getValue,
            setValue: setValue,
            invalidateCache: invalidateCache,
            getWelcomeTutorialComplete: getWelcomeTutorialComplete,
            setWelcomeTutorialComplete: setWelcomeTutorialComplete
        };

        function getValue(key) {
            return cache[key];
        }

        function setValue(keyValues) {
            _.forEach(keyValues, function(value, key) {
                cache[key] = value;
                if (typeof value === 'undefined') {
                    delete cache[key];
                }
            });
            saveCache(cacheId, cache);
        }

        function invalidateCache() {
            cache = {};
            saveCache(cacheId, cache);
        }

        function readCache(key) {
            if (!$window.localStorage) {
                return;
            }
            var storedCache = $window.localStorage.getItem(key);
            if (storedCache) {
                return JSON.parse(storedCache);
            }
        }

        function saveCache(key, data) {
            if (!$window.localStorage) {
                return;
            }
            if (!data) {
                $window.localStorage.removeItem(key);
            }
            else {
                $window.localStorage.setItem(key, JSON.stringify(data));
            }
        }

        function getWelcomeTutorialComplete() {
            return readCache(welcomeTutorialComplete);
        }

        function setWelcomeTutorialComplete() {
            saveCache(welcomeTutorialComplete, true);
        }
    }
})
();
