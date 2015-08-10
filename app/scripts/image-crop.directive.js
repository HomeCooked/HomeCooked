(function() {

    'use strict';

    angular
        .module('HomeCooked.directives')
        .directive('imageCrop', ImageCrop);

    ImageCrop.$inject = ['$ionicLoading'];
    function ImageCrop($ionicLoading) {
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
                scope.onLoadBegin = function() {
                    $ionicLoading.show({template: 'Loading image'});
                };
                scope.onLoadDone = $ionicLoading.hide;
                scope.onLoadError = function() {
                    $ionicLoading.show({template: 'Error loading the image', duration: 3000});
                };
            }
        };
    }
})();
