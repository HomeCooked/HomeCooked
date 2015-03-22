'use strict';
angular.module('HomeCooked.controllers').controller('ChefCtrl', ['$scope', '$ionicModal',
  function ($scope, $ionicModal) {
    // Create the login modal that we will use later
    $ionicModal.fromTemplateUrl('templates/add-dish.html', {
      scope: $scope
    }).then(function (modal) {
      $scope.modal = modal;
    });

    $scope.dishes = [{
      name: 'mock dish',
      description: 'mock description'
    }];

    $scope.addDish = function (dish) {

      $scope.modal.hide();
    };
  }]);
