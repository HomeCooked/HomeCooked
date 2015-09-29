(function () {
    'use strict';

    angular
        .module('HomeCooked.controllers')
        .controller('EnrollCtrl', EnrollCtrl);

    EnrollCtrl.$inject = ['$window', '$scope', '$state', '$ionicPopup', '$ionicLoading', 'LoginService', 'ChefService', 'HCMessaging'];
    function EnrollCtrl($window, $scope, $state, $ionicPopup, $ionicLoading, LoginService, ChefService, HCMessaging) {
        var vm = this;
        var chef = ChefService.getChef();

        vm.states = ['CA'];
        vm.form = getEmptyForm();
        vm.enroll = enroll;
        vm.openExternalLink = openExternalLink;

        $scope.$watch(function () {
            return chef.id;
        }, function () {
            vm.isChef = chef.id >= 0;
        });

        function enroll(formElement) {
            document.activeElement.blur();

            $ionicLoading.show({
                template: 'Enrolling...'
            });
            LoginService.becomeChef(vm.form)
                .then(function () {
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
                            onTap: function () {
                                // Returning a value will cause the promise to resolve with the given value.
                                $state.go('app.buyer');
                            }
                        }]
                    });
                    $ionicLoading.hide();
                })
                .catch(HCMessaging.showError);
        }

        function getEmptyForm() {
            var user = LoginService.getUser();
            return {
                first_name: user.first_name,
                last_name: user.last_name,
                email: user.email,
                phone_number: user.phone_number,
                address: {
                    state: vm.states[0]
                },
                card: {}
            };
        }

        function openExternalLink(link) {
            $window.open(link, '_system');
            return true;
        }
    }

})();
