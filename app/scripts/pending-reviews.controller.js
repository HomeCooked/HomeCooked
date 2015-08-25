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
            $ionicLoading.show();

            DishesService.addDishReview(review)
                .catch(HCMessaging.showError)
                .then(function added() {
                    hideModal();
                    modalScope.review = getEmptyReview();
                    form.$setPristine();
                    LoginService.reloadUser(false);
                    loadPendingReviews();
                });
        }

        function showModal(dish) {
            modalScope.review = getEmptyReview(dish.id, dish.order_id);
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

        function getEmptyReview(dishId, orderId) {
            return {score: 0, comment: '', dishId: dishId, orderId: orderId};
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
