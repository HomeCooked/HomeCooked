(function() {

    'use strict';

    angular
        .module('HomeCooked.controllers')
        .controller('SearchCtrl', SearchCtrl);

    SearchCtrl.$inject = ['$state', '$scope', '$ionicLoading', 'SearchService', 'LocationService', 'HCMessaging', '_'];

    function SearchCtrl($state, $scope, $ionicLoading, SearchService, LocationService, HCMessaging, _) {

        var userLocation = {
            latitude: 37.773204,
            longitude: -122.4213458
        };
        var vm = this;
        vm.chefs = [];

        //init the map
        $scope.$watch(function() {
            return LocationService.getCurrentLocation();
        }, onLocationChange);

        $scope.$on('$ionicView.afterEnter', onAfterEnter);

        function onAfterEnter() {
            getChefs({
                latitude: userLocation.latitude,
                longitude: userLocation.longitude
            });
        }

        function getChefs(location) {
            $ionicLoading.show();
            SearchService.getChefs(location)
                .then(setChefs)
                .catch(HCMessaging.showError);
        }

        function setChefs(chefs) {
            vm.chefs = chefs;
            updateChefsDistance();
            $ionicLoading.hide();
        }

        function onLocationChange(location) {
            if (location) {
                userLocation = location;
                updateChefsDistance();
            }
        }

        function updateChefsDistance() {
            _.forEach(vm.chefs, function(chef) {
                chef.distance = LocationService.getDistanceFrom(chef.location);
            });
            vm.chefs = _.sortBy(vm.chefs, 'distance');
        }
    }
})();
