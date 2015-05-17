'use strict';
angular.module('HomeCooked.controllers').controller('DishesCtrl', ['$rootScope', '$scope', '$ionicModal', '$ionicLoading', '$ionicPopup', 'ChefService', 'LoginService',
  function($rootScope, $scope, $ionicModal, $ionicLoading, $ionicPopup, ChefService, LoginService) {
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
        .catch(function notAdded(error) {
          $ionicLoading.hide();
          $ionicPopup.alert({
            title: 'Couldn\'t add',
            template: error
          });
        });
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
        .catch(function(error) {
          $ionicLoading.hide();
          $ionicPopup.alert({
            title: 'Couldn\'t load dishes',
            template: error
          });
        });
    };

    $ionicModal.fromTemplateUrl('templates/add-dish.html', {
      scope: modalScope
    }).then(function(modal) {
      that.modal = modal;
    });

    $scope.$on('$ionicView.beforeEnter', reload);
  }]);
