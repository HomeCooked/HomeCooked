'use strict';

var HomeCooked = angular.module('HomeCooked', ['ionic', 'ngAnimate', 'config', 'HomeCooked.controllers', 'leaflet-directive']);

angular.module('HomeCooked.controllers', ['HomeCooked.services']);
angular.module('HomeCooked.services', []);

HomeCooked
  .constant('_', window._) //lodash
  .config(function($httpProvider) {
    $httpProvider.interceptors.push('AuthInterceptor');
  })
  .config(function($stateProvider, $urlRouterProvider, $compileProvider, ENV) {

    $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|geo|maps|market|file|itms|itms-apps):/);

    window.openFB.init({
      appId: ENV.FACEBOOK_APP_ID
    });

    $stateProvider
      .state('app', {
        url: '',
        abstract: true,
        templateUrl: 'templates/menu.html',
        controller: 'MenuCtrl as vm'
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
            templateUrl: 'templates/settings/settings.html',
            controller: 'SettingsCtrl as vm'
          }
        }
      })
      .state('app.settings-email', {
        url: '/settings/email',
        views: {
          'menuContent': {
            templateUrl: 'templates/settings/email.html',
            controller: 'SettingsCtrl as vm'
          }
        }
      })
      .state('app.settings-phonenumber', {
        url: '/settings/phonenumber',
        views: {
          'menuContent': {
            templateUrl: 'templates/settings/phonenumber.html',
            controller: 'SettingsCtrl as vm'
          }
        }
      })
      .state('app.not-found', {
        url: '/not-found',
        views: {
          'menuContent': {
            templateUrl: 'templates/not-found.html'
          }
        }
      })
      .state('zipcode-validation', {
        url: '/zipcode-validation',
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
      var nextState = 'app.not-found';
      if (!LoginService.getUser()) {
        nextState = 'zipcode-validation';
      }
      else if ($state.current.name === '') {
        nextState = 'app.buyer';
      }
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
