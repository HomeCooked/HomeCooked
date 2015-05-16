'use strict';
angular.module('HomeCooked.controllers').controller('ChefCtrl', ['$rootScope', '$state', '$ionicModal', '$ionicLoading', '$ionicPopup', '$q', 'ChefService', '_',
  function($rootScope, $state, $ionicModal, $ionicLoading, $ionicPopup, $q, ChefService, _) {
    var that = this;
    var modalScope = $rootScope.$new();

    var init = function() {
      that.dishes = [];
      that.batches = [];

      modalScope.ctrl = that;
      modalScope.batch = {};

      $ionicModal.fromTemplateUrl('templates/add-batch.html', {
        scope: modalScope
      }).then(function(modal) {
        that.modal = modal;
      });

      loadOrders();
    };

    var emptyBatch = function() {
      var firstDish = that.dishes[0] || {};
      return {dishId: firstDish.id};
    };

    var loadOrders = function() {
      $ionicLoading.show({template: 'Getting orders'});
      $q.all([ChefService.getBatches(), ChefService.getDishes(), ChefService.getChefData()])
        .then(function(values) {
          $ionicLoading.hide();

          that.batches = values[0];
          that.dishes = values[1];
          var chefData = values[2];
          that.maxPrice = chefData.maxPrice;
          that.maxQuantity = chefData.maxQuantity;
          that.maxBatches = chefData.maxBatches;


          modalScope.batch = emptyBatch();
        })
        .catch(handleError);
    };

    var removePortions = function(batch) {
      $ionicLoading.show({template: 'Removing...'});
      ChefService.removeBatchAvailablePortions(batch)
        .then(function(batches) {
          that.batches = batches;
          $ionicLoading.hide();
          that.modal.hide();
        })
        .catch(handleError);
    };

    var handleError = function(error) {
      $ionicLoading.hide();
      $ionicPopup.alert({
        title: 'Sorry, something went wrong',
        template: error
      });
    };


    that.hideModal = function() {
      that.modal.hide();
    };

    that.addBatch = function(batch, form) {
      $ionicLoading.show({template: 'Adding dish'});
      ChefService.addBatch(batch)
        .then(function(batches) {
          modalScope.batch = emptyBatch();
          form.$setPristine();
          that.batches = batches;
          $ionicLoading.hide();
          that.modal.hide();
        })
        .catch(handleError);
    };

    that.adjustRange = function(qty, min, max) {
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

    that.go = function(path) {
      $state.go(path);
    };

    that.openAddDish = function() {
      that.modal.show();
    };

    that.removePortions = function(batch) {
      $ionicPopup.confirm({
        title: batch.dishName + ', ' + batch.quantity + ' portion(s)',
        template: 'Do you want to delete this batch?',
        cancelText: 'No',
        okText: 'Yes, Delete',
        okType: 'button-assertive'
      }).then(function(res) {
        if (res) {
          removePortions(batch);
        }
      });
    };

    that.showBatchOrder = function(batch, order) {
      $ionicPopup.alert({
        title: 'Order details',
        template: 'user: ' + order.userName
      });
    };

    init();
  }]);
