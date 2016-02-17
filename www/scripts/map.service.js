(function() {
    'use strict';

    angular
        .module('HomeCooked.services')
        .service('MapService', MapService);

    MapService.$inject = ['$window', 'leafletData'];

    function MapService($window, leafletData) {

        var featureGroups = {}; // an object containing each leaflet map feature group

        var service = {
            initMap: initMap,
            fitBounds: fitBounds,
            addMarkers: addMarkers,
            removeMarkers: removeMarkers,
            setMarkerLatLng: setMarkerLatLng,
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
            var mapFeatureGroup = $window.L.featureGroup();
            featureGroups[mapId] = mapFeatureGroup;
            mapFeatureGroup._markers = {};
            leafletData.getMap(mapId).then(function(map) {
                mapFeatureGroup.addTo(map);
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
         * @param bounds the bounds to fit
         */

        function fitBounds(mapId, bounds) {
            return leafletData.getMap(mapId).then(function(map) {
                bounds = bounds || featureGroups[mapId].getBounds();
                map.fitBounds(bounds, {
                    padding: [20, 20]
                });
            });
        }

        /**
         * reset all the markers and add new markers to the map
         * @param mapId the map id
         * @param markers an array of markers object
         */

        function addMarkers(mapId, markers) {
            for (var i = 0; i < markers.length; i++) {
                if (!markers[i].id) {
                    markers[i].id = 'marker_' + i;
                }
                addMarker(mapId, markers[i]);
            }
            featureGroups[mapId].bringToFront();
        }

        function removeMarkers(mapId, markerIds) {
            var group = featureGroups[mapId],
                markers = group._markers;
            for (var i = 0; i < markerIds.length; i++) {
                var id = markerIds[i];
                group.removeLayer(markers[id]);
                delete markers[id];
            }
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
                    iconAnchor: marker.iconAnchor,
                    id: marker.id
                })
            });

            // bind the on click function if exists
            if (typeof marker.onClickFn === 'function') {
                m.on('click', marker.onClickFn);
            }

            // add the maker to the group layer
            featureGroups[mapId].addLayer(m);
            featureGroups[mapId]._markers[marker.id] = m;
        }

        /**
         * updates the marker location
         * @param mapId the map id
         * @param markerId the marker id
         * @param lat the latitude
         * @param lng the longitude
         */
        function setMarkerLatLng(mapId, markerId, lat, lng) {
            featureGroups[mapId]._markers[markerId].setLatLng([lat, lng]);
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
