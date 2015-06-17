(function () {
  'use strict';

  angular
    .module('HomeCooked.controllers')
    .controller('PaymentCtrl', PaymentCtrl);

  PaymentCtrl.$inject = ['$scope', '$ionicLoading', 'HCMessaging', 'PaymentService'];

  function PaymentCtrl($scope, $ionicLoading, HCMessaging, PaymentService) {

    $scope.stripeCallback = stripeCallback;
    $scope.showLoading = showLoading;

    $scope.$on('$ionicView.beforeEnter', function () {
      // TODO get values from server!
      $scope.number = $scope.expiry = $scope.cvc = undefined;
    });

    function showLoading() {
      $ionicLoading.show({template: 'Saving...'});
    }

    function stripeCallback(code, result) {
      if (result.error) {
        $ionicLoading.hide();
        HCMessaging.showError(result.error);
      }
      else {
        PaymentService.savePaymentInfo(result).catch(HCMessaging.showError).finally($ionicLoading.hide);
      }
    }
  }

})();
