'use strict';
angular.module('HomeCooked.services')
  .factory('LoginService', ['$q', '$http', '$window', 'ENV', 'CacheService', '_',
    function($q, $http, $window, ENV, CacheService, _) {
      var self = this;
      var user = CacheService.getCache('hcuser');

      var homeCookedLogin = function(accessToken, provider) {
        var deferred = $q.defer();
        $http.post(ENV.BASE_URL + '/connect/', {
          'access_token': accessToken,
          'client_id': ENV.CLIENT_ID,
          'provider': provider
        })
          .success(function(data) {
            _updateLogin(data.credential, data.user);
            deferred.resolve(self.getUser());
          })
          .error(function loginFail(data) {
            _updateLogin();
            deferred.reject(data);
          });
        return deferred.promise;
      };

      var getAccessToken = function(provider) {
        var deferred = $q.defer();
        if (provider === 'facebook') {
          window.openFB.login(function(response) {
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

      var _updateLogin = function(credential, newUser) {
        //TODO should come from service
        if (newUser) {
          newUser.isEnrolled = !_.isEmpty(newUser.address) && !_.isEmpty(newUser.phone_number) && !_.isEmpty(newUser.email) && !_.isEmpty(newUser.payment);
        }
        CacheService.setCache('hccredential', credential);
        CacheService.setCache('hcuser', newUser);
        user = newUser;
      };

      self.login = function(type) {
        return getAccessToken(type).then(function(accessToken) {
          return homeCookedLogin(accessToken, type);
        });
      };

      self.logout = function() {
        _updateLogin();
      };

      self.getUser = function() {
        return user;
      };

      self.becomeChef = function(chefInfo) {
        //FIXME remove this and use real service
        return $q.when('OK', chefInfo);

        //var deferred = $q.defer();
        //$http.post(ENV.BASE_URL + '/enroll/', chefInfo)
        //  .success(deferred.resolve)
        //  .error(function (data) {
        //    deferred.reject(JSON.stringify(data));
        //  });
        //return deferred.promise;
      };
      return self;
    }]
);
