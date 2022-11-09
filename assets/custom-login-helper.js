const json = document.querySelector('[data-login-json]').innerHTML;
const loginHelper = JSON.parse(json);

function _submitLoginHelperForm() {
    let customerEmail = document.querySelector('[name="customer[email]"]').value;
    let customerPassword = document.querySelector('[name="customer[password]"]').value;
    if(customerEmail != undefined && customerEmail.length > 0){
        const validateEmail = Utility.validateEmail(customerEmail);
        if(validateEmail == null){
            document.querySelector("[data-login-alert]").innerHTML = `<p>Provide Valid Email Address.</p>`;
            document.querySelector("[data-login-alert]").classList.remove("d-none");
            setTimeout(() => {
                document.querySelector("[data-login-alert]").innerHTML = ``;
                document.querySelector("[data-login-alert]").classList.add("d-none");
            }, 3000);
            return;
        }

        const data = JSON.stringify({
            "url": `/customers/search.json`,
            "method": "GET",
            "data": {
                "email": customerEmail.toLowerCase()
            }
        });

        const xhr = new XMLHttpRequest();
        xhr.withCredentials = true;

        xhr.addEventListener("load", function() {
            const response = JSON.parse(xhr.responseText);
            let message = '';
            let customertype = ""
            if(response == undefined || response == null) return;
            if(response.customers.length == 1){
                if(response.customers[0].state == "disabled"){
                    let msg = unescape(loginHelper.settings.account_disable).split('.');
                    msg.forEach((x)=>{
                        message += x +'.';
                    });
                    let dataI = JSON.stringify({
                        "url": `/customers/${response.customers[0].id}/send_invite.json`,
                        "method": "POST",
                        "data": {
                            "customer_invite": {
                                "to": `${response.customers[0].email.toLowerCase()}`,
                                "from": `${loginHelper.sender_email}`,
                                "bcc": [],
                                "subject": "Customer account activation",
                                "custom_message": `Hi ${response.customers[0].first_name}, you've created a new customer account at PROJECT-NAME. All you have to do is activate it.`
                            }
                        },
                    });

                    const xhrI = new XMLHttpRequest();
                    xhrI.withCredentials = true;
                    xhrI.addEventListener("load", function(){});
                    xhrI.open("POST", "/tools/ha-api/shopify/common");
                    xhrI.setRequestHeader("Accept", "application/json");
                    xhrI.setRequestHeader("Content-Type", "application/json");
                    xhrI.send(dataI);
                }else if(response.customers[0].state == "invited"){
                    let msg = unescape(loginHelper.settings.account_invited).split('.');
                        msg.forEach((x)=>{
                        message += x +'.';
                    });
                    customertype = 'invited';
                }else if(response.customers[0].state == "enabled"){
                    let msg = unescape(loginHelper.settings.account_enable).split('.');
                        msg.forEach((x)=>{
                        message += x +'.';
                    });
                    customertype = "enabled";
                }else if(response.customers[0].state == "declined"){
                    let msg = unescape(loginHelper.settings.account_declined).split('.');
                    msg.forEach((x)=>{
                        message += x +'.';
                    });
                    customertype="declined";
                }
                loginHelper.status = response.customers[0].state;
                loginHelper.message = message;
            }else{
                let msg = unescape(loginHelper.settings.account_not_found).split('.');
                msg.forEach((x)=>{
                    message += x +'.<br/>';
                });
                loginHelper.status = 'other';
                loginHelper.message = message;
            }
            document.querySelector("[data-login-alert]").innerHTML = `<p>${loginHelper.message}</p>`;
            document.querySelector("[data-login-alert]").classList.remove("d-none");
            if(customerPassword && customerPassword.length > 0) {
                document.querySelector('[data-login-form] form').submit();
            }else if(customertype == 'enabled'){
                document.querySelector('[data-password-wrap]').classList.remove('d-none');
            }
        });

        xhr.open("POST", "/tools/ha-api/shopify/common");
        xhr.setRequestHeader("Accept", "application/json");
        xhr.setRequestHeader("Content-Type", "application/json");
        xhr.send(data);
    }else{
        document.querySelector("[data-login-alert]").innerHTML = `<p>Provide Email Address.</p>`;
        document.querySelector("[data-login-alert]").classList.remove("d-none");
        setTimeout(() => {
            document.querySelector("[data-login-alert]").innerHTML = ``;
            document.querySelector("[data-login-alert]").classList.add("d-none");
        }, 3000);
    }
}

document.querySelector("[data-login-submit]").addEventListener("click", function(event){
    event.preventDefault();
    _submitLoginHelperForm();
});