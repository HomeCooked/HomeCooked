(function() {
    'use strict';
    angular.module('HomeCooked.controllers').controller('OrdersCtrl', OrdersCtrl);

    OrdersCtrl.$inject = ['$rootScope', '$scope', '$ionicModal', '$ionicLoading', 'DishesService', 'LocationService', 'OrdersService', 'HCMessaging', 'mapService', '_'];
    function OrdersCtrl($rootScope, $scope, $ionicModal, $ionicLoading, DishesService, LocationService, OrdersService, HCMessaging, mapService, _) {
        var vm = this,
            modal,
            userLocation,
            modalScope = $rootScope.$new();

        modalScope.vm = vm;

        vm.activeOrders = [];
        vm.pastOrders = [];
        vm.showModal = showModal;
        vm.hideModal = hideModal;
        vm.addReview = addReview;
        vm.getMapId = getMapId;

        vm.map = {
            defaults: {
                zoomControl: false,
                attributionControl: false,
                doubleClickZoom: false,
                scrollWheelZoom: false,
                dragging: false,
                touchZoom: false
            },
            tiles: {
                url: 'https://mt{s}.googleapis.com/vt?x={x}&y={y}&z={z}&style=high_dpi&w=512',
                options: {
                    subdomains: [0, 1, 2, 3],
                    detectRetina: true,
                    tileSize: 512,
                    minZoom: 2,
                    maxZoom: 21,
                    reuseTiles: true,
                    noWrap: true
                }
            },
            markers: {}
        };

        $scope.$watch(function() {
            return LocationService.getCurrentLocation();
        }, onLocationChange);

        $scope.$on('$ionicView.beforeEnter', onBeforeEnter);
        $scope.$on('$destroy', onDestroy);

        function addReview(review, form) {
            $ionicLoading.show({template: 'Saving review...'});

            var dishId = 11;
            window.alert('hardcoded dishId! ' + dishId);
            DishesService.addDishReview(dishId, review)
                .then(function added() {
                    hideModal();
                    modalScope.review = getEmptyReview();
                    form.$setPristine();
                })
                .catch(HCMessaging.showError)
                .finally($ionicLoading.hide);
        }

        function showModal() {
            if (!modal) {
                $ionicModal.fromTemplateUrl('templates/add-review.html', {
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

        function getEmptyReview() {
            return {score: 0, comment: ''};
        }

        function onBeforeEnter() {
            // show modal only if pending reviews
            // modalScope.review = getEmptyReview();
            // showModal();
            $ionicLoading.show();
            OrdersService.getActiveOrders()
                .then(function(orders) {
                    vm.activeOrders = orders;
                    initMapProperties();
                    updateChefsDistance();
                    displayMarkers();
                })
                .catch(HCMessaging.showError)
                .finally($ionicLoading.hide);
        }

        function onDestroy() {
            if (modal) {
                modal.remove();
                modal = undefined;
                modalScope.$destroy();
            }
        }

        function initMapProperties() {
            _.forEach(vm.activeOrders, function(order) {
                order.center = {lat: order.chef.location.latitude, lng: order.chef.location.longitude, zoom: 14};
                mapService.initMap(getMapId(order));
            });
        }

        function getMapId(order) {
            return 'order-map-' + order.id;
        }

        function onLocationChange(location) {
            userLocation = location;
            updateChefsDistance();
            displayMarkers();
        }

        function updateChefsDistance() {
            _.forEach(vm.activeOrders, function(order) {
                order.chef.distance = LocationService.getDistanceFrom(order.chef.location);
            });
        }

        function displayMarkers() {
            _.forEach(vm.activeOrders, function(order) {
                var markers = [getChefMarker(order.chef)],
                    mapId = getMapId(order);
                if (userLocation) {
                    markers.push(getUserMarker(userLocation));
                }
                mapService.addMarkers(mapId, markers);
                mapService.fitMarkers(mapId);
            });
        }

        function getChefMarker(chef) {
            var html = '<img src="' + (chef.picture || 'images/user.png') + '" alt=""/>';

            return {
                id: chef.id + '_chef',
                lat: chef.location.latitude,
                lng: chef.location.longitude,
                className: 'marker',
                iconSize: [60, 60],
                iconAnchor: [30, 68],
                html: html
            };
        }

        function getUserMarker(coords) {
            return {
                id: 'user',
                lat: coords.latitude,
                lng: coords.longitude,
                className: 'currentUserMarker',
                iconSize: [12, 12],
                iconAnchor: [6, 6],
                html: ''
            };
        }
    }
})();
