(function() {

'use strict';

angular
    .module('HomeCooked.controllers')
    .controller('SignupCtrl', SignupCtrl);

    SignupCtrl.$inject = ['$scope', '$timeout', '$ionicSideMenuDelegate', '$ionicNavBarDelegate', 'LoginService'];

    function SignupCtrl($scope, $timeout, $ionicSideMenuDelegate, $ionicNavBarDelegate, LoginService) {
        var vm = this;


        activate();

        function activate() {
            $timeout(function() {
                //wrapping the delegates in a timeout is required to avoid a race condition
                //otherwise the nav bar remains displayed
                $ionicSideMenuDelegate.canDragContent(false);
                $ionicNavBarDelegate.showBar(false);
            });
        }
    }

})();