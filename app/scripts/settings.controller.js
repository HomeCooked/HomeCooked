'use strict';
angular.module('HomeCooked.controllers').controller('SettingsCtrl', ['$scope', 'LoginService',
  function($scope, LoginService) {
    var self = this;
    //check if user changes, to show or not settings
    $scope.$watch(
      LoginService.getUser,
      function(user) {
        self.user = user;
      }
    );
  }]);
