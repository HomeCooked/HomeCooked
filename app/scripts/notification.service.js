(function() {
    'use strict';
    angular.module('HomeCooked.services').factory('NotificationService', NotificationService);

    NotificationService.$inject = ['$rootScope', '$cordovaPush', '$http', 'CacheService', 'ENV', 'LoginService'];
    function NotificationService($rootScope, $cordovaPush, $http, CacheService, ENV, LoginService) {
        var baseUrl = ENV.BASE_URL + '/api/v1/';
        var devices = {
            ios: {
                url: 'apns',
                config: {
                    'badge': true,
                    'sound': true,
                    'alert': true
                }
            },
            android: {
                url: 'gcm',
                config: {
                    'badge': true,
                    'sound': true,
                    'alert': true
                }
            }
        };
        var user = LoginService.getUser();

        $rootScope.$watch(function() {
            return user.isLoggedIn;
        }, handleToken);

        return {
            register: register
        };

        function register() {
            if (getCurrentDeviceToken()) {
                return;
            }
            var device = getDevice();
            $cordovaPush.register(device.config)
                .then(function(deviceToken) {
                    device.token = deviceToken;
                    handleToken();
                });
        }

        function handleToken() {
            var device = getDevice();
            if (user.isLoggedIn && device.token) {
                // Success -- send deviceToken to server, and store for future use
                $http.post(baseUrl + 'device/' + device.url, {deviceToken: device.token}).then(function() {
                    CacheService.setValue('device-token', device.token);
                });
            }
        }

        function getDevice() {
            var platform = window.ionic.Platform.isIOS() ? 'ios' : window.ionic.Platform.isAndroid() ? 'android' : '';
            return devices[platform] || {};
        }

        function getCurrentDeviceToken() {
            return CacheService.getValue('device-token');
        }
    }
})();
