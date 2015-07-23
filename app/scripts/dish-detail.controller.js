(function() {

    'use strict';

    angular
        .module('HomeCooked.controllers')
        .controller('DishDetailCtrl', DishDetailCtrl);

    DishDetailCtrl.$inject = ['$state', '$stateParams', 'ChefService'];

    function DishDetailCtrl($state, $stateParams, ChefService) {
        var vm = this;

        vm.go = $state.go;

        vm.dish = {};

        activate();

        function activate() {
            ChefService.getChef($stateParams.id)
                .then(function(chef) {
                    vm.chef = chef;
                });
            ChefService.getDish($stateParams.dishId)
                .then(function(dish) {
                    vm.dish = dish;
                });
        }


    }
})();
