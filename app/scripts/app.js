'use strict';

var HomeCooked = angular.module('HomeCooked', [
    'ionic', 'ngCordova', 'ngAnimate', 'config', 'HomeCooked.controllers',
    'ionic.rating', 'leaflet-directive', 'angular-stripe', 'angularPayments', 'naif.base64', 'ngImgCrop', 'google.places', 'angularMoment']);

angular.module('HomeCooked.services', []);
angular.module('HomeCooked.directives', []);
angular.module('HomeCooked.controllers', ['HomeCooked.services', 'HomeCooked.directives']);

HomeCooked
    .constant('_', window._) //lodash
    .config(function($httpProvider) {
        $httpProvider.interceptors.push('AuthInterceptor');
    })
    .config(function($stateProvider, $urlRouterProvider, $compileProvider, ENV, stripeProvider) {

        $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|geo|maps|market|file|itms|itms-apps):/);

        stripeProvider.setPublishableKey(ENV.STRIPE_KEY);

        $stateProvider
            .state('app', {
                url: '',
                abstract: true,
                templateUrl: 'templates/menu.html',
                controller: 'MenuCtrl as menuVm'
            })
            .state('app.buyer', {
                url: '/buyer/',
                views: {
                    'menuContent': {
                        templateUrl: 'templates/buyer/search.html',
                        controller: 'SearchCtrl as vm'
                    }
                }
            })
            .state('app.chef-preview', {
                url: '/chef/:id/preview/',
                views: {
                    'menuContent': {
                        templateUrl: 'templates/buyer/preview.html',
                        controller: 'ChefPreviewCtrl as vm'
                    }
                }
            })
            .state('app.dish-preview', {
                url: '/chef/:id/dish/:dishId/',
                views: {
                    'menuContent': {
                        templateUrl: 'templates/buyer/dish-detail.html',
                        controller: 'ChefPreviewCtrl as vm'
                    }
                }
            })
            .state('app.dish-review', {
                url: '/chef/:id/dish/:dishId/reviews/',
                views: {
                    'menuContent': {
                        templateUrl: 'templates/buyer/dish-review.html',
                        controller: 'DishReviewCtrl as vm'
                    }
                }
            })
            .state('app.orders', {
                url: '/orders/',
                views: {
                    'menuContent': {
                        templateUrl: 'templates/buyer/orders.html',
                        controller: 'OrdersCtrl as vm'
                    }
                }
            })
            .state('app.enroll', {
                url: '/enroll/',
                views: {
                    'menuContent': {
                        templateUrl: 'templates/enroll.html',
                        controller: 'EnrollCtrl as vm'
                    }
                }
            })
            .state('app.seller', {
                url: '/seller/:v',
                views: {
                    'menuContent': {
                        templateUrl: 'templates/chef/chef.html',
                        controller: 'ChefCtrl as vm'
                    }
                }
            })
            .state('app.dishes', {
                url: '/dishes/:v',
                views: {
                    'menuContent': {
                        templateUrl: 'templates/chef/dishes.html',
                        controller: 'DishesCtrl as vm'
                    }
                }
            })
            .state('app.bio', {
                url: '/bio/',
                views: {
                    'menuContent': {
                        templateUrl: 'templates/chef/bio.html',
                        controller: 'ChefBioCtrl as vm'
                    }
                }
            })
            .state('app.settings', {
                url: '/settings/',
                views: {
                    'menuContent': {
                        templateUrl: 'templates/settings/settings.html',
                        controller: 'SettingsCtrl as vm'
                    }
                }
            })
            .state('app.settings-email', {
                url: '/settings/email/',
                views: {
                    'menuContent': {
                        templateUrl: 'templates/settings/email.html',
                        controller: 'SettingsCtrl as vm'
                    }
                }
            })
            .state('app.pending-reviews', {
                url: '/pending-reviews/',
                views: {
                    'menuContent': {
                        templateUrl: 'templates/buyer/pending-reviews.html',
                        controller: 'PendingReviewsCtrl as vm'
                    }
                }
            })
            .state('app.not-found', {
                url: '/not-found/',
                views: {
                    'menuContent': {
                        templateUrl: 'templates/not-found.html'
                    }
                }
            })
            .state('zipcode-validation', {
                url: '/zipcode-validation/',
                templateUrl: 'templates/zipcode/form.html',
                controller: 'ZipCodeRestrictionCtrl as vm'
            })
            .state('zipcode-unavailable', {
                url: '/zipcode-unavailable/:zipcode',
                templateUrl: 'templates/zipcode/unavailable.html',
                controller: 'ZipCodeRestrictionCtrl as vm'
            });
        // if none of the above states are matched, use this as the fallback
        $urlRouterProvider.otherwise(function($injector) {
            var $state = $injector.get('$state');
            var LoginService = $injector.get('LoginService');
            var nextState = 'app.not-found',
                user = LoginService.getUser();
            if (!user.isLoggedIn) {
                nextState = user.zipcode ? 'app.buyer' : 'zipcode-validation';
            }
            else if ($state.current.name === '') {
                nextState = 'app.buyer';
            }
            $state.go(nextState);
        });
    })
    .run(function(LoginService, ChefService, CacheService, HCModalHelper) {
        LoginService.reloadUser().then(ChefService.reloadChef);
        if (!CacheService.getWelcomeTutorialComplete()) {
            HCModalHelper.showTutorial([{
                title: 'An everyday option to food!',
                image: 'images/welcome1.png',
                message: '<p>Find the best amateur chefs in your neighborhood and pick-up their delicious, affordable home cooked meals minutes after they come out of the oven.</p>'
            }, {
                title: 'Fresh ingredients, talented cooks',
                image: 'images/welcome1.png',
                message: '<p>Our amateur chefs go through a rigorous testing process and abide to strict safety guidelines. Your ratings and reviews showcase the best of the best.</p>'
            }, {
                title: 'Ready when you are',
                image: 'images/welcome1.png',
                message: '<p>Select a nearby chef and choose the best time to pick up your hot dinner.</p>'
            }], CacheService.setWelcomeTutorialComplete);
        }
    })
    .run(function($ionicPlatform, NotificationService, ENV) {
        $ionicPlatform.ready(function() {
            if (window.cordova && window.facebookConnectPlugin) {
                window.facebookConnectPlugin.browserInit(ENV.FACEBOOK_APP_ID, 'v2.2');
            }
            if (!window.cordova && window.openFB) {
                window.openFB.init({
                    appId: ENV.FACEBOOK_APP_ID
                });
            }
            // Hide the accessory b ar by default (remove this to show the accessory bar above the keyboard
            // for form inputs)
            if (window.cordova && window.cordova.plugins.Keyboard) {
                cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
            }
            if (window.StatusBar) {
                // org.apache.cordova.statusbar required
                StatusBar.styleDefault();
            }
            if (window.cordova) {
                NotificationService.register();
            }

        });
    });
