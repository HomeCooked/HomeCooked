'use strict';
angular.module('HomeCooked.controllers').controller('ChefCtrl', ['$rootScope', '$state', '$ionicModal', '$ionicLoading', '$ionicPopup', '$q', 'ChefService',
  function ($rootScope, $state, $ionicModal, $ionicLoading, $ionicPopup, $q, ChefService) {
    var that = this;

    that.dishes = [];
    that.batches = [];
    that.newBatch = {};
    //TODO read from server
    that.maxQuantity = 6;
    that.maxPrice = 100;
    that.maxBatches = ChefService.maxBatches();

    var modalScope = $rootScope.$new();
    modalScope.ctrl = that;

    $ionicModal.fromTemplateUrl('templates/add-batch.html', {
      scope: modalScope
    }).then(function (modal) {
      that.modal = modal;
    });

    that.hideModal = function () {
      that.modal.hide();
    };

    that.addBatch = function (batch) {
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

    that.adjustRange = function (qty, min, max) {
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

    that.changeDishActivity = function (dish) {
      //TODO send to server dish active
      console.log(dish);
    };

    that.go = function (path) {
      $state.go(path);
    };

    that.openAddDish = function () {
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

    that.showBatchOrder = function (batch, order) {
      $ionicPopup.alert({
        title: 'Order details',
        template: 'user: ' + order.userName
      });
    };

    $ionicLoading.show({template: 'Getting dishes'});
    $q.all([ChefService.getBatches(), ChefService.getDishes()])
      .then(function (values) {
        $ionicLoading.hide();
        that.batches = values[0];
        that.dishes = values[1];
        that.newBatch = {dishId: that.dishes[0].id};
      })
      .catch(function (err) {
        $ionicLoading.hide();
        that.batches = [];
        that.dishes = [];
        $ionicPopup.alert({
          title: 'Couldn\'t get dishes',
          template: err
        });
      });
  }]);
