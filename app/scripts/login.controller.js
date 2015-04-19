'use strict';
angular.module('HomeCooked.controllers').controller('LoginCtrl', ['$scope', '$rootScope', '$ionicModal', '$ionicLoading', '$state', '$ionicPopup', 'LoginService', '_',
  function ($scope, $rootScope, $ionicModal, $ionicLoading, $state, $ionicPopup, LoginService, _) {
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
    that.selectedPath = '';

    var chefLinks = [
      {name: 'Orders', path: 'app.seller'},
      {name: 'My dishes', path: 'app.dishes'},
      {name: 'Edit Bio', path: 'app.bio'},
      {name: 'Get more delivery kits', path: 'app.delivery'}
    ];

    var buyerLinks = [
      {name: 'Find local chefs', path: 'app.buyer'},
      {name: 'My Orders', path: 'app.orders'},
      {name: 'Payment methods', path: 'app.settings'}
    ];

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
      var path = buyerLinks[0].path;
      if (that.chefMode) {
        //TODO check if he can be seller
        path = chefLinks[0].path;
      }
      that.go(path);
    };

    that.go = function (path) {
      $state.go(path);
    };

    var onStateChanged = function (event, toState) {
      var path = toState.name;
      that.chefMode = _.some(chefLinks, function (link) {
        return link.path === path;
      });
      that.links = that.chefMode ? chefLinks : buyerLinks;
      that.selectedPath = path;
    };
    onStateChanged(null, $state.current);
    $rootScope.$on('$stateChangeStart', onStateChanged);
  }]);
