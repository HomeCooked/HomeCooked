(function() {
    'use strict';
    
    angular
        .module('HomeCooked.controllers')
        .controller('SettingsCtrl', SettingsCtrl);

    SettingsCtrl.$inject = ['$rootScope', '$scope', '$state', '$timeout', '$ionicLoading', 'LoginService'];
    
    function SettingsCtrl($rootScope, $scope, $state, $timeout, $ionicLoading, LoginService) {

        var vm = this;
        vm.onChange = onChange;        
        vm.openExternalLink = openExternalLink;
        vm.openRatingLink = openRatingLink;

        $scope.$on('$ionicView.beforeEnter', function() {
          vm.user = LoginService.getUser();
        });


        var deregisterStateChangeStart = $rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState) {
            // detect the navigation between a setting page to the main setting page
            if (toState && fromState && toState.name === 'app.settings' &&  fromState.name.indexOf('app.settings') > -1) {
                updateUserProperties(event, toState.name);
            }
            deregisterStateChangeStart();
        });

        function updateUserProperties(event, toStateName) {
            if (vm.userPropertiesChanged) {
                event.preventDefault();
                $ionicLoading.show({
                    template: 'Saving...'
                });
                $timeout(function() {
                    //API CALL
                    console.log(vm.user);
                    $ionicLoading.hide();
                    $state.go(toStateName);
                }, 1500);
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
            return window.open(link, '_system');
        }
    }

})();