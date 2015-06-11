'use strict';
(function () {
  angular.module('HomeCooked.services').factory('LoginService', LoginService);

  LoginService.$inject = ['$q', '$http', 'ENV', 'CacheService'];
  function LoginService($q, $http, ENV, CacheService) {
    var user = getUserFromCache();

    return {
      login: login,
      logout: logout,
      getUser: getUser,
      setUserZipCode: setUserZipCode,
      becomeChef: becomeChef
    };


    function login(type) {
      return getAccessToken(type).then(function (accessToken) {
        return homeCookedLogin(accessToken, type);
      });
    }

    function logout() {
      updateCache();
    }

    function getUser() {
      return user;
    }

    function setUserZipCode(zipcode) {
      user.zipcode = zipcode;
      CacheService.setCache('hcuser', user);
    }

    function becomeChef(chefInfo) {
      //FIXME remove this and use real service
      return $q.when('OK', chefInfo);

      //var deferred = $q.defer();
      //$http.post(ENV.BASE_URL + '/enroll/', chefInfo)
      //  .success(deferred.resolve)
      //  .error(function (data) {
      //    deferred.reject(JSON.stringify(data));
      //  });
      //return deferred.promise;
    }

    function getUserFromCache() {
      return CacheService.getCache('hcuser') || {};
    }

    function homeCookedLogin(accessToken, provider) {
      var deferred = $q.defer();
      $http.post(ENV.BASE_URL + '/connect/', {
        'access_token': accessToken,
        'client_id': ENV.CLIENT_ID,
        'provider': provider
      })
        .success(function (data) {
          // TODO this should come from the server
          data.user.zipcode = user.zipcode;
          data.user.isLoggedIn = true;
          updateCache(data.credential, data.user);
          deferred.resolve(user);
        })
        .error(function loginFail(data) {
          updateCache();
          deferred.reject(data);
        });
      return deferred.promise;
    }

    function getAccessToken(provider) {
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
    }

    function updateCache(credential, newUser) {
      newUser = newUser || {};
      CacheService.setCache('hccredential', credential);
      CacheService.setCache('hcuser', newUser);
      user = newUser;
    }
  }
})();
