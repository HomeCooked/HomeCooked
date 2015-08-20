(function() {
    'use strict';
    angular.module('HomeCooked.services').factory('NotificationService', NotificationService);

    NotificationService.$inject = ['$log', '$rootScope', '$cordovaPush', '$cordovaDialogs', '$http', 'CacheService', 'ENV', 'LoginService', 'HCMessaging', '_'];
    function NotificationService($log, $rootScope, $cordovaPush, $cordovaDialogs, $http, CacheService, ENV, LoginService, HCMessaging, _) {
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

        var loginWatcher = $rootScope.$watch(function() {
            return user.isLoggedIn;
        }, handleToken);


        // Notification Received
        $rootScope.$on('$cordovaPush:notificationReceived', handleNotification);

        return {
            isRegistered: isRegistered,
            register: register
        };

        function isRegistered() {
            return !!CacheService.getValue('device-token');
        }

        function register() {
            var device = getDevice();
            $log.info('register start');
            $cordovaPush.register(device.config)
                .then(function(deviceToken) {
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
                $log.info('handleToken start');
                // Success -- send deviceToken to server, and store for future use
                $http.post(device.url, {registration_id: device.token}).then(function() {
                    $log.info('handleToken success');
                    CacheService.setValue({'device-token': device.token});
                }, function(err) {
                    // if we sent already
                    if (_.get(err, 'data.registration_id[0]') === 'This field must be unique.') {
                        CacheService.setValue({'device-token': device.token});
                    }
                    else {
                        HCMessaging.showError('Error registering the device', 'We cannot send you push notifications :(');
                    }
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
                $cordovaDialogs.alert(notification.message, 'Push Notification Received');
            }
            else if (notification.event === 'error') {
                $cordovaDialogs.alert(notification.msg, 'Push notification error event');
            }
            else {
                $cordovaDialogs.alert(notification.event, 'Push notification handler - Unprocessed Event');
            }
        }

        // IOS Notification Received Handler
        function handleIOS(notification) {
            // The app was already open but we'll still show the alert and sound the tone received this way. If you didn't check
            // for foreground here it would make a sound twice, once when received in background and upon opening it from clicking
            // the notification when this code runs (weird).
            if (notification.foreground === '1') {
                // Play custom audio if a sound specified.
                //TODO

                if (notification.body && notification.messageFrom) {
                    $cordovaDialogs.alert(notification.body, notification.messageFrom);
                }
                else {
                    $cordovaDialogs.alert(notification.alert, 'Push Notification Received');
                }

                if (notification.badge) {
                    $cordovaPush.setBadgeNumber(notification.badge);
                }
            }
            // Otherwise it was received in the background and reopened from the push notification. Badge is automatically cleared
            // in this case. You probably wouldn't be displaying anything at this point, this is here to show that you can process
            // the data in this situation.
            else {
                if (notification.body && notification.messageFrom) {
                    $cordovaDialogs.alert(notification.body, '(RECEIVED WHEN APP IN BACKGROUND) ' + notification.messageFrom);
                }
                else {
                    $cordovaDialogs.alert(notification.alert, '(RECEIVED WHEN APP IN BACKGROUND) Push Notification Received');
                }
            }
        }
    }
})();
