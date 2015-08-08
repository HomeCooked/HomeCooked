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
            return {
                dish: (vm.dishes[0] || {}).id,
                duration: 1,
                start_time: (modalScope.startTimes[0] || {}).start_time
            };
        }

        function onBeforeEnter() {
            checkTutorial();
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
            var chefId = LoginService.getUser().id;
            ChefService.getChef(chefId)
                .then(function(chef) {
                    if (!chef.batches_tutorial_completed) {
                        HCModalHelper.showTutorial([{
                            title: 'Ready to cook?',
                            image: 'images/chef3.jpg',
                            message: '<p>This is the part where you post your meal, and cook on your schedule! Select the meal, quantity, and pickup time, and see the orders trickling in.</p>'
                        }, {
                            title: 'Easy payment',
                            image: 'images/chef3.jpg',
                            message: '<p>Payment is automatic and goes directly to your account, even if the buyer doesn\'t show up.</p>' +
                            '<p>For each dish, we will take an average commission of $1, which includes all bank and transaction fees</p>'
                        }, {
                            title: 'Simple end-to-end',
                            image: 'images/chef3.jpg',
                            message: '<p>First: you select the meal, quantity and time of pick-up<br>Second: you watch orders tickling in<br>Third: we notify you when the buyer arrives for pickup!</p>'
                        }, {
                            title: 'Plan ahead!',
                            image: 'images/chef3.jpg',
                            message: '<p>We recommend to post your meals several days ahead of the due date, to collect maximum orders</p>'
                        }, {
                            title: 'Cancellation Policy',
                            image: 'images/chef3.jpg',
                            message: '<p>Cancelling before the delivery time results in negative ratings. Cancelling during or after pick-up time results in stronger penalties and potential exclusion.</p>'
                        }], function() {
                            ChefService.setBatchesTutorialDone(chefId);
                        });
                    }
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
                if (d > weekDay) {
                    day.week_day += 7;
                }
                indexed[d] = day;
            }
            return _.chain(indexed).values().sortBy('week_day').value();
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

        function openAddBatch() {
            if (!LoginService.getUser().has_payment) {
                HCModalHelper.showUpdatePayment();
                return;
            }
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
