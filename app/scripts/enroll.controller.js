(function() {
    'use strict';

    angular
        .module('HomeCooked.controllers')
        .controller('EnrollCtrl', EnrollCtrl);

    EnrollCtrl.$inject = ['$window', '$state', '$ionicPopup', '$ionicLoading', 'LoginService', 'HCMessaging'];
    function EnrollCtrl($window, $state, $ionicPopup, $ionicLoading, LoginService, HCMessaging) {
        var vm = this;

        vm.form = getEmptyForm();
        vm.enroll = enroll;
        vm.openExternalLink = openExternalLink;

        function enroll(formElement) {
            document.activeElement.blur();

            $ionicLoading.show({
                template: 'Enrolling...'
            });
            calculateAddress(vm.form, vm.form.address);
            LoginService.becomeChef(vm.form)
                .then(function() {
                    vm.form = getEmptyForm();
                    if (formElement) {
                        formElement.$setPristine();
                    }
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

        function getEmptyForm() {
            var user = LoginService.getUser();
            return {
                first_name: user.first_name,
                last_name: user.last_name,
                email: user.email,
                phone_number: user.phone_number,
                card: {}
            };
        }

        function openExternalLink(link) {
            $window.open(link, '_system');
            return true;
        }
    }

})();
