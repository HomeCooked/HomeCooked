(function() {

    'use strict';

    angular
        .module('HomeCooked.controllers')
        .controller('ChefPreviewCtrl', ChefPreviewCtrl);

    ChefPreviewCtrl.$inject = ['$state', '$stateParams', '$scope', '$ionicLoading', 'ChefService', 'LocationService', 'HCMessaging', 'LoginService', 'PaymentService', '_'];

    function ChefPreviewCtrl($state, $stateParams, $scope, $ionicLoading, ChefService, LocationService, HCMessaging, LoginService, PaymentService, _) {
        var vm = this;
        var user = LoginService.getUser();

        vm.go = $state.go;
        vm.user = user;
        vm.signin = signin;
        vm.order = order;
        vm.chef = {};

        activate();

        function activate() {
            $ionicLoading.show();
            ChefService.getChef($stateParams.id, true)
                .then(function(chef) {
                    vm.chef = chef;
                    if ($stateParams.dishId) {
                        vm.dish = _.find(chef.dishes, {id: parseFloat($stateParams.dishId)});
                        vm.quantity = 1;
                        vm.dish.quantities = getQuantities(vm.dish.remaining);
                    }
                    onLocationChange();
                })
                .catch(HCMessaging.showError)
                .finally($ionicLoading.hide);
            $scope.$watch(function() {
                return LocationService.getCurrentLocation();
            }, onLocationChange);
        }

        function onLocationChange() {
            vm.chef.distance = LocationService.getDistanceFrom(vm.chef.location);
        }

        function order() {
            if (user.hasPaymentInfo) {
                PaymentService.order({dishId: $stateParams.dishId, quantity: vm.quantity});
            }
            else {
                $state.go('app.settings-payment');
            }
        }

        function getQuantities(remaining) {
            var a = [];
            for (var i = 0; i < remaining; i++) {
                a.push(i + 1);
            }
            return a;
        }

        function signin() {
            LoginService.login('facebook');
        }

    }
})();
