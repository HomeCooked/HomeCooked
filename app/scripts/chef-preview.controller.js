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
        vm.getNumber = getNumber;
        vm.chef = {};

        activate();

        function activate() {
            $ionicLoading.show();
            ChefService.getChef($stateParams.id, true)
                .then(function(chef) {
                    vm.chef = chef;
                    vm.dish = _.find(chef.dishes, {id: parseFloat($stateParams.dishId)});
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

        function order(qty) {
            if (user.hasCC) {
                PaymentService.order({dishId: $stateParams.dishId, quantity: qty});
            }
            else {
                $state.go('app.settings-payment');
            }
        }

        function getNumber(num) {
            var a = [];
            for (var i = 0; i < num; i++) {
                a.push(i);
            }
            return a;
        }

        function signin() {
            LoginService.login('facebook');
        }

    }
})();
