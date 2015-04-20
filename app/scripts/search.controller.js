'use strict';
angular.module('HomeCooked.controllers').controller('SearchCtrl', ['$ionicLoading',
  function ($ionicLoading) {
    var self = this;
    self.query = '';
    self.findChefs = function () {
      $ionicLoading.show({template: 'Searching...', duration: 2000});
    };
  }]);
