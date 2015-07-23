'use strict';
angular.module('HomeCooked.services')
    .factory('ChefService', ['$q', '$http', '$timeout', 'ENV', 'CacheService', '_',
        function($q, $http, $timeout, ENV, CacheService, _) {
            var baseUrl = ENV.BASE_URL + '/api/v1/';

            var ordersReady;

            var handleResponses = function(httpPromise) {
                return httpPromise.then(function(response) {
                    return response.data;
                });
            };
            var wait = function(ms) {
                return $timeout(function() {
                }, ms || 0);
            };

            var getOrders = function() {
                ordersReady = ordersReady || handleResponses($http.get('mock/orders.json'));
                return ordersReady;
            };

            var getBatches = function() {
                return handleResponses($http.get(baseUrl + 'batches/'));
            };

            var getDishes = function() {
                return handleResponses($http.get(baseUrl + 'dishes/'));
            };

            var getDish = function(dishId) {
                return handleResponses($http.get(baseUrl + 'dishes/' + dishId));

                //return {
                //    title: 'Philly Cheese Steak',
                //    picture: 'http://www.muscleandfitness.com/sites/muscleandfitness.com/files/philly-cheesesteak-recipe_0.jpg',
                //    price: '$7.99',
                //    available_qty: 3,
                //    review_count: 22,
                //    rating: 4.7,
                //    pickup_time: '7pm',
                //    id: dishId,
                //    ingredients: ['pizza', 'mushrooms', 'onions', 'cheese', 'more cheese']
                //};
            };

            var addDish = function(dish) {
                return handleResponses($http.post(baseUrl + 'dishes/', dish)).then(getDishes);
            };


            var deleteDish = function(dish) {
                return handleResponses($http.delete(baseUrl + 'dishes/' + dish.id + '/'));
            };


            var addBatch = function(batch) {
                return handleResponses($http.post(baseUrl + 'batches/', batch)).then(getBatches);
            };

            var removeBatchAvailablePortions = function(batch) {
                //FIXME remove this and call the service
                return $q.all([getBatches(), wait(300)])
                    .then(function(values) {
                        var batches = values[0];
                        var i = _.findIndex(batches, {'dishId': batch.dishId, 'price': batch.price});
                        if (i >= 0) {
                            var localBatch = batches[i];
                            localBatch.quantity = localBatch.quantityOrdered;
                            //will remove current batch if empty
                            if (localBatch.quantity === 0) {
                                batches.splice(i, 1);
                            }
                        }

                        return batches;
                    });

                //return handleResponses($http.delete(baseUrl + 'batches/' + batch.id)).then(getBatches);
            };

            var getChefData = function() {
                //TODO read this from server!!
                var chefData = {
                    maxPrice: 100,
                    maxQuantity: 25,
                    maxBatches: 3
                };
                return $q.when(chefData);
            };

            var getChef = function(chefId, details) {
                return handleResponses($http.get(baseUrl + 'chefs/' + chefId + '/' + (details ? 'details/' : '')));

                //return {
                //    id: chefId,
                //    picture: 'http://www.gohomecooked.com/images/marc.jpg',
                //    first_name: 'Marc-Antoine',
                //    last_name: 'Andreoli',
                //    rating: '4.5',
                //    distance: '0.2mi',
                //    num_active_dishes: 2,
                //    bio: 'Growing up in a Greek and Sicilian family, the Cleveland native creates boldly flavored, ' +
                //    'deeply satisfying dishes at his four restaurants in America’s heartland.',
                //    dishes: [{
                //        title: 'Philly Cheese Steak',
                //        picture: 'http://i.bullfax.com/imgs/962fd564649084eabfe59808c745c2220a23883c.jpg',
                //        price: '$7.99',
                //        available_qty: 3,
                //        pickup_time: '7pm',
                //        review_count: 22,
                //        id: 1
                //    }, {
                //        title: 'Philly Cheese Steak',
                //        picture: 'http://cdn.crownmediadev.com/d1/720d567fca26a5b363ecd6d6b74976/calamari-segment-Ep060.jpg',
                //        price: '$5.99',
                //        available_qty: 2,
                //        pickup_time: '8pm',
                //        review_count: 22,
                //        id: 4
                //    }, {
                //        title: 'Philly Cheese Steak',
                //        picture: 'http://www.muscleandfitness.com/sites/muscleandfitness.com/files/philly-cheesesteak-recipe_0.jpg',
                //        price: '$5.99',
                //        available_qty: 3,
                //        pickup_time: '7pm',
                //        review_count: 22,
                //        id: 3
                //    }, {
                //        title: 'Philly Cheese Steak',
                //        picture: 'http://www.muscleandfitness.com/sites/muscleandfitness.com/files/philly-cheesesteak-recipe_0.jpg',
                //        price: '$5.99',
                //        available_qty: 3,
                //        pickup_time: '7pm',
                //        review_count: 22,
                //        id: 2
                //    }]
                //};
            };

            var setChefBio = function(chefId, bio) {
                return handleResponses($http.patch(baseUrl + 'chefs/' + chefId + '/', {user: chefId, bio: bio}));
            };

            var isDishesTutorialDone = function() {
                var tutorialDone = CacheService.getValue('dishesTutorialDone') === true;
                return $q.when(tutorialDone);
            };

            var setDishesTutorialDone = function() {
                CacheService.setValue({'dishesTutorialDone': true});
                return $q.when();
            };

            return {
                getOrders: getOrders,
                getBatches: getBatches,
                getDishes: getDishes,
                getDish: getDish,
                addDish: addDish,
                deleteDish: deleteDish,
                addBatch: addBatch,
                removeBatchAvailablePortions: removeBatchAvailablePortions,
                getChefData: getChefData,
                getChef: getChef,
                setChefBio: setChefBio,
                isDishesTutorialDone: isDishesTutorialDone,
                setDishesTutorialDone: setDishesTutorialDone
            };
        }]
);
