(function() {

    'use strict';

    angular
        .module('HomeCooked.controllers')
        .controller('ChefPreviewCtrl', ChefPreviewCtrl);

    ChefPreviewCtrl.$inject = ['$state', '$stateParams'];

    function ChefPreviewCtrl($state, $stateParams) {
        var vm = this;

        vm.go = $state.go;

        vm.chef = {};

        activate();

        function activate() {
            vm.chef = {
                id: $stateParams.id,
                picture: 'http://www.gohomecooked.com/images/marc.jpg',
                first_name: 'Marc-Antoine',
                last_name: 'Andreoli',
                rating: '4.5',
                distance: '0.2mi',
                description: 'Doing the best hamburgers in town.',
                dish_count: 2,
                location: {
                    latitude: 37.7551522,
                    longitude: -122.4260917
                },
                bio: 'Growing up in a Greek and Sicilian family, the Cleveland native creates boldly flavored, ' +
                    'deeply satisfying dishes at his four restaurants in America’s heartland.',
                dishes: [{
                    title: 'Philly Cheese Steak',
                    picture: 'http://i.bullfax.com/imgs/962fd564649084eabfe59808c745c2220a23883c.jpg',
                    price: '$7.99',
                    available_qty: 3,
                    pickup_time: '7pm',
                    review_count: 22
                }, {
                    title: 'Philly Cheese Steak',
                    picture: 'http://cdn.crownmediadev.com/d1/720d567fca26a5b363ecd6d6b74976/calamari-segment-Ep060.jpg',
                    price: '$5.99',
                    available_qty: 2,
                    pickup_time: '8pm',
                    review_count: 22
                }, {
                    title: 'Philly Cheese Steak',
                    picture: 'http://www.muscleandfitness.com/sites/muscleandfitness.com/files/philly-cheesesteak-recipe_0.jpg',
                    price: '$5.99',
                    available_qty: 3,
                    pickup_time: '7pm',
                    review_count: 22
                }, {
                    title: 'Philly Cheese Steak',
                    picture: 'http://www.muscleandfitness.com/sites/muscleandfitness.com/files/philly-cheesesteak-recipe_0.jpg',
                    price: '$5.99',
                    available_qty: 3,
                    pickup_time: '7pm',
                    review_count: 22
                }]
            };
        }


    }
})();
