(function () {

    'use strict';

    angular
        .module('HomeCooked.directives')
        .directive('reviewsRating', ReviewsRating);

    function ReviewsRating() {

        return {
            restrict: 'E',
            transclude: true,
            scope: {
                score: '=',
                count: '='
            },
            templateUrl: 'templates/reviews-rating.html',
            link: function (scope, element, attrs) {
                var max = 5,
                    range = [];
                for (var i = 0; i < max; i++) {
                    range.push({
                        index: i
                    });
                }
                scope.max = max;
                scope.range = range;
                scope.readOnly = scope.$eval(attrs.readOnly) !== false;
                scope.updateScore = function (r) {
                    if (!scope.readOnly) {
                        scope.score = r.index + 1;
                    }
                };
            }
        };
    }
})();
