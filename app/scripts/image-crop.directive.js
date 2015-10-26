(function () {

    'use strict';

    angular
        .module('HomeCooked.directives')
        .directive('imageCrop', ImageCrop);

    ImageCrop.$inject = ['$cordovaCamera', '$ionicActionSheet'];
    function ImageCrop($cordovaCamera, $ionicActionSheet) {
        return {
            restrict: 'E',
            transclude: true,
            scope: {
                onSave: '&',
                showSave: '=',
                result: '=',
                inputName: '@'
            },
            templateUrl: 'templates/image-crop.html',
            link: function (scope) {
                var SIZE = 600;
                scope.pictureData = undefined;
                scope.myImage = '';
                scope.didSelect = false;
                scope.showSave = scope.showSave === true;
                scope.result = scope.result || '';
                scope.isMobile = !!window.cordova;

                scope.takePicture = function () {
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

                scope.cropPicture = function (pictureData) {
                    if (!pictureData) {
                        return;
                    }
                    var picture = 'data:' + pictureData.filetype + ';base64,' + pictureData.base64;
                    scope.myImage = picture;
                    scope.didSelect = true;
                };

                function onActionSelected(index) {
                    var options = {
                        quality: 90,
                        destinationType: window.Camera.DestinationType.DATA_URL,
                        sourceType: (index === 0 ? window.Camera.PictureSourceType.CAMERA : window.Camera.PictureSourceType.PHOTOLIBRARY),
                        allowEdit: true,
                        encodingType: window.Camera.EncodingType.JPEG,
                        targetWidth: SIZE,
                        targetHeight: SIZE,
                        popoverOptions: window.CameraPopoverOptions,
                        saveToPhotoAlbum: false
                    };

                    $cordovaCamera.getPicture(options).then(function (imageData) {
                        scope.didSelect = true;
                        scope.result = 'data:image/jpeg;base64,' + imageData;
                    }, function () {
                        scope.didSelect = false;
                        scope.result = '';
                    });
                    return true;
                }
            }
        };
    }
})();
