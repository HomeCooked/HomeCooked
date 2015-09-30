(function () {
    'use strict';
    angular.module('HomeCooked.services').factory('HCMessaging', HCMessaging);

    HCMessaging.$inject = ['$rootScope', '$ionicLoading', '$ionicPopup'];

    function HCMessaging($rootScope, $ionicLoading, $ionicPopup) {

        $rootScope.$on('unauthorized', notifyUnauthorized);

        return {
            showError: showError,
            showMessage: showMessage
        };

        function showMessage(title, message) {
            $ionicLoading.hide();
            $ionicPopup.alert({
                title: title,
                template: message
            });
        }

        function showError(error) {
            error = error || {};
            var msg = typeof error !== 'object' ? error : error.data;
            $ionicLoading.hide();
            $ionicPopup.alert({
                title: 'Oops, something went wrong!',
                template: msg || 'Sorry for the inconvenience'
            });
        }

        function notifyUnauthorized() {
            showMessage('Session expired', 'Please login again');
        }
    }
})();
