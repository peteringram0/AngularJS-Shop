(function (document, window) {
    'use strict';

    var shopConfig = angular.module('shopConfig', ["shop"]);

    /*
        Application settings.
        Please read and enter all the config below.
    */
    shopConfig.constant('constants', {


      /*
          This is the base URL of the shop package within your AngaulrJS application, i recomenmd putting this in a directory called
          packages within your AngularJS route directory.
      */
      app_base_url : "http://localhost/nutrin/public/packages/AngularJS-Shop",


      /*
          This is the URL of the products, if you are using an API please change this to your API route, the API should return
          the information from the demo JSON file. 

          http://localhost/nutrin/public/packages/AngularJS-Shop/demo-products.json
      */
      products_json : "http://localhost/nutrin/public/products",


      /*
          Return data about the user, if the user is not logged in your API should return a 401 to the browser, if this happens the
          user will be redirect to the login page, if the API call is succsesfull the application will treat as if the user is
          logged in. The API should return the information in the demo JSON file.

          http://localhost/nutrin/public/packages/AngularJS-Shop/demo-user.json
      */
      user_json : "http://localhost/nutrin/public/user/basicdata",
      

      /*
          The currency symbol will be displayed on the shop pages.
      */
      currency_symbol : "£",


      /*
          The VAT amount for your country, this will be applied depending on the VAT_type setting below.
      */
      VAT_amount : 20.00,


      /*
          Two VAT types are supported inclusive or exclusive.
          -- inclusive means that you have added VAT to the product price already -- 
          -- exclusive means that the product prices are not including the VAT
          so the system should add the VAT to the total cost --
      */
      VAT_type : "exclusive",


      /*
          Checkout methods. Currantly only paypal is supported.
      */
      checkout_methods : { 'paypal' : true },


      /*
          If you have paypal set as true please enter the details below. Paypal in this application is configured to use IPN, meaning
          that once a transaction is made PayPal will return to the URL below the data on the transaction including if it was sucssessfull or not
          this URL you enter should capture this information.

          email = Your paypal email address
          Currency_code = Your currency code
          IPN_ReturnScriptUrl = PayPal IPN script
          return = The URL you would like PayPal to return the user to after the transaction
          cancel_return = The URL you would like PayPal to return to the user to if the transaction is cancled
      */
      paypal_config : { "email" : "peter.ingram0@gmail.com",
                        "currency_code" : "GBP",
                        "IPN_ReturnScriptUrl" : "",
                        "return" : "",
                        "cancel_return" : "" }
    
    });




  /*
      Hocks are used in this application. A hock is designed to link standard functions in your base application to functions within
      the shop. This is to keep this plugin in standard with your currant application.

      myAlert = This should trigger the alert function in your application
      showLoading = Should show a loading bar, stop the user from clicking or whatever you require
      hideLoading = should stop the loading after the application is receved the required information

      myAlert = @param 'style' required string
      
  */
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