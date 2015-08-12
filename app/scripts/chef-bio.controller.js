(function() {
    'use strict';
    angular.module('HomeCooked.controllers').controller('ChefBioCtrl', ChefBioCtrl);

    ChefBioCtrl.$inject = ['$scope', '$ionicLoading', 'ChefService', 'LoginService', 'HCMessaging'];

    function ChefBioCtrl($scope, $ionicLoading, ChefService, LoginService, HCMessaging) {
        var vm = this;
        vm.updateBio = updateBio;
        vm.maxLength = 160;
        vm.chefInfo = {};

        $scope.$on('$ionicView.beforeEnter', function() {
            vm.modify = false;
            vm.chefInfo = ChefService.getChef();
        });

        function updateBio() {
            $ionicLoading.show({
                template: 'Updating...'
            });
            ChefService.saveChefData({bio:vm.chefInfo.bio})
                .then(function() {
                    vm.modify = false;
                    $ionicLoading.show({
                        template: 'Saved successfully!',
                        duration: 2000
                    });
                })
                .catch(HCMessaging.showError);
        }
    }
})();
