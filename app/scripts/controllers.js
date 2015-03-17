'use strict';
angular.module('HomeCooked.controllers', [])
  .factory('LoginService', ['$q', '$http',
    function ($q, $http) {
      var BASE_URL = '//homecooked.herokuapp.com',
        CLIENT_ID = '111',
        CACHE_ID = 'homecooked';
      var _isLoggedIn, loginCache = JSON.parse(window.localStorage.getItem(CACHE_ID) || '{}');

      var homeCookedLogin = function (accessToken, provider) {
        var deferred = $q.defer();
        $http.post(BASE_URL + '/connect/', {
          access_token: accessToken,
          client_id: CLIENT_ID,
          provider: provider
        })
          .success(function (data) {
            _isLoggedIn = true;
            _updateLogin(data, provider);
            deferred.resolve(_isLoggedIn);
          })
          .error(function loginFail(data) {
            _isLoggedIn = false;
            _updateLogin();
            deferred.reject(data);
          });
        return deferred.promise;
      };

      var getAccessToken = function (provider) {
        var deferred = $q.defer();
        if (provider === 'facebook') {
          window.openFB.login(function (response) {
            if (response && response.authResponse && response.authResponse.token) {
              deferred.resolve(response.authResponse.token);
            }
            else {
              deferred.reject('not connected');
            }
          }, {scope: 'email'});
        }
        else {
          deferred.reject('not supported');
        }
        return deferred.promise;
      };
      var getLoginStatus = function () {
        var deferred = $q.defer();
        if (loginCache.loginInfo) {
          _isLoggedIn = !!loginCache.loginInfo.user;
          deferred.resolve(_isLoggedIn);
        }
        else {
          _isLoggedIn = false;
          window.openFB.getLoginStatus(function (response) {
            if (response && response.status === 'connected') {
              homeCookedLogin(response.authResponse.token, 'facebook').then(deferred.resolve, deferred.resolve);
            }
            else {
              _updateLogin();
              deferred.resolve(_isLoggedIn);
            }
          });
        }
        return deferred.promise;
      };

      var login = function (type, user, pass) {
        var deferred = $q.defer();

        if (type == 'facebook') {
          getAccessToken(type).then(function (accessToken) {
            homeCookedLogin(accessToken, 'facebook').then(deferred.resolve, deferred.reject);
          });
        }
        else {
          $http.post(BASE_URL + '/api-auth/login/', {username: user, password: pass})
            .success(deferred.resolve)
            .error(deferred.reject);
        }
        return deferred.promise;
      };

      var logout = function () {
        if (_isLoggedIn) {
          if (loginCache.loginType === 'facebook') {
            window.openFB.logout();
          }
          _isLoggedIn = false;
          _updateLogin();
        }
      };

      var getUserInfo = function () {
        if (loginCache.loginInfo) {
          return loginCache.loginInfo.user;
        }
      };

      var isLoggedIn = function () {
        return _isLoggedIn;
      };

      var _updateLogin = function (newInfo, newType) {
        loginCache.loginType = newType;
        loginCache.loginInfo = newInfo;
        window.localStorage.setItem(CACHE_ID, JSON.stringify(loginCache));
      };

      return {
        getLoginStatus: getLoginStatus,
        isLoggedIn: isLoggedIn,
        login: login,
        getUserInfo: getUserInfo,
        logout: logout
      };
    }])
  .controller('AppCtrl', ['$scope', '$ionicModal', '$ionicLoading', '$state', '$ionicPopup', 'LoginService',
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
            $scope.user = LoginService.getUserInfo();
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
