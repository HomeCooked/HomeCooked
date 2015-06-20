(function() {
    'use strict';

    angular
        .module('HomeCooked.services')
        .service('mapService', MapService);

    MapService.$inject = ['$window', '$log', '$timeout', 'leafletData'];

    function MapService($window, $log, $timeout, leafletData) {

        var featureGroups = []; // an array containing each leaflet map feature group

        var service = {
            initMap: initMap,
            fitMarkers: fitMarkers,
            addMarkers: addMarkers,
            centerMap: centerMap,
            onEvent: onEvent
        };

        return service;


        //////////////////////////////////


        /**
         * Create a Leafleft feature group
         * this method must be call at the init in order
         * to be able to add markers later.
         *
         * @param mapId
         */

        function initMap(mapId) {

            delete featureGroups[mapId];
            leafletData.getMap(mapId).then(function(map) {
                var mapFeatureGroup = $window.L.featureGroup();
                mapFeatureGroup.addTo(map);
                featureGroups[mapId] = mapFeatureGroup;
            });
        }


        /**
         * fit the map to display all the markers displayed on the map,
         * we decrease the maxZoom level to manage the corner case when
         * there is only one marker and the method map.fitBounds is going
         * to zoom at the max.
         * might need some improvements, it's a little bit hackish.
         *
         * @param mapId
         */

        function fitMarkers(mapId) {
            leafletData.getMap(mapId).then(function(map) {
                var maxZoom = map.getMaxZoom();
                map.options.maxZoom = 18;
                $timeout(function() {
                    map.fitBounds(featureGroups[mapId].getBounds().pad(0.2));
                    map.options.maxZoom = maxZoom;
                });
            });
        }


        /** 
         * reset all the markers and add new markers to the map
         * @param mapId the map id
         * @param markers an array of markers object
         */

        function addMarkers(mapId, markers) {
            leafletData.getMap(mapId).then(function() {
                featureGroups[mapId].clearLayers();
                for (var i = 0; i < markers.length; i++) {
                    addMarker(mapId, markers[i]);
                }
            });
        }

        /** 
         * add a HTML Marker to the leaflet featureGroup layer
         * this method computes automatically the iconSize and its position in the map
         * @param mapId the map id
         * @param marker an object containing information about the marker
         *
         */

        function addMarker(mapId, marker) {

            var m = $window.L.marker([marker.lat, marker.lng], {
                icon: $window.L.divIcon({
                    className: marker.className,
                    html: marker.html,
                    iconSize: marker.iconSize,
                    iconAnchor: marker.iconAnchor
                })
            });

            // bind the on click function if exists
            if (marker.onClickFn !== null && typeof marker.onClickFn === 'function') {
                m.on('click', marker.onClickFn);
            }

            // add the maker to the group layer
            featureGroups[mapId].addLayer(m);
        }


        /**
         * center the map on a given latitude and longitude
         * @param mapId the map id
         * @param lat the latitude
         * @param lng the longitude
         */

        function centerMap(mapId, lat, lng) {
            leafletData.getMap(mapId).then(function(map) {
                map.panTo([lat, lng]);
            });
        }

        /**
         * bind an event on the map
         * @param mapId the map id
         * @param eventName the name of the leaflet event (i.e. dragstart)
         * @param fn the function to execute
         */

        function onEvent(mapId, eventName, fn) {
            leafletData.getMap(mapId).then(function(map) {
                map.on(eventName, fn);
            });
        }
    }
})();