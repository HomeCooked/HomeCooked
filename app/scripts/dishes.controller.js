'use strict';
angular.module('HomeCooked.controllers').controller('DishesCtrl', ['$rootScope', '$scope', '$ionicModal', '$ionicLoading', '$ionicPopup', 'ChefService', 'LoginService', 'HCMessaging',
  function($rootScope, $scope, $ionicModal, $ionicLoading, $ionicPopup, ChefService, LoginService, HCMessaging) {
    var that = this;

    that.dishes = [];
    that.modal = null;

    that.hideModal = function() {
      that.modal.hide();
    };
    that.addDish = function(dish, form) {
      $ionicLoading.show({template: 'Adding dish...'});
      ChefService.addDish(dish)
        .then(function added(dishes) {
          modalScope.dish = emptyDish();
          form.$setPristine();
          that.dishes = dishes;
          that.modal.hide();
          $ionicLoading.hide();
        })
        .catch(HCMessaging.showError);
    };


    var emptyDish = function() {
      return {user: LoginService.getUser().id};
    };

    var modalScope = $rootScope.$new();
    modalScope.ctrl = that;

    var reload = function() {
      modalScope.dish = emptyDish();

      $ionicLoading.show({template: 'Getting dishes...'});
      ChefService.getDishes(true)
        .then(function(dishes) {
          that.dishes = dishes;
          $ionicLoading.hide();
        })
        .catch(HCMessaging.showError);
    };

    $ionicModal.fromTemplateUrl('templates/add-dish.html', {
      scope: modalScope
    }).then(function(modal) {
      that.modal = modal;
    });

    $scope.$on('$ionicView.beforeEnter', reload);
  }]);
