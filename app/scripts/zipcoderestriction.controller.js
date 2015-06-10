(function() {
    'use strict';

    angular
        .module('HomeCooked.controllers')
        .controller('ZipCodeRestrictionCtrl', ZipCodeRestrictionCtrl);

    ZipCodeRestrictionCtrl.$inject = ['$timeout', '$ionicHistory', '$state', '$ionicLoading', '$ionicPopup'];

    function ZipCodeRestrictionCtrl($timeout, $ionicHistory, $state, $ionicLoading, $ionicPopup) {

        var vm = this;
        vm.validZipCode = validZipCode;


        activate();


        function activate() {
            if ($state.current.name === 'zipcode-validation') {
                initMapProperties();
                $timeout(function() {
                    navigator.geolocation.getCurrentPosition(onLocationSuccess, onLocationError);
                }, 500);
            }
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
                    doubleClickZoom: false,
                    scrollWheelZoom: false,
                    dragging: false,
                    touchZoom: false,
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

        function validZipCode() {
            if (vm.zipcode && parseInt(vm.zipcode) > 0) {
                $ionicLoading.show({
                    template: 'Checking...'
                });
                //FAKE API CALL
                $timeout(function() {
                    $ionicLoading.hide();
                    if (true) {
                        $ionicHistory.nextViewOptions({
                          historyRoot: true
                        });
                        $state.go('app.buyer');
                    }
                }, 1000);
            }
        }

    }

})();