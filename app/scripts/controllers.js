'use strict';
angular.module('HomeCooked.controllers', [])
  .factory('LoginService', ['$q', '$http',
    function ($q, $http) {
      var baseUrl = '//homecooked.herokuapp.com';
      var _isLoggedIn = false, currentLoginType;

      var isLoggedIn = function () {
        if (!_isLoggedIn) {
          //TODO create promise and check on server if logged in
        }
        return _isLoggedIn;
      };

      var login = function (loginType, user, pass) {
        var deferred = $q.defer();
        if (loginType === 'fb') {
          window.openFB.login(
            function didLogin(response) {
              if (response.status === 'connected') {
                _isLoggedIn = true;
                currentLoginType = loginType;
                deferred.resolve();
              } else {
                deferred.reject('Facebook login failed');
              }
            },
            {scope: 'email'});
        }
        else {
          $http.post(baseUrl + '/api-auth/login/', {username: user, password: pass})
            .success(deferred.resolve)
            .error(function loginFail(data /*, status, headers, config*/) {
              deferred.reject(data);
            });
        }
        return deferred.promise;
      };

      var logout = function () {
        if (_isLoggedIn) {
          if (currentLoginType === 'fb') {
            window.openFB.logout();
          }
          _isLoggedIn = false;
          currentLoginType = undefined;
        }
      };

      return {
        isLoggedIn: isLoggedIn,
        login: login,
        logout: logout
      };
    }])
  .controller('AppCtrl', ['$scope', '$ionicModal', 'LoginService',
    function ($scope, $ionicModal, LoginService) {
      // Create the login modal that we will use later
      $ionicModal.fromTemplateUrl('templates/login.html', {
        scope: $scope,
        backdropClickToClose: false,
        hardwareBackButtonClose: false
      }).then(function (modal) {
        $scope.modal = modal;
        //TODO use promise
        if (!LoginService.isLoggedIn()) {
          openLogin();
        }
      });

      var openLogin = function () {
        $scope.modal.show();
      };
      var logout = function () {
        LoginService.logout();
        openLogin();
      };
      $scope.openLogin = openLogin;
      $scope.logout = logout;

      // Perform the login action when the user submits the login form
      $scope.login = function (loginType, user, pass) {
        LoginService.login(loginType, user, pass).then(function didLogin() {
          $scope.modal.hide();
          $scope.doingLogin = $scope.doingSignup = false;
          //TODO welcome message toast
        }, function didNotLogin(err) {
          window.alert(err);
        });
      };
    }])
  .controller('SellerCtrl', function () {})
  .controller('BuyerCtrl', ['$scope',
    function ($scope) {
      $scope.findChefs = function () {
        console.log(arguments);
      };
      $scope.openOrders = function () {
        console.log(arguments);
      };
    }]);
