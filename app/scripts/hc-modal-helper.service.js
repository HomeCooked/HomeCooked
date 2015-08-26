(function() {
    'use strict';
    angular.module('HomeCooked.controllers').factory('HCModalHelper', HCModalHelper);

    HCModalHelper.$inject = ['_', '$q', '$rootScope', '$ionicLoading', '$ionicModal', 'HCMessaging', 'PaymentService', 'LoginService', 'ChefService'];

    function HCModalHelper(_, $q, $rootScope, $ionicLoading, $ionicModal, HCMessaging, PaymentService, LoginService, ChefService) {

        var modals = {};

        var tutorials = {
            'welcome': [{
                title: 'An everyday option to food!',
                image: 'images/welcome1.jpg',
                message: '<p>Find the best amateur chefs in your neighborhood and pick-up their delicious, affordable home cooked meals minutes after they come out of the oven.</p>'
            }, {
                title: 'Fresh ingredients, talented cooks',
                image: 'images/welcome2.jpg',
                message: '<p>Our amateur chefs go through a rigorous testing process and abide to strict safety guidelines. Your ratings and reviews showcase the best of the best.</p>'
            }, {
                title: 'Ready when you are',
                image: 'images/welcome5.jpg',
                message: '<p>Select a nearby chef and choose the best time to pick up your hot dinner.</p>'
            }],
            'dishes': [{
                title: 'Build your own menu',
                image: 'images/chef8.jpg',
                message: '<p>You decide what to cook, when to cook, and how much to charge.</p><p>Use this section to describe your meals and make your customers want more!</p>'
            }, {
                title: 'Before you start',
                image: 'images/chef8.jpg',
                message: '<p>Each menu item starts with zero reviews, as you will accumulate them through time.</p><p>You cannot edit existing items, but feel free to create as many as you like!</p>'
            }],
            'batches': [{
                title: 'Ready to cook?',
                image: 'images/chef5.jpg',
                message: '<p>This is the part where you post your meal, and cook on your schedule! Select the meal, quantity, and pickup time, and see the orders trickling in.</p>'
            }, {
                title: 'Easy payment',
                image: 'images/chef5.jpg',
                message: '<p>Payment is automatic and goes directly to your account, even if the buyer doesn\'t show up.</p>' +
                '<p>For each dish, we will take an average commission of $1, which includes all bank and transaction fees</p>'
            }, {
                title: 'Simple end-to-end',
                image: 'images/chef5.jpg',
                message: '<p>First: you select the meal, quantity and time of pick-up<br>Second: you watch orders tickling in<br>Third: we notify you when the buyer arrives for pickup!</p>'
            }, {
                title: 'Plan ahead!',
                image: 'images/chef5.jpg',
                message: '<p>We recommend to post your meals several days ahead of the due date, to collect maximum orders</p>'
            }, {
                title: 'Cancellation Policy',
                image: 'images/chef5.jpg',
                message: '<p>Cancelling before the delivery time results in negative ratings. Cancelling during or after pick-up time results in stronger penalties and potential exclusion.</p>'
            }]
        };

        return {
            showUpdatePayment: showUpdatePayment,
            showTutorial: showTutorial,
            showUpdatePhoneNumber: showUpdatePhoneNumber,
            showUpdateEmail: showUpdateEmail,
            showSignup: showSignup
        };

        function showUpdatePayment() {
            var modalScope = $rootScope.$new();
            var deferred = $q.defer();
            modals['update-payment'] = modalScope;
            modalScope.deferred = deferred;
            modalScope.updatePayment = updatePayment;
            modalScope.closeModal = closeModal;
            modalScope.user = LoginService.getChefMode() ? ChefService.getChef() : LoginService.getUser();
            modalScope.mustBeDebit = LoginService.getChefMode();
            $ionicModal.fromTemplateUrl('templates/update-payment.html', {
                scope: modalScope
            }).then(function(modal) {
                modal.show();
                modalScope.modal = modal;
            });
            return deferred.promise;
        }

        function updatePayment(paymentForm) {
            document.activeElement.blur();
            $ionicLoading.show();
            PaymentService.savePaymentInfo({
                card: paymentForm.card.$modelValue,
                cvc: paymentForm.cvc.$modelValue,
                expiry: paymentForm.expiry.$modelValue
            })
                .then(function() {
                    var scope = closeModal('update-payment');
                    scope.deferred.resolve();
                    $ionicLoading.show({template: 'Your payment information was saved!', duration: 3000});
                })
                .catch(HCMessaging.showError);
        }

        function showTutorial(tutorialId) {
            var modalScope = $rootScope.$new();
            modals['tutorial'] = modalScope;
            var deferred = $q.defer();
            modalScope.deferred = deferred;
            modalScope.steps = tutorials[tutorialId];
            modalScope.tutorialDone = tutorialDone;
            $ionicModal.fromTemplateUrl('templates/tutorial.html', {
                scope: modalScope
            }).then(function(modal) {
                modal.show();
                modalScope.modal = modal;
            });
            return deferred.promise;
        }

        function tutorialDone() {
            var scope = closeModal('tutorial');
            scope.deferred.resolve();
        }

        function showUpdatePhoneNumber() {
            var modalScope = $rootScope.$new();
            var deferred = $q.defer();
            modals['update-phone'] = modalScope;
            modalScope.deferred = deferred;
            modalScope.savePhone = savePhone;
            modalScope.closeModal = closeModal;

            var user = LoginService.getChefMode() ? ChefService.getChef() : LoginService.getUser();
            modalScope.phone_number = user.phone_number;

            $ionicModal.fromTemplateUrl('templates/update-phone.html', {
                scope: modalScope
            }).then(function(modal) {
                modalScope.modal = modal;
                modal.show();
            });
            return deferred.promise;
        }

        function savePhone(phone) {
            document.activeElement.blur();
            $ionicLoading.show();
            var fn = LoginService.getChefMode() ? ChefService.saveChefData : LoginService.saveUserData;
            fn({phone_number: phone}).then(function() {
                var scope = closeModal('update-phone');
                scope.deferred.resolve();
                $ionicLoading.show({template: 'Your phone information was saved!', duration: 3000});
            })
                .catch(HCMessaging.showError);
        }

        function showUpdateEmail() {
            var modalScope = $rootScope.$new();
            var deferred = $q.defer();
            modals['update-email'] = modalScope;
            modalScope.deferred = deferred;
            modalScope.saveEmail = saveEmail;
            modalScope.closeModal = closeModal;

            var user = LoginService.getChefMode() ? ChefService.getChef() : LoginService.getUser();
            modalScope.email = user.email;

            $ionicModal.fromTemplateUrl('templates/update-email.html', {
                scope: modalScope
            }).then(function(modal) {
                modalScope.modal = modal;
                modal.show();
            });
            return deferred.promise;
        }

        function saveEmail(email) {
            $ionicLoading.show();
            var data = {email: email};
            var fn = LoginService.getChefMode() ? ChefService.saveChefData : LoginService.saveUserData;
            fn(data).then(function() {
                var scope = closeModal('update-email');
                scope.deferred.resolve();
            }).catch(HCMessaging.showError).finally($ionicLoading.hide);
        }

        function showSignup() {
            var modalScope = $rootScope.$new();
            var deferred = $q.defer();
            modals['signup'] = modalScope;
            modalScope.deferred = deferred;
            modalScope.closeModal = closeModal;
            modalScope.signIn = signIn;

            $ionicModal.fromTemplateUrl('templates/signup/signup.html', {
                animation: 'slide-in-up',
                scope: modalScope
            }).then(function(modal) {
                modalScope.modal = modal;
                modal.show();
            });
            return deferred.promise;
        }

        function signIn(loginType, user, pass) {
            $ionicLoading.show();
            LoginService.login(loginType, user, pass).then(function didLogin() {
                $ionicLoading.hide();
                var scope = closeModal('signup');
                scope.deferred.resolve();
            }, HCMessaging.showError);
        }

        function closeModal(scopeName) {
            var scope = modals[scopeName];
            scope.modal.remove();
            scope.$destroy();
            delete modals[scopeName];
            return scope;
        }
    }

})();
