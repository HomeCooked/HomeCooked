'use strict';
angular.module('HomeCooked.controllers').controller('ChefCtrl', ['$scope', '$location', '$ionicModal', '$ionicLoading', '$ionicPopup', 'ChefService',
  function ($scope, $location, $ionicModal, $ionicLoading, $ionicPopup, ChefService) {
    // Create the login modal that we will use later
    $ionicModal.fromTemplateUrl('templates/add-dish.html', {
      scope: $scope
    }).then(function (modal) {
      $scope.modal = modal;
    });

    $scope.orders = [];
    $scope.batches = [];

    ChefService.getOrders().then(function (orders) {
      $scope.orders = orders;
    });

    ChefService.getBatches().then(function (batches) {
      $scope.batches = batches;
    });

    $scope.changeDishActivity = function (dish) {
      //TODO send to server dish active
      console.log(dish);
    };

    $scope.go = function (path) {
      $location.path(path);
    };

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
