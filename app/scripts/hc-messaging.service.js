'use strict';
(function () {
  angular.module('HomeCooked.services').factory('HCMessaging', HCMessaging);

  HCMessaging.$inject = ['$log', '$ionicLoading', '$ionicPopup'];

  function HCMessaging($log, $ionicLoading, $ionicPopup) {
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
      $ionicLoading.hide();
      $log.error(error);
      $ionicPopup.alert({
        title: 'Sorry, something went wrong',
        template: '<p align="center">' +
        'Sorry for the inconvenience.<br><a ng-hide="showmore" href ng-click="showmore=true">show more</a>' +
        '<p>' +
        '<pre ng-show="showmore" style="font-size: x-small"><code>' +
        JSON.stringify(error, null, '  ') + '</code></pre>'
      });
    }
  }
})();
