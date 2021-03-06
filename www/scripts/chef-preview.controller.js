(function() {

    'use strict';

    angular
        .module('HomeCooked.controllers')
        .controller('ChefPreviewCtrl', ChefPreviewCtrl);

    ChefPreviewCtrl.$inject = ['$q', '$state', '$rootScope', '$stateParams', '$scope', '$ionicLoading', '$ionicPopup', '$ionicHistory', 'ChefService',
        'LocationService', 'HCMessaging', 'LoginService', 'PaymentService', 'HCModalHelper', 'MapService', '_'
    ];

    function ChefPreviewCtrl($q, $state, $rootScope, $stateParams, $scope, $ionicLoading, $ionicPopup, $ionicHistory, ChefService,
        LocationService, HCMessaging, LoginService, PaymentService, HCModalHelper, MapService, _) {
        var vm = this;
        var mapId = 'chefmap';
        var chefIconSize = 60;
        var user, popup;

        vm.go = $state.go;
        vm.back = back;
        vm.signin = signin;
        vm.order = order;
        vm.checkout = checkout;
        vm.chef = {};
        vm.checkoutInfo = {};
        vm.hasUserLocation = false;
        vm.centerToUserLocation = centerToUserLocation;
        vm.centerToChefLocation = centerToChefLocation;

        $scope.$on('$ionicView.afterEnter', onAfterEnter);

        $scope.$watch(function() {
            return LocationService.getCurrentLocation();
        }, onLocationChange);

        //init the map
        initMapProperties();

        function onAfterEnter() {
            popup = undefined;
            user = LoginService.getUser();
            vm.user = user;
            vm.chefId = $stateParams.id;
            getChefDetails();
            if (!$stateParams.batchId) {
                // fixes rendering issues of the map
                window.ionic.trigger('resize');
            }
        }

        function mapZoomChanged(event) {
            var map = event.target;
            var zoom = 1.2 * (map.getZoom() - 14);
            var size = Math.max(chefIconSize, chefIconSize * zoom);
            vm.map.markers.chef.icon.iconSize = [size, size];
            vm.map.markers.chef.icon.iconAnchor = [size / 2, size / 2];
        }

        function getChefDetails() {
            // must force reload if on chef view
            var reload = !$stateParams.batchId || vm.chefId !== vm.chef.id;
            if (reload) {
                $ionicLoading.show();
            }
            return ChefService.getChefDetails(vm.chefId, reload)
                .then(function(chef) {
                    $ionicLoading.hide();
                    vm.chef = chef;
                    if ($stateParams.batchId) {
                        var dish = _.find(chef.dishes, {
                            id: parseFloat($stateParams.batchId)
                        });
                        if (!dish) {
                            HCMessaging.showMessage('Could not find the dish', 'The chef might have deleted this dish');
                            $state.go('app.chef-preview', {
                                id: $stateParams.id
                            });
                            return;
                        }
                        vm.quantity = 1;
                        dish.quantities = getQuantities(dish.remaining);
                        dish.specialIngredients = getSpecialIngredients(dish);
                        vm.dish = dish;
                    }
                    // needed only on chef view
                    else {
                        updateMapCenter();
                        getCheckoutInfo().then(function(info) {
                            if (_.size(info.portions)) {
                                checkout();
                            }
                        });
                    }
                    onLocationChange();
                    return chef;
                }, function(error) {
                    HCMessaging.showError(error);
                    back();
                });
        }

        function getCheckoutInfo() {
            var getInfoPromise = user.isLoggedIn ? PaymentService.getCheckoutInfo(vm.chefId) : $q.when({});
            return getInfoPromise.then(function(info) {
                vm.checkoutInfo = info;
                return info;
            });
        }

        function onLocationChange() {
            var location = LocationService.getCurrentLocation();
            if (location) {
                vm.hasUserLocation = true;
                vm.chef.distance = LocationService.getDistanceFrom(vm.chef.location);
                vm.map.markers.user.lat = location.latitude;
                vm.map.markers.user.lng = location.longitude;
            }
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
            return PaymentService.holdBatch({
                    batchId: $stateParams.batchId,
                    quantity: vm.quantity
                })
                .then(function() {
                    $state.go('app.chef-preview', {
                        id: $stateParams.id
                    });
                })
                .catch(HCMessaging.showError);
        }

        function checkout() {
            popup = $ionicPopup.confirm({
                title: 'Confirm checkout',
                templateUrl: 'templates/confirm-checkout.html',
                scope: getCheckoutScope(),
                cancelText: 'Close',
                okText: 'Checkout',
                okType: 'button-positive'
            });
            popup.then(function(res) {
                if (res) {
                    doCheckout();
                } else {
                    popup = undefined;
                }
            });
        }

        function getCheckoutScope(noDelivery) {
            var confirmScope = $rootScope.$new();
            confirmScope.checkoutInfo = vm.checkoutInfo;
            if (!noDelivery) {
                confirmScope.deliveryOptions = vm.chef.delivery_options;
                confirmScope.selectedDeliveryOption = vm.chef.delivery_options[0];
                confirmScope.selectedDeliveryOptionType = confirmScope.selectedDeliveryOption.type;
                confirmScope.deleteDishPortions = deleteDishPortions;
                confirmScope.updateOption = function(type) {
                    confirmScope.selectedDeliveryOptionType = type;
                    confirmScope.selectedDeliveryOption = _.find(confirmScope.deliveryOptions, {
                        type: type
                    });
                };
                confirmScope.address = {
                    state: 'CA'
                };
                confirmScope.states = ['CA'];
                vm.checkoutScope = confirmScope;
            } else {
                vm.checkoutScope = undefined;
            }
            return confirmScope;
        }

        function doCheckout() {
            if (vm.checkoutScope.selectedDeliveryOption.address_required && !isValidAddress(vm.checkoutScope.address)) {
                var address = vm.checkoutScope.address,
                    selectedDeliveryOption = vm.checkoutScope.selectedDeliveryOption;
                checkout();
                setTimeout(function() {
                    $ionicLoading.show({
                        template: 'Please input a valid address.',
                        duration: 2000
                    });
                    vm.checkoutScope.address = address;
                    vm.checkoutScope.selectedDeliveryOption = selectedDeliveryOption;
                    vm.checkoutScope.selectedDeliveryOptionType = selectedDeliveryOption.type;
                }, 100);
                return;
            }
            $ionicLoading.show();
            var portionsIds = vm.checkoutInfo.portion_id_list;
            PaymentService.checkout(portionsIds, vm.checkoutScope.selectedDeliveryOption.type, vm.checkoutScope.address)
                .then(function() {
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
                .then(function() {
                    vm.checkoutInfo = [];
                    $ionicHistory.nextViewOptions({
                        historyRoot: true,
                        disableAnimate: true
                    });
                    $state.go('app.orders');
                });
        }

        function isValidAddress(address) {
            return (_.size(address.line1) >= 2 && _.size(address.city) >= 2 && _.size(address.zipcode) >= 5 && _.size(address.state) >= 1);
        }

        function getQuantities(remaining) {
            var a = [];
            for (var i = 1; i <= remaining; i++) {
                a.push(i);
            }
            return a;
        }

        function getSpecialIngredients(dish) {
            var containsIngredients = _.filter(['milk', 'peanuts', 'eggs'], function(ingredient) {
                return dish[ingredient] === true;
            });

            var isIngredients = _.filter(['vegetarian'], function(ingredient) {
                return dish[ingredient] === true;
            });
            return {
                contains: containsIngredients.join(', '),
                is: isIngredients.join(', ')
            };
        }

        function signin() {
            HCModalHelper.showSignup();
        }

        function back() {

            if (!$stateParams.batchId && _.size(vm.checkoutInfo.portions)) {
                popup = $ionicPopup.show({
                    title: 'Order pending',
                    templateUrl: 'templates/confirm-checkout.html',
                    scope: getCheckoutScope(true),
                    buttons: [{
                        text: 'Delete',
                        type: 'button-assertive',
                        onTap: function() {
                            return true;
                        }
                    }, {
                        text: 'Keep'
                    }]
                });
                popup.then(function(res) {
                    if (res) {
                        vm.checkoutInfo = {};
                        PaymentService.cancelOrder();
                        back();
                    } else {
                        popup = undefined;
                    }
                });
            } else if (canGoBack()) {
                $ionicHistory.goBack();
            } else if ($stateParams.batchId) {
                $state.go('app.chef-preview', {
                    id: $stateParams.id
                });
            } else {
                $state.go('app.buyer');
            }
        }

        function canGoBack() {
            var backView = $ionicHistory.backView();
            return backView && ['app.chef-preview', 'app.dish-preview'].indexOf(backView.stateName) === -1;
        }

        function deleteDishPortions(portion) {
            $ionicLoading.show();
            PaymentService.deleteBatch(portion.portion_id_list)
                .then(function() {
                    getChefDetails();
                    return getCheckoutInfo();
                })
                .catch(HCMessaging.showError)
                .then(function(info) {
                    $ionicLoading.hide();
                    if (popup && _.isEmpty(info.portions)) {
                        popup.close();
                    }
                });
        }

        function updateMapCenter() {
            vm.map.center.lat = vm.map.markers.chef.lat = vm.chef.location.latitude;
            vm.map.center.lng = vm.map.markers.chef.lng = vm.chef.location.longitude;
        }

        function initMapProperties() {
            vm.map = {
                defaults: {
                    zoomControl: !('ontouchstart' in window),
                    attributionControl: false,
                    doubleClickZoom: true,
                    scrollWheelZoom: false,
                    dragging: true,
                    touchZoom: true
                },
                tiles: {
                    url: 'https://mt{s}.googleapis.com/vt?x={x}&y={y}&z={z}&style=high_dpi&w=512',
                    options: {
                        subdomains: [0, 1, 2, 3],
                        detectRetina: true,
                        tileSize: 512,
                        minZoom: 10,
                        maxZoom: 18,
                        reuseTiles: true,
                        noWrap: true
                    }
                },
                center: {
                    lat: 37.773204,
                    lng: -122.4213458,
                    zoom: 15
                },
                markers: {
                    user: {
                        lat: 0,
                        lng: 0,
                        icon: {
                            type: 'div',
                            className: 'currentUserMarker',
                            iconSize: [12, 12],
                            iconAnchor: [6, 6],
                            html: ''
                        }
                    },
                    chef: {
                        lat: 0,
                        lng: 0,
                        icon: {
                            type: 'div',
                            className: 'currentChefMarker',
                            iconSize: [chefIconSize, chefIconSize],
                            iconAnchor: [chefIconSize / 2, chefIconSize / 2],
                            html: ''
                        }
                    }
                }
            };
            MapService.initMap(mapId);
            MapService.onEvent(mapId, 'zoomend', mapZoomChanged);
        }

        function centerToUserLocation() {
            var userLocation = LocationService.getCurrentLocation();
            MapService.centerMap(mapId, userLocation.latitude, userLocation.longitude);
        }

        function centerToChefLocation() {
            MapService.centerMap(mapId, vm.chef.location.latitude, vm.chef.location.longitude);
        }
    }
})();
