(function () {

    'use strict';

    angular
        .module('HomeCooked.controllers')
        .controller('DishReviewCtrl', DishReviewCtrl);

    DishReviewCtrl.$inject = ['$scope', '$stateParams', '$ionicLoading', 'DishesService', 'HCMessaging'];

    function DishReviewCtrl($scope, $stateParams, $ionicLoading, DishesService, HCMessaging) {
        var vm = this;

        vm.reviews = [];

        $scope.$on('$ionicView.beforeEnter', getReviews);

        function getReviews() {
            $ionicLoading.show();
            DishesService.getDishReviews($stateParams.dishId)
                .then(function (reviews) {
                    vm.reviews = reviews;
                    $ionicLoading.hide();
                })
                .catch(HCMessaging.showError);
        }
    }
})();
