(function() {

    'use strict';

    angular
        .module('HomeCooked.directives')
        .directive('imageCrop', ImageCrop);

    ImageCrop.$inject = ['$jrCrop', '$cordovaCamera', '$ionicActionSheet'];
    function ImageCrop($jrCrop, $cordovaCamera, $ionicActionSheet) {
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
                var SIZE = 800;
                scope.pictureData = undefined;
                scope.cropped = undefined;
                scope.isMobile = window.ionic.Platform.isWebView();

                scope.takePicture = function() {
                    document.activeElement.blur();
                    if (!scope.isMobile) {
                        return;
                    }
                    $ionicActionSheet.show({
                        buttons: [
                            {text: 'Camera'},
                            {text: 'Album'}
                        ],
                        titleText: 'Upload picture from',
                        cancelText: 'Cancel',
                        buttonClicked: onActionSelected
                    });
                };

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
                        width: SIZE,
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

                function onActionSelected(index) {
                    var aspectRatio = parseFloat(scope.aspectRatio);
                    if (typeof aspectRatio !== 'number' || isNaN(aspectRatio)) {
                        aspectRatio = 1;
                    }
                    var options = {
                        quality: 90,
                        destinationType: window.Camera.DestinationType.DATA_URL,
                        sourceType: (index === 0 ? window.Camera.PictureSourceType.CAMERA : window.Camera.PictureSourceType.PHOTOLIBRARY),
                        allowEdit: true,
                        encodingType: window.Camera.EncodingType.JPEG,
                        targetWidth: SIZE,
                        targetHeight: SIZE * aspectRatio,
                        popoverOptions: window.CameraPopoverOptions,
                        saveToPhotoAlbum: false
                    };

                    $cordovaCamera.getPicture(options).then(function(imageData) {
                        scope.result = 'data:image/jpeg;base64,' + imageData;
                    }, function() {
                        scope.result = undefined;
                    });
                    return true;
                }
            }
        };
    }
})();
