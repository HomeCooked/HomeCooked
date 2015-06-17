(function () {
  'use strict';
  angular.module('HomeCooked.services').factory('HCMessaging', HCMessaging);

  HCMessaging.$inject = ['$log', '$rootScope', '$ionicLoading', '$ionicPopup'];

  function HCMessaging($log, $rootScope, $ionicLoading, $ionicPopup) {
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
      var scope = $rootScope.$new();
      scope.showMore = false;
      scope.errorDetails = typeof error === 'object' ? JSON.stringify(error, null, '  ') : error;
      scope.showDetails = function () {
        scope.showMore = true;
      };
      $ionicPopup.alert({
        title: 'Oops, something went wrong!',
        scope: scope,
        templateUrl: 'templates/error.html'
      });
    }
  }
})();
