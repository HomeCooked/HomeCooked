'use strict';
angular.module('HomeCooked.controllers').controller('SettingsCtrl', ['$scope', '$ionicLoading', '$timeout', 'LoginService',
  function ($scope, $ionicLoading, $timeout, LoginService) {
    var self = this;
    //check if user changes, to show or not settings
    $scope.$watch(
      LoginService.getUser,
      function (user) {
        self.user = user;
      }
    );
  }]);
