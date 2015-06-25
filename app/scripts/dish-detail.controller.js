(function() {

    'use strict';

    angular
        .module('HomeCooked.controllers')
        .controller('DishDetailCtrl', DishDetailCtrl);

    DishDetailCtrl.$inject = ['$state', '$stateParams'];

    function DishDetailCtrl($state, $stateParams) {
        var vm = this;

        vm.go = $state.go;

        vm.dish = {};

        activate();

        function activate() {

            vm.dish = {
                title: 'Philly Cheese Steak',
                picture: 'http://www.muscleandfitness.com/sites/muscleandfitness.com/files/philly-cheesesteak-recipe_0.jpg',
                price: '$7.99',
                available_qty: 3,
                pickup_time: '7pm',
                id: $stateParams.dishId,
                ingredients: ['pizza', 'mushrooms', 'onions','cheese', 'more cheese']
            };
        }


    }
})();
