(function () {
  'use strict';

  angular
    .module('HomeCooked.controllers')
    .controller('PaymentCtrl', PaymentCtrl);

  PaymentCtrl.$inject = ['$scope', 'HCMessaging'];

  function PaymentCtrl($scope, HCMessaging) {

    var vm = this;
    vm.stripeCallback = stripeCallback;

    $scope.$on('$ionicView.beforeEnter', function () {
      // TODO get values from server!
      vm.number = vm.expiry = vm.cvc = null;
    });

    function stripeCallback(code, result) {
      if (result.error) {
        HCMessaging.showError(result.error);
      }
    }
  }

})();
