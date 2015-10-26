(function () {
    'use strict';
    angular.module('HomeCooked.controllers').controller('DishesCtrl', DishesCtrl);

    DishesCtrl.$inject = ['$q', '$rootScope', '$scope', '$ionicHistory', '$state', '$ionicModal', '$ionicLoading', '$ionicPopup', 'DishesService', 'ChefService', 'HCMessaging', 'HCModalHelper', '_'];
    function DishesCtrl($q, $rootScope, $scope, $ionicHistory, $state, $ionicModal, $ionicLoading, $ionicPopup, DishesService, ChefService, HCMessaging, HCModalHelper, _) {
        var vm = this,
            modal,
            modalScope = $rootScope.$new();

        modalScope.vm = vm;

        vm.dishes = [];
        vm.showModal = showModal;
        vm.hideModal = hideModal;
        vm.showUpdatePhoto = showUpdatePhoto;
        vm.addDish = addDish;
        vm.deleteDish = deleteDish;
        vm.go = go;
        vm.checkPrice = checkPrice;
        $scope.reload = loadData;

        $scope.$on('$ionicView.beforeEnter', onBeforeEnter);
        $scope.$on('$destroy', onDestroy);

        function showUpdatePhoto() {
            HCModalHelper.showUpdatePicture(savePicture);
        }

        function savePicture(pict) {
            modalScope.dish.picture = pict;
        }

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
            }).then(function (res) {
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
                .catch(function () {
                    HCMessaging.showMessage('Cannot delete', 'There are pending orders for the dish you tried to delete.<br>' +
                        'You will be able to delete after the orders have been completed.');
                })
                .finally($ionicLoading.hide);
        }

        function showModal() {
            if (!modal) {
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
            return {user: vm.chefId};
        }

        function onBeforeEnter() {
            vm.chefId = ChefService.getChef().id;
            modalScope.dish = getEmptyDish();

            checkTutorial();
            loadData();
        }

        function loadData() {
            $ionicLoading.show();
            $q.all([DishesService.getDishes(), getChefData()])
                .then(function (values) {
                    var dishes = values[0];
                    $ionicLoading.hide();
                    vm.dishes = dishes;
                    if ($state.params.v === 'new') {
                        showModal();
                    }
                })
                .catch(HCMessaging.showError)
                .finally(function () {
                    // Stop the ion-refresher from spinning
                    $scope.$broadcast('scroll.refreshComplete');
                });
        }

        function getChefData() {
            return ChefService.getChefData().then(function (chefData) {
                modalScope.minPrice = chefData.minDishPrice || 0.1;
                modalScope.maxPrice = chefData.maxDishPrice || 100;
                modalScope.minPrice = modalScope.minPrice.toFixed(2);
                modalScope.maxPrice = modalScope.maxPrice.toFixed(2);
                return chefData;
            });
        }

        function checkTutorial() {
            ChefService.chefReady()
                .then(function (chef) {
                    if (!chef.dishes_tutorial_completed) {
                        HCModalHelper.showTutorial('dishes').then(function () {
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

        function checkPrice(dish, min, max) {
            var price = parseFloat(dish.price);
            if (typeof price !== 'number' || isNaN(price)) {
                price = 0;
            }
            dish.price = Math.max(min, Math.min(price, max)).toFixed(2);
        }
    }
})();
