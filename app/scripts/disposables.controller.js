(function () {
    'use strict';
    angular.module('HomeCooked.controllers').controller('DisposablesCtrl', DisposablesCtrl);

    DisposablesCtrl.$inject = ['ChefService'];

    function DisposablesCtrl(ChefService) {
        var vm = this;

        var chef = ChefService.getChef();
        vm.email = 'marc@gohomecooked.com';
        vm.subject = 'Order new wares';
        vm.body = 'Hi, I would like to order 20 disposable ware kits. Delivery address: ' + chef.address + '. Chef Id: ' + chef.id;
    }
})();
