(function() {

    'use strict';

    angular
        .module('HomeCooked.controllers')
        .controller('DishReviewCtrl', DishReviewCtrl);

    DishReviewCtrl.$inject = ['$stateParams', '$ionicLoading', 'DishesService', 'HCMessaging'];

    function DishReviewCtrl($stateParams, $ionicLoading, DishesService, HCMessaging) {
        var vm = this;

        vm.reviews = [];

        getReviews();

        function getReviews() {
            $ionicLoading.show();
            DishesService.getDishReviews($stateParams.dishId)
                .then(function(reviews) {
                    vm.reviews = reviews;
                })
                .catch(HCMessaging.showError)
                .finally($ionicLoading.hide);
        }


    }
})();
