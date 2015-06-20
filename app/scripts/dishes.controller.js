(function () {
  'use strict';
  angular.module('HomeCooked.controllers').controller('DishesCtrl', DishesCtrl);

  DishesCtrl.$inject = ['$rootScope', '$scope', '$ionicModal', '$ionicLoading', 'ChefService', 'LoginService', 'HCMessaging', '_'];
  function DishesCtrl($rootScope, $scope, $ionicModal, $ionicLoading, ChefService, LoginService, HCMessaging, _) {
    var vm = this;

    vm.dishes = [];

    vm.showModal = showModal;
    vm.hideModal = hideModal;
    vm.addDish = addDish;
    vm.deleteDish = deleteDish;
    vm.uploadStart = uploadStart;
    vm.uploadSuccess = uploadSuccess;
    vm.uploadFail = uploadFail;

    var modal, modalScope = $rootScope.$new();

    $scope.$on('$ionicView.beforeEnter', function onBeforeEnter() {
      modalScope.ctrl = vm;
      modalScope.dish = getEmptyDish();

      $ionicLoading.show({template: 'Getting dishes...'});
      ChefService.getDishes()
        .then(function (dishes) {
          vm.dishes = dishes;
        })
        .catch(HCMessaging.showError)
        .finally($ionicLoading.hide);
    });

    $scope.$on('$destroy', function onDestroy() {
      modal.remove();
      modal = undefined;
    });

    function addDish(dish, form) {
      $ionicLoading.show({template: 'Adding dish...'});
      ChefService.addDish(dish)
        .then(function added(dishes) {
          modalScope.dish = getEmptyDish();
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
          HCMessaging.showMessage('Cannot delete', 'There are pending orders for the dish you tried to delete.<br>' +
            'You will be able to delete after the orders have been completed.');
        })
        .finally($ionicLoading.hide);
    }

    function showModal() {
      if (!vm.modal) {
        $ionicModal.fromTemplateUrl('templates/add-dish.html', {
          scope: modalScope
        }).then(function (m) {
          modal = m;
          modal.show();
        });
      }
      else {
        modal.show();
      }
    }

    function hideModal() {
      if (modal) {
        modal.hide();
      }
    }

    function getEmptyDish() {
      return {user: LoginService.getUser().id};
    }

    function uploadStart() {
      $ionicLoading.show({template: 'Uploading...'});
    }

    function uploadSuccess(result) {
      $ionicLoading.hide();
      modalScope.dish.imageUrl = result;
    }

    function uploadFail(error) {
      HCMessaging.showError(error);
    }
  }
})();
