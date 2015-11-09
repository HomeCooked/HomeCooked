(function () {

    'use strict';

    angular
        .module('HomeCooked.controllers')
        .controller('ChefPreviewCtrl', ChefPreviewCtrl);

    ChefPreviewCtrl.$inject = ['$q', '$state', '$rootScope', '$stateParams', '$scope', '$ionicLoading', '$ionicPopup', '$ionicHistory', 'ChefService', 'LocationService', 'HCMessaging', 'LoginService', 'PaymentService', 'HCModalHelper', '_'];
    function ChefPreviewCtrl($q, $state, $rootScope, $stateParams, $scope, $ionicLoading, $ionicPopup, $ionicHistory, ChefService, LocationService, HCMessaging, LoginService, PaymentService, HCModalHelper, _) {
        var vm = this;
        var user, popup;

        vm.go = $state.go;
        vm.back = back;
        vm.signin = signin;
        vm.order = order;
        vm.checkout = checkout;
        vm.chef = {};
        vm.checkoutInfo = {};

        $scope.$on('$ionicView.beforeEnter', onBeforeEnter);

        $scope.$watch(function () {
            return LocationService.getCurrentLocation();
        }, onLocationChange);

        function onBeforeEnter() {
            popup = undefined;
            user = LoginService.getUser();
            vm.user = user;
            vm.chefId = $stateParams.id;
            getChefDetails();
            getCheckoutInfo();
        }

        function getChefDetails() {
            $ionicLoading.show();
            return ChefService.getChefDetails(vm.chefId)
                .then(function (chef) {
                    chef.distance = vm.chef.distance;
                    vm.chef = chef;
                    if ($stateParams.batchId) {
                        vm.dish = _.find(chef.dishes, {id: parseFloat($stateParams.batchId)});
                        vm.quantity = 1;
                        vm.dish.quantities = getQuantities(vm.dish.remaining);
                        vm.dish.specialIngredients = getSpecialIngredients(vm.dish);
                    }
                    onLocationChange();
                    return chef;
                })
                .catch(HCMessaging.showError)
                .finally($ionicLoading.hide);
        }

        function getCheckoutInfo() {
            var getInfoPromise = user.isLoggedIn ? PaymentService.getCheckoutInfo(vm.chefId) : $q.when({});
            return getInfoPromise.then(function (info) {
                vm.checkoutInfo = info;
                return info;
            });
        }

        function onLocationChange() {
            vm.chef.distance = LocationService.getDistanceFrom(vm.chef.location);
        }

        function order() {
            showUpdatePayment().then(showUpdatePhone).then(holdBatch);
        }

        function showUpdatePayment() {
            if (user.has_payment) {
                return $q.when();
            }
            $ionicLoading.show({
                template: 'Please provide a payment method',
                duration: 2000
            });
            return HCModalHelper.showUpdatePayment();
        }

        function showUpdatePhone() {
            // us numbers are 10 & the +1 at the beginning make length = 11
            if (user.phone_number && user.phone_number.toString().length > 10) {
                return $q.when();
            }
            $ionicLoading.show({
                template: 'Please provide a valid phone number',
                duration: 2000
            });
            return HCModalHelper.showUpdatePhoneNumber();
        }

        function holdBatch() {
            $ionicLoading.show();
            return PaymentService.holdBatch({batchId: $stateParams.batchId, quantity: vm.quantity})
                .then(function () {
                    $ionicLoading.show({template: 'Item added to the cart!', duration: 2000});
                    $state.go('app.chef-preview', {id: $stateParams.id});
                })
                .catch(HCMessaging.showError);
        }

        function checkout() {
            popup = $ionicPopup.confirm({
                title: 'Confirm checkout',
                templateUrl: 'templates/confirm-checkout.html',
                scope: getCheckoutScope(),
                cancelText: 'Cancel',
                okText: 'Confirm',
                okType: 'button-positive'
            });
            popup.then(function (res) {
                if (res) {
                    doCheckout();
                }
                else {
                    popup = undefined;
                }
            });
        }

        function getCheckoutScope() {
            var confirmScope = $rootScope.$new();
            confirmScope.checkoutInfo = vm.checkoutInfo;
            confirmScope.deleteDishPortions = deleteDishPortions;
            return confirmScope;
        }

        function doCheckout() {
            $ionicLoading.show();
            var portionsIds = vm.checkoutInfo.portion_id_list;
            PaymentService.checkout(portionsIds)
                .then(function () {
                    $ionicLoading.hide();
                    return $ionicPopup.show({
                        title: 'Checkout successful!',
                        template: 'Your order is confirmed, remember to go pick it up!',
                        buttons: [{
                            text: 'Got it!',
                            type: 'button-positive'
                        }]
                    });
                }, HCMessaging.showError)
                .then(function(){
                    vm.checkoutInfo = [];
                    $ionicHistory.nextViewOptions({
                        historyRoot: true,
                        disableAnimate: true
                    });
                    $state.go('app.orders');
                });
        }

        function getQuantities(remaining) {
            var a = [];
            for (var i = 1; i <= remaining; i++) {
                a.push(i);
            }
            return a;
        }

        function getSpecialIngredients(dish) {
            var ingredients = _.filter(['milk', 'peanuts', 'eggs', 'vegetarian'], function (ingredient) {
                return dish[ingredient] === true;
            });
            return ingredients.join(', ');
        }

        function signin() {
            HCModalHelper.showSignup();
        }

        function back() {
            if (_.size(vm.checkoutInfo.portions)) {
                popup = $ionicPopup.show({
                    title: 'Order pending',
                    templateUrl: 'templates/confirm-checkout.html',
                    scope: getCheckoutScope(),
                    buttons: [{
                        text: 'Delete',
                        type: 'button-assertive',
                        onTap: function () {
                            return true;
                        }
                    }, {
                        text: 'Keep'
                    }]
                });
                popup.then(function(res) {
                    if (res) {
                        $ionicLoading.show();
                        PaymentService.cancelOrder($ionicLoading.hide, HCMessaging.showError);
                        goBack();
                    }
                    else {
                        popup = undefined;
                    }
                });
            }
            else {
                goBack();
            }
        }

        function goBack() {
            $state.go('app.buyer');
        }

        function deleteDishPortions(portion) {
            $ionicLoading.show();
            PaymentService.deleteBatch(portion.portion_id_list)
                .then(function () {
                    getChefDetails();
                    return getCheckoutInfo();
                })
                .catch(HCMessaging.showError)
                .then(function (info) {
                    $ionicLoading.hide();
                    if (popup && _.isEmpty(info.portions)) {
                        popup.close();
                    }
                });
        }
    }
})();
