(function() {

    'use strict';

    angular
        .module('HomeCooked.controllers')
        .controller('SearchCtrl', SearchCtrl);

    SearchCtrl.$inject = ['$state', '$timeout', '$ionicLoading', '$ionicPopup', 'mapService', 'SearchService', '_'];

    function SearchCtrl($state, $timeout, $ionicLoading, $ionicPopup, mapService, SearchService, _) {

        var mapId = 'chefmap';
        var userLocation = null;
        var vm = this;

        vm.query = '';
        vm.visible = false;
        vm.chefs = [];
        vm.goToPreview = goToPreview;

        activate();

        function activate() {
            //init the map
            initMapProperties();
            //retrieve chefs
            getChefs({
                latitude: vm.map.center.lat,
                longitude: vm.map.center.lng,
            });

            //center the map on user location
            $timeout(function() {
                navigator.geolocation.getCurrentPosition(onLocationSuccess, onLocationError);
            }, 500);
        }

        function getChefs(location) {
            SearchService.getChefs(location).then(setChefs);
        }

        function setChefs(chefs) {
            vm.chefs = chefs;
            displayMarkers();
        }

        function onLocationSuccess(position) {
            userLocation = position.coords;
            displayMarkers();
        }

        function displayMarkers() {
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
                $timeout(function() {
                    mapService.fitMarkers(mapId);
                }, 100);
            }
        }

        function getChefMarker(chef) {
            var html = '<img src="' + (chef.picture || 'images/user.png') + '" alt=""/>' + //
                '<span class="badge">' + chef.num_active_dishes + '</span>';

            var onClickFn = function() {
                goToPreview(parseInt(this.options.icon.options.id));
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

        function onLocationError() {
            $ionicPopup.alert({
                title: 'Error',
                template: 'Unable to retrieve your location'
            });
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
