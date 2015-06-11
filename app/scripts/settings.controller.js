(function() {
    'use strict';

    angular
        .module('HomeCooked.controllers')
        .controller('SettingsCtrl', SettingsCtrl);

    SettingsCtrl.$inject = ['$scope', '$state', '$timeout', '$ionicPlatform',
        '$ionicPopup', '$ionicLoading', '$ionicHistory', 'LoginService'];

    function SettingsCtrl($scope, $state, $timeout, $ionicPlatform,
        $ionicPopup, $ionicLoading, $ionicHistory, LoginService) {

        var vm = this;
        vm.onChange = onChange;
        vm.onSave = onSave;
        vm.openExternalLink = openExternalLink;
        vm.openRatingLink = openRatingLink;
        vm.confirmLogout = confirmLogout;

        $scope.$on('$ionicView.beforeEnter', function() {
          vm.user = LoginService.getUser();
        });

        function updateUserProperties() {
            if (vm.userPropertiesChanged) {
                $ionicLoading.show({
                    template: 'Saving...'
                });
                $timeout(function() {
                    //API CALL
                    console.log(vm.user);
                    $ionicLoading.hide();
                    $ionicHistory.goBack();
                }, 1500);
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
            return window.open(link, '_system');
        }

        function confirmLogout() {
            var confirmPopup = $ionicPopup.confirm({
                title: 'Are you sure?',
                template: 'Signing out will remove your HomeCooked data from this device. Do you want to sign out?'
            });
            confirmPopup.then(function(res) {
                if(res) {
                    LoginService.logout();
                    $ionicHistory.nextViewOptions({
                        historyRoot: true,
                        disableAnimate: true
                    });
                    $state.go('zipcode-validation');
                }
            });
        }
    }

})();
