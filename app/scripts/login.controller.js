'use strict';
angular.module('HomeCooked.controllers').controller('LoginCtrl', ['$scope', '$ionicModal', '$ionicLoading', '$state', '$ionicPopup', '$timeout', '$ionicSideMenuDelegate', 'LoginService',
  function ($scope, $ionicModal, $ionicLoading, $state, $ionicPopup, $timeout, $ionicSideMenuDelegate, LoginService) {
    $scope.doingLogin = false;
    $scope.doingSignup = false;
    $scope.user = LoginService.getUser();
    // Create the login modal that we will use later
    $ionicModal.fromTemplateUrl('templates/login.html', {
      scope: $scope,
      backdropClickToClose: false,
      hardwareBackButtonClose: false
    }).then(function (modal) {
      $scope.modal = modal;
      if (!$scope.user) {
        modal.show();
      }
    });

    $scope.logout = function () {
      LoginService.logout();
      $scope.modal.show();
    };
    $scope.isSellerView = $state.current.name === 'app.seller';
    $scope.switchView = function () {
      $scope.isSellerView = !$scope.isSellerView;
      //TODO check if he can be seller
      $timeout(function () {
        $ionicSideMenuDelegate.toggleLeft(false);
        $state.go($scope.isSellerView ? 'app.seller' : 'app.buyer');
      }, 250);
    };

    // Perform the login action when the user submits the login form
    $scope.login = function (loginType, user, pass) {
      $ionicLoading.show({
        template: 'Doing login...'
      });
      LoginService.login(loginType, user, pass).then(function didLogin(user) {
        $scope.user = user;
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
  }]);
