(function() {
    'use strict';
    angular.module('HomeCooked.controllers').controller('DishesCtrl', DishesCtrl);

    DishesCtrl.$inject = ['$q', '$rootScope', '$stateParams', '$scope', '$ionicModal', '$ionicLoading',
        '$ionicScrollDelegate', 'ChefService', 'LoginService', 'HCMessaging', '_'];
    function DishesCtrl($q, $rootScope, $stateParams, $scope, $ionicModal, $ionicLoading,
                        $ionicScrollDelegate, ChefService, LoginService, HCMessaging, _) {
        var vm = this;

        vm.dishes = [];

        vm.showModal = showModal;
        vm.hideModal = hideModal;
        vm.addDish = addDish;
        vm.deleteDish = deleteDish;

        var modal, modalScope = $rootScope.$new();
        modalScope.uploadStart = uploadStart;
        modalScope.uploadSuccess = uploadSuccess;
        modalScope.uploadFail = uploadFail;

        $scope.$on('$ionicView.afterEnter', function onAfterEnter() {
            modalScope.ctrl = vm;
            modalScope.dish = getEmptyDish();

            $ionicLoading.show({template: 'Getting dishes...'});
            $q.all([ChefService.getDishes(), ChefService.isDishesTutorialDone()])
                .then(function(values) {
                    var dishes = values[0],
                        tutorialDone = values[1];
                    vm.dishes = dishes;
                    if (_.size(dishes) === 0 && !tutorialDone) {
                        showTutorial();
                    }
                    if ($stateParams.v==='new') {
                        showModal();
                    }
                })
                .catch(HCMessaging.showError)
                .finally($ionicLoading.hide);
        });

        $scope.$on('$destroy', function onDestroy() {
            modal.remove();
            modal = undefined;
            modalScope.$destroy();
        });

        function addDish(dish, form) {
            dish.picture = dish.picture.base64;
            $ionicLoading.show({template: 'Adding dish...'});
            ChefService.addDish(dish)
                .then(function added(dishes) {
                    modalScope.dish = getEmptyDish();
                    form.$setPristine();
                    vm.dishes = dishes;
                    hideModal();
                })
                .catch(HCMessaging.showError)
                .finally($ionicLoading.hide);
        }

        function deleteDish(dish) {
            $ionicLoading.show({template: 'Deleting dish...'});
            ChefService.deleteDish(dish)
                .then(function deleted() {
                    _.remove(vm.dishes, dish);
                })
                .catch(function() {
                    HCMessaging.showMessage('Cannot delete', 'There are pending orders for the dish you tried to delete.<br>' +
                        'You will be able to delete after the orders have been completed.');
                })
                .finally($ionicLoading.hide);
        }

        function showModal() {
            if (!modal) {
                $ionicModal.fromTemplateUrl('templates/add-dish.html', {
                    scope: modalScope
                }).then(function(m) {
                    modal = m;
                    modal.show();
                });
            }
            else {
                modal.show();
            }
        }

        function hideModal() {
            if (modal) {
                modal.hide();
            }
        }

        function getEmptyDish() {
            return {user: LoginService.getUser().id};
        }

        function uploadStart() {
            $ionicLoading.show({template: 'Uploading...'});
        }

        function uploadSuccess(result) {
            $ionicLoading.hide();
            modalScope.dish.imageUrl = result;
        }

        function uploadFail(error) {
            HCMessaging.showError(error);
        }

        function showTutorial() {
            var tutorialModal,
                tutorialScope = $rootScope.$new();
            tutorialScope.step = 0;
            tutorialScope.next = function() {
                scrollTop();
                tutorialScope.step++;
                if (tutorialScope.step === 2) {
                    tutorialModal.remove();
                    tutorialModal = undefined;
                    tutorialScope.$destroy();
                    ChefService.setDishesTutorialDone();
                }
            };
            $ionicModal.fromTemplateUrl('templates/dishes-tutorial.html', {
                scope: tutorialScope
            }).then(function(m) {
                tutorialModal = m;
                tutorialModal.show();
            });
        }

        function scrollTop() {
            // TODO use $getByHandle once fixed in ionic
            var handle = _.find($ionicScrollDelegate._instances, function(s) {
                return s.$$delegateHandle === 'dishesTutorialContent';
            });
            handle.scrollTop();
        }
    }
})();
