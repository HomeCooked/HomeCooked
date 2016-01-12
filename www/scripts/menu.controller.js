(function() {
    'use strict';

    angular
        .module('HomeCooked.controllers')
        .controller('MenuCtrl', MenuCtrl);

    MenuCtrl.$inject = ['$scope', '$state', '$ionicHistory', 'LoginService', 'ChefService', 'HCModalHelper', 'HCMessaging', '_'];

    function MenuCtrl($scope, $state, $ionicHistory, LoginService, ChefService, HCModalHelper, HCMessaging, _) {

        var vm = this;

        var chefLinks = [{
            name: 'My Menu',
            icon: 'ion-pizza',
            path: 'app.dishes'
        }, {
            name: 'Edit Bio',
            icon: 'ion-person',
            path: 'app.bio'
        }, {
            name: 'Order new wares',
            icon: 'ion-ios-cart',
            path: 'app.buy'
        }];

        var buyerLinks = [{
            name: 'Find local meals',
            icon: 'ion-ios-location',
            path: 'app.buyer'
        }, {
            name: 'My Orders',
            icon: 'ion-ios-cart',
            path: 'app.orders'
        }, {
            name: 'Pending reviews',
            icon: 'ion-star',
            path: 'app.pending-reviews'
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
        }, checkPendingReviews);

        $scope.$watch(function() {
            return chef.id;
        }, init);

        function init() {
            vm.isUserLoggedIn = user.isLoggedIn === true;
            vm.userFirstName = user.first_name || '';
            vm.isChef = chef.id >= 0;
            updateStateIfNeeded($state.current);
        }

        function checkPendingReviews() {
            if (vm.isUserLoggedIn && !vm.chefMode && user.has_pending_reviews && $state.current !== 'app.pending-reviews') {
                HCMessaging.showMessage('Pending reviews', 'You got some dishes to review!');
                go('app.pending-reviews');
            }
        }

        function getCorrectPath(path) {
            if (!vm.isUserLoggedIn && path !== 'app.buyer' && path !== 'app.enroll') {
                return 'app.buyer';
            }
            var chefMode = _.some(chefLinks, {
                path: path
            });
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
                    // will send to pending-reviews if necessary
                    checkPendingReviews();
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
