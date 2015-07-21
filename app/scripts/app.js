'use strict';

var HomeCooked = angular.module('HomeCooked', [
  'ionic', 'ngAnimate', 'config', 'HomeCooked.controllers',
  'leaflet-directive', 'angular-stripe', 'angularPayments', 'naif.base64']);

angular.module('HomeCooked.controllers', ['HomeCooked.services']);
angular.module('HomeCooked.services', []);

HomeCooked
  .constant('_', window._) //lodash
  .config(function ($httpProvider) {
    $httpProvider.interceptors.push('AuthInterceptor');
  })
  .config(function ($stateProvider, $urlRouterProvider, $compileProvider, ENV, stripeProvider) {

    $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|geo|maps|market|file|itms|itms-apps):/);

    window.openFB.init({
      appId: ENV.FACEBOOK_APP_ID
    });

    stripeProvider.setPublishableKey(ENV.STRIPE_KEY);


    $stateProvider
      .state('app', {
        url: '',
        abstract: true,
        templateUrl: 'templates/menu.html',
        controller: 'MenuCtrl as menuVm'
      })
      .state('app.buyer', {
        url: '/buyer',
        views: {
          'menuContent': {
            templateUrl: 'templates/buyer/search.html',
            controller: 'SearchCtrl as vm'
          }
        }
      })
      .state('app.chef-preview', {
        url: '/chef/:id/preview',
        views: {
          'menuContent': {
            templateUrl: 'templates/buyer/preview.html',
            controller: 'ChefPreviewCtrl as vm'
          }
        }
      })
      .state('app.dish-preview', {
        url: '/chef/:id/dish/:dishId',
        views: {
          'menuContent': {
            templateUrl: 'templates/buyer/dish-detail.html',
            controller: 'DishDetailCtrl as vm'
          }
        }
      })
      .state('app.dish-review', {
        url: '/chef/:id/dish/:dishId/reviews',
        views: {
          'menuContent': {
            templateUrl: 'templates/buyer/dish-review.html',
            controller: 'DishReviewCtrl as vm'
          }
        }
      })
      .state('app.orders', {
        url: '/orders',
        views: {
          'menuContent': {
            templateUrl: 'templates/chef/orders.html'
          }
        }
      })
      .state('app.enroll', {
        url: '/enroll',
        views: {
          'menuContent': {
            templateUrl: 'templates/enroll.html',
            controller: 'EnrollCtrl as vm'
          }
        }
      })
      .state('app.seller', {
        url: '/seller',
        views: {
          'menuContent': {
            templateUrl: 'templates/chef/chef.html',
            controller: 'ChefCtrl as vm'
          }
        }
      })
      .state('app.dishes', {
        url: '/dishes',
        views: {
          'menuContent': {
            templateUrl: 'templates/chef/dishes.html',
            controller: 'DishesCtrl as vm'
          }
        }
      })
      .state('app.bio', {
        url: '/bio',
        views: {
          'menuContent': {
            templateUrl: 'templates/chef/bio.html',
            controller: 'ChefBioCtrl as vm'
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
      .state('app.settings-payment', {
        url: '/settings/payment',
        views: {
          'menuContent': {
            templateUrl: 'templates/settings/payment.html',
            controller: 'PaymentCtrl as vm'
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
    $urlRouterProvider.otherwise(function ($injector) {
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
  .run(function (LoginService) {
    LoginService.setIsChef();
  })
  .run(function ($ionicPlatform) {
    $ionicPlatform.ready(function () {
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
