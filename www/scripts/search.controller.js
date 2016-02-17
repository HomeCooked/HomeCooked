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
        var vm = this;
        var mapId = 'searchmap';
        vm.chefs = [];
        vm.hasUserLocation = false;
        vm.mapMode = false;
        vm.toggleMapMode = toggleMapMode;
        vm.centerToUserLocation = centerToUserLocation;

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
            getChefs(userLocation || defaultLocation);
        }

        function getChefs(location) {
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
                userLocation = location;
                if (vm.hasUserLocation) {
                    MapService.setMarkerLatLng(mapId, 'user', location.latitude, location.longitude);
                } else {
                    MapService.addMarkers(mapId, [getUserMarker()]);
                    vm.hasUserLocation = true;
                }
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

        function toggleMapMode() {
            vm.mapMode = !vm.mapMode;
            if (vm.mapMode) {
                $ionicScrollDelegate.scrollBy(0, 0, false);
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
            if (!vm.chefs.length) {
                return;
            }
            // top-left
            var tl = [vm.chefs[0].location.latitude, vm.chefs[0].location.longitude];
            // bottom-right
            var br = [vm.chefs[0].location.latitude, vm.chefs[0].location.longitude];
            for (var i = 1; i < vm.chefs.length; i++) {
                var l = vm.chefs[i].location;
                tl[0] = Math.min(tl[0], l.latitude);
                tl[1] = Math.min(tl[1], l.longitude);
                br[0] = Math.max(br[0], l.latitude);
                br[1] = Math.max(br[1], l.longitude);
            }
            // we exclude user location
            MapService.fitBounds(mapId, [tl, br]);
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

        function getUserMarker() {
            return {
                id: 'user',
                lat: userLocation.latitude,
                lng: userLocation.longitude,
                className: 'currentUserMarker',
                iconSize: [12, 12],
                iconAnchor: [6, 6],
                html: ''
            };
        }

        function centerToUserLocation() {
            MapService.centerMap(mapId, userLocation.latitude, userLocation.longitude);
        }

    }
})();
