(function() {
    'use strict';

    angular.module('HomeCooked.controllers').controller('ChefCtrl', ChefCtrl);
    ChefCtrl.$inject = ['_', '$rootScope', '$scope', '$state', '$stateParams', '$ionicHistory', '$ionicModal', '$ionicLoading', '$ionicPopup', '$q', 'ChefService', 'DishesService', 'LoginService', 'HCMessaging', 'HCModalHelper'];

    function ChefCtrl(_, $rootScope, $scope, $state, $stateParams, $ionicHistory, $ionicModal, $ionicLoading, $ionicPopup, $q, ChefService, DishesService, LoginService, HCMessaging, HCModalHelper) {
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
        vm.openAddBatch = openAddBatch;
        vm.adjustRange = adjustRange;
        vm.deleteBatch = deleteBatch;
        vm.showBatchOrder = showBatchOrder;

        $scope.$on('$ionicView.beforeEnter', onBeforeEnter);
        $scope.$on('$destroy', onDestroy);

        function addBatch(batch, form) {
            document.activeElement.blur();
            batch.chef = ChefService.getChef().id;
            batch.is_active = true;

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
            return {
                dish: (vm.dishes[0] || {}).id,
                duration: 1,
                start_time: (modalScope.startTimes[0] || {}).start_time
            };
        }

        function onBeforeEnter() {
            checkTutorial().finally(loadData);
        }

        function loadData() {
            $ionicLoading.show();
            $q.all([getBatches(), getDishes(), getChefData()])
                .then(function() {
                    modalScope.batch = emptyBatch();
                    if ($stateParams.v === 'new' && vm.dishes.length) {
                        openAddBatch();
                    }
                })
                .catch(HCMessaging.showError)
                .finally($ionicLoading.hide);
        }

        function checkTutorial() {
            return ChefService.chefReady()
                .then(function(chef) {
                    if (!chef.batches_tutorial_completed) {
                        return HCModalHelper.showTutorial('batches').then(function() {
                            return ChefService.saveChefData({batches_tutorial_completed: true});
                        });
                    }
                    return chef;
                });
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
                chefData = chefData[0];
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

            serviceDays = orderedServiceDays(serviceDays, weekDay);

            var days = _.filter(serviceDays, 'is_active');
            return _.map(days, function(day) {
                var t = time + (day.week_day - weekDay) * 86400000;
                return {
                    start_time: getDate(t, day.start_minute),
                    end_time: getDate(t, day.end_minute)
                };
            });
        }

        function orderedServiceDays(serviceDays, weekDay) {
            var indexed = _.indexBy(serviceDays, 'week_day');
            for (var d = 0; d < 7; d++) {
                var day = indexed[d] || {week_day: d};
                if (d < weekDay) {
                    day.week_day += 7;
                }
                else if (d === weekDay && isExpiredTime(day.end_minute)) {
                    day.week_day += 7;
                }
                indexed[d] = day;
            }
            return _.chain(indexed).values().sortBy('week_day').value();
        }

        function isExpiredTime(endMinute) {
            if (!endMinute) {
                return true;
            }
            var now = new Date(),
                date = new Date(),
                hours = Math.floor(endMinute / 60),
                minutes = endMinute % 60;
            date.setHours(hours);
            date.setMinutes(minutes);
            return now >= date.getTime();
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
                historyRoot: true,
                disableAnimate: true
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

        function openAddBatch() {
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
            var title = batch.dish.title;
            if (batch.quantity) {
                title += ', ' + batch.quantity + ' portion' + (batch.quantity === 1 ? '' : 's');
            }
            $ionicPopup.confirm({
                title: title,
                template: 'Do you want to delete this item?',
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
                .catch(function() {
                    HCMessaging.showError('Too early!', 'You can mark an order as "delivered" only after the pickup time.');
                })
                .finally($ionicLoading.hide);
        }
    }
})();
