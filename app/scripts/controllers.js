'use strict';
angular.module('HomeCooked.controllers', [])
  .factory('LoginService', ['$q', '$http',
    function ($q, $http) {
      var baseUrl = '//homecooked.herokuapp.com';
      var _isLoggedIn = false, currentLoginType, userInfo;

      var homeCookedLogin = function (accessToken, provider) {
        var javascriptClientId = '111';
        var deferred = $q.defer();
        $http.post(baseUrl + '/connect', {
          access_token: accessToken,
          client_id: javascriptClientId,
          provider: provider
        })
          .success(function (data) {
            currentLoginType = provider;
            _isLoggedIn = true;
            userInfo = data;
            deferred.resolve(_isLoggedIn);
          })
          .error(function loginFail(data) {
            _isLoggedIn = false;
            currentLoginType = undefined;
            userInfo = undefined;
            deferred.reject(data);
          });
        return deferred.promise;
      };

      var getLoginStatus = function () {
        var deferred = $q.defer();
        if (!_isLoggedIn) {
          window.openFB.getLoginStatus(function (response) {
            if (response && response.status === 'connected') {
              homeCookedLogin(response.authResponse.token, 'facebook').then(deferred.resolve, deferred.reject);
            }
            else {
              deferred.reject('not connected');
            }
          });
        }
        else {
          deferred.resolve(_isLoggedIn);
        }
        return deferred.promise;
      };

      var login = function (loginType, user, pass) {
        var deferred = $q.defer();
        if (loginType === 'facebook') {
          window.openFB.login(
            function didLogin(response) {
              if (response && response.status === 'connected') {
                homeCookedLogin(response.authResponse.token, 'facebook').then(deferred.resolve, deferred.reject);
              }
              else {
                deferred.reject('not connected');
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
          if (currentLoginType === 'facebook') {
            window.openFB.logout();
          }
          _isLoggedIn = false;
          currentLoginType = undefined;
        }
      };

      var getUserInfo = function () {
        var deferred = $q.defer();
        if (userInfo) {
          deferred.resolve(userInfo);
        }
        else if (_isLoggedIn) {
          if (currentLoginType === 'facebook') {
            window.openFB.api({
              path: '/v2.2/me',
              success: function (result) {
                userInfo = result;
                deferred.resolve(userInfo);
              },
              error: deferred.reject
            });
          }
          else {
            //TODO
            deferred.reject('login type not supported');
          }
        }
        else {
          deferred.reject('not logged in');
        }
        return deferred.promise;
      };
      var isLoggedIn = function () {
        return _isLoggedIn;
      }

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
        LoginService.getLoginStatus().then(openLogin, openLogin);
      });

      var openLogin = function () {
        $ionicLoading.hide();
        if (!LoginService.isLoggedIn()) {
          $scope.modal.show();
        }
      };
      var logout = function () {
        LoginService.logout();
        openLogin();
      };

      $scope.logout = logout;
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
