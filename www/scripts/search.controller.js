(function() {

    'use strict';

    angular
        .module('HomeCooked.controllers')
        .controller('SearchCtrl', SearchCtrl);

    SearchCtrl.$inject = ['$state', '$scope', '$ionicScrollDelegate', '$ionicLoading', 'SearchService', 'LocationService', 'HCMessaging', 'ConfigService', '_'];

    function SearchCtrl($state, $scope, $ionicScrollDelegate, $ionicLoading, SearchService, LocationService, HCMessaging, ConfigService, _) {

        var userLocation = {
            latitude: 37.773204,
            longitude: -122.4213458
        };
        var today;
        var vm = this;
        vm.chefs = [];
        vm.showOnlyToday = false;
        vm.isToday = isToday;

        $scope.reload = reloadData;

        //init the map
        $scope.$watch(function() {
            return LocationService.getCurrentLocation();
        }, onLocationChange);

        $scope.$on('$ionicView.beforeEnter', reloadData);

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
            $ionicLoading.hide();
            $ionicScrollDelegate.scrollBy(0, scrollPosition.top, true);
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
            vm.dishes = _.sortBy(vm.dishes, 'chef.distance');
        }

        function isToday(value) {
            var date = new Date(value.start_time).getTime();
            return !vm.showOnlyToday || date <= today;
        }

    }
})();
