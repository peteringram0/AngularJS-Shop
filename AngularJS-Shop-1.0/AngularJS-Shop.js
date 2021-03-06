/*
 * AngularJS-Shop
 * Created By Peter Ingram
 * peter.ingram0@gmail.com
 *
 * License: MIT
 */

(function (document, window) {
    'use strict';
    var shop = angular.module('shop', ["shopConfig"]);

    shop.run(function ($rootScope, constants) {
      $rootScope.constants = constants; // Lets make these settings system wide
    });

    shop.config(['$routeProvider', function($routeProvider){
    	$routeProvider.
	    	when('/cart', {
		        controller: 'CartController',
            templateUrl: "packages/AngularJS-Shop/segments/cart.html",
		        private : false
	    	}).
        when('/products', {
            templateUrl: "packages/AngularJS-Shop/segments/products.html",
            controller: 'ProductsController',
            private  : false
        }).
        when('/product/:productId', {
            templateUrl: "packages/AngularJS-Shop/segments/product.html",
            controller: 'ProductController',
            private  : false
        }).
        when('/checkout', {
            controller: 'CartController',
            templateUrl: "packages/AngularJS-Shop/segments/checkout.html",
            private  : true
        });
    }]);

    shop.controller("shopController",function($scope){

    });

    shop.factory("userFactory",function($q,$http,constants){
      
      var factory = {};
        factory.userdetails = {};

      return{
        userDetails : function(){
            var deferred = $q.defer();
            var user = $http.post(constants.user_json);
            user.success(function(data){
              deferred.resolve(data);
              factory.userdetails = data;
            });
            user.error(function(){
              console.log("Error Getting Customer Details");
              deferred.resolve(false);
            });
            return deferred.promise;
          },
          getUserDetails : function(){
            var deferred = $q.defer();
            if(Object.keys(factory.userdetails).length === 0){
              this.userDetails().then(function(data){
                deferred.resolve(data);
            });
            }
            else{
              deferred.resolve(factory.userdetails);
            }
            return deferred.promise;
          }
        }
    });

    shop.factory('piCartFactory', function($rootScope,ProductsFactory){
        var store = {};
            store.contents = [];
    	return{
            add : function(data){
                var count = store.contents.length;
                var obj = {"id" : count++,
                           "productid" : data.id,
                           "name" : ((data.product_name) ? data.product_name : 'TEST PRODUCT'),
                           "price" : ((data.product_price) ? data.product_price : '10.00')};

                store.contents.push(obj);
                $rootScope.$broadcast('BroadcastUpdateCartData');
            },
            get : function(){
                return {"count" : store.contents.length, "contents" : store.contents};
            },
            remove : function(id, index){
                store.contents.splice(index, 1);
                $rootScope.$broadcast('BroadcastUpdateCartData');
                return {"count" : store.contents.length, "contents" : store.contents};
            }
    	}
    });

    shop.factory("helpers",function(constants,piCartFactory){

      var total = 0; // price before VAT
      var total_cost_caculated = 0; // price after VAT either inc or ex VAT

      return{
        get_cost_and_vat : function(){

          if(constants.VAT_type == "inclusive"){
            total_cost_caculated = this.total_cost();
          }
          else if(constants.VAT_type == "exclusive"){
            total_cost_caculated = this.total_cost()+this.vat_amount();
          }

          return {total_cost : total_cost_caculated, vat_amount : this.vat_amount()};
        },
        total_cost : function(){
          total = 0;
          var a = piCartFactory.get().contents;
          a.forEach(function(entry) {
            total += parseInt(entry.price);
          });
          return total;
        },
        vat_amount : function(){
          var cal = total/100*constants.VAT_amount;
          return cal;
        }
      }

    });

    shop.factory('ProductsFactory',function($http,$q,constants,hocks){
  
      var factory = {}; 
        factory.details = {};

      return{
        loadProducts: function(){
          var deferred = $q.defer();
          if(Object.keys(factory.details).length === 0){
            hocks.showLoading();
            this.getAll().then(function(data){
              deferred.resolve(data);
              hocks.hideLoading();
            });
          }
          else{
            deferred.resolve(factory.details);
          }
          return deferred.promise;
        },
        getAll: function(){
          var deferred = $q.defer();
          var products = $http.post(constants.products_json);
          products.success(function(data){
            deferred.resolve(data);
            factory.details = data;
          });
          products.error(function(){
            console.log("Error Getting Products");
          });
          return deferred.promise;
        }
      }
    });

    shop.controller("CartController",function($scope,$rootScope,piCartFactory,constants,helpers,$location,hocks,userFactory){

      $scope.constants = $rootScope.constants;

      $scope.remove = function(id, index){
          $scope.cart = piCartFactory.remove(id, index);
          hocks.myAlert('info','Item removed from your cart');
      };
      $scope.cart = piCartFactory.get();

      /* When this function is triggered, check if the user is logged in if they are not redirect them
        to the login page, if they are pass them to the checkout route (This runs this same controller) */
      $scope.checkoutPage = function(){
        userFactory.getUserDetails().then(function(data){
          if(data == false){
            hocks.myAlert("alert","Please login or signup to checkout");
            $location.path("/login/");
          } else{
            $location.path("/checkout/");
          }
        });
      };

      /* If the user is logged in and we have their data in the factory load it into the scope. */
      userFactory.getUserDetails().then(function(data){
        if(data != false){
          $scope.userData = data;
        }
      });

      $scope.$on('BroadcastUpdateCartData', function() {
        $scope.vat = helpers.get_cost_and_vat().vat_amount;
        $scope.cost = helpers.get_cost_and_vat().total_cost;
      });
      $scope.vat = helpers.get_cost_and_vat().vat_amount;
      $scope.cost = helpers.get_cost_and_vat().total_cost;

    });

    shop.controller('ProductsController',function($scope,ProductsFactory,$location){

      ProductsFactory.loadProducts().then(function(data){
        $scope.products = data;
      });

      $scope.viewProduct = function(obj){
        var productId = obj.target.parentNode.attributes.productid.value;
        $location.path("/product/"+productId);
      }

    });

    shop.controller('ProductController',function($rootScope,$scope,hocks,ProductsFactory,$routeParams,piCartFactory){

      $scope.constants = $rootScope.constants;

      var productID = $routeParams.productId;

      ProductsFactory.loadProducts().then(function(data){
        $scope.product = data[productID];
      });

      $scope.addToCart = function(id){
        piCartFactory.add({id : id, product_name : $scope.product.product_name, product_price : $scope.product.product_price });
        hocks.myAlert('success','Item added to your cart.')
      };

    });

})(document, window);