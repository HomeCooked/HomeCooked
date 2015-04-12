'use strict';
angular.module('HomeCooked.controllers').controller('ChefCtrl', ['$scope', '$location', '$ionicModal', '$ionicLoading', '$ionicPopup', 'ChefService',
  function ($scope, $location, $ionicModal, $ionicLoading, $ionicPopup, ChefService) {
    var that = this;
    // Create the login modal that we will use later
    $ionicModal.fromTemplateUrl('templates/add-dish.html', {
      scope: $scope
    }).then(function (modal) {
      that.modal = modal;
    });

    $scope.addDish = function (dish) {
      $ionicLoading.show({template: 'Adding dish'});
      ChefService.addDish(dish).then(function added() {
        $ionicLoading.hide();
        that.modal.hide();
      }, function notAdded(error) {
        $ionicLoading.hide();
        $ionicPopup.alert({
          title: 'Couldn\'t add',
          template: error
        });
      });
    };
    $scope.hideModal = function () {
      that.modal.hide();
    }

    that.orders = [];
    that.batches = [];

    ChefService.getOrders().then(function (orders) {
      that.orders = orders;
    });

    ChefService.getBatches().then(function (batches) {
      that.batches = batches;
    });

    that.changeDishActivity = function (dish) {
      //TODO send to server dish active
      console.log(dish);
    };

    that.go = function (path) {
      $location.path(path);
    };
  }]);
