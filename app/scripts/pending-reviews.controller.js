(function() {
    'use strict';
    angular.module('HomeCooked.controllers').controller('PendingReviewsCtrl', PendingReviewsCtrl);

    PendingReviewsCtrl.$inject = ['$rootScope', '$scope', '$ionicModal', '$ionicLoading', 'DishesService', 'LoginService', 'HCMessaging'];
    function PendingReviewsCtrl($rootScope, $scope, $ionicModal, $ionicLoading, DishesService, LoginService, HCMessaging) {
        var vm = this,
            modal,
            modalScope = $rootScope.$new();

        modalScope.vm = vm;

        vm.dishes = [];
        vm.showModal = showModal;
        vm.hideModal = hideModal;
        vm.addReview = addReview;

        $scope.$on('$ionicView.beforeEnter', loadPendingReviews);
        $scope.$on('$destroy', onDestroy);

        function addReview(review, form) {
            $ionicLoading.show({template: 'Saving review...'});

            DishesService.addDishReview(review.dishId, review)
                .catch(HCMessaging.showError)
                .then(function added() {
                    hideModal();
                    modalScope.review = getEmptyReview();
                    form.$setPristine();
                    LoginService.reloadUser();
                    loadPendingReviews();
                });
        }

        function showModal(dishId) {
            modalScope.review = getEmptyReview(dishId);
            if (!modal) {
                $ionicModal.fromTemplateUrl('templates/add-review.html', {
                    scope: modalScope
                }).then(function(m) {
                    modal = m;
                    modal.show();
                });
            }
            else {
                modal.show();
            }
        }

        function hideModal() {
            if (modal) {
                modal.hide();
            }
        }

        function getEmptyReview(dishId) {
            return {score: 0, comment: '', dishId: dishId};
        }

        function loadPendingReviews() {
            // show modal only if pending reviews
            $ionicLoading.show();
            return DishesService.getPendingReviews()
                .then(function(dishes) {
                    vm.dishes = dishes;
                })
                .catch(HCMessaging.showError)
                .finally($ionicLoading.hide);
        }

        function onDestroy() {
            if (modal) {
                modal.remove();
                modal = undefined;
                modalScope.$destroy();
            }
        }
    }
})();
