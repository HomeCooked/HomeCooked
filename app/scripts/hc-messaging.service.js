'use strict';
angular.module('HomeCooked.services')
  .factory('HCMessaging', ['$log', '$ionicLoading', '$ionicPopup',
    function($log, $ionicLoading, $ionicPopup) {
      var showError = function(error) {
        $ionicLoading.hide();
        $log.error(error);
        $ionicPopup.alert({
          title: 'Sorry, something went wrong',
          template: '<p align="center">' +
          'Sorry for the inconvenience.<br><a ng-hide="showmore" href ng-click="showmore=true">show more</a>' +
          '<p>' +
          '<pre ng-show="showmore" style="font-size: x-small"><code>' + JSON.stringify(error, null, '  ') + '</code></pre>'
        });
      };
      return {
        showError: showError
      };
    }]
);
