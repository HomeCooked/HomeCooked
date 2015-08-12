(function() {

    'use strict';

    angular
        .module('HomeCooked.directives')
        .directive('imageCrop', ImageCrop);

    ImageCrop.$inject = ['$jrCrop'];
    function ImageCrop($jrCrop) {
        return {
            restrict: 'E',
            transclude: true,
            scope: {
                result: '=',
                aspectRatio: '@',
                inputName: '@'
            },
            templateUrl: 'templates/image-crop.html',
            link: function(scope) {
                scope.pictureData = undefined;
                scope.cropped = undefined;
                scope.cropPicture = function(pictureData) {
                    if (!pictureData) {
                        return;
                    }
                    var picture = 'data:' + pictureData.filetype + ';base64,' + pictureData.base64,
                        aspectRatio = parseFloat(scope.aspectRatio);
                    if (typeof aspectRatio !== 'number' || isNaN(aspectRatio)) {
                        aspectRatio = 1;
                    }
                    $jrCrop.crop({
                        url: picture,
                        height: 300,
                        aspectRatio: aspectRatio
                    }).then(function(canvas) {
                        scope.result = canvas.toDataURL();
                    });
                };
                scope.$watch(function() {
                    return scope.result;
                }, function(newValue) {
                    if (!newValue) {
                        scope.pictureData = undefined;
                    }
                    if (newValue && newValue.indexOf('data:') === 0) {
                        scope.cropped = newValue;
                    }
                    else {
                        scope.cropped = undefined;
                    }
                });
            }
        };
    }
})();
