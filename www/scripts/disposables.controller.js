(function () {
    'use strict';
    angular.module('HomeCooked.controllers').controller('DisposablesCtrl', DisposablesCtrl);

    DisposablesCtrl.$inject = ['$cordovaSocialSharing', 'ChefService'];

    function DisposablesCtrl($cordovaSocialSharing, ChefService) {
        var vm = this;

        vm.email = 'marc@gohomecooked.com';
        vm.order = order;

        function order() {
            var chef = ChefService.getChef(),
                subject = 'Order new wares',
                body = 'Hi, I would like to order 20 disposable ware kits. Delivery address: ' + chef.address + '. Chef Id: ' + chef.id;
            if (window.ionic.Platform.isWebView()) {
                $cordovaSocialSharing.shareViaEmail(body, subject, [vm.email]);
            }
            else {
                window.location.href = 'mailto:' + vm.email + '?subject=' + subject + '&body=' + body;
            }
        }
    }
})();
