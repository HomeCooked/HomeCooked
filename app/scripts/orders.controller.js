(function() {
    'use strict';
    angular.module('HomeCooked.controllers').controller('OrdersCtrl', OrdersCtrl);

    OrdersCtrl.$inject = ['$scope', '$ionicLoading', 'OrdersService', 'HCMessaging'];
    function OrdersCtrl($scope, $ionicLoading, OrdersService, HCMessaging) {
        var vm = this;

        vm.activeOrders = [];
        vm.notifyChef = notifyChef;
        vm.openMap = openMap;
        $scope.reload = reload;
        $scope.$on('$ionicView.beforeEnter', reload);

        function reload() {
            $ionicLoading.show();
            return OrdersService.getActiveOrders()
                .then(function(orders) {
                    vm.activeOrders = orders;
                    $ionicLoading.hide();
                })
                .catch(HCMessaging.showError)
                .finally(function() {
                    // Stop the ion-refresher from spinning
                    $scope.$broadcast('scroll.refreshComplete');
                });
        }

        function notifyChef(order) {
            $ionicLoading.show();
            OrdersService.notifyReadyForPickup(order.id)
                .then(function() {
                    $ionicLoading.show({
                        template: 'Chef notified!',
                        duration: 2000
                    });
                })
                .catch(function() {
                    HCMessaging.showMessage('Too early!', 'Please wait for the scheduled pickup time.');
                });
        }

        function openMap(chef) {
            var url = 'https://www.google.com/maps?q=' + chef.address + '&center=' + chef.location.latitude + ',' + chef.location.longitude;
            window.open(url, '_system', 'location=yes');
        }
    }
})();
