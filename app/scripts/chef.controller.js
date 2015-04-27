'use strict';
angular.module('HomeCooked.controllers').controller('ChefCtrl', ['$scope', '$location', '$ionicModal', '$ionicLoading', '$ionicPopup', 'ChefService',
  function ($scope, $location, $ionicModal, $ionicLoading, $ionicPopup, ChefService) {
    var that = this;
    // Create the login modal that we will use later
    $ionicModal.fromTemplateUrl('templates/add-batch.html', {
      scope: $scope
    }).then(function (modal) {
      that.modal = modal;
    });

    $scope.addDish = function (dish) {
      $ionicLoading.show({template: 'Adding dish'});
      ChefService.addDish(dish)
        .then(function added() {
          $ionicLoading.hide();
          that.modal.hide();
        })
        .catch(function notAdded(error) {
          $ionicLoading.hide();
          $ionicPopup.alert({
            title: 'Couldn\'t add',
            template: error
          });
        });
    };

    $scope.hideModal = function () {
      that.modal.hide();
    };

    $scope.addBatch = function (batch) {
      $ionicLoading.show({template: 'Adding dish'});
      ChefService.addBatch(batch)
        .then(function (batches) {
          that.batches = batches;
          $ionicLoading.hide();
          that.modal.hide();
        })
        .catch(function notAdded(error) {
          $ionicLoading.hide();
          $ionicPopup.alert({
            title: 'Couldn\'t add',
            template: error
          });
        });
    };

    $scope.adjustRange = function (qty, min, max) {
      if (_.isNumber(qty)) {
        if (qty < min) {
          qty = min;
        }
        else if (qty > max) {
          qty = max;
        }
      }
      return qty;
    };

    $scope.dishes = [];
    $scope.batch = {};
    //TODO read from server
    $scope.maxQuantity = 6;
    $scope.maxPrice = 100;

    ChefService.getDishes().then(function (dishes) {
      $scope.dishes = dishes;
    });


    that.orders = [];
    that.batches = [];

    that.maxBatches = ChefService.maxBatches();

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

    that.openAddDish = function () {
      //Reset popup
      $scope.batch = {dishId: $scope.dishes[0].id};
      that.modal.show();
    };

    that.removePortions = function (batch) {
      //shall ask for confirmation before?
      ChefService.removeBatchAvailablePortions(batch).then(function (batches) {
        that.batches = batches;
      });
    };
    that.removeAllAvailablePortions = function () {
      ChefService.removeAllAvailablePortions()
        .then(function (batches) {
          that.batches = batches;
        });
    };
  }]);
