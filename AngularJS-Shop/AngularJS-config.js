(function (document, window) {
    'use strict';

    var shopConfig = angular.module('shopConfig', ["shop"]);

    // Application settings
    shopConfig.constant('constants', {

      /* This is the base URL of the pi-shop package within your AngaulrJS application */
      app_base_url : "http://localhost/nutrin/public/packages/AngularJS-Shop",

      /* This is the location of the products, can be JSON file or RESTFULL API url
       - "http://localhost/nutrin/public/products" */
      products_json : "http://localhost/nutrin/public/packages/AngularJS-Shop/demo-products.json",

      /* Return data about the user */
      user_json : "http://localhost/nutrin/public/packages/AngularJS-Shop/demo-user.json",
      
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
      paypal_config : { "email" : "peter.ingram0@gmail.com",
                        "currency_code" : "GBP",
                        "IPN_ReturnScriptUrl" : "http://162.243.14.142/dev/public/paypalipn",
                        "return" : "http://162.243.14.142/dev/public/#/products?&return=TRUE",
                        "cancel_return" : "http://162.243.14.142/dev/public/#/products?&cancel_return=TRUE" }
    
    });


	shopConfig.factory('hocks',function(AlertsFactory,UserInfoFactory,$q,$http,constants){
      
      var factory = {};
      	factory.userdetails = {};

      return{
      	myAlert : function(style,msg){
      		AlertsFactory.add(style,msg);
      	},
      	showLoading : function(){
      		AlertsFactory.StartLoading();
      	},
      	hideLoading : function(){
      		AlertsFactory.StopLoading();
      	}
      }
    });
    

})(document, window);