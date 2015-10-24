'use strict';
(function () {
    angular.module('HomeCooked.services').factory('LoginService', LoginService);

    LoginService.$inject = ['$q', '$rootScope', '$http', '$cordovaFacebook', 'ENV', 'CacheService', 'ChefService', '_'];
    function LoginService($q, $rootScope, $http, $cordovaFacebook, ENV, CacheService, ChefService, _) {
        var user = {},
            baseUrl = ENV.BASE_URL + '/api/v1/';
        setUser(CacheService.getValue('user'));

        var chefMode = CacheService.getValue('chefMode');

        $rootScope.$on('unauthorized', logout);

        return {
            reloadUser: reloadUser,
            login: login,
            signup: signup,
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
            if (user.isLoggedIn && typeof user.id === 'number') {
                return $http.get(baseUrl + 'users/' + user.id + '/')
                    .then(function (response) {
                        handleUser(response.data);
                        ChefService.reloadChef(user);
                    })
                    .catch(invalidateUser);
            }
            return $q.when(user);
        }

        function invalidateUser() {
            ChefService.invalidateChef();
            return handleUser();
        }

        function login(provider, data) {
            data = data || {};
            var tokenPromise;
            if (provider === 'facebook') {
                tokenPromise = getFacebookToken();
            }
            else if (provider === 'homecooked') {
                tokenPromise = getHomecookedToken(data);
            }
            if (tokenPromise) {
                return tokenPromise.then(function (token) {
                    return loadUser(token, provider);
                });
            }
            return $q.reject('not supported');
        }

        function signup(provider, data) {
            if (provider !== 'homecooked') {
                return $q.reject('not supported');
            }
            data = data || {};
            return $http.post(ENV.BASE_URL + '/auth/register/', {
                'provider': provider,
                'username': data.email,
                'email': data.email,
                'password': data.password
            }).then(function () {
                return login(provider, data);
            });
        }

        function logout() {
            invalidateUser();
            return $q.reject();
        }

        function getUser() {
            return user;
        }

        function setUser(newUser) {
            newUser = newUser || {};
            _.forEach(user, function (val, key) {
                if (!newUser.hasOwnProperty(key) && key !== 'zipcode') {
                    user[key] = undefined;
                    delete user[key];
                }
            });
            if (!_.isEmpty(newUser)) {
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
                .error(deferred.reject);
            return deferred.promise;
        }

        function loadUser(token, provider) {
            return $http.post(ENV.BASE_URL + '/connect/', {
                'access_token': token,
                'provider': provider
            })
                .then(function (response) {
                    var data = response.data;
                    CacheService.setValue({
                        provider: provider,
                        credential: data.credential
                    });
                    handleUser(data.user);
                    ChefService.reloadChef(user);
                    return user;
                }, logout);
        }

        function getFacebookToken() {
            var deferred = $q.defer();
            var scope = ['public_profile', 'email'];
            if (window.cordova) {
                $cordovaFacebook.login(scope).finally(onFacebookLoginSuccess);
            }
            else {
                window.openFB.login(onFacebookLoginSuccess, {scope: scope});
            }
            _.delay(function () {
                deferred.reject('timeout');
            }, 90000);
            return deferred.promise;

            function onFacebookLoginSuccess(response) {
                response = response || {};
                var authResponse = response.authResponse || {},
                    token = authResponse.token || authResponse.accessToken,
                    error = response.error || 'Could not connect.';
                if (token) {
                    deferred.resolve(token);
                }
                else {
                    deferred.reject(error);
                }
            }
        }

        function getHomecookedToken(data) {
            return $http.post(ENV.BASE_URL + '/auth/login/', {
                'username': data.email,
                'password': data.password
            })
                .then(function (response) {
                    var token = _.get(response, 'data.auth_token');
                    if (!token) {
                        return $q.reject('Could not connect.');
                    }
                    return token;
                });
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
            return $http.patch(baseUrl + (chefMode ? 'chefs/' : 'users/') + user.id + '/', data)
                .then(function (response) {
                    return handleUser(response.data);
                });
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
            var res = parseInt(phone, 10);
            if (isNaN(res)) {
                return '';
            }
            return res;
        }

        function handleUser(newUser) {
            if (newUser) {
                newUser.isLoggedIn = true;
            }
            setUser(newUser);
            CacheService.setValue({user: user});
            return user;
        }
    }
})();
