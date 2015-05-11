'use strict';
angular.module('HomeCooked.controllers').controller('DishesCtrl', ['$rootScope', '$ionicModal', '$ionicLoading', '$ionicPopup', 'ChefService',
  function($rootScope, $ionicModal, $ionicLoading, $ionicPopup, ChefService) {
    var self = this;

    var modalScope = $rootScope.$new();
    modalScope.ctrl = self;
    modalScope.dish = {};
    // Create the login modal that we will use later
    $ionicModal.fromTemplateUrl('templates/add-dish.html', {
      scope: modalScope
    }).then(function(modal) {
      self.modal = modal;
    });

    self.dishes = [];
    ChefService.getDishes().then(function(dishes) {
      self.dishes = dishes;
    });

    self.hideModal = function() {
      self.modal.hide();
    };
    self.addDish = function(dish, form) {
      $ionicLoading.show({template: 'Adding dish'});
      ChefService.addDish(dish)
        .then(function added(dishes) {
          modalScope.dish = {};
          form.$setPristine();
          self.dishes = dishes;
          $ionicLoading.hide();
          self.modal.hide();
        })
        .catch(function notAdded(error) {
          $ionicLoading.hide();
          $ionicPopup.alert({
            title: 'Couldn\'t add',
            template: error
          });
        });
    };
  }]);
