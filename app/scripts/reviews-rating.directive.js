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
                count: '@'
            },
            templateUrl: 'templates/reviews-rating.html',
            link: function(scope, element, attrs) {
                scope.readOnly = scope.$eval(attrs.readOnly);
                if (scope.readOnly !== false) {
                    scope.readOnly = true;
                    element.addClass('read-only');
                }
                scope.max = 5;
            }
        };
    }
})();
