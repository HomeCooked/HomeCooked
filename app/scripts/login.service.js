'use strict';
angular.module('HomeCooked.services')
  .factory('LoginService', ['$q', '$http',
    function ($q, $http) {
      var BASE_URL = '//homecooked.herokuapp.com',
        CLIENT_ID = '111',
        CACHE_ID = 'homecooked';
      var loginData = {};
      if (window.localStorage) {
        loginData = JSON.parse(window.localStorage.getItem(CACHE_ID) || '{}');
      }

      var homeCookedLogin = function (accessToken, provider) {
        var deferred = $q.defer();
        $http.post(BASE_URL + '/connect/', {
          access_token: accessToken,
          client_id: CLIENT_ID,
          provider: provider
        })
          .success(function (data) {
            _updateLogin(data, provider);
            deferred.resolve(data.user);
          })
          .error(function loginFail(data) {
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
        if (loginData.loginInfo) {
          deferred.resolve();
        }
        else {
          window.openFB.getLoginStatus(function (response) {
            if (response && response.status === 'connected') {
              homeCookedLogin(response.authResponse.token, 'facebook').then(deferred.resolve, deferred.resolve);
            }
            else {
              _updateLogin();
              deferred.resolve();
            }
          });
        }
        return deferred.promise;
      };

      var login = function (type) {
        var deferred = $q.defer();

        getAccessToken(type).then(function (accessToken) {
          homeCookedLogin(accessToken, type).then(deferred.resolve, deferred.reject);
        });
        return deferred.promise;
      };

      var logout = function () {
        _updateLogin();
      };

      var getUserInfo = function () {
        if (loginData.loginInfo) {
          return loginData.loginInfo.user;
        }
      };

      var isLoggedIn = function () {
        return !!loginData.loginInfo && !!loginData.loginInfo.user;
      };

      var _updateLogin = function (newInfo, newType) {
        loginData.loginType = newType;
        loginData.loginInfo = newInfo;
        window.localStorage.setItem(CACHE_ID, JSON.stringify(loginData));
      };

      return {
        getLoginStatus: getLoginStatus,
        isLoggedIn: isLoggedIn,
        getUserInfo: getUserInfo,
        login: login,
        logout: logout
      };
    }]
);
