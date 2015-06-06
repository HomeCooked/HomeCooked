'use strict';

var HomeCooked = angular.module('HomeCooked', ['ionic', 'ngAnimate', 'config', 'HomeCooked.controllers']);

angular.module('HomeCooked.controllers', ['HomeCooked.services']);
angular.module('HomeCooked.services', []);

HomeCooked
    .constant('_', window._) //lodash
    .config(function($httpProvider) {
        $httpProvider.interceptors.push('AuthInterceptor');
    })
    .config(function($stateProvider, $urlRouterProvider, ENV) {

        window.openFB.init({
            appId: ENV.FACEBOOK_APP_ID
        });

        $stateProvider
            .state('app', {
                url: '/app',
                abstract: true,
                templateUrl: 'templates/menu.html'
            })
            .state('app.signup', {
                url: '/signup',
                views: {
                    'menuContent': {
                        templateUrl: 'templates/signup/signup.html',
                        controller: 'SignupCtrl as vm'
                    }
                }
            })
            .state('app.main', {
                url: '/main',
                views: {
                    'menuContent': {
                        templateUrl: 'templates/main.html'
                    }
                }
            })
            .state('app.buyer', {
                url: '/buyer',
                views: {
                    'menuContent': {
                        templateUrl: 'templates/buyer.html'
                    }
                }
            })
            .state('app.orders', {
                url: '/orders',
                views: {
                    'menuContent': {
                        templateUrl: 'templates/orders.html'
                    }
                }
            })
            .state('app.enroll', {
                url: '/enroll',
                views: {
                    'menuContent': {
                        templateUrl: 'templates/enroll.html'
                    }
                }
            })
            .state('app.seller', {
                url: '/seller',
                views: {
                    'menuContent': {
                        templateUrl: 'templates/chef.html'
                    }
                }
            })
            .state('app.dishes', {
                url: '/dishes',
                views: {
                    'menuContent': {
                        templateUrl: 'templates/dishes.html'
                    }
                }
            })
            .state('app.bio', {
                url: '/bio',
                views: {
                    'menuContent': {
                        templateUrl: 'templates/bio.html'
                    }
                }
            })
            .state('app.delivery', {
                url: '/delivery',
                views: {
                    'menuContent': {
                        templateUrl: 'templates/delivery.html'
                    }
                }
            })
            .state('app.settings', {
                url: '/settings',
                views: {
                    'menuContent': {
                        templateUrl: 'templates/settings.html'
                    }
                }
            });
        // if none of the above states are matched, use this as the fallback
        $urlRouterProvider.otherwise( function($injector) {
            var $state = $injector.get('$state');
            var LoginService = $injector.get('LoginService');
            var nextState = LoginService.getUser() === null ? 'app.signup' : 'app.buyer';
            $state.go(nextState);
        });
    })
    .run(function($ionicPlatform) {
        $ionicPlatform.ready(function() {
            // Hide the accessory b ar by default (remove this to show the accessory bar above the keyboard
            // for form inputs)
            if (window.cordova && window.cordova.plugins.Keyboard) {
                cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
            }
            if (window.StatusBar) {
                // org.apache.cordova.statusbar required
                StatusBar.styleDefault();
            }
        });
    });
