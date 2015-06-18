(function () {
  'use strict';

  angular.module('HomeCooked.services').factory('PaymentService', PaymentService);

  PaymentService.$inject = ['$http', 'ENV'];
  function PaymentService($http, ENV) {
    var baseUrl = ENV.BASE_URL + '/api/v1/';

    return {
      savePaymentInfo: savePaymentInfo
    };

    function savePaymentInfo(info) {
      return $http.post(baseUrl + 'payment-info/', info);
    }
  }
})();
