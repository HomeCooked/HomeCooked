'use strict';
angular.module('HomeCooked.controllers', [])

  .controller('AppCtrl', function ($scope, $ionicModal, $timeout) {

    // Create the login modal that we will use later
    $ionicModal.fromTemplateUrl('templates/login.html', {
      scope: $scope
    }).then(function (modal) {
      $scope.modal = modal;

      //check if user is connected to FB
      openFB.getLoginStatus(function gotStatus(status) {
        if (status.status !== 'connected') {
          $scope.openLogin();
        }
      });
    });

    // Open the login modal
    $scope.openLogin = function () {
      $scope.modal.show();
    };

    // Open the login modal
    $scope.logout = function () {
      openFB.logout();
      $scope.modal.show();
    };

    // Perform the login action when the user submits the login form
    $scope.login = function () {
      // Simulate a login delay. Remove this and replace with your login
      // code if using a login system
      $timeout(function () {
        $scope.modal.hide();
      }, 1000);
    };

    /*$scope.signup = function (form) {
     //input is form
     console.log(form);
     };*/

    $scope.fbLogin = function () {
      openFB.login(
        function (response) {
          if (response.status === 'connected') {
            console.log('Facebook login succeeded');
            $scope.modal.hide();
          } else {
            alert('Facebook login failed');
          }
        },
        {scope: 'email'});
    };
  })

  .controller('SellerCtrl', function () {
  })
  .controller('BuyerCtrl', function ($scope) {
    $scope.findChefs = function () {
      console.log(arguments);
    };
    $scope.openOrders = function () {
      console.log(arguments);
    };
  });
