(function() {

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

        $scope.$watch(function() {
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
                .then(function(chef) {
                    vm.chef = chef;
                    if ($stateParams.dishId) {
                        vm.dish = _.find(chef.dishes, {id: parseFloat($stateParams.dishId)});
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
            return getInfoPromise.then(function(info) {
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
            return PaymentService.holdBatch({dishId: $stateParams.dishId, quantity: vm.quantity})
                .then(function() {
                    $ionicLoading.show({template: 'Item added to the cart!', duration: 2000});
                    $state.go('app.chef-preview', {id: $stateParams.id});
                })
                .catch(HCMessaging.showError);
        }

        function checkout() {
            popup = $ionicPopup.show({
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
            confirmScope.checkoutInfo = vm.checkoutInfo;
            confirmScope.deleteDishPortions = deleteDishPortions;
            return confirmScope;
        }

        function doCheckout() {
            $ionicLoading.show();
            var portionsIds = vm.checkoutInfo.portion_id_list;
            PaymentService.checkout(portionsIds)
                .then(function() {
                    $ionicPopup.show({
                        title: 'Checkout successful!',
                        template: 'Your order is confirmed, remember to go pick it up!',
                        buttons: [{
                            text: 'Got it!',
                            type: 'button-positive',
                            onTap: function() {
                                vm.checkoutInfo = [];
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

        function getSpecialIngredients(dish) {
            var ingredients = _.filter(['milk', 'peanuts', 'eggs', 'vegetarian'], function(ingredient) {
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
                        onTap: function() {
                            $ionicLoading.show();
                            PaymentService.cancelOrder()
                                .catch(HCMessaging.showError)
                                .finally($ionicLoading.hide);
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

        function deleteDishPortions(portion) {
            $ionicLoading.show();
            PaymentService.deleteBatch(portion.portion_id_list)
                .then(function() {
                    getChefDetails();
                    return getCheckoutInfo();
                })
                .then(function(info) {
                    if (popup && _.isEmpty(info.portions)) {
                        popup.close();
                    }
                })
                .catch(HCMessaging.showError)
                .finally($ionicLoading.hide);
        }
    }
})();
