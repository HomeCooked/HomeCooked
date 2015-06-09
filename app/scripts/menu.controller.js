(function() {
    'use strict';

    angular
        .module('HomeCooked.controllers')
        .controller('MenuCtrl', MenuCtrl);

    MenuCtrl.$inject = ['$rootScope', '$state', '$ionicPopup', '$ionicHistory', 'LoginService', 'ChefService', '_'];

    function MenuCtrl($rootScope, $state, $ionicPopup, $ionicHistory, LoginService, ChefService, _) {
        var vm = this;
        vm.logout = logout;
        vm.switchView = switchView;
        vm.go = go;

        var signupPath = 'signup';

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
            vm.userFirstName = user ? user.first_name : '';
            vm.isChef = undefined;
            vm.selectedPath = null;
            if (user) {
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

            vm.chefMode = chefMode;
            vm.links = vm.chefMode ? chefLinks : buyerLinks;
            vm.selectedPath = path;
        }

        function logout() {
            LoginService.logout();
            vm.go(signupPath);
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
    }
})();