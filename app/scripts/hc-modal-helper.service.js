(function() {
    'use strict';
    angular.module('HomeCooked.controllers').factory('HCModalHelper', HCModalHelper);

    HCModalHelper.$inject = ['$rootScope', '$ionicLoading', '$ionicModal', 'HCMessaging', 'PaymentService', 'LoginService'];

    function HCModalHelper($rootScope, $ionicLoading, $ionicModal, HCMessaging, PaymentService, LoginService) {

        var modals = {};
        return {
            showUpdatePayment: showUpdatePayment
        };

        function showUpdatePayment() {
            var modalScope = $rootScope.$new();
            modalScope.showLoading = showLoading;
            modalScope.stripeCallback = stripeCallback;
            modalScope.user = LoginService.getUser();
            $ionicModal.fromTemplateUrl('templates/update-payment.html', {
                scope: modalScope
            }).then(function(modal) {
                modal.show();
                modalScope.modal = modal;
                modals['update-payment'] = modal;
            });
        }

        function showLoading(msg) {
            var params = msg ? {template: msg} : undefined;
            $ionicLoading.show(params);
        }

        function stripeCallback(code, result) {
            if (result.error) {
                HCMessaging.showError(result.error);
            }
            else {
                PaymentService.savePaymentInfo(result)
                    .then(function() {
                        // TODO remove this
                        LoginService.setUserHasPaymentInfo(true);
                        LoginService.reloadUser();
                        modals['update-payment'].hide();
                        $ionicLoading.show({template: 'Your payment information was saved!', duration: 3000});
                    })
                    .catch(HCMessaging.showError);
            }
        }
    }

})();
