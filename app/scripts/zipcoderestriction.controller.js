(function() {
  'use strict';

  angular
    .module('HomeCooked.controllers')
    .controller('ZipCodeRestrictionCtrl', ZipCodeRestrictionCtrl);

  ZipCodeRestrictionCtrl.$inject = ['$stateParams', '$timeout', '$ionicHistory', '$state', '$ionicLoading', '$ionicPopup', 'LoginService', 'ZipcodeService'];

  function ZipCodeRestrictionCtrl($stateParams, $timeout, $ionicHistory, $state, $ionicLoading, $ionicPopup, LoginService, ZipcodeService) {

    var vm = this;
    vm.validZipCode = validZipCode;
    vm.registerEmail = registerEmail;

    activate();

    function activate() {
      if ($state.current.name === 'zipcode-validation') {
        initMapProperties();
        $timeout(function() {
          navigator.geolocation.getCurrentPosition(onLocationSuccess, onLocationError);
        }, 500);
      }
    }

    function onLocationSuccess(position) {
      var coords = position.coords;
      vm.map.center = {
        lat: coords.latitude,
        lng: coords.longitude,
        zoom: 14
      };
      vm.map.markers = {
        marker: {
          lat: coords.latitude,
          lng: coords.longitude
        }
      };
    }

    function onLocationError() {
      $ionicPopup.alert({
        title: 'Error',
        template: 'Unable to retrieve your location'
      });
    }

    function initMapProperties() {
      vm.map = {
        defaults: {
          zoomControl: false,
          attributionControl: false,
          doubleClickZoom: false,
          scrollWheelZoom: false,
          dragging: false,
          touchZoom: false,
        },
        tiles: {
          url: 'https://mt{s}.googleapis.com/vt?x={x}&y={y}&z={z}&style=high_dpi&w=512',
          options: {
            subdomains: [0, 1, 2, 3],
            detectRetina: true,
            tileSize: 512,
            minZoom: 2,
            maxZoom: 21,
            reuseTiles: true,
            noWrap: true
          }
        },
        center: {
          lat: 37.773204,
          lng: -122.4213458,
          zoom: 14
        },
        markers: {}
      };
    }

    function validZipCode() {
      if (vm.zipcode && parseInt(vm.zipcode) > 0) {
        $ionicLoading.show({
          template: 'Checking...'
        });
        ZipcodeService.isValidZipcode(parseInt(vm.zipcode))
          .then(function(isAvailable) {
            $ionicLoading.hide();
            if (isAvailable) {
              LoginService.setUserZipCode(vm.zipcode);
              $ionicHistory.nextViewOptions({
                historyRoot: true
              });
              $state.go('app.buyer');
            }
            else {
              $state.go('zipcode-unavailable', {
                zipcode: vm.zipcode
              });
            }
          });
      }
    }

    function registerEmail() {
      if (vm.email_address && $stateParams.zipcode) {
        $ionicLoading.show({
          template: 'Registering...'
        });
        //FAKE API CALL PASSING THE EMAIL ADDRESS AND THE ZIP CODE
        $timeout(function() {
          $ionicLoading.hide();
          vm.email_address = null;
          $ionicPopup.alert({
            title: 'Thank you for registering',
            template: 'Thank you, we will be in touch shortly.'
          });
        }, 1000);
      }
    }
  }

})();
