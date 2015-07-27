(function() {
    'use strict';
    angular.module('HomeCooked.controllers').controller('OrdersCtrl', OrdersCtrl);

    OrdersCtrl.$inject = ['$rootScope', '$scope', '$ionicModal', '$ionicLoading', 'DishesService', 'ChefService', 'HCMessaging'];
    function OrdersCtrl($rootScope, $scope, $ionicModal, $ionicLoading, DishesService, ChefService, HCMessaging) {
        var vm = this,
            modal,
            modalScope = $rootScope.$new();

        modalScope.vm = vm;

        vm.orders = [];
        vm.pastOrders = [];
        vm.showModal = showModal;
        vm.hideModal = hideModal;
        vm.addReview = addReview;

        $scope.$on('$ionicView.beforeEnter', onBeforeEnter);
        $scope.$on('$destroy', onDestroy);

        function addReview(review, form) {
            $ionicLoading.show({template: 'Saving review...'});

            var dishId = 11;
            DishesService.addDishReview(dishId, review)
                .then(function added() {
                    hideModal();
                    modalScope.review = getEmptyReview();
                    form.$setPristine();
                })
                .catch(HCMessaging.showError)
                .finally($ionicLoading.hide);
        }

        function showModal() {
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

        function getEmptyReview() {
            return {score: 0, comment: ''};
        }

        function onBeforeEnter() {
            // show modal only if pending reviews
            // modalScope.review = getEmptyReview();
            // showModal();
            $ionicLoading.show({template: 'Getting orders...'});
            ChefService.getOrders()
                .then(function(orders) {
                    vm.orders = orders;
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
