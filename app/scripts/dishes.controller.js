(function() {
    'use strict';
    angular.module('HomeCooked.controllers').controller('DishesCtrl', DishesCtrl);

    DishesCtrl.$inject = ['$q', '$rootScope', '$stateParams', '$scope', '$ionicModal', '$ionicLoading', 'DishesService', 'ChefService', 'LoginService', 'HCMessaging', 'HCModalHelper', '_'];
    function DishesCtrl($q, $rootScope, $stateParams, $scope, $ionicModal, $ionicLoading, DishesService, ChefService, LoginService, HCMessaging, HCModalHelper, _) {
        var vm = this,
            modal,
            modalScope = $rootScope.$new();

        modalScope.vm = vm;

        vm.dishes = [];
        vm.showModal = showModal;
        vm.hideModal = hideModal;
        vm.addDish = addDish;
        vm.deleteDish = deleteDish;

        $scope.$on('$ionicView.beforeEnter', onBeforeEnter);
        $scope.$on('$destroy', onDestroy);

        function addDish(dish, form) {
            dish.picture = dish.picture.base64;
            $ionicLoading.show({template: 'Adding dish...'});
            DishesService.addDish(dish)
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
            DishesService.deleteDish(dish)
                .then(function deleted() {
                    _.remove(vm.dishes, dish);
                })
                .catch(function() {
                    HCMessaging.showMessage('Cannot delete', 'There are pending orders for the dish you tried to delete.<br>' +
                        'You will be able to delete after the orders have been completed.');
                })
                .finally($ionicLoading.hide);
        }

        function showModal() {
            if (!modal) {
                $ionicModal.fromTemplateUrl('templates/add-dish.html', {
                    scope: modalScope
                }).then(function(m) {
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
            return {user: vm.chefId};
        }

        function onBeforeEnter() {
            vm.chefId = LoginService.getUser().id;
            modalScope.dish = getEmptyDish();

            checkTutorial();

            $ionicLoading.show();
            DishesService.getDishes()
                .then(function(dishes) {
                    vm.dishes = dishes;
                    if ($stateParams.v === 'new') {
                        showModal();
                    }
                })
                .catch(HCMessaging.showError)
                .finally($ionicLoading.hide);
        }

        function checkTutorial() {
            ChefService.getChef(vm.chefId)
                .then(function(chef) {
                    if (!chef.dishes_tutorial_completed) {
                        HCModalHelper.showTutorial([{
                            title: 'Build your own menu',
                            image: 'images/chef1.jpg',
                            message: '<p>You decide what to cook, when to cook, and how much to charge.</p><p>Use this section to describe your meals and make your customers want more!</p>'
                        }, {
                            title: 'Before you start',
                            image: 'images/chef2.jpg',
                            message: '<p>Each menu item starts with zero reviews, as you will accumulate them through time.</p><p>You cannot edit existing items, but feel free to create as many as you like!</p>'
                        }], function() {
                            ChefService.setDishesTutorialDone(vm.chefId);
                        });
                    }
                });
        }

        function onDestroy() {
            if (modal) {
                modal.remove();
                modal = undefined;
                modalScope.$destroy();
            }
        }
    }
})();
