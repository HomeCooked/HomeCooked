'use strict';
angular.module('HomeCooked.controllers', [])

  .controller('AppCtrl', function ($scope, $ionicModal, $timeout, Parse) {
    // Form data for the login modal
    Parse.initialize('LaxhuAA5aa4vMQ7SfNfDchfXgMETj2xVl3tGoMWC', 'ajYR5N3u2d1G4f5bZ52HBJwFCZRyJ4S3CNLAk5Il');
    $scope.loginData = {};
    $scope.currentUser = Parse.User.current();

    // Create the login modal that we will use later
    $ionicModal.fromTemplateUrl('templates/login.html', {
      scope: $scope
    }).then(function (modal) {
      $scope.modal = modal;
      if ($scope.currentUser) {
        $scope.login();
      }
    });

    // Triggered in the login modal to close it
    $scope.closeLogin = function () {
      $scope.modal.hide();
    };

    // Open the login modal
    $scope.login = function () {
      $scope.modal.show();
    };

    // Open the login modal
    $scope.logout = function () {
      $scope.loginData = {};
      $scope.modal.show();
    };

    // Perform the login action when the user submits the login form
    $scope.doLogin = function () {
      console.log('Doing login', $scope.loginData);

      // Simulate a login delay. Remove this and replace with your login
      // code if using a login system
      $timeout(function () {
        $scope.closeLogin();
      }, 1000);
    };
  })

  .controller('PlaylistsCtrl', function ($scope) {
    $scope.playlists = [
      {title: 'Reggae', id: 1},
      {title: 'Chill', id: 2},
      {title: 'Dubstep', id: 3},
      {title: 'Indie', id: 4},
      {title: 'Rap', id: 5},
      {title: 'Cowbell', id: 6}
    ];
  })

  .controller('PlaylistCtrl', function () {})
  .controller('BuyerCtrl', function ($scope) {
    $scope.findChefs = function () {
      console.log(arguments);
    };
    $scope.openOrders = function () {
      console.log(arguments);
    };
  });
