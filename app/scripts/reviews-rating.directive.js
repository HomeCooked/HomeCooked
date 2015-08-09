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
            link: function(scope, element) {
                if (scope.readOnly !== false) {
                    element.addClass('read-only');
                }
                scope.max = 5;
            }
        };
    }
})();
