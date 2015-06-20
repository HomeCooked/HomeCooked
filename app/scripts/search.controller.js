(function() {

    'use strict';

    angular
        .module('HomeCooked.controllers')
        .controller('SearchCtrl', SearchCtrl);

    SearchCtrl.$inject = ['$state', '$timeout', '$ionicLoading', '$ionicPopup'];

    function SearchCtrl($state, $timeout, $ionicLoading, $ionicPopup) {
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
            vm.chefs = [{
                id: 1,
                picture: 'http://www.gohomecooked.com/images/marc.jpg',
                first_name: 'Marc-Antoine',
                last_name: 'Andreoli',
                rating: '4.5',
                distance: '0.2mi',
                bio: 'Doing the best hamburgers in town.',
                dish_count: 2,
                location: {
                    latitude: 37.7551522,
                    longitude: -122.4260917
                }
            }, {
                id: 2,
                picture: 'http://www.gohomecooked.com/images/valdrin.jpg',
                first_name: 'Valdrin',
                last_name: 'Koshi',
                rating: '4.5',
                distance: '0.2mi',
                bio: 'Doing the best hamburgers in town.',
                dish_count: 4,
                location: {
                    latitude: 37.7543784,
                    longitude: -122.4200126
                }
            }, {
                id: 3,
                picture: 'http://didierbaquier.fr/img/me.jpg',
                first_name: 'Didier',
                last_name: 'Baquier',
                rating: '4.5',
                distance: '0.2mi',
                bio: 'Doing the best hamburgers in town.',
                dish_count: 1,
                location: {
                    latitude: 37.7581146,
                    longitude: -122.4184106
                }
            }];

            addChefMarkers();
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
            vm.map.markers['user'] = {
                lat: coords.latitude,
                lng: coords.longitude
            };
        }

        function addChefMarkers() {
            for (var i = 0; i < vm.chefs.length; i++) { 
                var chef = vm.chefs[i];
                if (chef.location) {
                    vm.map.markers['chef_' + chef.id] =  {
                        lat: chef.location.latitude,
                        lng: chef.location.longitude
                    };
                }
            }
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

        function goToPreview(chefId) {
            return $state.go('app.chef-preview', {id: chefId});
        }
    }
})();