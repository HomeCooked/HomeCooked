(function() {
    'use strict';
    
    angular
        .module('HomeCooked.controllers')
        .controller('SettingsCtrl', SettingsCtrl);

    SettingsCtrl.$inject = ['$rootScope', '$scope', '$state', '$timeout', '$ionicPlatform', '$ionicLoading', '$ionicHistory', 'LoginService'];
    
    function SettingsCtrl($rootScope, $scope, $state, $timeout, $ionicPlatform, $ionicLoading, $ionicHistory, LoginService) {

        var vm = this;
        vm.onChange = onChange;
        vm.onSave = onSave;        
        vm.openExternalLink = openExternalLink;
        vm.openRatingLink = openRatingLink;

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
    }

})();