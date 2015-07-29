'use strict';
(function() {
    angular.module('HomeCooked.services').factory('LoginService', LoginService);

    LoginService.$inject = ['$q', '$http', '$cordovaFacebook', 'ENV', 'CacheService', '_'];
    function LoginService($q, $http, $cordovaFacebook, ENV, CacheService, _) {
        var user = CacheService.getValue('user') || {},
            baseUrl = ENV.BASE_URL + '/api/v1/';

        return {
            init: init,
            login: login,
            logout: logout,
            getUser: getUser,
            setUserZipCode: setUserZipCode,
            becomeChef: becomeChef
        };

        function init() {
            if (user.isLoggedIn && user.id) {
                $http.get(baseUrl + 'users/' + user.id + '/')
                    .success(function(userData) {
                        _.assign(user, userData);
                        CacheService.setValue({user: user});
                    });
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
            $http.post(baseUrl + 'chefs/enroll/', chefInfo)
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
            if (provider === 'facebook') {
                return doFacebookLogin()
                    .then(function(response) {
                        var token = _.get(response, 'authResponse.token') || _.get(response, 'authResponse.accessToken');
                        if (token) {
                            return token;
                        }
                        return $q.reject('not connected');
                    });
            }
            return $q.reject('not supported');
        }

        function doFacebookLogin() {
            var deferred = $q.defer();
            var scope = ['public_profile', 'email'];
            if (window.cordova) {
                $cordovaFacebook.login(scope).then(deferred.resolve, deferred.reject);
            }
            else {
                window.openFB.login(deferred.resolve, {scope: scope});
            }
            _.delay(deferred.reject.bind(deferred, 'timeout'), 60000);
            return deferred.promise;
        }
    }
})();
