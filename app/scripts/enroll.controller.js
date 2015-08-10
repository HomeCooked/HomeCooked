(function() {
    'use strict';

    angular
        .module('HomeCooked.controllers')
        .controller('EnrollCtrl', EnrollCtrl);

    EnrollCtrl.$inject = ['$state', '$scope', '$ionicPopup', '$ionicLoading', 'LoginService', 'HCMessaging'];

    function EnrollCtrl($state, $scope, $ionicPopup, $ionicLoading, LoginService, HCMessaging) {
        var vm = this;
        var user = LoginService.getUser();
        vm.form = {
            first_name: user.first_name,
            last_name: user.last_name,
            email: user.email,
            phone_number: user.phone_number
        };
        resetCard();

        vm.enroll = enroll;
        // crap needed by angular-payments
        $scope.stripeCallback = stripeCallback;

        function enroll(formElement) {
            $ionicLoading.show({
                template: 'Enrolling...'
            });
            resetCard();
            if(formElement){
                formElement.$setPristine();
            }
            var form = vm.form;
            if (!form.stripe) {
                return;
            }
            calculateAddress(form, form.address);
            LoginService.becomeChef(form)
                .then(function() {
                    $ionicPopup.show({
                        title: 'You\'re enrolled!',
                        template: 'We\'ll reach out to you soon with further instructions.',
                        buttons: [{
                            text: 'Got it!',
                            type: 'button-positive',
                            onTap: function() {
                                // Returning a value will cause the promise to resolve with the given value.
                                $state.go('app.buyer');
                            }
                        }]
                    });
                    $ionicLoading.hide();
                })
                .catch(HCMessaging.showError);
        }

        function calculateAddress(form, place) {
            if (typeof place === 'string') {
                form.address = place;
                form.coordinates = {latitude: 37.7732, longitude: -122.42134};
            }
            else {
                form.address = place.formatted_address;
                form.coordinates = {latitude: place.geometry.location.lat(), longitude: place.geometry.location.lng()};
            }
        }

        function resetCard(){
            $scope.number = $scope.expiry = $scope.cvc = undefined;
        }

        function stripeCallback(code, result) {
            if (result.error) {
                HCMessaging.showError(result.error);
            }
            else {
                vm.form.stripe = result;
                enroll();
            }
        }
    }

})();
