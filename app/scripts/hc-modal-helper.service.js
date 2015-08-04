(function() {
    'use strict';
    angular.module('HomeCooked.controllers').factory('HCModalHelper', HCModalHelper);

    HCModalHelper.$inject = ['$rootScope', '$ionicLoading', '$ionicModal', '$ionicScrollDelegate', 'HCMessaging', 'PaymentService', 'LoginService'];

    function HCModalHelper($rootScope, $ionicLoading, $ionicModal, $ionicScrollDelegate, HCMessaging, PaymentService, LoginService) {

        var modals = {};
        return {
            showUpdatePayment: showUpdatePayment,
            showTutorial: showTutorial
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

        function showTutorial(steps, onCompleteCb) {
            var tutorialScope = $rootScope.$new();
            tutorialScope.steps = steps;
            tutorialScope.step = 0;
            tutorialScope.next = function next() {
                if (tutorialScope.step === tutorialScope.steps.length - 1) {
                    modals['tutorial'].remove();
                    delete modals['tutorial'];
                    tutorialScope.$destroy();
                    if (typeof onCompleteCb == 'function') {
                        onCompleteCb();
                    }
                }
                else {
                    scrollTop();
                    tutorialScope.step++;
                }
            };
            $ionicModal.fromTemplateUrl('templates/tutorial.html', {
                scope: tutorialScope
            }).then(function(m) {
                m.show();
                modals['tutorial'] = m;
            });
        }

        function scrollTop() {
            // TODO use $getByHandle once fixed in ionic
            var handle = _.find($ionicScrollDelegate._instances, function(s) {
                return s.$$delegateHandle === 'tutorialContent';
            });
            handle.scrollTop();
        }
    }

})();
