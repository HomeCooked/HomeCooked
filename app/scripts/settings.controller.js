(function() {
    'use strict';
    
    angular
        .module('HomeCooked.controllers')
        .controller('SettingsCtrl', SettingsCtrl);

    SettingsCtrl.$inject = ['$scope', 'LoginService'];
    
    function SettingsCtrl($scope, LoginService) {

        var vm = this;

        $scope.$on('$ionicView.beforeEnter', function() {
          vm.user = LoginService.getUser();
        });
    }

})();