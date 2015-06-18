(function() {

    'use strict';

    angular
        .module('HomeCooked.controllers')
        .controller('ChefPreviewCtrl', ChefPreviewCtrl);

    ChefPreviewCtrl.$inject = ['$stateParams'];

    function ChefPreviewCtrl($stateParams) {
        var vm = this;

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
                dishes: []
            };
        }


    }
})();