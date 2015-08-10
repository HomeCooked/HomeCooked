(function() {

    'use strict';

    angular
        .module('HomeCooked.directives')
        .directive('imageCrop', ImageCrop);

    function ImageCrop() {
        return {
            restrict: 'E',
            transclude: true,
            scope: {
                result: '=',
                inputName: '@'
            },
            templateUrl: 'templates/image-crop.html',
            link: function(scope) {
                scope.picture = '';
                scope.cropped = '';
                scope.onCropChange = function(dataURI) {
                    scope.result = dataURI.split(';base64,').pop();
                };
            }
        };
    }
})();
