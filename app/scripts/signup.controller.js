(function() {

    'use strict';

    angular
        .module('HomeCooked.controllers')
        .controller('SignupCtrl', SignupCtrl);

    SignupCtrl.$inject = ['$scope', '$timeout', '$state', '$ionicSideMenuDelegate', '$ionicNavBarDelegate', '$ionicLoading', '$ionicPopup', 'LoginService'];

    function SignupCtrl($scope, $timeout, $state, $ionicSideMenuDelegate, $ionicNavBarDelegate, $ionicLoading, $ionicPopup, LoginService) {
        
        var vm = this;
        vm.signIn = signIn;

        activate();

        function activate() {
            $timeout(function() {
                //wrapping the delegates in a timeout is required to avoid a race condition
                //otherwise the nav bar remains displayed
                $ionicSideMenuDelegate.canDragContent(false);
                $ionicNavBarDelegate.showBar(false);
            });
        }

        function signIn(loginType, user, pass) {
            $ionicLoading.show({
                template: 'Sign in...'
            });
            LoginService.login(loginType, user, pass).then(function didLogin() {
                $ionicLoading.hide();
                $state.go('app.buyer');
            }, function didNotLogin(err) {
                $ionicLoading.hide();
                $ionicPopup.alert({
                    title: 'Couldn\'t signin',
                    template: err
                });
            });
        }
    }

})();