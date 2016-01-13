(function() {
    'use strict';
    angular.module('HomeCooked.controllers').controller('PendingReviewsCtrl', PendingReviewsCtrl);

    PendingReviewsCtrl.$inject = ['_', '$rootScope', '$scope', '$ionicModal', '$ionicLoading', '$ionicScrollDelegate', 'DishesService', 'LoginService', 'HCMessaging'];

    function PendingReviewsCtrl(_, $rootScope, $scope, $ionicModal, $ionicLoading, $ionicScrollDelegate, DishesService, LoginService, HCMessaging) {
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
                .then(function added() {
                    hideModal();
                    modalScope.review = getEmptyReview();
                    form.$setPristine();
                    loadPendingReviews();
                })
                .catch(HCMessaging.showError);
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
            } else {
                modal.show();
            }
        }

        function hideModal() {
            if (modal) {
                modal.hide();
            }
        }

        function getEmptyReview(dishId, orderId) {
            return {
                score: 0,
                comment: '',
                dishId: dishId,
                orderId: orderId
            };
        }

        function loadPendingReviews() {
            $ionicLoading.show();
            return DishesService.getPendingReviews()
                .then(function(dishes) {
                    if (!_.size(dishes)) {
                        LoginService.getUser().has_pending_reviews = false;
                    }
                    var scrollPosition = $ionicScrollDelegate.getScrollPosition();
                    vm.dishes = dishes;
                    $ionicScrollDelegate.scrollBy(0, scrollPosition.top, true);
                    $ionicLoading.hide();
                })
                .catch(HCMessaging.showError);
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
