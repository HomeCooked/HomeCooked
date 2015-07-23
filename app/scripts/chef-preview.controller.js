(function() {

    'use strict';

    angular
        .module('HomeCooked.controllers')
        .controller('ChefPreviewCtrl', ChefPreviewCtrl);

    ChefPreviewCtrl.$inject = ['$state', '$stateParams', 'ChefService'];

    function ChefPreviewCtrl($state, $stateParams, ChefService) {
        var vm = this;

        vm.go = $state.go;

        vm.chef = {};

        activate();

        function activate() {
            ChefService.getChef($stateParams.id)
                .then(function(chef) {
                    vm.chef = chef;
                });
        }

    }
})();
