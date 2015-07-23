(function() {

    'use strict';

    angular
        .module('HomeCooked.controllers')
        .controller('ChefPreviewCtrl', ChefPreviewCtrl);

    ChefPreviewCtrl.$inject = ['$state', '$stateParams', '$scope', 'ChefService', 'LocationService'];

    function ChefPreviewCtrl($state, $stateParams, $scope, ChefService, LocationService) {
        var vm = this;

        vm.go = $state.go;

        vm.chef = {};

        activate();

        function activate() {
            ChefService.getChef($stateParams.id)
                .then(function(chef) {
                    vm.chef = chef;
                    onLocationChange();
                });
            $scope.$watch(function() {
                return LocationService.getCurrentLocation();
            }, onLocationChange);
        }

        function onLocationChange() {
            vm.chef.distance = LocationService.getDistanceFrom(vm.chef.location) + 'mi.';
        }

    }
})();
