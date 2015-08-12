'use strict';
(function() {
    angular.module('HomeCooked.services').factory('DishesService', DishesService);

    DishesService.$inject = ['$http', 'ENV'];
    function DishesService($http, ENV) {
        var baseUrl = ENV.BASE_URL + '/api/v1/';
        var dishesUrl = baseUrl + 'dishes/';

        return {
            getDishes: getDishes,
            getDish: getDish,
            addDish: addDish,
            deleteDish: deleteDish,
            getDishReviews: getDishReviews,
            addDishReview: addDishReview,
            getPendingReviews: getPendingReviews
        };

        function handleResponses(httpPromise) {
            return httpPromise.then(function(response) {
                return response.data;
            });
        }

        function getDishes() {
            return handleResponses($http.get(dishesUrl));
        }

        function getDish(dishId) {
            return handleResponses($http.get(dishesUrl + dishId));
        }

        function addDish(dish) {
            dish.picture = dish.picture.split(';base64,').pop();
            return handleResponses($http.post(dishesUrl, dish)).then(getDishes);
        }

        function deleteDish(dish) {
            return handleResponses($http.delete(dishesUrl + dish.id + '/'));
        }

        function getDishReviews(dishId) {
            return handleResponses($http.get(dishesUrl + dishId + '/reviews/'));
        }

        function addDishReview(review) {
            return handleResponses($http.post(baseUrl + 'reviews/', review));
        }

        function getPendingReviews() {
            return handleResponses($http.get(baseUrl + 'dishes/dishes_to_review/'));
        }
    }
})();
