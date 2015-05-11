'use strict';
angular.module('HomeCooked.controllers').controller('EnrollCtrl', ['$state', '$ionicPopup', '$ionicLoading', 'LoginService',
  function ($state, $ionicPopup, $ionicLoading, LoginService) {
    var that = this;

    that.enroll = function (form) {
      $ionicLoading.show({
        template: 'Enrolling...'
      });
      LoginService.becomeChef(form)
        .then(function () {
          $ionicPopup.show({
            title: 'You\'re enrolled!',
            template: 'We\'ll reach out to you soon with further instructions.',
            buttons: [{
              text: 'Got it!',
              type: 'button-positive',
              onTap: function () {
                // Returning a value will cause the promise to resolve with the given value.
                $state.go('app.buyer');
              }
            }]
          });
          $ionicLoading.hide();
        })
        .catch(function () {
          $ionicLoading.hide();
          $ionicPopup.alert({
            template: 'sorry we couldn\'t enroll you this time'
          });
        });
    };
  }]);
