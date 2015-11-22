(function () {
    'use strict';
    angular.module('HomeCooked.controllers').factory('HCModalHelper', HCModalHelper);

    HCModalHelper.$inject = ['$q', '$window', '$rootScope', '$ionicLoading', '$ionicModal', '$ionicSlideBoxDelegate', 'HCMessaging', 'PaymentService', 'LoginService', 'ChefService'];

    function HCModalHelper($q, $window, $rootScope, $ionicLoading, $ionicModal, $ionicSlideBoxDelegate, HCMessaging, PaymentService, LoginService, ChefService) {

        var modals = {};

        var tutorials = {
            'dishes': [{
                title: 'Build your own menu',
                image: 'images/chef8.jpg',
                message: '<p>You decide what to cook, when to cook, and how much to charge. Buyers will come to pickup at your front door after passing orders.</p>' +
                    '<p>We recommend posting your dishes several days in advance, and aiming for top reviews and ratings.</p>'
            }, {
                title: 'Get paid',
                image: 'images/chef8.jpg',
                message: '<p>Payment is automatic, and takes up to 5 business days to process. For each dish, we take a variable transaction fee below $1, to cover bank and transaction fees.</p>'
            }, {
                title: 'Follow our rules',
                image: 'images/chef8.jpg',
                message: '<p>Cancelling a meal that has already been purchased results in negative reviews.</p><p>Be sure to follow our code of good conduct and safety requirements from the California Food Handler Program.</p>'
            }]
        };

        return {
            showUpdatePayment: showUpdatePayment,
            showTutorial: showTutorial,
            showUpdatePhoneNumber: showUpdatePhoneNumber,
            showUpdateEmail: showUpdateEmail,
            showSignup: showSignup,
            showUpdatePicture: showUpdatePicture
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
            }).then(function (modal) {
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
                .then(function () {
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
            modalScope.step = 0;
            modalScope.steps = tutorials[tutorialId];
            modalScope.tutorialDone = tutorialDone;
            modalScope.nextSlide = nextSlide;
            modalScope.previousSlide = previousSlide;
            $ionicModal.fromTemplateUrl('templates/tutorial.html', {
                scope: modalScope
            }).then(function (modal) {
                modal.show();
                modalScope.modal = modal;
            });
            return deferred.promise;
        }

        function nextSlide() {
            getTutorialSlideBox().next();
        }

        function previousSlide() {
            getTutorialSlideBox().previous();
        }

        function getTutorialSlideBox() {
            return $ionicSlideBoxDelegate.$getByHandle('tutorial-slide-box')._instances[0];
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
            }).then(function (modal) {
                modalScope.modal = modal;
                modal.show();
            });
            return deferred.promise;
        }

        function savePhone(phone) {
            document.activeElement.blur();
            $ionicLoading.show();
            var fn = LoginService.getChefMode() ? ChefService.saveChefData : LoginService.saveUserData;
            fn({phone_number: phone}).then(function () {
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
            }).then(function (modal) {
                modalScope.modal = modal;
                modal.show();
            });
            return deferred.promise;
        }

        function saveEmail(email) {
            $ionicLoading.show();
            var data = {email: email};
            var fn = LoginService.getChefMode() ? ChefService.saveChefData : LoginService.saveUserData;
            fn(data).then(function () {
                $ionicLoading.hide();
                var scope = closeModal('update-email');
                scope.deferred.resolve();
            }).catch(HCMessaging.showError);
        }

        function showSignup() {
            var modalScope = $rootScope.$new();
            var deferred = $q.defer();
            modals['signup'] = modalScope;
            modalScope.deferred = deferred;
            modalScope.closeModal = closeModal;
            modalScope.doingLogin = true;
            modalScope.signIn = signIn;
            modalScope.toggleDoingLogin = toggleDoingLogin;
            modalScope.openExternalLink = openExternalLink;

            $ionicModal.fromTemplateUrl('templates/signup/signup.html', {
                animation: 'slide-in-up',
                scope: modalScope
            }).then(function (modal) {
                modalScope.modal = modal;
                modal.show();
            });
            return deferred.promise;
        }

        function signIn(loginType, data) {
            // block ui only for homecooked login
            if (loginType === 'homecooked') {
                $ionicLoading.show();
            }

            var scope = modals['signup'],
                fn = loginType === 'homecooked' && !scope.doingLogin ? LoginService.signup : LoginService.login;
            fn(loginType, data).then(function didLogin() {
                $ionicLoading.hide();
                closeModal('signup');
                scope.deferred.resolve();
            }, HCMessaging.showError);
        }

        function toggleDoingLogin() {
            var scope = modals['signup'];
            scope.doingLogin = !scope.doingLogin;
        }

        function closeModal(scopeName) {
            var scope = modals[scopeName];
            scope.modal.remove();
            scope.$destroy();
            delete modals[scopeName];
            return scope;
        }

        function showUpdatePicture(uploadMethod) {
            var modalScope = $rootScope.$new();
            var deferred = $q.defer();
            modals['picture'] = modalScope;
            modalScope.deferred = deferred;
            modalScope.callback = uploadMethod;
            modalScope.result = '';
            modalScope.closeModal = closeModal;
            modalScope.uploadPicture = uploadPicture;

            $ionicModal.fromTemplateUrl('templates/update-picture.html', {
                animation: 'slide-in-up',
                scope: modalScope
            }).then(function (modal) {
                modalScope.modal = modal;
                modal.show();
            });
            return deferred.promise;
        }

        function uploadPicture(pict) {
            var scope = modals['picture'];
            var method = LoginService.getChefMode() ? ChefService.uploadProfilePicture : LoginService.uploadProfilePicture;
            if (typeof scope.callback === 'function') {
                method = scope.callback;
            }
            $ionicLoading.show();
            var promise = method(pict) || $q.when();
            promise.then(function () {
                $ionicLoading.hide();
                var scope = closeModal('picture');
                scope.deferred.resolve();
            }, HCMessaging.showError);
        }

        function openExternalLink(link) {
            $window.open(link, '_system');
            return true;
        }
    }

})();
