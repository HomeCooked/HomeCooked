(function() {
  'use strict';

  angular
    .module('HomeCooked.controllers')
    .controller('MenuCtrl', MenuCtrl);

  MenuCtrl.$inject = ['$rootScope', '$scope', '$state', '$ionicHistory', '$ionicModal', 'LoginService', '_'];

  function MenuCtrl($rootScope, $scope, $state, $ionicHistory, $ionicModal, LoginService, _) {

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

    // will be same instance during all the session
    var user = LoginService.getUser();

    init();
    $scope.$on('$stateChangeStart', onStateChanged);

    $scope.$watch(function() {
      return user.isLoggedIn;
    }, init);

    function init() {
      vm.isUserLoggedIn = user.isLoggedIn === true;
      vm.userFirstName = user.first_name || '';
      vm.isChef = user.isChef;
      if (user.isChef && buyerLinks[buyerLinks.length - 1].path === 'app.enroll') {
        buyerLinks.pop();
      }
      updateStateIfNeeded($state.current);
    }

    function getCorrectPath(path) {
      if (vm.isChef && path === 'app.enroll') {
        return chefLinks[0].path;
      }

      if (!user.isLoggedIn && !user.zipcode) {
        return 'zipcode-validation';
      }

      var chefMode = _.some(chefLinks, {path: path});
      if ((vm.isChef === false && chefMode) || (!user.isLoggedIn && user.zipcode)) {
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
