(function() {

    'use strict';

    angular
        .module('HomeCooked.controllers')
        .controller('SearchCtrl', SearchCtrl);

    SearchCtrl.$inject = ['$ionicLoading'];

    function SearchCtrl($ionicLoading) {
        var vm = this;
        
        vm.query = '';

        vm.findChefs = function() {
            $ionicLoading.show({
                template: 'Searching...',
                duration: 2000
            });
        };
    }
})();