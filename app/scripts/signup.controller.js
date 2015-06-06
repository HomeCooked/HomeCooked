(function() {

    'use strict';

    angular
        .module('HomeCooked.controllers')
        .controller('SignupCtrl', SignupCtrl);

    SignupCtrl.$inject = ['$scope', '$timeout', '$state', '$ionicHistory', '$ionicLoading', '$ionicPopup', 'LoginService'];

    function SignupCtrl($scope, $timeout, $state, $ionicHistory, $ionicLoading, $ionicPopup, LoginService) {
        
        var vm = this;
        vm.signIn = signIn;

  
        function signIn(loginType, user, pass) {
            $ionicLoading.show({
                template: 'Sign in...'
            });
            LoginService.login(loginType, user, pass).then(function didLogin() {
                $ionicLoading.hide();
                $state.go('app.buyer');
                $ionicHistory.nextViewOptions({
                    historyRoot: true
                });
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