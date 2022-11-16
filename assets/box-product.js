

// multi product add
var addcartmultiproduct = (e) => {
    e.preventDefault();

    /******************************************* for main product *********************************************/ 

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