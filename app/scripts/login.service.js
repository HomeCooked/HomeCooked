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
        //TODO should come from service
        if (newUser) {
          newUser.isEnrolled = !_.isEmpty(newUser.address) && !_.isEmpty(newUser.phone_number) && !_.isEmpty(newUser.email) && !_.isEmpty(newUser.payment);
        }
        CacheService.setCache('hccredential', credential);
        CacheService.setCache('hcuser', newUser);
        user = newUser;
      };

      self.login = function (type) {
        return getAccessToken(type).then(function (accessToken) {
          return homeCookedLogin(accessToken, type);
        });
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
