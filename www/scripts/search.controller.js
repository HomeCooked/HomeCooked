(function() {

    'use strict';

    angular
        .module('HomeCooked.controllers')
        .controller('SearchCtrl', SearchCtrl);

    SearchCtrl.$inject = ['$state', '$scope', '$ionicScrollDelegate', '$ionicLoading', 'SearchService', 'LocationService', 'HCMessaging', 'ConfigService', 'MapService', '_'];

    function SearchCtrl($state, $scope, $ionicScrollDelegate, $ionicLoading, SearchService, LocationService, HCMessaging, ConfigService, MapService, _) {

        var userLocation;
        var defaultLocation = {
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
            getChefs(userLocation || defaultLocation);
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
            var oldMarkers = getChefMarkers(vm.chefs);
            var newMarkers = getChefMarkers(chefs);
            var toRemove = _.difference(oldMarkers, newMarkers, 'id');
            var toAdd = _.difference(newMarkers, oldMarkers, 'id');
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
            updateMarkers(toAdd, toRemove);
            $ionicLoading.hide();
            $ionicScrollDelegate.scrollBy(0, scrollPosition.top, true);
        }

        function onLocationChange(location) {
            if (location) {
                if (!userLocation) {
                    MapService.addMarkers(mapId, [getUserMarker(location)]);
                } else {
                    MapService.setMarkerLatLng(mapId, 'user', location.latitude, location.longitude);
                }
                userLocation = location;
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
                _.delay(fitMarkers, 100);
            }
        }

        function updateMarkers(toAdd, toRemove) {
            if (_.size(toRemove)) {
                MapService.removeMarkers(mapId, _.map(toRemove, 'id'));
            }
            if (_.size(toAdd)) {
                MapService.addMarkers(mapId, toAdd);
            }
            if (_.size(toRemove)  ||  _.size(toAdd)) {
                fitMarkers();
            }
        }

        function fitMarkers() {
            MapService.fitMarkers(mapId);
        }

        function getChefMarkers(chefs) {
            return _.chain(chefs)
                .filter(function(chef) {
                    return _.isObject(chef.location);
                })
                .map(getChefMarker)
                .value();
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

        function getUserMarker(location) {
            return {
                id: 'user',
                lat: location.latitude,
                lng: location.longitude,
                className: 'currentUserMarker',
                iconSize: [12, 12],
                iconAnchor: [6, 6],
                html: ''
            };
        }

    }
})();
