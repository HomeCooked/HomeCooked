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
                updateChefsDistance();
                updateMarkers();
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
                MapService.fitMarkers(mapId);
            }

        }

        function updateMarkers() {
            var markers = _.chain(vm.chefs)
                .filter(function(chef) {
                    return _.isObject(chef.location);
                })
                .map(getChefMarker)
                .value();
            if (userLocation) {
                markers.push(getUserMarker(userLocation));
            }
            if (_.size(markers)) {
                MapService.addMarkers(mapId, markers);
                MapService.fitMarkers(mapId);
            }
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
                    zoom: 18
                },
                markers: {}
            };
            MapService.initMap(mapId);
        }

        function getChefMarker(chef) {
            var html = '<img src="' + chef.dishes[0].picture + '"/>';
            return {
                id: 'chef' + chef.id,
                lat: chef.location.latitude,
                lng: chef.location.longitude,
                className: 'chefMarker',
                iconSize: [80, 80],
                iconAnchor: [40, 40],
                html: html,
                onClickFn: goToChefPreview.bind(vm, chef.id)
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
