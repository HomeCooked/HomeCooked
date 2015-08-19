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

        $scope.$watch(function() {
            return LoginService.getChefMode();
        }, function(chefMode) {
            vm.user = chefMode ? ChefService.getChef() : LoginService.getUser();
        });

        function onSave() {
            if (vm.userPropertiesChanged) {
                $ionicLoading.show();
                var data = {email: vm.user.email};
                var fn = LoginService.getChefMode() ? ChefService.saveChefData : LoginService.saveUserData;
                fn(data).then(function() {
                    $state.go('app.settings');
                })
                    .catch(HCMessaging.showError)
                    .finally($ionicLoading.hide);
            }
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
