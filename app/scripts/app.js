'use strict';
var Parse = require('parse').Parse;
Parse.initialize('LaxhuAA5aa4vMQ7SfNfDchfXgMETj2xVl3tGoMWC', 'ajYR5N3u2d1G4f5bZ52HBJwFCZRyJ4S3CNLAk5Il');

// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js
angular.module('HomeCooked', ['ionic', 'HomeCooked.controllers'])

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if(window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if(window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }
  });
})

.config(function($stateProvider, $urlRouterProvider) {
  $stateProvider
    .state('app', {
      url: '/app',
      abstract: true,
      templateUrl: 'templates/menu.html',
      controller: 'AppCtrl'
    })

    .state('app.search', {
      url: '/search',
      views: {
        'menuContent' :{
          templateUrl: 'templates/search.html'
        }
      }
    })

    .state('app.buyer', {
      url: '/buyer',
      views: {
        'menuContent' :{
          templateUrl: 'templates/buyer.html',
          controller: 'BuyerCtrl'
        }
      }
    })
    .state('app.seller', {
      url: '/seller',
      views: {
        'menuContent' :{
          templateUrl: 'templates/seller.html',
          controller: 'SellerCtrl'
        }
      }
    })
    .state('app.playlists', {
      url: '/playlists',
      views: {
        'menuContent' :{
          templateUrl: 'templates/playlists.html',
          controller: 'PlaylistsCtrl'
        }
      }
    })

    .state('app.chefs', {
      url: '/buyer/:zipcode',
      views: {
        'menuContent' :{
          templateUrl: 'templates/playlist.html',
          controller: 'PlaylistCtrl'
        }
      }
    });
  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/app/buyer');
});

