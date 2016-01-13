(function() {
    'use strict';
    angular.module('HomeCooked.services').factory('HCMessaging', HCMessaging);

    HCMessaging.$inject = ['$ionicLoading', '$ionicPopup'];

    function HCMessaging($ionicLoading, $ionicPopup) {

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

    }
})();
