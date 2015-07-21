'use strict';
(function() {
    angular.module('HomeCooked.services').factory('LoginService', LoginService);

    LoginService.$inject = ['$q', '$http', 'ENV', 'CacheService', '_'];
    function LoginService($q, $http, ENV, CacheService, _) {
        var user = CacheService.getValue('user') || {};

        return {
            init: init,
            login: login,
            logout: logout,
            getUser: getUser,
            setUserZipCode: setUserZipCode,
            becomeChef: becomeChef
        };

        function init() {
            var credential = CacheService.getValue('credential');
            if (credential) {
                homeCookedLogin(credential.access_token, 'facebook');
            }
        }

        function login(type) {
            return getAccessToken(type).then(function(accessToken) {
                return homeCookedLogin(accessToken, type);
            });
        }

        function logout() {
            CacheService.invalidateCache();
            _.forEach(user, function(val, key) {
                user[key] = undefined;
                delete user[key];
            });
        }

        function getUser() {
            return user;
        }

        function setUserZipCode(zipcode) {
            user.zipcode = zipcode;
            CacheService.setValue({user: user});
        }

        function becomeChef(chefInfo) {
            chefInfo.user = user.id;
            var deferred = $q.defer();
            $http.post(ENV.BASE_URL + '/api/v1/chefs/enroll/', chefInfo)
                .success(deferred.resolve)
                .error(function(data) {
                    deferred.reject(JSON.stringify(data));

                });
            return deferred.promise;
        }

        function homeCookedLogin(accessToken, provider) {
            return $http.post(ENV.BASE_URL + '/connect/', {
                'access_token': accessToken,
                'client_id': ENV.CLIENT_ID,
                'provider': provider
            })
                .then(function(response) {
                    var data = response.data;
                    // TODO this should come from the server
                    data.user.zipcode = user.zipcode;
                    _.assign(user, data.user, {isLoggedIn: true});
                    CacheService.setValue({
                        provider: provider,
                        credential: data.credential
                    });
                    return user.is_chef;
                })
                .finally(function() {
                    if (user.isLoggedIn) {
                        CacheService.setValue({user: user});
                    }
                    else {
                        CacheService.invalidateCache();
                    }
                });
        }

        function getAccessToken(provider) {
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
        }
    }
})();
