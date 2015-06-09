'use strict';
angular.module('HomeCooked.controllers').controller('SignupCtrl', [
  '$scope', '$state', '$ionicHistory', '$ionicLoading', '$ionicPopup', 'LoginService',
  function($scope, $state, $ionicHistory, $ionicLoading, $ionicPopup, LoginService) {

    var vm = this;


    vm.signIn = function(loginType, user, pass) {
      $ionicLoading.show({
        template: 'Sign in...'
      });
      LoginService.login(loginType, user, pass).then(function didLogin() {
        $ionicLoading.hide();
        $scope.closeModal();
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
