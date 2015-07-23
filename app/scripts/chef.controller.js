(function() {
    'use strict';

    angular.module('HomeCooked.controllers').controller('ChefCtrl', ChefCtrl);
    ChefCtrl.$inject = ['_', '$rootScope', '$scope', '$state', '$stateParams', '$ionicHistory', '$ionicModal', '$ionicLoading', '$ionicPopup', '$q', 'ChefService', 'LoginService', 'HCMessaging'];

    function ChefCtrl(_, $rootScope, $scope, $state, $stateParams, $ionicHistory, $ionicModal, $ionicLoading, $ionicPopup, $q, ChefService, LoginService, HCMessaging) {
        var vm = this,
            modal,
            modalScope = $rootScope.$new();

        modalScope.vm = vm;
        modalScope.startTimes = [
            {'id': 0, 'title': 'Friday (6pm-9pm)'},
            {'id': 24, 'title': 'Saturday (6pm-9pm)'}
        ];

        vm.dishes = [];
        vm.batches = [];
        vm.addBatch = addBatch;
        vm.hideModal = hideModal;
        vm.go = go;
        vm.openAddDish = openAddDish;
        vm.adjustRange = adjustRange;
        vm.deleteBatch = deleteBatch;
        vm.showBatchOrder = showBatchOrder;

        $scope.$on('$ionicView.beforeEnter', onBeforeEnter);
        $scope.$on('$destroy', onDestroy);

        function addBatch(batch, form) {
            batch.chef = LoginService.getUser().id;
            batch.is_active = true;

            var now = new Date();
            now.setHours(now.getHours() + batch.start_time);
            batch.start_time = now.toISOString().split('.').shift();

            $ionicLoading.show({template: 'Adding batch'});
            ChefService.addBatch(batch)
                .then(function(batches) {
                    modalScope.batch = emptyBatch();
                    form.$setPristine();
                    vm.batches = batches;
                    setBatchesDishInfo(vm.batches, vm.dishes);
                    $ionicLoading.hide();
                    modal.hide();
                })
                .catch(HCMessaging.showError);
        }

        function emptyBatch() {
            var firstDish = vm.dishes[0] || {};
            return {
                dish: firstDish.id,
                start_time: 0,
                duration: 1
            };
        }

        function onBeforeEnter() {
            $ionicLoading.show({template: 'Getting orders'});
            $q.all([ChefService.getBatches(), ChefService.getDishes(), ChefService.getChefData()])
                .then(function(values) {
                    $ionicLoading.hide();

                    vm.dishes = values[1];
                    vm.batches = values[0];
                    setBatchesDishInfo(vm.batches, vm.dishes);
                    var chefData = values[2];
                    vm.maxPrice = chefData.maxPrice;
                    vm.maxQuantity = chefData.maxQuantity;
                    vm.maxBatches = chefData.maxBatches;

                    modalScope.batch = emptyBatch();
                    if ($stateParams.v === 'new' && vm.dishes.length) {
                        openAddDish();
                    }
                })
                .catch(HCMessaging.showError);
        }

        function onDestroy() {
            if (modal) {
                modal.remove();
                modal = undefined;
                modalScope.$destroy();
            }
        }

        function setBatchesDishInfo(batches, dishes) {
            _.forEach(batches, function(batch) {
                var dish = _.find(dishes, {'id': batch.dish}) || {};
                _.extend(batch, {
                    'dishName': dish.title,
                    'dishImage': dish.image,
                    'dishPrice': dish.price
                });
            });
        }

        function hideModal() {
            modal.hide();
        }

        function go(path, params) {
            $ionicHistory.nextViewOptions({
                historyRoot: true
            });
            $state.go(path, params);
        }

        function adjustRange(qty, min, max) {
            if (_.isNumber(qty)) {
                if (qty < min) {
                    qty = min;
                }
                else if (qty > max) {
                    qty = max;
                }
            }
            return qty;
        }

        function openAddDish() {
            if (!modal) {
                $ionicModal.fromTemplateUrl('templates/add-batch.html', {
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

        function showBatchOrder(batch, order) {
            $ionicPopup.alert({
                title: 'Order details',
                template: 'user: ' + order.userName
            });
        }

        function deleteBatch(batch) {
            $ionicPopup.confirm({
                title: batch.dishName + ', ' + batch.quantity + ' portion(s)',
                template: 'Do you want to delete this batch?',
                cancelText: 'No',
                okText: 'Yes, Delete',
                okType: 'button-assertive'
            }).then(function(res) {
                if (res) {
                    _deleteBatch(batch);
                }
            });
        }

        function _deleteBatch(batch) {
            $ionicLoading.show({template: 'Removing...'});
            ChefService.deleteBatch(batch)
                .then(function(batches) {
                    vm.batches = batches;
                    $ionicLoading.hide();
                })
                .catch(HCMessaging.showError);
        }
    }
})();
