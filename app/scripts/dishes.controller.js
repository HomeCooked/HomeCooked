'use strict';
angular.module('HomeCooked.controllers').controller('DishesCtrl', ['$scope', '$ionicModal', '$ionicLoading', '$ionicPopup', 'ChefService',
  function ($scope, $ionicModal, $ionicLoading, $ionicPopup, ChefService) {
    var self = this;
    // Create the login modal that we will use later
    $ionicModal.fromTemplateUrl('templates/add-dish.html', {
      scope: $scope
    }).then(function (modal) {
      self.modal = modal;
    });

    self.dishes = [];
    ChefService.getDishes().then(function (dishes) {
      self.dishes = dishes;
    });

    $scope.hideModal = function(){
      self.modal.hide();
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
