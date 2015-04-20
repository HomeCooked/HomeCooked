'use strict';
angular.module('HomeCooked.controllers').controller('MainCtrl', ['$state', 'LoginService',
  function ($state, LoginService) {

    this.buyerMode = function () {
      LoginService.getUser().isEnrolled = false;
      $state.go('app.buyer');
    };
    this.sellerMode = function () {
      LoginService.getUser().isEnrolled = true;
      $state.go('app.seller');
    };
  }]);
