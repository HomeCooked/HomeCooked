'use strict';
angular.module('HomeCooked.controllers').controller('LoginCtrl', ['$scope', '$ionicModal', '$ionicLoading', '$state', '$ionicPopup', '$timeout', '$ionicSideMenuDelegate', 'LoginService',
  function ($scope, $ionicModal, $ionicLoading, $state, $ionicPopup, $timeout, $ionicSideMenuDelegate, LoginService) {
    $scope.doingLogin = false;
    $scope.doingSignup = false;
    // Perform the login action when the user submits the login form
    $scope.login = function (loginType, user, pass) {
      $ionicLoading.show({
        template: 'Doing login...'
      });
      LoginService.login(loginType, user, pass).then(function didLogin(user) {
        that.user = user;
        $ionicLoading.hide();
        that.modal.hide();
        $scope.doingLogin = $scope.doingSignup = false;
      }, function didNotLogin(err) {
        $ionicLoading.hide();
        $ionicPopup.alert({
          title: 'Couldn\'t login',
          template: err
        });
      });
    };

    var that = this;

    var setLinks = function () {
      if (that.isSellerView) {
        that.links = [
          {name: 'Bank & Address', url: '#/app/seller'},
          {name: 'Transaction History', url: '#/app/seller'},
          {name: 'View Ratings', url: '#/app/ratings'},
          {name: 'Edit Bio', url: '#/app/bio'},
          {name: 'Get more delivery kits', url: '#/app/delivery'}
        ];
      }
      else {
        that.links = [
          {name: 'My Orders', url: '#/app/seller'},
          {name: 'Payment methods', url: '#/app/seller'}
        ];
      }
    };
    
    that.user = LoginService.getUser();
    // Create the login modal that we will use later
    $ionicModal.fromTemplateUrl('templates/login.html', {
      scope: $scope,
      backdropClickToClose: false,
      hardwareBackButtonClose: false
    }).then(function (modal) {
      that.modal = modal;
      if (!that.user) {
        modal.show();
      }
    });

    that.logout = function () {
      LoginService.logout();
      that.modal.show();
    };

    that.switchView = function () {
      that.isSellerView = !that.isSellerView;
      //TODO check if he can be seller
      $timeout(function () {
        $ionicSideMenuDelegate.toggleLeft(false);
        setLinks();
        $state.go(that.isSellerView ? 'app.seller' : 'app.buyer');
      }, 250);
    };

    that.isSellerView = $state.current.name === 'app.seller';
    setLinks();
  }]);
