'use strict';
angular.module('HomeCooked.controllers').controller('SearchCtrl', ['$ionicLoading', '$timeout',
  function ($ionicLoading, $timeout) {
    var self = this;
    self.query = '';
    self.findChefs = function () {
      $ionicLoading.show({template: 'Searching...'});
      $timeout($ionicLoading.hide, 2000);
    };
  }]);
