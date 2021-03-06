(function () {
    'use strict';
    angular.module('HomeCooked.services').factory('NotificationService', NotificationService);

    NotificationService.$inject = ['$log', '$rootScope', '$cordovaPush', '$state', '$ionicHistory', '$http', '$ionicLoading', 'CacheService', 'ENV', 'LoginService', '_'];
    function NotificationService($log, $rootScope, $cordovaPush, $state, $ionicHistory, $http, $ionicLoading, CacheService, ENV, LoginService, _) {
        var devices = {
            ios: {
                url: ENV.BASE_URL + '/api/v1/device/apns/',
                config: {
                    'badge': true,
                    'sound': true,
                    'alert': true,
                    'ecb': 'onNotificationAPN'
                }
            },
            android: {
                url: ENV.BASE_URL + '/api/v1/device/gcm/',
                config: {
                    'senderID': '510294279480' // REPLACE THIS WITH YOURS FROM GCM CONSOLE - also in the project URL like: https://console.developers.google.com/project/43420598907
                }
            }
        };
        var user = LoginService.getUser();

        var loginWatcher = $rootScope.$watch(function () {
            return user.isLoggedIn;
        }, handleToken);


        // Notification Received
        $rootScope.$on('$cordovaPush:notificationReceived', handleNotification);

        return {
            register: register
        };

        function register() {
            var device = getDevice();
            $log.info('register start');
            $cordovaPush.register(device.config)
                .then(function (deviceToken) {
                    $log.info('register success ' + deviceToken);
                    if (window.ionic.Platform.isIOS()) {
                        device.token = deviceToken;
                        handleToken();
                    }
                });
        }

        function handleToken() {
            var device = getDevice();
            if (user.isLoggedIn && device.token) {
                loginWatcher();
                if (CacheService.getValue('device-token') === device.token) {
                    return;
                }
                $log.info('handleToken start');
                // Success -- send deviceToken to server, and store for future use
                $http.post(device.url, {registration_id: device.token}).then(function () {
                    $log.info('handleToken success');
                    CacheService.setValue({'device-token': device.token});
                }, function (err) {
                    var msg = _.get(err, 'data.registration_id[0]') || '';
                    if (msg.indexOf('must be unique') >= 0) {
                        $log.warn('called again service to register token');
                        CacheService.setValue({'device-token': device.token});
                        return;
                    }
                    $ionicLoading.show({
                        template: 'Error registering the device, we cannot send you push notifications :(',
                        duration: 3000
                    });
                });
            }
        }

        function handleNotification(event, notification) {
            if (window.ionic.Platform.isAndroid()) {
                handleAndroid(notification);
            }
            else if (window.ionic.Platform.isIOS()) {
                handleIOS(notification);
            }
        }

        function getDevice() {
            var platform = window.ionic.Platform.isIOS() ? 'ios' : window.ionic.Platform.isAndroid() ? 'android' : '';
            return devices[platform] || {};
        }

        // Android Notification Received Handler
        function handleAndroid(notification) {
            // ** NOTE: ** You could add code for when app is in foreground or not, or coming from coldstart here too
            //             via the console fields as shown.
            $log.info('In foreground ' + notification.foreground + ' Coldstart ' + notification.coldstart);
            if (notification.event === 'registered') {
                devices.android.token = notification.regid;
                handleToken();
            }
            else if (notification.event === 'message') {
                redirectIfNeeded(notification);
                $ionicLoading.show({
                    template: notification.message,
                    duration: 3000
                });
            }
            else if (notification.event === 'error') {
                $ionicLoading.show({
                    template: notification.msg,
                    duration: 3000
                });
            }
            else {
                $ionicLoading.show({
                    template: notification.event,
                    duration: 3000
                });
            }
        }

        // IOS Notification Received Handler
        function handleIOS(notification) {
            // The app was already open but we'll still show the alert and sound the tone received this way. If you didn't check
            // for foreground here it would make a sound twice, once when received in background and upon opening it from clicking
            // the notification when this code runs (weird).
            redirectIfNeeded(notification);
            if (notification.foreground === '1') {
                // Play custom audio if a sound specified.
                //TODO
                if (notification.message) {
                    $ionicLoading.show({
                        template: notification.message,
                        duration: 3000
                    });
                }

                if (notification.badge) {
                    $cordovaPush.setBadgeNumber(notification.badge);
                }
            }
        }

        function redirectIfNeeded(notification) {
            if (notification.redirect_url) {
                go(notification.redirect_url);
            }
        }

        function go(state) {
            $ionicHistory.nextViewOptions({
                historyRoot: true,
                disableAnimate: true
            });
            $state.go(state);
        }
    }
})();
