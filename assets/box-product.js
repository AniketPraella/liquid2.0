

// multi product add
var addcartmultiproduct = (e) => {
    e.preventDefault();


   // addAllItems(variantIdArray) {
        // split fake liquid array to make proper array
        var subvariantarray = [];
        var product_data = null;
        for (subp = 0; subp < productarray.length; subp++){
            subvariantarray.push({'id': productarray[subp].variant_id, "quantity": 1})
        }
      
        // map over variant array to create an array of objects with quantity and id
        // product_data = subvariantarray.map(variantId => {
        //   return {quantity: 1, id: variantId}
        // })
      
        // add the items to the data object we need to pass to the fetch call 
        var data = {
          items: subvariantarray
        }
            
        console.log('data',data,subvariantarray);
        // return false;
        fetch('/cart/add.js', {
          body: JSON.stringify(data),
          credentials: 'same-origin',
          headers: {
            'Content-Type': 'application/json',
            'X-Requested-With':'xmlhttprequest'
          },
          method: 'POST'
        }).then((response) => {
          return response.json();
        }).then((dataresponse) => {
          /* yay! our products were added - do something here to indicate to the user */
          console.log('products', dataresponse);
        }).catch((err) => {
          /* uh oh, we have error. */
          console.error(err)
        });
      //}


    /******************************************* for main product *********************************************/ 
/*

    var request = new XMLHttpRequest();
    var url = "/cart/add.js";
    request.open("POST", url, true);
    request.setRequestHeader("Content-Type", "application/json");
    request.onreadystatechange = function() {
        if (request.readyState === 4 && request.status === 200) {
        var jsonData = JSON.parse(request.response);
        console.log(jsonData);
        
        console.log("product array - " + productarray)
        
        }
    };

    pro_titles = [];
    for (px = 0; px < productarray.length; px++) {
        console.log('xval ' + (px+1));
        pro_title = document.querySelector(".bundle-box-product-page-right-sec [name='properties[Bundle" + (px+1) + "]']").value
        pro_titles.push(pro_title + " | ");
        console.log(pro_titles);
    }

    randomnumber = Math.floor((Math.random() * 999999) + 10000);
    pid = document.querySelector(".bundle-box-product-page-right-sec [name='id']").value
    pqty = document.querySelector(".bundle-box-product-page-right-sec [name='quantity']").value

    var data = JSON.stringify({
        "id": pid,
        "quantity": pqty,
        properties: {
            "randomnumber": randomnumber,
            "product": pro_titles,
            "type": "main"
        }
    });

    console.log("data " + data);
    request.send(data);

    */

    /******************************************* for main product END *********************************************/ 

    /******************************************* for sub products *********************************************/ 

    /*
    for (subp = 0; subp < productarray.length; subp++) {
        console.log('subpval ' + (subp+1));
        
        var request2 = new XMLHttpRequest();
        var url2 = "/cart/add.js";
        request.open("POST", url2, true);
        request.setRequestHeader("Content-Type", "application/json");
        request.onreadystatechange = function() {
            if (request2.readyState === 4 && request2.status === 200) {
            var jsonData2 = JSON.parse(request2.response);
            console.log(jsonData2);
                    
            }
        };

        productarray[subp].variant_image

        pid2 = document.querySelector(".bundle-box-product-page-right-sec [name='id']").value
        pqty2 = document.querySelector(".bundle-box-product-page-right-sec [name='quantity']").value

        var data2 = JSON.stringify({
            "id": productarray[subp].variant_id,
            "quantity": productarray[subp].quantity,
            properties: {
                "randomnumber": randomnumber,
                "type": "sub_product"
            }
        });

        console.log("data " + data2);
        request.send(data2);

        }
        */

        /******************************************* for sub products END *********************************************/ 


    productarray.splice(0, productarray.length);
    updatebundleproduct();
    addproducttobundleempty();
    removeproduct();
}