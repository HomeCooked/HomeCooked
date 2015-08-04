(function() {
    'use strict';
    angular.module('HomeCooked.controllers').factory('HCModalHelper', HCModalHelper);

    HCModalHelper.$inject = ['_', '$q', '$rootScope', '$ionicLoading', '$ionicModal', '$ionicScrollDelegate', 'HCMessaging', 'PaymentService', 'LoginService'];

    function HCModalHelper(_, $q, $rootScope, $ionicLoading, $ionicModal, $ionicScrollDelegate, HCMessaging, PaymentService, LoginService) {

        var modals = {};
        return {
            showUpdatePayment: showUpdatePayment,
            showTutorial: showTutorial,
            showUpdatePhoneNumber: showUpdatePhoneNumber
        };

        function showUpdatePayment() {
            var modalScope = $rootScope.$new();
            var deferred = $q.defer();
            modals['update-payment'] = modalScope;
            modalScope.deferred = deferred;
            modalScope.showLoading = showLoading;
            modalScope.stripeCallback = stripeCallback;
            modalScope.user = LoginService.getUser();
            $ionicModal.fromTemplateUrl('templates/update-payment.html', {
                scope: modalScope
            }).then(function(modal) {
                modal.show();
                modalScope.modal = modal;
            });
            return deferred.promise;
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

                        var scope = modals['update-payment'];
                        scope.modal.remove();

                        scope.deferred.resolve();
                        scope.$destroy();
                        delete modals['update-payment'];
                        $ionicLoading.show({template: 'Your payment information was saved!', duration: 3000});
                    })
                    .catch(HCMessaging.showError);
            }
        }

        function showTutorial(steps, onCompleteCb) {
            var tutorialScope = $rootScope.$new();
            modals['tutorial'] = tutorialScope;
            tutorialScope.steps = steps;
            tutorialScope.step = 0;
            tutorialScope.next = function next() {
                if (tutorialScope.step === tutorialScope.steps.length - 1) {
                    modals['tutorial'].modal.remove();
                    modals['tutorial'].$destroy();
                    delete modals['tutorial'];
                    if (typeof onCompleteCb === 'function') {
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
                tutorialScope.modal = m;
            });
        }

        function scrollTop() {
            // TODO use $getByHandle once fixed in ionic
            var handle = _.find($ionicScrollDelegate._instances, function(s) {
                return s.$$delegateHandle === 'tutorialContent';
            });
            handle.scrollTop();
        }

        function showUpdatePhoneNumber() {
            var modalScope = $rootScope.$new();
            var deferred = $q.defer();
            modals['update-phone'] = modalScope;
            modalScope.deferred = deferred;
            modalScope.phoneForm = {phone_number: LoginService.getUser().phone_number};
            modalScope.savePhone = savePhone;
            $ionicModal.fromTemplateUrl('templates/update-phone.html', {
                scope: modalScope
            }).then(function(modal) {
                modal.show();
                modalScope.modal = modal;
            });
            return deferred.promise;
        }

        function savePhone(form) {
            LoginService.saveUserData(form).then(function() {
                var scope = modals['update-phone'];
                scope.modal.remove();
                scope.deferred.resolve();
                scope.$destroy();
                delete modals['update-phone'];
                $ionicLoading.show({template: 'Your phone information was saved!', duration: 3000});
            })
                .catch(HCMessaging.showError);
        }
    }

})();
