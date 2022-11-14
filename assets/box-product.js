/*
let bundleproductadd = (e) => {
    e.preventDefault();

    var request = new XMLHttpRequest();
    var url = "/cart/add.js";
    request.open("POST", url, true);
    request.setRequestHeader("Content-Type", "application/json");
    request.onreadystatechange = function () {
        if (request.readyState === 4 && request.status === 200) {
            var jsonData = JSON.parse(request.response);
            console.log(jsonData);
        }
    };
    var pid = document.getElementById("id").value;
    var pqty = document.getElementById("quantity").value;

    var data = JSON.stringify({ "id": pid, "quantity": pqty });

    console.log(data);
    request.send(data);

    let productarray = [];
    productarray.push("");
}
*/