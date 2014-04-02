/*
 * AngularJS-Shop
 * Created By Peter Ingram
 * peter.ingram0@gmail.com
 *
 * Version: 0.0.1 02/04/2014
 * License: MIT
 */

(function (document, window) {
    'use strict';
    var shop = angular.module('shop', []);

    // Application settings
    shop.constant('constants', {

      /* The URL of your application */
      app_url : "http://localhost/nutrin/public/#dashboard",

      /* This is the base URL of the pi-shop package within your AngaulrJS application */
      app_base_url : "http://localhost/nutrin/public/packages/AngularJS-Shop",

      /* This is the location of the products, can be JSON file or RESTFULL API url
       - "http://localhost/nutrin/public/products" */
      products_json : "http://localhost/nutrin/public/packages/AngularJS-Shop/demo-products.json",
      
      /* This symbol will be displayed next to the prices on shop and checkout pages */
      currency_symbol : "£",

      /* The VAT amount for your country, please enter to two decimal places  */
      VAT_amount : 20.00,

      /* Two VAT types are supported inclusive or  exclusive.
      Inclusive means that you have added VAT to the product price already
      Exclusive means that the product prices are not including the VAT so the system should add the VAT to the total cost*/
      VAT_type : "exclusive",

      /* Checkout methods. Currantly only paypal is supported, true should be lowercase */
      checkout_methods : { 'paypal' : true },

      /* If you have paypal set as true please enter the details below */
      paypal_config : { "email" : "peter.ingram0@gmail.com", "currency_code" : "GBP" }
    
    });


    shop.run(function ($rootScope, constants) {
      $rootScope.constants = constants; // Lets make these settings system wide
    });

    shop.config(['$routeProvider', function($routeProvider,constants){
    	$routeProvider.
	    	when('/cart', {
		        controller: 'CartController',
            templateUrl: "packages/AngularJS-Shop/segments/cart.html",
		        private : true
	    	}).
        when('/products', {
            templateUrl: "packages/AngularJS-Shop/segments/products.html",
            controller: 'ProductsController',
            private  : true
        }).
        when('/product/:productId', {
            templateUrl: "packages/AngularJS-Shop/segments/product.html",
            controller: 'ProductController',
            private  : true
        }).
        when('/checkout', {
            controller: 'CartController',
            templateUrl: "packages/AngularJS-Shop/segments/checkout.html",
            private  : true
        });
    }]);

    shop.factory('piCartFactory', function($rootScope,ProductsFactory){
        var store = {};
            store.contents = [];
    	return{
            add : function(data){
                var count = store.contents.length;
                var obj = {"id" : count++,
                           "productid" : data.id ,
                           "foruser" : data.foruser,
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

    shop.factory('ProductsFactory',function($http,$q,AlertsFactory,constants){
  
      var factory = {}; 
        factory.details = {};

      return{
        loadProducts: function(){
          var deferred = $q.defer();
          if(Object.keys(factory.details).length === 0){
            AlertsFactory.StartLoading();
            this.getAll().then(function(data){
              deferred.resolve(data);
              AlertsFactory.StopLoading();
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

    shop.controller("CartController",function($scope,$rootScope,piCartFactory,constants,helpers,AlertsFactory,$location){

      $scope.constants = $rootScope.constants;

      $scope.remove = function(id, index){
          $scope.cart = piCartFactory.remove(id, index);
          AlertsFactory.add('info','Item removed from your cart');
      };
      $scope.cart = piCartFactory.get();

      $scope.checkoutPage = function(){
        $location.path("/checkout/"); 
      }

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

    shop.controller('ProductController',function($rootScope,$scope,AlertsFactory,ProductsFactory,$routeParams,piCartFactory,UserInfoFactory){

      $scope.constants = $rootScope.constants;

      UserInfoFactory.load().then(function(data){
        $scope.userDetails = data;
      });

      var productID = $routeParams.productId;

      ProductsFactory.loadProducts().then(function(data){
        $scope.product = data[productID];
      });

      $scope.addToCart = function(id){
        piCartFactory.add({id : id, email: $scope.userDetails.email, product_name : $scope.product.product_name, product_price : $scope.product.product_price });
        AlertsFactory.add('success','Item added to your cart.');
      };

    });

})(document, window);