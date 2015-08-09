(function() {

    'use strict';

    angular
        .module('HomeCooked.directives')
        .directive('reviewsRating', ReviewsRating);

    function ReviewsRating() {

        return {
            restrict: 'E',
            transclude: true,
            scope: {
                score: '@',
                rating: '@',
                readOnly: '@'
            },
            templateUrl: 'templates/reviews-rating.html',
            link: function(scope) {
                if (scope.readOnly !== false) {
                    scope.readOnly = true;
                }
                scope.max = 5;
            }
        };
    }
})();
