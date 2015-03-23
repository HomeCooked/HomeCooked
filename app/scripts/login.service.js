'use strict';
angular.module('HomeCooked.services')
  .factory('LoginService', ['$q', '$http', '$window', 'BASE_URL', 'CLIENT_ID', 'CacheService',
    function ($q, $http, $window, BASE_URL, CLIENT_ID, CacheService) {
      var self = this;
      var user = CacheService.getCache('hcuser');

      var homeCookedLogin = function (accessToken, provider) {
        var deferred = $q.defer();
        $http.post(BASE_URL + '/connect/', {
          'access_token': accessToken,
          'client_id': CLIENT_ID,
          'provider': provider
        })
          .success(function (data) {
            _updateLogin(data.credential, data.user);
            deferred.resolve(self.getUser());
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

      var _updateLogin = function (credential, newUser) {
        CacheService.setCache('hccredential', credential);
        CacheService.setCache('hcuser', newUser);
        user = newUser;
      };

      self.login = function (type) {
        var deferred = $q.defer();

        getAccessToken(type).then(function (accessToken) {
          homeCookedLogin(accessToken, type).then(deferred.resolve, deferred.reject);
        });
        return deferred.promise;
      };

      self.logout = function () {
        _updateLogin();
      };

      self.getUser = function () {
        return user;
      };

      return self;
    }]
);
