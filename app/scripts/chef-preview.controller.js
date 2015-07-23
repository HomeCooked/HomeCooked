(function() {

    'use strict';

    angular
        .module('HomeCooked.controllers')
        .controller('ChefPreviewCtrl', ChefPreviewCtrl);

    ChefPreviewCtrl.$inject = ['$state', '$stateParams', '$scope', '$ionicLoading', 'ChefService', 'LocationService', 'HCMessaging', '_'];

    function ChefPreviewCtrl($state, $stateParams, $scope, $ionicLoading, ChefService, LocationService, HCMessaging, _) {
        var vm = this;

        vm.go = $state.go;

        vm.chef = {};

        activate();

        function activate() {
            $ionicLoading.show();
            ChefService.getChef($stateParams.id, true)
                .then(function(chef) {
                    vm.chef = chef;
                    vm.dish = _.find(chef.dishes, {id: parseFloat($stateParams.dishId)});
                    onLocationChange();
                })
                .catch(HCMessaging.showError)
                .finally($ionicLoading.hide);
            $scope.$watch(function() {
                return LocationService.getCurrentLocation();
            }, onLocationChange);
        }

        function onLocationChange() {
            vm.chef.distance = LocationService.getDistanceFrom(vm.chef.location);
        }

    }
})();
