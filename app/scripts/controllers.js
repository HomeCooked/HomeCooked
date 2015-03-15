'use strict';
angular.module('HomeCooked.controllers', [])
  .factory('LoginService', ['$q', '$http',
    function ($q, $http) {
      var baseUrl = '//homecooked.herokuapp.com';
      var _isLoggedIn = false, currentLoginType;

      var isLoggedIn = function () {
        var deferred = $q.defer();
        if (!_isLoggedIn) {
          window.openFB.getLoginStatus(function (response) {
            _isLoggedIn = response.status === 'connected';
            if (_isLoggedIn) {
              currentLoginType = 'fb';
            }
            deferred.resolve(_isLoggedIn);
          });
        }
        else {
          deferred.resolve(_isLoggedIn);
        }
        return deferred.promise;
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
  .controller('AppCtrl', ['$scope', '$ionicModal', '$state', '$ionicPopup', 'LoginService',
    function ($scope, $ionicModal, $state, $ionicPopup, LoginService) {
      $scope.doingLogin = false;
      $scope.doingSignup = false;
      // Create the login modal that we will use later
      $ionicModal.fromTemplateUrl('templates/login.html', {
        scope: $scope,
        backdropClickToClose: false,
        hardwareBackButtonClose: false
      }).then(function (modal) {
        $scope.modal = modal;
        LoginService.isLoggedIn().then(function (isLoggedIn) {
          if (!isLoggedIn) {
            openLogin();
          }
        });
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
      $scope.isSellerView = false;
      $scope.switchView = function () {
        $scope.isSellerView = !$scope.isSellerView;
        //TODO check if he can be seller
        $state.go($scope.isSellerView ? 'app.seller' : 'app.buyer');
      }

      // Perform the login action when the user submits the login form
      $scope.login = function (loginType, user, pass) {
        LoginService.login(loginType, user, pass).then(function didLogin() {
          $scope.modal.hide();
          $scope.doingLogin = $scope.doingSignup = false;
          //TODO welcome message toast
        }, function didNotLogin(err) {
          $ionicPopup.alert({
            title: 'Couldn\'t login',
            template: err
          });
        });
      };
    }])
  .controller('SellerCtrl', function () {
  })
  .controller('BuyerCtrl', ['$scope',
    function ($scope) {
      $scope.findChefs = function () {
        console.log(arguments);
      };
      $scope.openOrders = function () {
        console.log(arguments);
      };
    }]);
