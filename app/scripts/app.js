'use strict';

angular.module('HomeCooked', ['ionic', 'ngAnimate', 'HomeCooked.controllers'])
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
  })
  .constant("BASE_URL", "//homecooked.herokuapp.com")
  .constant("CLIENT_ID", "111")
  .constant("CACHE_ID", "homecooked")
  .config(function ($stateProvider, $urlRouterProvider) {
    window.openFB.init({appId: '805673482820123'});
    $stateProvider
      .state('app', {
        url: '/app',
        abstract: true,
        templateUrl: 'templates/menu.html',
        controller: 'LoginCtrl'
      })

      .state('app.buyer', {
        url: '/buyer',
        views: {
          'menuContent': {
            templateUrl: 'templates/buyer.html'
          }
        }
      })
      .state('app.seller', {
        url: '/seller',
        views: {
          'menuContent': {
            templateUrl: 'templates/chef.html',
            controller: 'ChefCtrl'
          }
        }
      });
    // if none of the above states are matched, use this as the fallback
    $urlRouterProvider.otherwise('/app/buyer');
  });
angular.module('HomeCooked.controllers', ['HomeCooked.services']);
angular.module('HomeCooked.services', []);
