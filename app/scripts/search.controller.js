(function() {

    'use strict';

    angular
        .module('HomeCooked.controllers')
        .controller('SearchCtrl', SearchCtrl);

    SearchCtrl.$inject = ['$timeout', '$ionicLoading', '$ionicPopup'];

    function SearchCtrl($timeout, $ionicLoading, $ionicPopup) {
        var vm = this;

        vm.query = '';

        activate();

        function activate() {
            //init the map
            initMapProperties();
            //retrieve chefs
            //center the map on user location
            $timeout(function() {
                navigator.geolocation.getCurrentPosition(onLocationSuccess, onLocationError);
            }, 500);
        }

        function onLocationSuccess(position) {
            var coords = position.coords;
            vm.map.center = {
                lat: coords.latitude,
                lng: coords.longitude,
                zoom: 14
            };
            vm.map.markers = {
                marker: {
                    lat: coords.latitude,
                    lng: coords.longitude
                }
            };
        }

        function onLocationError() {
            $ionicPopup.alert({
                title: 'Error',
                template: 'Unable to retrieve your location'
           });
        }

        function initMapProperties() {
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

        vm.findChefs = function() {
            $ionicLoading.show({
                template: 'Searching...',
                duration: 2000
            });
        };
    }
})();