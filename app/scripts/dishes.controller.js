(function() {
    'use strict';
    angular.module('HomeCooked.controllers').controller('DishesCtrl', DishesCtrl);

    DishesCtrl.$inject = ['$rootScope', '$scope', '$ionicHistory', '$state', '$ionicModal', '$ionicLoading', '$ionicPopup', 'DishesService', 'ChefService', 'LoginService', 'HCMessaging', 'HCModalHelper', '_'];
    function DishesCtrl($rootScope, $scope, $ionicHistory, $state, $ionicModal, $ionicLoading, $ionicPopup, DishesService, ChefService, LoginService, HCMessaging, HCModalHelper, _) {
        var vm = this,
            modal,
            modalScope = $rootScope.$new();

        modalScope.vm = vm;

        vm.dishes = [];
        vm.showModal = showModal;
        vm.hideModal = hideModal;
        vm.addDish = addDish;
        vm.deleteDish = deleteDish;
        vm.go = go;

        $scope.$on('$ionicView.beforeEnter', onBeforeEnter);
        $scope.$on('$destroy', onDestroy);

        function addDish(dish, form) {
            document.activeElement.blur();
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

        function deleteDish(dish, $event) {
            if ($event) {
                $event.stopPropagation();
                $event.preventDefault();
            }
            $ionicPopup.confirm({
                title: dish.title,
                template: 'Do you want to delete this dish?<br>You will loose all the reviews',
                cancelText: 'No',
                okText: 'Yes, Delete',
                okType: 'button-assertive'
            }).then(function(res) {
                if (res) {
                    doDeleteDish(dish);
                }
            });
        }

        function doDeleteDish(dish) {
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
                    if ($state.params.v === 'new') {
                        showModal();
                    }
                })
                .catch(HCMessaging.showError)
                .finally($ionicLoading.hide);
        }

        function checkTutorial() {
            ChefService.chefReady()
                .then(function(chef) {
                    if (!chef.dishes_tutorial_completed) {
                        HCModalHelper.showTutorial('dishes').then(function() {
                            return ChefService.saveChefData({dishes_tutorial_completed: true});
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

        function go(path) {
            $ionicHistory.nextViewOptions({
                historyRoot: true,
                disableAnimate: true
            });
            $state.go(path);
        }
    }
})();
