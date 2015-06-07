'use strict';
var MenuCtrl = ['$rootScope', '$state', '$ionicPopup', '$ionicHistory', 'LoginService', 'ChefService', '_',
  function($rootScope, $state, $ionicPopup, $ionicHistory, LoginService, ChefService, _) {
    var that = this;
    var homePath = 'app.main';

    var chefLinks = [
      {name: 'Orders', path: 'app.seller'},
      {name: 'My dishes', path: 'app.dishes'},
      {name: 'Edit Bio', path: 'app.bio'},
      {name: 'Get more delivery kits', path: 'app.delivery'}
    ];

    var buyerLinks = [
      {name: 'Find local chefs', path: 'app.buyer'},
      {name: 'My Order', path: 'app.orders'},
      {name: 'Payment methods', path: 'app.settings'},
      {name: 'Become a chef!', path: 'app.enroll'}
    ];
    var init = function() {
      var user = LoginService.getUser();
      that.userFirstName = user ? user.first_name : '';
      that.isChef = undefined;
      that.selectedPath = null;
      if (user) {
        ChefService.getChefInfo(user.id)
          .then(function() {
            that.isChef = true;
            var enroll = buyerLinks.pop();
            if ($state.current.name == enroll.path) {
              that.go(buyerLinks[0].path);
            }
          })
          .catch(function() {
            that.isChef = false;
            if (_.some(chefLinks, {path: $state.current.name})) {
              that.go(buyerLinks[0].path);
            }
            else {
              that.links = buyerLinks;
            }
          });
      }
      onStateChanged(null, $state.current);
    };

    var onStateChanged = function(event, toState) {
      var path = toState.name;

      //if not logged in, go to home page always
      if (_.isEmpty(LoginService.getUser()) && path !== homePath) {
        if (event) {
          event.preventDefault();
        }
        $ionicPopup.show({
          title: 'Your session expired',
          template: 'Please login again'
        });
        that.go(homePath);
        return;
      }
      var chefMode = _.some(chefLinks, {path: path});
      if ((that.isChef === false && chefMode) || (that.isChef && path === 'app.enroll')) {
        if (event) {
          event.preventDefault();
        }
        else {
          that.go(buyerLinks[0].path);
        }
        return;
      }

      that.chefMode = chefMode;
      that.links = that.chefMode ? chefLinks : buyerLinks;
      that.selectedPath = path;
    };

    that.logout = function() {
      LoginService.logout();
      that.go(homePath);
    };

    that.switchView = function() {
      var path = that.chefMode ? chefLinks[0].path : buyerLinks[0].path;
      that.go(path);
    };

    that.go = function(path) {

      $ionicHistory.nextViewOptions({
        historyRoot: true,
        disableAnimate: true
      });
      $state.go(path);
    };
    $rootScope.$on('$stateChangeStart', onStateChanged);

    init();
  }];
angular.module('HomeCooked.controllers').controller('MenuCtrl', MenuCtrl);
