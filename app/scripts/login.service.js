'use strict';
(function() {
    angular.module('HomeCooked.services').factory('LoginService', LoginService);

    LoginService.$inject = ['$q', '$rootScope', '$http', '$cordovaFacebook', 'ENV', 'CacheService', '_'];
    function LoginService($q, $rootScope, $http, $cordovaFacebook, ENV, CacheService, _) {
        var user = {},
            baseUrl = ENV.BASE_URL + '/api/v1/';
        setUser(CacheService.getValue('user'));

        var chefMode = CacheService.getValue('chefMode');

        $rootScope.$on('unauthorized', logout);

        return {
            reloadUser: reloadUser,
            login: login,
            logout: logout,
            getUser: getUser,
            setUserZipCode: setUserZipCode,
            saveUserData: saveUserData,
            becomeChef: becomeChef,
            getChefMode: getChefMode,
            setChefMode: setChefMode,
            getNotified: getNotified
        };

        function reloadUser() {
            if (user.isLoggedIn && user.id) {
                return $http.get(baseUrl + 'users/' + user.id + '/').then(handleUser);
            }
            return $q.when(user);
        }

        function login(type) {
            return getAccessToken(type).then(function(accessToken) {
                return homeCookedLogin(accessToken, type);
            });
        }

        function logout() {
            var zipcode = user.zipcode;
            setUser();
            user.zipcode = zipcode;
            CacheService.setValue({user: user});
        }

        function getUser() {
            return user;
        }

        function setUser(newUser) {
            if (_.isEmpty(newUser)) {
                _.forEach(user, function(val, key) {
                    user[key] = undefined;
                    delete user[key];
                });
            }
            else {
                newUser.phone_number = deserializePhone(newUser.phone_number);
                _.assign(user, newUser);
            }
        }

        function setUserZipCode(zipcode) {
            user.zipcode = zipcode;
            CacheService.setValue({user: user});
        }

        function becomeChef(chefInfo) {
            chefInfo.user = user.id;
            chefInfo.phone_number = serializePhone(chefInfo.phone_number);
            chefInfo.picture = chefInfo.picture.split(';base64,').pop();

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
                    data.user.isLoggedIn = true;
                    setUser(data.user);
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

        function getChefMode() {
            return chefMode;
        }

        function setChefMode(mode) {
            chefMode = (mode === true);
            CacheService.setValue({chefMode: chefMode});
        }

        function saveUserData(data) {
            data.phone_number = serializePhone(data.phone_number);
            return $http.patch(baseUrl + (chefMode ? 'chefs/' : 'users/') + user.id + '/', data).then(handleUser);
        }

        function getNotified(zipcode, email) {
            return $http.post(baseUrl + 'users/get_notified/', {
                zipcode: zipcode,
                email: email
            });
        }

        function serializePhone(phone) {
            if (phone && (phone + '').indexOf('1') !== 0) {
                return '1' + phone;
            }
            return phone;
        }

        function deserializePhone(phone) {
            if (typeof phone === 'string') {
                return parseInt(phone, 10);
            }
            return phone;
        }

        function handleUser(response) {
            setUser(response.data);
            CacheService.setValue({user: user});
            return user;
        }
    }
})();
