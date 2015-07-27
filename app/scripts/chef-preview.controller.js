(function() {

    'use strict';

    angular
        .module('HomeCooked.controllers')
        .controller('ChefPreviewCtrl', ChefPreviewCtrl);

    ChefPreviewCtrl.$inject = ['$window', '$state', '$rootScope', '$stateParams', '$scope', '$ionicLoading', '$ionicPopup', '$ionicHistory', 'ChefService', 'LocationService', 'HCMessaging', 'LoginService', 'PaymentService', '_'];

    function ChefPreviewCtrl($window, $state, $rootScope, $stateParams, $scope, $ionicLoading, $ionicPopup, $ionicHistory, ChefService, LocationService, HCMessaging, LoginService, PaymentService, _) {
        var vm = this;
        var user = LoginService.getUser();

        vm.go = $state.go;
        vm.back = back;
        vm.user = user;
        vm.signin = signin;
        vm.order = order;
        vm.checkout = checkout;
        vm.chef = {};
        vm.checkoutDetails = [];

        $scope.$on('$ionicView.beforeEnter', onBeforeEnter);

        $scope.$watch(function() {
            return LocationService.getCurrentLocation();
        }, onLocationChange);

        function onBeforeEnter() {
            vm.chefId = $stateParams.id;
            $ionicLoading.show();
            ChefService.getChef(vm.chefId, true)
                .then(function(chef) {
                    vm.chef = chef;
                    if ($stateParams.dishId) {
                        vm.dish = _.find(chef.dishes, {id: parseFloat($stateParams.dishId)});
                        vm.quantity = 1;
                        vm.dish.quantities = getQuantities(vm.dish.remaining);
                    }
                    onLocationChange();
                })
                .catch(HCMessaging.showError)
                .finally($ionicLoading.hide);

            PaymentService.getCheckoutDetails(vm.chefId).then(function(details) {
                vm.checkoutDetails = details;
            });
        }

        function onLocationChange() {
            vm.chef.distance = LocationService.getDistanceFrom(vm.chef.location);
        }

        function order() {
            if (user.has_payment) {
                $ionicLoading.show();
                PaymentService.holdBatch({dishId: $stateParams.dishId, quantity: vm.quantity})
                    .then(function() {
                        $window.history.back();
                    })
                    .catch(HCMessaging.showError)
                    .finally($ionicLoading.hide);
            }
            else {
                $state.go('app.settings-payment');
            }
        }

        function checkout() {
            $ionicPopup.show({
                title: 'Confirm checkout',
                templateUrl: 'templates/confirm-checkout.html',
                scope: getCheckoutScope(),
                buttons: [{
                    text: 'Confirm',
                    type: 'button-positive',
                    onTap: doCheckout
                }, {
                    text: 'Cancel'
                }]
            });
        }

        function getCheckoutScope() {
            var confirmScope = $rootScope.$new();
            confirmScope.checkoutDetails = vm.checkoutDetails;
            var price = 0;
            _.forEach(vm.checkoutDetails, function(detail) {
                price += detail.total_price;
            });
            confirmScope.totalPrice = price;
            return confirmScope;
        }

        function doCheckout() {
            $ionicLoading.show();
            var batches = _.pluck(vm.checkoutDetails, 'id');
            PaymentService.checkout(vm.chefId, batches)
                .then(function() {
                    $ionicPopup.show({
                        title: 'Checkout successful!',
                        template: 'Your order is confirmed, remember to go pick it up!',
                        buttons: [{
                            text: 'Got it!',
                            type: 'button-positive',
                            onTap: function() {
                                vm.checkoutDetails = [];
                                $ionicHistory.nextViewOptions({
                                    historyRoot: true,
                                    disableAnimate: true
                                });
                                $state.go('app.orders');
                            }
                        }]
                    });
                })
                .catch(HCMessaging.showError)
                .finally($ionicLoading.hide);
        }

        function getQuantities(remaining) {
            var a = [];
            for (var i = 1; i <= remaining; i++) {
                a.push(i);
            }
            return a;
        }

        function signin() {
            LoginService.login('facebook');
        }

        function back() {
            if (_.size(vm.checkoutDetails)) {
                $ionicPopup.show({
                    title: 'Delete order?',
                    templateUrl: 'templates/confirm-checkout.html',
                    scope: getCheckoutScope(),
                    buttons: [{
                        text: 'Delete',
                        type: 'button-assertive',
                        onTap: function() {
                            PaymentService.cancelOrder();
                            goBack();
                        }
                    }, {
                        text: 'Keep'
                    }]
                });
            }
            else {
                goBack();
            }
        }

        function goBack() {
            $state.go('app.buyer');
        }
    }
})();
