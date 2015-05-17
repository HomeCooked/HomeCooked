'use strict';
var MenuCtrl = ['$rootScope', '$state', 'LoginService', 'ChefService', '_',
  function($rootScope, $state, LoginService, ChefService, _) {
    var that = this;
    that.selectedPath = '';
    var homePath = 'app.main';

    var chefLinks = [
      {name: 'Orders', path: 'app.seller'},
      {name: 'My dishes', path: 'app.dishes'},
      {name: 'Edit Bio', path: 'app.bio'},
      {name: 'Get more delivery kits', path: 'app.delivery'}
    ];

    var buyerLinks = [
      {name: 'Find local chefs', path: 'app.buyer'},
      {name: 'My Orders', path: 'app.orders'},
      {name: 'Payment methods', path: 'app.settings'}
    ];
    var init = function() {
      var user = LoginService.getUser();
      that.userFirstName = user ? user.first_name : '';
      //TODO put this to false!!
      that.isChef = true;
      if (user) {
        ChefService.getChefInfo(user.id)
          .then(function() {
            that.isChef = true;
          });
      }
      onStateChanged(null, $state.current);
    };

    var onStateChanged = function(event, toState) {
      var path = toState.name;

      //if not logged in, go to home page always
      if (_.isEmpty(LoginService.getUser()) && path !== homePath) {
        //TODO notify he needs to login
        if (event) {
          event.preventDefault();
        }
        that.go(homePath);
        return;
      }

      that.chefMode = _.some(chefLinks, function(link) {
        return link.path === path;
      });

      that.links = that.chefMode ? chefLinks : buyerLinks;
      that.selectedPath = path;
    };

    that.logout = function() {
      LoginService.logout();
      that.go(homePath);
    };

    that.switchView = function() {
      var path = buyerLinks[0].path;
      if (that.chefMode) {
        //TODO check if he can be seller
        path = chefLinks[0].path;
      }
      that.go(path);
    };

    that.go = function(path) {
      $state.go(path);
    };
    $rootScope.$on('$stateChangeStart', onStateChanged);

    init();
  }];
angular.module('HomeCooked.controllers').controller('MenuCtrl', MenuCtrl);
