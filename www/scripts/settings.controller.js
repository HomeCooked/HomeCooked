(function () {
    'use strict';

    angular
        .module('HomeCooked.controllers')
        .controller('SettingsCtrl', SettingsCtrl);

    SettingsCtrl.$inject = ['$window', '$scope', '$ionicPlatform',
        '$ionicPopup', 'LoginService', 'ChefService', 'HCModalHelper', 'ENV'];

    function SettingsCtrl($window, $scope, $ionicPlatform,
                          $ionicPopup, LoginService, ChefService, HCModalHelper, ENV) {

        var vm = this;
        vm.version = ENV.version;
        vm.openExternalLink = openExternalLink;
        vm.openRatingLink = openRatingLink;
        vm.confirmLogout = confirmLogout;
        vm.showUpdatePayment = showUpdatePayment;
        vm.showUpdateEmail = showUpdateEmail;
        vm.showUpdatePhone = showUpdatePhone;
        vm.newPicture = null;
        vm.showUpdatePhoto = showUpdatePhoto;

        $scope.$watch(function () {
            return LoginService.getChefMode();
        }, function (chefMode) {
            vm.user = chefMode ? ChefService.getChef() : LoginService.getUser();
        });

        function openRatingLink() {
            var link = $ionicPlatform.is('android') ? 'market://details?id=com.homecooked.app' : 'itms://itunes.apple.com/app/homecooked/id1027256050';
            return openExternalLink(link);
        }

        function openExternalLink(link) {
            $window.open(link, '_system');
            return true;
        }

        function confirmLogout() {
            $ionicPopup.confirm({
                title: 'Are you sure?',
                template: 'Signing out will remove your HomeCooked data from this device. Do you want to sign out?'
            }).then(function (res) {
                if (res) {
                    LoginService.logout();
                }
            });
        }

        function showUpdatePayment() {
            HCModalHelper.showUpdatePayment();
        }

        function showUpdateEmail() {
            HCModalHelper.showUpdateEmail();
        }

        function showUpdatePhone() {
            HCModalHelper.showUpdatePhoneNumber();
        }

        function showUpdatePhoto() {
            HCModalHelper.showUpdatePicture();
        }
    }

})();
