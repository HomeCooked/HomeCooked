'use strict';
angular.module('HomeCooked.controllers').controller('ChefCtrl', ['$scope', '$ionicModal', '$ionicLoading', '$ionicPopup', 'ChefService',
  function ($scope, $ionicModal, $ionicLoading, $ionicPopup, ChefService) {
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
      $ionicLoading.show({template: 'Adding dish'});
      ChefService.addDish(dish).then(function added() {
        $ionicLoading.hide();
        $scope.modal.hide();
      }, function notAdded(error) {
        $ionicLoading.hide();
        $ionicPopup.alert({
          title: 'Couldn\'t add',
          template: error
        });
      });
    };
  }]);
