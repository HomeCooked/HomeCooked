(function() {

    'use strict';

    angular
        .module('HomeCooked.controllers')
        .controller('SearchCtrl', SearchCtrl);

    SearchCtrl.$inject = ['$state', '$scope', '$ionicLoading', 'mapService', 'SearchService', 'LocationService', '_'];

    function SearchCtrl($state, $scope, $ionicLoading, mapService, SearchService, LocationService, _) {

        var mapId = 'chefmap';
        var userLocation = null;
        var vm = this;

        vm.query = '';
        vm.visible = false;
        vm.chefs = [];

        //init the map
        initMapProperties();
        $scope.$watch(function() {
            return LocationService.getCurrentLocation();
        }, onLocationChange);

        $scope.$on('$ionicView.beforeEnter', onBeforeEnter);

        function onBeforeEnter() {
            //retrieve chefs
            getChefs({
                latitude: vm.map.center.lat,
                longitude: vm.map.center.lng,
            });
        }

        function getChefs(location) {
            $ionicLoading.show();
            SearchService.getChefs(location)
                .then(setChefs)
                .finally($ionicLoading.hide);
        }

        function setChefs(chefs) {
            vm.chefs = chefs;
            updateChefsDistance();
            displayMarkers(true);
        }

        function onLocationChange(location) {
            var fit = !userLocation && !!location;
            userLocation = location;
            updateChefsDistance();
            displayMarkers(fit);
        }

        function updateChefsDistance() {
            _.forEach(vm.chefs, function(chef) {
                chef.distance = LocationService.getDistanceFrom(chef.location);
            });
        }

        function displayMarkers(fit) {
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
                mapService.addMarkers(mapId, markers);
                if (fit) {
                    mapService.fitMarkers(mapId);
                }
            }
        }

        function getChefMarker(chef) {
            var html = '<img src="' + (chef.picture || 'images/user.png') + '" alt=""/>' + //
                '<span class="badge">' + chef.num_active_dishes + '</span>';

            var onClickFn = function() {
                goToPreview(parseInt(chef.id));
            };

            return {
                id: chef.id + '_chef',
                lat: chef.location.latitude,
                lng: chef.location.longitude,
                className: 'marker',
                iconSize: [60, 60],
                iconAnchor: [30, 68],
                html: html,
                onClickFn: onClickFn
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

        function initMapProperties() {
            mapService.initMap(mapId);
            vm.map = {
                defaults: {
                    zoomControl: false,
                    attributionControl: false,
                    doubleClickZoom: true,
                    scrollWheelZoom: true,
                    dragging: true,
                    touchZoom: true,
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
                center: {
                    lat: 37.773204,
                    lng: -122.4213458,
                    zoom: 14
                },
                markers: {}
            };
        }

        function goToPreview(chefId) {
            return $state.go('app.chef-preview', {id: chefId});
        }
    }
})();
