'use strict';
(function () {
  angular.module('HomeCooked.controllers').controller('DishesCtrl', DishesCtrl);

  DishesCtrl.$inject = ['$rootScope', '$scope', '$ionicModal', '$ionicLoading', 'ChefService', 'LoginService', 'HCMessaging'];
  function DishesCtrl($rootScope, $scope, $ionicModal, $ionicLoading, ChefService, LoginService, HCMessaging) {
    var vm = this;

    vm.dishes = [];
    vm.modal = null;

    vm.hideModal = hideModal;
    vm.addDish = addDish;
    vm.deleteDish = deleteDish;

    var modalScope = $rootScope.$new();
    modalScope.ctrl = vm;

    $ionicModal.fromTemplateUrl('templates/add-dish.html', {
      scope: modalScope
    }).then(function (modal) {
      vm.modal = modal;
    });

    $scope.$on('$ionicView.beforeEnter', reload);

    function addDish(dish, form) {
      $ionicLoading.show({template: 'Adding dish...'});
      ChefService.addDish(dish)
        .then(function added(dishes) {
          modalScope.dish = emptyDish();
          form.$setPristine();
          vm.dishes = dishes;
          hideModal();
        })
        .catch(HCMessaging.showError)
        .finally($ionicLoading.hide);
    }

    function deleteDish(dish) {
      $ionicLoading.show({template: 'Deleting dish...'});
      ChefService.deleteDish(dish)
        .then(function deleted() {
          _.remove(vm.dishes, dish);
        })
        .catch(function () {
          HCMessaging.showMessage('Cannot delete', 'There are pending orders for the dish you tried to delete.<br>You will be able to delete after the orders have been completed.');
        })
        .finally($ionicLoading.hide);
    }

    function hideModal() {
      vm.modal.hide();
    }

    function emptyDish() {
      return {user: LoginService.getUser().id};
    }

    function reload() {
      modalScope.dish = emptyDish();

      $ionicLoading.show({template: 'Getting dishes...'});
      ChefService.getDishes()
        .then(function (dishes) {
          vm.dishes = dishes;
        })
        .catch(HCMessaging.showError)
        .finally($ionicLoading.hide);
    }
  }
})();
