(function() {
    'use strict';

    angular
        .module('HomeCooked.controllers')
        .controller('PaymentCtrl', PaymentCtrl);

    PaymentCtrl.$inject = ['$scope', '$state', '$ionicPopup', '$ionicLoading', 'HCMessaging', 'PaymentService', 'LoginService'];

    function PaymentCtrl($scope, $state, $ionicPopup, $ionicLoading, HCMessaging, PaymentService, LoginService) {

        var vm = this;

        $scope.stripeCallback = stripeCallback;
        $scope.showLoading = showLoading;

        $scope.$on('$ionicView.beforeEnter', function() {
            vm.number = vm.expiry = vm.cvc = undefined;
            vm.user = LoginService.getUser();
        });

        function showLoading() {
            $ionicLoading.show({template: 'Saving...'});
        }

        function stripeCallback(code, result) {
            if (result.error) {
                $ionicLoading.hide();
                HCMessaging.showError(result.error);
            }
            else {
                PaymentService.savePaymentInfo(result)
                    .then(function() {
                        LoginService.setUserHasPaymentInfo(true);
                    })
                    .then(function() {
                        $state.go('app.settings');
                        $ionicPopup.alert({
                            title: 'Save successful',
                            template: 'Your payment information was saved!',
                        });
                    })
                    .catch(HCMessaging.showError)
                    .finally($ionicLoading.hide);
            }
        }
    }

})();
