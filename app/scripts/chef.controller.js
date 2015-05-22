'use strict';

angular.module('HomeCooked.controllers').controller('ChefCtrl', ['_', '$rootScope', '$scope', '$log', '$state', '$ionicModal', '$ionicLoading', '$ionicPopup', '$q', 'ChefService', 'LoginService', 'HCMessaging',
  function(_, $rootScope, $scope, $log, $state, $ionicModal, $ionicLoading, $ionicPopup, $q, ChefService, LoginService, HCMessaging) {
    var that = this;
    var modalScope = $rootScope.$new();

    var init = function() {
      that.dishes = [];
      that.batches = [];

      modalScope.ctrl = that;
      modalScope.batch = emptyBatch();
      modalScope.start_times = [
        {'id': 0, 'title': 'Now'},
        {'id': 1, 'title': 'in 1 hour'},
        {'id': 2, 'title': 'in 2 hours'},
        {'id': 3, 'title': 'in 3 hours'},
        {'id': 24, 'title': 'Tomorrow this time'}
      ];

      $ionicModal.fromTemplateUrl('templates/add-batch.html', {
        scope: modalScope
      }).then(function(modal) {
        that.modal = modal;
      });
    };

    var emptyBatch = function() {
      var firstDish = that.dishes[0] || {};
      return {
        dish: firstDish.id,
        start_time: 0,
        duration: 1
      };
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
        _.extend(batch, {
          'dishName': dish.title,
          'dishImage': dish.image,
          'dishPrice': dish.price
        });
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
      batch.chef = LoginService.getUser().id;
      batch.remaining = batch.quantity;

      var now = new Date();
      now.setHours(now.getHours() + batch.start_time);
      batch.start_time = now.toISOString();

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


    $scope.$on('$ionicView.beforeEnter', loadOrders);
  }]);
