'use strict';
(function () {
    // Safari, in Private Browsing Mode, looks like it supports localStorage but all calls to setItem
    // throw QuotaExceededError. We're going to detect this and just silently drop any calls to setItem
    // to avoid the entire page breaking, without having to do a check at each usage of Storage.
    if (typeof localStorage === 'object') {
        try {
            localStorage.setItem('localStorage', 1);
            localStorage.removeItem('localStorage');
        } catch (e) {
            window.Storage.prototype._setItem = window.Storage.prototype.setItem;
            window.Storage.prototype.setItem = function () {};
            window.alert('Your web browser does not support storing settings locally. In Safari, the most common cause of this is using "Private Browsing Mode". Some settings may not save or some features may not work properly for you.');
        }
    }
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
            _.forEach(keyValues, function (value, key) {
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
