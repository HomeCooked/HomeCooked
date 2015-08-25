(function() {
    'use strict';

    angular
        .module('HomeCooked.controllers')
        .controller('MenuCtrl', MenuCtrl);

    MenuCtrl.$inject = ['$scope', '$state', '$ionicHistory', '$ionicSideMenuDelegate', 'LoginService', 'ChefService', 'HCModalHelper', '_'];

    function MenuCtrl($scope, $state, $ionicHistory, $ionicSideMenuDelegate, LoginService, ChefService, HCModalHelper, _) {

        var vm = this;

        var chefLinks = [{
            name: 'My Dishes',
            icon: 'ion-pizza',
            path: 'app.dishes'
        }, {
            name: 'Edit Bio',
            icon: 'ion-person',
            path: 'app.bio'
        }];

        var buyerLinks = [{
            name: 'Find local chefs',
            icon: 'ion-ios-location',
            path: 'app.buyer'
        }, {
            name: 'My Orders',
            icon: 'ion-ios-cart',
            path: 'app.orders'
        }];

        // will be same instance during all the session
        var user = LoginService.getUser();
        var chef = ChefService.getChef();

        vm.login = login;
        vm.chefMode = LoginService.getChefMode();
        vm.switchView = switchView;
        vm.go = go;
        vm.showUpdatePayment = showUpdatePayment;

        init();
        $scope.$on('$stateChangeStart', onStateChanged);

        $scope.$watch(function() {
            return user.isLoggedIn;
        }, init);

        $scope.$watch(function() {
            return user.has_pending_reviews;
        }, init);

        $scope.$watch(function() {
            return chef.id;
        }, init);

        function init() {
            vm.isUserLoggedIn = user.isLoggedIn === true;
            $ionicSideMenuDelegate.canDragContent(vm.isUserLoggedIn);
            vm.userFirstName = user.first_name || '';
            vm.isChef = chef.id >= 0;
            vm.hasPendingReviews = user.has_pending_reviews;
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
                go(correctPath);
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
            vm.chefMode = !vm.chefMode;
            vm.links = vm.chefMode ? chefLinks : buyerLinks;
            LoginService.setChefMode(vm.chefMode);
            if ($state.current.name !== 'app.settings') {
                _.delay(function() {
                    go(vm.chefMode ? chefLinks[0].path : buyerLinks[0].path);
                }, 300);
            }
        }

        function go(path) {
            $ionicHistory.nextViewOptions({
                historyRoot: true,
                disableAnimate: true
            });
            $state.go(path);
        }

        function showUpdatePayment() {
            HCModalHelper.showUpdatePayment();
        }

        function login() {
            HCModalHelper.showSignup();
        }
    }
})();
