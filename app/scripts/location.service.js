'use strict';
(function() {
    angular.module('HomeCooked.services').factory('LocationService', LocationService);

    LocationService.$inject = ['$cordovaGeolocation'];
    function LocationService($cordovaGeolocation) {
        var location;

        var posOptions = {timeout: 10000, enableHighAccuracy: false};
        $cordovaGeolocation.getCurrentPosition(posOptions)
            .then(onLocationSuccess, onLocationFail);

        var watchOptions = {
            frequency: 1000,
            timeout: 3000,
            enableHighAccuracy: false // may cause errors if true
        };

        var watch = $cordovaGeolocation.watchPosition(watchOptions);
        watch.then(null, onLocationFail, onLocationSuccess);

        return {
            getCurrentLocation: getCurrentLocation,
            getDistanceFrom: getDistanceFrom
        };

        function getCurrentLocation() {
            return location;
        }

        function getDistanceFrom(l) {
            if (!location || !l) {
                return '';
            }
            return distance(location.latitude, location.longitude, l.latitude, l.longitude).toFixed(1) + ' miles';
        }

        function distance(lat1, lon1, lat2, lon2) {
            var radlat1 = Math.PI * lat1 / 180;
            var radlat2 = Math.PI * lat2 / 180;
            var theta = lon1 - lon2;
            var radtheta = Math.PI * theta / 180;
            var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
            dist = Math.acos(dist);
            dist = dist * 180 / Math.PI;
            dist = dist * 60 * 1.1515;
            return dist;
        }


        function onLocationSuccess(position) {
            location = {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude
            };
        }

        function onLocationFail() {
            //HCMessaging.showMessage('Error', 'Unable to retrieve your location');
        }
    }
})();
