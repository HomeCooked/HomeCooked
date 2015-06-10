(function() {
    'use strict';

    angular
        .module('HomeCooked.controllers')
        .controller('ZipCodeRestrictionCtrl', ZipCodeRestrictionCtrl);

    ZipCodeRestrictionCtrl.$inject = [];

    function ZipCodeRestrictionCtrl() {

        var vm = this;

        vm.map = {
            defaults: {
                zoomControl: false,
                attributionControl: false,
                doubleClickZoom: true,
                scrollWheelZoom: true
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
                lat: 37.7685616,
                lng: -122.4152349,
                zoom: 14
            }
        };

    }

})();