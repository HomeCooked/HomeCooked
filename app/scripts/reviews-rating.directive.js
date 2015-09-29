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
                var range = [];
                for (var i = 0; i < 5; i++) {
                    range.push({
                        index: i
                    });
                }
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
