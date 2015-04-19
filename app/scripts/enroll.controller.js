'use strict';
angular.module('HomeCooked.controllers').controller('EnrollCtrl', ['$scope', '$location', '$ionicModal', '$ionicLoading', '$ionicPopup', 'LoginService',
  function ($scope, $location, $ionicModal, $ionicLoading, $ionicPopup, LoginService) {
    var that = this;

    that.go = function (path) {
      $location.path(path);
    };
  }]);
