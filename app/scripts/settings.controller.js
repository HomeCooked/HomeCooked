'use strict';
angular.module('HomeCooked.controllers').controller('SettingsCtrl', ['$scope', 'LoginService',
  function($scope, LoginService) {
    var that = this;
    //check if user changes, to show or not settings
    $scope.$on('$ionicView.beforeEnter', function() {
      that.user = LoginService.getUser();
    });
  }]);
