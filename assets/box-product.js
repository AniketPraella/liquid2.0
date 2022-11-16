

// multi product add
var addcartmultiproduct = (e) => {
    e.preventDefault();
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
    productarray.splice(0, productarray.length);
    updatebundleproduct();
    addproducttobundleempty();
    removeproduct();
}