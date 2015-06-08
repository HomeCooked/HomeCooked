'use strict';
angular.module('HomeCooked.controllers').controller('SignupCtrl', [
  '$state', '$ionicHistory', '$ionicLoading', '$ionicPopup', 'LoginService',
  function($state, $ionicHistory, $ionicLoading, $ionicPopup, LoginService) {

    var vm = this;
    vm.signIn = function(loginType, user, pass) {
      $ionicLoading.show({
        template: 'Sign in...'
      });
      LoginService.login(loginType, user, pass).then(function didLogin() {
        $ionicLoading.hide();
        $ionicHistory.nextViewOptions({
          historyRoot: true
        });
        $state.go('app.buyer');
      }, function didNotLogin(err) {
        $ionicLoading.hide();
        $ionicPopup.alert({
          title: 'Couldn\'t signin',
          template: err
        });
      });
    };
  }
]);
