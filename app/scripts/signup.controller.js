(function() {

'use strict';

angular
    .module('HomeCooked.controllers')
    .controller('SignupCtrl', SignupCtrl);

    SignupCtrl.$inject = ['$scope', 'LoginService'];

    function SignupCtrl($scope, LoginService) {
        var vm = this;
    }

})();