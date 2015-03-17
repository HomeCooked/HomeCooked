'use strict';
angular.module('HomeCooked.controllers').controller('LoginCtrl', [
    '$scope', '$ionicModal', '$ionicLoading', '$state', '$ionicPopup', 'LoginService',
    function ($scope, $ionicModal, $ionicLoading, $state, $ionicPopup, LoginService) {
      $scope.doingLogin = false;
      $scope.doingSignup = false;
      $ionicLoading.show({
        template: 'Checking login...'
      });
      // Create the login modal that we will use later
      $ionicModal.fromTemplateUrl('templates/login.html', {
        scope: $scope,
        backdropClickToClose: false,
        hardwareBackButtonClose: false
      }).then(function (modal) {
        $scope.modal = modal;
        LoginService.getLoginStatus().then(function gotLoginStatus(isLoggedIn) {
          $ionicLoading.hide();
          if (isLoggedIn) {
            that.user = LoginService.getUserInfo();
          }
          else {
            modal.show();
          }
        }, function didntGotLoginStatus() {
          $ionicLoading.hide();
          modal.show();
        });
      });

      $scope.logout = function () {
        LoginService.logout();
        $scope.modal.show();
      };
      $scope.isSellerView = false;
      $scope.switchView = function () {
        $scope.isSellerView = !$scope.isSellerView;
        //TODO check if he can be seller
        $state.go($scope.isSellerView ? 'app.seller' : 'app.buyer');
      }

      // Perform the login action when the user submits the login form
      $scope.login = function (loginType, user, pass) {
        $ionicLoading.show({
          template: 'Doing login...'
        });
        LoginService.login(loginType, user, pass).then(function didLogin() {
          $scope.user = LoginService.getUserInfo();
          $ionicLoading.hide();
          $scope.modal.hide();
          $scope.doingLogin = $scope.doingSignup = false;
        }, function didNotLogin(err) {
          $ionicLoading.hide();
          $ionicPopup.alert({
            title: 'Couldn\'t login',
            template: err
          });
        });
      };
    }]
);
