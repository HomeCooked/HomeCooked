(function() {
    'use strict';

    angular.module('HomeCooked.controllers').controller('ChefCtrl', ChefCtrl);
    ChefCtrl.$inject = ['_', '$rootScope', '$scope', '$state', '$stateParams', '$ionicHistory', '$ionicModal', '$ionicLoading', '$ionicPopup', '$q', 'ChefService', 'DishesService', 'LoginService', 'HCMessaging'];

    function ChefCtrl(_, $rootScope, $scope, $state, $stateParams, $ionicHistory, $ionicModal, $ionicLoading, $ionicPopup, $q, ChefService, DishesService, LoginService, HCMessaging) {
        var vm = this,
            modal,
            modalScope = $rootScope.$new();

        modalScope.vm = vm;
        modalScope.startTimes = [];

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
            batch.start_time = batch.start_time.split('.').shift();

            $ionicLoading.show();
            ChefService.addBatch(batch)
                .then(getBatches)
                .then(function() {
                    modalScope.batch = emptyBatch();
                    form.$setPristine();
                    modal.hide();
                })
                .catch(HCMessaging.showError)
                .finally($ionicLoading.hide);

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
            $ionicLoading.show();
            $q.all([getBatches(), getDishes(), getChefData()])
                .then(function() {
                    modalScope.batch = emptyBatch();
                    if ($stateParams.v === 'new' && vm.dishes.length) {
                        openAddDish();
                    }
                })
                .catch(HCMessaging.showError)
                .finally($ionicLoading.hide);
        }

        function getBatches() {
            return ChefService.getBatches().then(function(batches) {
                vm.batches = batches;
                return batches;
            });
        }

        function getDishes() {
            return DishesService.getDishes().then(function(dishes) {
                vm.dishes = dishes;
                return dishes;
            });
        }

        function getChefData() {
            return ChefService.getChefData().then(function(chefData) {
                vm.maxPrice = chefData.maxDishPrice;
                vm.maxQuantity = chefData.maxBatchQuantity;
                vm.maxBatches = chefData.maxBatches;
                modalScope.startTimes = getStartTimes(chefData.serviceDays);
                return chefData;
            });
        }

        function getStartTimes(serviceDays) {
            var now = new Date(),
                weekDay = now.getDay();
            now.setHours(0);
            now.setMinutes(0);
            now.setSeconds(0);
            now.setMilliseconds(0);
            var time = now.getTime();
            var i = _.findIndex(serviceDays, {week_day: weekDay});
            if (i > 0) {
                var split1 = _.slice(serviceDays, 0, i);
                var split2 = _.slice(serviceDays, i);
                _.forEach(split1, function(day) {
                    day.week_day += 7;
                });
                serviceDays = split2.concat(split1);
            }
            var days = _.filter(serviceDays, 'is_active');
            return _.map(days, function(day) {
                var t = time + (day.week_day - weekDay) * 86400000;
                return {
                    start_time: getDate(t, day.start_minute),
                    end_time: getDate(t, day.end_minute)
                };
            });
        }

        function getDate(time, minute) {
            var date = new Date(),
                hours = Math.floor(minute / 60),
                minutes = minute % 60;
            date.setTime(time);
            date.setHours(hours);
            date.setMinutes(minutes);
            return date.toISOString();
        }

        function onDestroy() {
            if (modal) {
                modal.remove();
                modal = undefined;
                modalScope.$destroy();
            }
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

        function showBatchOrder(order) {
            var scope = getOrderScope(order);
            $ionicPopup.alert({
                title: 'Order details',
                scope: scope,
                templateUrl: 'templates/chef/order-details.html',
                buttons: [{
                    text: 'Close',
                    type: 'button-stable',
                }, {
                    text: 'Delivered',
                    type: 'button-balanced',
                    onTap: function() {
                        notifyDelivered(order);
                    }
                }, {
                    text: 'Cancel',
                    type: 'button-assertive',
                    onTap: function() {
                        cancelOrder(order);
                    }
                }]
            });
        }

        function getOrderScope(order) {
            var orderScope = $rootScope.$new();
            orderScope.order = order;
            return orderScope;
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
                    doDeleteBatch(batch);
                }
            });
        }

        function doDeleteBatch(batch) {
            $ionicLoading.show();
            ChefService.deleteBatch(batch)
                .then(getBatches)
                .catch(HCMessaging.showError)
                .finally($ionicLoading.hide);
        }

        function cancelOrder(order) {
            $ionicPopup.show({
                title: 'Cancel order?',
                template: 'Are you sure you want to cancel this order? It will result in a 0 star rating for each dish.',
                buttons: [{
                    text: 'Cancel Order',
                    type: 'button-assertive',
                    onTap: function() {
                        doCancelOrder(order);
                    }
                }, {
                    text: 'Close'
                }]
            });
        }

        function doCancelOrder(order) {
            $ionicLoading.show();
            ChefService.cancelOrder(order.id)
                .then(getBatches)
                .catch(HCMessaging.showError)
                .finally($ionicLoading.hide);
        }

        function notifyDelivered(order) {
            $ionicLoading.show();
            ChefService.notifyDelivered(order.id)
                .then(getBatches)
                .catch(HCMessaging.showError)
                .finally($ionicLoading.hide);
        }
    }
})();
