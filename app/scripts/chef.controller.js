'use strict';


// OLD def
//{
//  dishImage: 'images/logo.png',
//  dishId: batch.dishId,
//  dishName: dish.title,
//  quantity: batch.quantity,
//  quantityOrdered: 0,
//  price: batch.price,
//  orders: []
//}

// NEW def
//{
//  "id": 1,
//  "quantity": 1,
//  "remaining": 1,
//  "start_time": "2015-01-01T01:01:00Z",
//  "duration": 10,
//  "prep_time": 10,
//  "chef": 2,
//  "dish": 1
//}

angular.module('HomeCooked.controllers').controller('ChefCtrl', ['_', '$rootScope', '$log', '$state', '$ionicModal', '$ionicLoading', '$ionicPopup', '$q', 'ChefService', 'HCMessaging',
  function(_, $rootScope, $log, $state, $ionicModal, $ionicLoading, $ionicPopup, $q, ChefService, HCMessaging) {
    var that = this;
    var modalScope = $rootScope.$new();

    var init = function() {
      that.dishes = [];
      that.batches = [];

      modalScope.ctrl = that;
      modalScope.batch = emptyBatch();

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

          that.dishes = values[1];
          that.batches = values[0];
          setBatchesDishInfo(that.batches, that.dishes);
          var chefData = values[2];
          that.maxPrice = chefData.maxPrice;
          that.maxQuantity = chefData.maxQuantity;
          that.maxBatches = chefData.maxBatches;


          modalScope.batch = emptyBatch();
        })
        .catch(HCMessaging.showError);
    };

    var setBatchesDishInfo = function(batches, dishes) {
      _.forEach(batches, function(batch) {
        var dish = _.find(dishes, {'id': batch.dish}) || {};
        _.extend(batch, {'dishName': dish.title, 'dishImage': dish.image});
      });
    };

    var removePortions = function(batch) {
      $ionicLoading.show({template: 'Removing...'});
      ChefService.removeBatchAvailablePortions(batch)
        .then(function(batches) {
          that.batches = batches;
          $ionicLoading.hide();
          that.modal.hide();
        })
        .catch(HCMessaging.showError);
    };

    that.hideModal = function() {
      that.modal.hide();
    };

    that.addBatch = function(batch, form) {
      $ionicLoading.show({template: 'Adding batch'});
      ChefService.addBatch(batch)
        .then(function(batches) {
          modalScope.batch = emptyBatch();
          form.$setPristine();
          that.batches = batches;
          setBatchesDishInfo(that.batches, that.dishes);
          $ionicLoading.hide();
          that.modal.hide();
        })
        .catch(HCMessaging.showError);
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
