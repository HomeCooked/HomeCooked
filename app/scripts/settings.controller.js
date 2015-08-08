(function() {
    'use strict';

    angular
        .module('HomeCooked.controllers')
        .controller('SettingsCtrl', SettingsCtrl);

    SettingsCtrl.$inject = ['$window', '$scope', '$state', '$ionicPlatform',
        '$ionicPopup', '$ionicLoading', '$ionicHistory', 'LoginService', 'ChefService', 'HCMessaging', 'HCModalHelper'];

    function SettingsCtrl($window, $scope, $state, $ionicPlatform,
                          $ionicPopup, $ionicLoading, $ionicHistory, LoginService, ChefService, HCMessaging, HCModalHelper) {

        var vm = this;
        vm.onChange = onChange;
        vm.onSave = onSave;
        vm.openExternalLink = openExternalLink;
        vm.openRatingLink = openRatingLink;
        vm.confirmLogout = confirmLogout;
        vm.showUpdatePayment = showUpdatePayment;
        vm.showUpdatePhone = showUpdatePhone;

        $scope.$on('$ionicView.beforeEnter', function() {
            var user = LoginService.getUser();
            if (user.is_chef && LoginService.getChefMode()) {
                ChefService.getChef(user.id).then(function(chef) {
                    vm.user = chef;
                });
            }
            else {
                vm.user = user;
            }
        });

        function updateUserProperties() {
            if (vm.userPropertiesChanged) {
                $ionicLoading.show();
                LoginService.saveUserData({
                    email: vm.user.email
                })
                    .then(function() {
                        $state.go('app.settings');
                    })
                    .catch(HCMessaging.showError)
                    .finally($ionicLoading.hide);
            }
        }

        function onSave() {
            updateUserProperties();
        }

        function onChange() {
            vm.userPropertiesChanged = true;
        }

        function openRatingLink() {
            var link = $ionicPlatform.is('android') ? 'market://details?id=' : 'itms://itunes.apple.com/app/';
            return openExternalLink(link);
        }

        function openExternalLink(link) {
            $window.open(link, '_system');
            return true;
        }

        function confirmLogout() {
            var confirmPopup = $ionicPopup.confirm({
                title: 'Are you sure?',
                template: 'Signing out will remove your HomeCooked data from this device. Do you want to sign out?'
            });
            confirmPopup.then(function(res) {
                if (res) {
                    LoginService.logout();
                    $ionicHistory.nextViewOptions({
                        historyRoot: true,
                        disableAnimate: true
                    });
                    $state.go('app.buyer');
                }
            });
        }

        function showUpdatePayment() {
            HCModalHelper.showUpdatePayment();
        }

        function showUpdatePhone() {
            HCModalHelper.showUpdatePhoneNumber();
        }
    }

})();
