(function() {
    'use strict';

    angular
        .module('HomeCooked.controllers')
        .controller('MenuCtrl', MenuCtrl);

    MenuCtrl.$inject = ['$rootScope', '$scope', '$state', '$ionicHistory', '$ionicModal', 'LoginService', 'ChefService', '_'];

    function MenuCtrl($rootScope, $scope, $state, $ionicHistory, $ionicModal, LoginService, ChefService, _) {

        var vm = this;
        vm.login = login;
        vm.switchView = switchView;
        vm.go = go;

        var chefLinks = [{
            name: 'Orders',
            path: 'app.seller'
        }, {
            name: 'My dishes',
            path: 'app.dishes'
        }, {
            name: 'Edit Bio',
            path: 'app.bio'
        }, {
            name: 'Get more delivery kits',
            path: 'app.delivery'
        }];

        var buyerLinks = [{
            name: 'Find local chefs',
            path: 'app.buyer'
        }, {
            name: 'My Order',
            path: 'app.orders'
        }, {
            name: 'Payment methods',
            path: 'app.settings'
        }, {
            name: 'Become a chef!',
            path: 'app.enroll'
        }];


        init();
        $rootScope.$on('$stateChangeStart', onStateChanged);

        function init() {
            var user = LoginService.getUser();
            vm.isUserLoggedIn = user.isLoggedIn;
            vm.userFirstName = user.first_name || '';
            vm.isChef = undefined;
            vm.selectedPath = null;
            if (user.id) {
                ChefService.getChefInfo(user.id)
                    .then(function() {
                        vm.isChef = true;
                        var enroll = buyerLinks.pop();
                        if ($state.current.name === enroll.path) {
                            vm.go(buyerLinks[0].path);
                        }
                    })
                    .catch (function() {
                        vm.isChef = false;
                        if (_.some(chefLinks, {
                            path: $state.current.name
                        })) {
                            vm.go(buyerLinks[0].path);
                        } else {
                            vm.links = buyerLinks;
                        }
                    });
            }
            onStateChanged(null, $state.current);
        }

        function onStateChanged(event, toState) {
            var path = toState.name;

            var chefMode = _.some(chefLinks, {
                path: path
            });
            if ((vm.isChef === false && chefMode) || (vm.isChef && path === 'app.enroll')) {
                if (event) {
                    event.preventDefault();
                } else {
                    vm.go(buyerLinks[0].path);
                }
                return;
            }
            var zipcode = LoginService.getUser().zipcode,
                redirectPath = !!zipcode ? 'app.buyer' : 'zipcode-validation';
            if (!vm.isUserLoggedIn && path !== redirectPath) {
                if (event) {
                    event.preventDefault();
                }
                go(redirectPath);
                return;
            }

            vm.chefMode = chefMode;
            vm.links = vm.chefMode ? chefLinks : buyerLinks;
            vm.selectedPath = path;
        }

        function switchView() {
            var path = vm.chefMode ? chefLinks[0].path : buyerLinks[0].path;
            vm.go(path);
        }

        function go(path) {
            $ionicHistory.nextViewOptions({
                historyRoot: true,
                disableAnimate: true
            });
            $state.go(path);
        }

        function login() {
            if (!vm.modal) {
                var modalScope = $rootScope.$new();
                $ionicModal.fromTemplateUrl('templates/signup/signup.html', {
                    animation: 'slide-in-up',
                    scope: modalScope
                }).then(function(modal) {
                    vm.modal = modal;
                    vm.modal.show();
                });
                modalScope.closeModal = function() {
                    vm.modal.hide();
                    init();
                };
                $scope.$on('$destroy', function() {
                    vm.modal.remove();
                });
            } else {
                vm.modal.show();
            }
        }
    }
})();
