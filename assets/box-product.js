

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
    pid = document.querySelector(".bundle-box-product-page-right-sec [name='id']").value
    pqty = document.querySelector(".bundle-box-product-page-right-sec [name='quantity']").value

    var data = JSON.stringify({"id": pid, "quantity": pqty});

    console.log("data " + data);
    request.send(data);
    productarray.splice(0, productarray.length);
    updatebundleproduct();
    addproducttobundleempty();
}