(function() {

    'use strict';

    angular
        .module('HomeCooked.controllers')
        .controller('SearchCtrl', SearchCtrl);

    SearchCtrl.$inject = ['$state', '$scope', '$ionicScrollDelegate', '$ionicLoading', 'SearchService', 'LocationService', 'HCMessaging', 'ConfigService', 'MapService', '_'];

    function SearchCtrl($state, $scope, $ionicScrollDelegate, $ionicLoading, SearchService, LocationService, HCMessaging, ConfigService, MapService, _) {

        var userLocation = {
            latitude: 37.773204,
            longitude: -122.4213458
        };
        var today;
        var vm = this;
        var mapId = 'searchmap';
        var chefIconSize = 60;
        vm.chefs = [];
        vm.showOnlyToday = false;
        vm.mapMode = false;
        vm.isToday = isToday;
        vm.toggleMapMode = toggleMapMode;

        $scope.reload = reloadData;

        //init the map
        $scope.$watch(function() {
            return LocationService.getCurrentLocation();
        }, onLocationChange);

        $scope.$on('$ionicView.afterEnter', onAfterEnter);

        //init the map
        initMapProperties();

        function onAfterEnter() {
            window.ionic.trigger('resize');
            reloadData();
        }

        function reloadData() {
            getChefs({
                latitude: userLocation.latitude,
                longitude: userLocation.longitude
            });
        }

        function getChefs(location) {
            // now + 12h
            today = new Date().getTime() + 43200000;
            $ionicLoading.show();
            ConfigService.getConfig().then(function(config) {
                    vm.search_inactive = config.search_inactive;
                    vm.search_message = config.search_message;
                    if (!vm.search_inactive) {
                        SearchService.getChefs(location).then(setChefs, HCMessaging.showError);
                    } else {
                        $ionicLoading.hide();
                    }
                }, HCMessaging.showError)
                .finally(function() {
                    // Stop the ion-refresher from spinning
                    $scope.$broadcast('scroll.refreshComplete');
                });
        }

        function setChefs(chefs) {
            var scrollPosition = $ionicScrollDelegate.getScrollPosition();
            vm.chefs = chefs;
            var dishes = [];
            _.forEach(chefs, function(chef) {
                _.forEach(chef.dishes, function(dish) {
                    dish.chef = chef;
                });
                dishes = dishes.concat(chef.dishes);
            });
            vm.dishes = dishes;
            updateChefsDistance();
            updateMarkers();
            $ionicLoading.hide();
            $ionicScrollDelegate.scrollBy(0, scrollPosition.top, true);
        }

        function onLocationChange(location) {
            if (location) {
                userLocation = location;
                vm.map.markers.user.lat = location.latitude;
                vm.map.markers.user.lng = location.longitude;
                updateChefsDistance();
            }
        }

        function updateChefsDistance() {
            _.forEach(vm.chefs, function(chef) {
                chef.distance = LocationService.getDistanceFrom(chef.location);
            });
            vm.chefs = _.sortBy(vm.chefs, 'distance');
            vm.dishes = _.sortBy(vm.dishes, 'chef.distance');
        }

        function isToday(value) {
            var date = new Date(value.start_time).getTime();
            return !vm.showOnlyToday || date <= today;
        }

        function toggleMapMode() {
            vm.mapMode = !vm.mapMode;
            if (vm.mapMode) {
                window.ionic.trigger('resize');
            }

        }

        function updateMarkers() {
            var markers = {};
            markers.user = vm.map.markers.user;
            var markersCount = 1;
            var min = [markers.user.latitude, markers.user.longitude];
            var max = [].concat(min);
            _.forEach(vm.chefs, function(chef) {
                markers['chef' + markersCount] = {
                    lat: chef.location.latitude,
                    lng: chef.location.longitude,
                    icon: {
                        type: 'div',
                        className: 'chefMarker',
                        iconSize: [chefIconSize, chefIconSize],
                        iconAnchor: [chefIconSize / 2, chefIconSize / 2],
                        html: '<img src="' + (chef.picture || 'images/user.png') + '" alt=""/>',
                        onClickFn: goToChefPreview.bind(this, chef.id)
                    }
                };
                if (typeof min[0] !== 'number') {
                    min[0] = max[0] = chef.location.latitude;
                    min[1] = max[1] = chef.location.longitude;
                } else {
                    min[0] = Math.min(chef.location.latitude, min[0]);
                    min[1] = Math.min(chef.location.longitude, min[1]);
                    max[0] = Math.max(chef.location.latitude, max[0]);
                    max[1] = Math.max(chef.location.longitude, max[1]);
                }
                markersCount++;
            }.bind(this));
            vm.map.markers = markers;
            vm.map.center.latitude = (min[0] + max[0]) / 2;
            vm.map.center.longitude = (min[1] + max[1]) / 2;
        }

        function goToChefPreview(chefId) {
            return $state.go('app.chef-preview', {
                id: chefId
            });
        }

        function initMapProperties() {
            vm.map = {
                defaults: {
                    zoomControl: !('ontouchstart' in window),
                    attributionControl: false,
                    doubleClickZoom: true,
                    scrollWheelZoom: true,
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
                    }
                }
            };
            MapService.initMap(mapId);
        }

    }
})();
