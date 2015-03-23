'use strict';
angular.module('HomeCooked.services')
  .factory('ChefService', ['$q', '$http', 'BASE_URL',
    function ($q, $http, BASE_URL) {
      var self = this;
      self.addDish = function (dish) {
        var deferred = $q.defer();
        $http.post(BASE_URL + '/dishes/', dish)
          .success(deferred.resolve)
          .error(function (data) {
            deferred.reject(JSON.stringify(data));
          });
        return deferred.promise;
      };

      return self;
    }]
);
