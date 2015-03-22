'use strict';
angular.module('HomeCooked.services')
  .factory('LoginService', ['$q', '$http', 'BASE_URL', 'CLIENT_ID', 'CACHE_ID',
    function ($q, $http, BASE_URL, CLIENT_ID, CACHE_ID) {
      var loginData = {};
      if (window.localStorage) {
        loginData = JSON.parse(window.localStorage.getItem(CACHE_ID) || '{}');
      }

      var homeCookedLogin = function (accessToken, provider) {
        var deferred = $q.defer();
        $http.post(BASE_URL + '/connect/', {
          'access_token': accessToken,
          'client_id': CLIENT_ID,
          'provider': provider
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
          deferred.resolve(loginData.loginInfo.user);
        }
        else {
          window.openFB.getLoginStatus(function (response) {
            if (response && response.status === 'connected') {
              homeCookedLogin(response.authResponse.token, 'facebook').then(deferred.resolve, deferred.reject);
            }
            else {
              _updateLogin();
              deferred.reject();
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
        login: login,
        logout: logout
      };
    }]
);
