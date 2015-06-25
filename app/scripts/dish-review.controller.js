(function() {

    'use strict';

    angular
        .module('HomeCooked.controllers')
        .controller('DishReviewCtrl', DishReviewCtrl);

    DishReviewCtrl.$inject = [];

    function DishReviewCtrl() {
        var vm = this;

        vm.reviews = [];

        activate();

        function activate() {
            vm.reviews = [{
                first_name: 'Didier',
                last_name: 'Baquier',
                picture: 'http://didierbaquier.fr/img/me.jpg',
                rating: 4.7,
                comment: 'It was so delicious, the meat was perfectly cooked!'
            },{
                first_name: 'Didier',
                last_name: 'Baquier',
                picture: 'http://didierbaquier.fr/img/me.jpg',
                rating: 4.7,
                comment: 'It was so delicious, the meat was perfectly cooked!'
            },{
                first_name: 'Didier',
                last_name: 'Baquier',
                picture: 'http://didierbaquier.fr/img/me.jpg',
                rating: 4.7,
                comment: 'It was so delicious, the meat was perfectly cooked!'
            },{
                first_name: 'Didier',
                last_name: 'Baquier',
                picture: 'http://didierbaquier.fr/img/me.jpg',
                rating: 4.7,
                comment: 'It was so delicious, the meat was perfectly cooked!'
            },];
        }


    }
})();
