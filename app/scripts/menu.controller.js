(function() {
    'use strict';

    angular
        .module('HomeCooked.controllers')
        .controller('MenuCtrl', MenuCtrl);

    MenuCtrl.$inject = ['$rootScope', '$scope', '$state', '$ionicHistory', '$ionicModal', '$ionicSideMenuDelegate', 'LoginService', '_'];

    function MenuCtrl($rootScope, $scope, $state, $ionicHistory, $ionicModal, $ionicSideMenuDelegate, LoginService, _) {

        var vm = this;
        vm.login = login;
        vm.chefMode = LoginService.getChefMode();
        vm.switchView = switchView;
        vm.go = go;

        var chefLinks = [{
            name: 'My dishes',
            path: 'app.dishes'
        }, {
            name: 'My Batches',
            path: 'app.seller'
        }, {
            name: 'Edit Bio',
            path: 'app.bio'
        }];

        var buyerLinks = [{
            name: 'Find local chefs',
            path: 'app.buyer'
        }, {
            name: 'My Orders',
            path: 'app.orders'
        }, {
            name: 'Payment methods',
            path: 'app.settings-payment'
        }];
        var becomeChefLink = {
            name: 'Become a chef!',
            path: 'app.enroll'
        };

        // will be same instance during all the session
        var user = LoginService.getUser();

        init();
        $scope.$on('$stateChangeStart', onStateChanged);

        $scope.$watch(function() {
            return user.isLoggedIn;
        }, init);

        $scope.$watch(function() {
            return user.has_pending_reviews;
        }, init);

        $scope.$watch(function() {
            return user.is_chef;
        }, init);

        function init() {
            vm.isUserLoggedIn = user.isLoggedIn === true;
            $ionicSideMenuDelegate.canDragContent(vm.isUserLoggedIn);
            vm.userFirstName = user.first_name || '';
            vm.isChef = user.is_chef;
            vm.hasPendingReviews = user.has_pending_reviews;

            _.remove(buyerLinks, becomeChefLink);
            if (!vm.isChef) {
                buyerLinks.push(becomeChefLink);
            }
            updateStateIfNeeded($state.current);
        }

        function getCorrectPath(path) {
            if (vm.hasPendingReviews) {
                return 'app.pending-reviews';
            }
            else if (path === 'app.pending-reviews') {
                path = 'app.buyer';
            }
            if (vm.isChef && path === 'app.enroll') {
                return chefLinks[0].path;
            }

            if (!user.isLoggedIn && !user.zipcode) {
                return 'zipcode-validation';
            }

            var chefMode = _.some(chefLinks, {path: path});
            if (vm.isChef === false && chefMode) {
                return 'app.buyer';
            }

            return path;
        }

        function updateStateIfNeeded(state) {
            var path = state.name;
            var correctPath = getCorrectPath(path);
            if (path !== correctPath) {
                $state.go(correctPath);
                return true;
            }

            _.forEach(chefLinks.concat(buyerLinks), function(link) {
                link.selected = (link.path === path);
            });

            var buyerMode = _.some(buyerLinks, 'selected'),
                chefMode = _.some(chefLinks, 'selected');

            // if one of the main links, and if not settings
            if ((chefMode || buyerMode) && path !== 'app.settings') {
                vm.chefMode = chefMode;
                LoginService.setChefMode(chefMode);
            }
            vm.links = vm.chefMode ? chefLinks : buyerLinks;

            return false;
        }

        function onStateChanged(event, toState) {
            if (updateStateIfNeeded(toState)) {
                event.preventDefault();
            }
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
            }
            else {
                vm.modal.show();
            }
        }
    }
})();
