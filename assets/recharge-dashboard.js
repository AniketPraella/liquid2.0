var allSubscriptions=[]; // Stores All logged in customer subscriptions from recharge response including Active and In-Active Subscriptions
var activeSubscriptions=[]; // Stores Active Subscriptions
var inActiveSubscriptions=[]; // Stores In-Active Subscriptions
var productsJson={}; // Stored Store front all products JSON
var graphQLProductsJSON=null; // Stores GraphQL Products JSON which are used for displaying image
var customerAddresses=null; // Stored Recharge All Customer Addresses
var customerPaymentMethods=null; // Stores Customer Payment Methods
var subscriptionData={}; // Stores Specific Subscription Data when any modal is opened
var successModalType=null; // Used for confirmation modal open when any success full action is triggered
var selectedProduct = ""; // Used for storing shopify product information ( Ex. whenever product is changed in updating subscription  )
var selectedVariant = ""; // Used For storing shopify variant information ( Ex. whenever variant is changed in updating subscription   )
var selectedAddonVariant = ""; // Used For storing shopify variant information ( Ex. whenever variant is changed in updating subscription   )
var storeCancellationReason=[]; // Stored cancellation reason which are stored in recharge admin
var subscriptionId='';
var currentAddon =''; //Used when update addon is triggered
var subscriptionAddressId='';
var deliverySchedules=null; // Stores delivery schedule of the customer
var selectedAddons = []; //arrays of addons connected with selected subscription
var scheduleDeliveryFlag = false; //flag for scheduled delivery after any update is done.
var customerAddressId = null; // Stores address id to update
var addressIdForAddon = ''; // Stores address id, in order to pass while creating addon obj
var discounts=[];
var selectedProductOptions = [];
var allCharges=[];
class dashboard extends HTMLElement {
    constructor () {
        super();
        this.dashboard = this;
        //Get OnLoad Details With Customers
        this.getLoadDetails();
    } 

    async getLoadDetails(){
        //Get Customer Details
        await RechargeUtilities._getCustomerDetails();
        await this.onLoadData();
    }

    async deliveryDetails(){
        //Get Delivery Schedule
        await RechargeUtilities._getDeliverySchedule(); 
        //create Delivery Schedule HTML
        await this._createDeliveryScheduleHTML();
    }
    
    _bindDeliveryScheduleEvents() {
         // Bind click event for Skip/Unskip in delivery schedule
         this.dashboard.querySelectorAll('[data-skip_unskip_delivery]').forEach(ele=>{
            ele.addEventListener('click', (event) => {
                event.stopImmediatePropagation();
                this._skipUnskipCharge(event.target);
            })
        });

    }

    async onLoadData() {

        if (window.customerDetails.rechargeCustomerDetails) {
            
            //Get Subscriptions
            await RechargeUtilities._getSubscriptions(); 
    
            //Get Customer Addresses
            await RechargeUtilities._getCustomerAddresses(); 
    
            //Get Payment Methods
            await  RechargeUtilities._getPaymentMethods();
            
            //Get One-times Addons
            await RechargeUtilities._getOnetimes(); 

        }

        //Get GraphQL Products JSON
        await RechargeUtilities._getProductsJsonByGraphQl(); 

        //Get Upcoming Charges
        allCharges=await RechargeUtilities._getUpcomingCharges(); 

        // Convert Customer PaymentMethods array to object for avoiding looping
        customerPaymentMethods = window.customerDetails.rechargePaymentMethods;

        // create billing addresses HTML
        await this._createBillingHTML();
 
        //create Subscriptions HTML
        await this._createSubscriptionsHTML(); 

        //create Addresses HTML
        this._createAddressesHTML();
 
        await this._bindModalEvents();
        

        // When addon is added change button text
        // if(successModalType == 'addon-success'){
        //     this._showSuccessModal();
        //     this.dashboard.querySelector('.btn.loading .add-text').innerText='Added!';
        //     successModalType= null;
        // }
        // Remove class for Button Loading after any action is executed successfully
        
        this.dashboard.querySelector('.btn.loading')?.classList.remove('loading');
        if (successModalType != null && successModalType != 'addon-success') {
            //Open Confirmation Modal after successfull api call 
            this._showSuccessModal();
        }
        this._removeDisabledButton();
        
        //flag for delivery schedule after any update is done.
        scheduleDeliveryFlag = false;
        document.querySelector('#dashboard').removeAttribute('style');
    }


    /**
    * Update next charge date for subscription and Addons
    * 
    * @param {Number} subscription_id
    * @param {Date} nextChargeDate ( YYYY-MM-DD )
    */
    async _setNextChargeDate(subscription_id, nextChargeDate) {
        var response=await RechargeUtilities._changeChargeDate(subscription_id,nextChargeDate); 
        if (response) {
            // If Addons are connected with subscription change their dates also
            if (selectedAddons.length > 0){
                 var response2 = await RechargeUtilities._changeChargeDateAddon(selectedAddons,nextChargeDate)
                 if(response2){this.onLoadData();}
            }else{
                this.onLoadData();
            }
        }
    }

    /**
    * Cancel Subscription and delete addons
    * 
    * @param {Number} subscription_id
    * @param {String} reason
    * @param {String} feedback
    */
    async _cancelSubscription(subscriptionId,reason,feedback){
        // If Addons are connected with subscription first delete them
        if (selectedAddons.length > 0){
            var response = await RechargeUtilities._cancelOnetimeAddon(selectedAddons);
            if (response) {
                // Once Addons are deleted cacel the subscription
                var response2=await RechargeUtilities._cancelSubscription(subscriptionId,reason,feedback); 
                if(response2){this.onLoadData();}
            }
        }else{
            // If addons are not there directly cancel sunscription
            var response=await RechargeUtilities._cancelSubscription(subscriptionId,reason,feedback); 
            if(response){this.onLoadData();}
        }
    }

    /**
    * Re-Activate Subscription
    * 
    * @param {Number} subscription_id
    */
    async _reActivateSubscription(subscription_id){
        var response=await RechargeUtilities._reActivateSubscription(subscription_id); 
        if (response) {
            this.onLoadData();
        }
    }

    /**
    * Update Subscription
    * 
    * @param {Number} subscription_id
    * @param {JSON} updateSubscriptionObj : https://developer.rechargepayments.com/2021-11/subscriptions/subscriptions_update    
    */
    async _updateSubscription(subscription_id,updateSubscriptionObj){
        var response=await RechargeUtilities._updateSubscription(subscription_id,updateSubscriptionObj); 
        if (response) {
            this.onLoadData();
        }
    }

    /**
    * Create a one-time addon
    * @param {JSON} addonObj : https://developer.rechargepayments.com/2021-11/onetimes/onetimes_create
    */
    async _createOnetimeAddon(addonObj){

        var response=await RechargeUtilities._createOnetimeAddon(addonObj); 
        if (response) {
            successModalType="onetime-addon-success-modal";
            this.onLoadData();
        }
    }

    /**
    * Create subscription product
    * @param {JSON} addonObj : https://developer.rechargepayments.com/2021-11/subscriptions/subscriptions_create
    */
     async _createSubscriptionProduct(subsDataObj){

        var response=await RechargeUtilities._createSubscriptionProduct(subsDataObj); 
        if (response) {
            // successModalType="addon-success"
            this.onLoadData();
        }
    }
    
    /**
    * Update one-time Addon product
    * 
    * @param {Number} addon_Id
    * @param {JSON} addonObj : https://developer.rechargepayments.com/2021-11/onetimes/onetimes_update
    
    */
    async _updateOnetimeAddon(addon_Id,addonObj){
        var response=await RechargeUtilities._updateOnetimeAddon(addon_Id,addonObj); 
        if (response) {
            this.onLoadData();
        }
    }

    /**
    * Remove one-time Addon product
    *  @param {Number} addon_Id
    */
    async _removeOnetimeAddon(addon_Id){

        var response=await RechargeUtilities._removeOnetimeAddon(addon_Id); 
        if (response) {
            this.onLoadData();
        }
    }

    /**
    * Change Shipping Address
    * 
    * @param {Number} address_id
    * @param {JSON} updatedAddressObj : https://developer.rechargepayments.com/2021-11/addresses/update_address
    */
    async _changeShippingAddress(address_id,updatedAddressObj){
      console.log("updatedAddressObj",updatedAddressObj);
        var response=await RechargeUtilities._changeShippingAddress(address_id,updatedAddressObj); 
        if (response) {
            this.onLoadData();
        }else{
            // Remove class for Button Loading after any action has been failed.
            this.dashboard.querySelector('.btn.loading')?.classList.remove('loading')
        }
    }

    /**
    * Apply Discount Based on charge id
    * 
    * @param {Number} charge_id
    * @param {Number} discount_id
    */
    async _applyDiscountOnCharge(charge_id,discount_id){
        var response=await RechargeUtilities._applyDiscountOnCharge(charge_id,discount_id); 
        if (response) {
            this.onLoadData();
        }
    }

    /**
    * Send an email notification
    * 
    */
    async _updatePaymethodMethod(){
        var response=await RechargeUtilities._updatePaymethodMethod(); 
        if (response) {
            // Remove class for Button Loading after any action is executed successfully
            this.dashboard.querySelector('.btn.loading')?.classList.remove('loading');
            if (successModalType != null) {
                //Open Confirmation Modal after successfull api call 
                this._showSuccessModal();
            }
        }
    }

    /**
    * Skip/Unskip a charge
    * 
    * @param {Number} subscription_id
    */
    async _skipUnskipCharge(event){
        
        var is_skip = event.closest('.btn').getAttribute("data-skipped")
        var charge_id = event.closest('.btn').getAttribute("data-charge_id")
        var item_id = event.closest('.btn').getAttribute("data-item_id")
        event.closest('.btn').classList.add('loading');
        // call unskip
        if(is_skip === 'true') {
            var response = await RechargeUtilities._unSkipCharge(charge_id, item_id); 
            if (response) {
                this.deliveryDetails();
            }
        } else {
            // call skip
            var response = await RechargeUtilities._skipCharge(charge_id, item_id); 
            if (response) {
                this.deliveryDetails();
            }
        }
    }

    /** *
      * Create Delivery Schedule HTML
    */ 
    _createDeliveryScheduleHTML() {
        
        deliverySchedules = window.customerDetails.rechargeDeliverySchedule;
        var deliveryScheduleHTML = ''        

        deliverySchedules.forEach((currentValue) => {
            
            var ds_date = RechargeUtilities._formatDate(currentValue.date, 'M DD, YYYY');
            
            // get all the products for a particular record
            var line_items_html = '';
            var line_items = currentValue.orders[0].line_items;
            var charge_id = currentValue.orders[0].charge_id;

            line_items.forEach((item) => {
                line_items_html += 
                `<tr>
                    <td> <img src="${item.images.small ? item.images.small : 'https://cdn.shopify.com/s/files/1/0533/2089/files/placeholder-images-image_large.png'}" style="width:60px"> </td>
                    <td> 
                        ${item.is_skipped ? `Skipped: <span style="color: #8e8f8e">${item.product_title}</span>` : `${item.product_title}` }  
                    </td>
                    <td class="text-end"> ${item.quantity} </td>
                    <td class="text-end"> ${item.unit_price} </td>
                    <td class="text-center"> ${item.plan_type} </td>     
                    <td class="text-center"> 
                        ${(item.is_skippable && charge_id ) ? 
                            `<a href="#" class="fw-semibold btn" data-skipped="${item.is_skipped}" data-charge_id="${charge_id}"  data-item_id="${item.subscription_id}" data-date="${currentValue.date}" data-skip_unskip_delivery>
                                <span class="add-text">${item.is_skipped ? 'Unskip' : 'Skip' }</span> 
                                <span class="spinner"></span>
                            </a>` 
                        : ' ' }
                    </td>     
                </tr>`

            })

            // Main delivery schedule block HTML
            deliveryScheduleHTML += 
            `<div class="my-5">
                <div class="h5 mb-3">${ds_date}</div>
                <table class="table">
                    <thead>
                    <tr>
                        <th scope="col" colspan="2">Product</th>
                        <th scope="col" class="text-end">Quantity</th>
                        <th scope="col" class="text-end">USD</th>
                        <th scope="col" class="text-center">Type</th>
                        <th scope="col" class="text-center"></th>
                    </tr>
                    </thead>
                    <tbody>
                        ${line_items_html}
                    </tbody>
                </table>
            </div>` 
        });

        this.dashboard.querySelector('[data-delivery_schedule]').innerHTML = deliveryScheduleHTML;

        // Remove Dashboard Loader When All the Onload APIs Call Successful
        this.dashboard.querySelector('[data-loader_button_delivery_schedule]')?.classList.add('d-none');

        this._bindDeliveryScheduleEvents()
    }

    /**
      * Create Addresses HTML
    */ 
    _createAddressesHTML() {

        let recharge_addresses = window.customerDetails.rechargeCustomerAddress;
        this.dashboard.querySelector('[data-addresses]').innerHTML = "";

        const regionNames = new Intl.DisplayNames(['en'], { type: 'region' })

        var customerAddressesHTML = ''        

        recharge_addresses.forEach((currentValue) => {
            
            customerAddressesHTML += 
            `<div class="col-sm-6 mb-4" data-single_customer_address="">
                <div class="card min-h-100 border-gray-200">
                    <div class="card-body">
                        <div class="card-title">
                            <h5 class="d-inline-block">
                            <span data-address_first_name=""> ${currentValue.first_name} </span> 
                            <span data-address_last_name=""> ${currentValue.last_name} </span>
                            </h5>
                        </div>
                        <div class="card-text">
                            <p data-address_1="" class="m-0"> ${currentValue.address1} </p>
                            <p data-address_2="" class="m-0 ${currentValue.address2 == null ? 'd-none' : ''}"> ${currentValue.address2} </p>
                            <p class="m-0"><span data-address_city=""> ${currentValue.city} </span> <span data-address_state="">${currentValue.province}</span> <span data-address_pincode="">${currentValue.zip}</span></p>
                            <p data-address_country="" class="m-0">${regionNames.of(currentValue.country_code)}</p>
                            <p data-address_phone="" class="m-0 ${currentValue.phone == null ? 'd-none' : ''}">PH: ${currentValue.phone}</p>
                        </div>
                    </div>
                    <div class="card-footer border-gray-200 bg-transparent">
                        <a class="card-link" href="javascript:void(0);" data-toggle="modal" data-modal-opener="shippingaddress-modal" data-customer_address_id="${currentValue.id}">Edit</a>
                    </div>
                </div>
            </div>` 
        });

        this.dashboard.querySelector('[data-addresses]').innerHTML = customerAddressesHTML;

        // Remove Dashboard Loader When All the Onload APIs Call Successful
        this.dashboard.querySelector('[data-loader_button_addresses]').classList.add('d-none');

    }
    
    _createSubscriptionsHTML(){
        allSubscriptions=window.customerDetails.rechargeSubscriptions;
        graphQLProductsJSON= window.customerDetails.graphQLProductsJSON;
        
        if (window.customerDetails.rechargeCustomerDetails) {

            customerAddresses = window.customerDetails.rechargeCustomerAddress;
            // Convert Customer Addresses array to object for avoiding looping
            let rechargeaddress = {};
            customerAddresses.map((address, i) => {
                rechargeaddress[address.id] = address;
            });
            customerAddresses = rechargeaddress;

            let rechargePaymentMethods = {};
            customerPaymentMethods.map((payment, i) => {
                rechargePaymentMethods[payment.id] = payment;
            });
            customerPaymentMethods = rechargePaymentMethods;

            // create Subscription HTML
            this._createSubscriptionHTML();

        }else{
            return false;
        }

        //Remove Dashboard Loader When All the Onload APIs Call Successful
        this.dashboard.querySelector('[data-loader_button]').classList.add('d-none')
    }


    /**
     * Create payment HTML 
    */
     _createBillingHTML(){

        let paymentHtml = '';
        customerPaymentMethods.map((payment)=>{
            paymentHtml=paymentHtml+this._paymentRowHTML(payment);
        });
        this.dashboard.querySelector('[data-subscription_billing]').innerHTML= paymentHtml;
     }

     /**
     * Create payment row HTML 
    */
     _paymentRowHTML(payment){

        return `
        <div class="border mb-5 table-responsive" data-payment-id="#${payment.id}">
        <table table-responsive="true" class="table biiling_table">
            <tbody>
                <tr>
                    <td class="font-size-xl fw-semibold ls-sm">Card on File</td>
                    <td class="rc_text--base">
                        <p class="fw-medium mb-2" data-card-details=""><span class="text-capitalize" data-card-brand="">visa</span> ending in <span data-card-4digit="">${payment.payment_details.last4}</span></p>
                        <p class="fw-medium text-capitalize mb-2" data-card-exp-details="">Expires ${payment.payment_details.exp_month} / ${payment.payment_details.exp_year}</p>
                        <p class="d-none"><a href="#" data-update-card="" class="font-size-md fw-bold text-uppercase">Update Card</a></p>
                    </td>
                </tr>
                <tr>
                    <td>
                        <p class="font-size-xl fw-semibold ls-sm">Billing Information</p>
                    </td>
                    <td class="rc_text--base">
                        <p class="fw-normal ls-sm mb-0" data-original-billing-address="">
                            <span class="mb-2 d-block fw-medium" data-billing-name="">${payment.billing_address.first_name} ${payment.billing_address.last_name}</span>
                            <span class="mb-2 d-block fw-medium" data-billing-address1="">${payment.billing_address.address1}</span>
                            <span class="mb-2 d-block fw-medium" data-billing-province="">${payment.billing_address.province}</span>
                            <span class="mb-2 d-block fw-medium" data-billing-countryname="">${payment.billing_address.country}</span>
                        </p>
                        <p>
                            <a href="#" class="btn btn-fill ps-0" data-modal-opener="${payment.processor_name == 'shopify_payments' ? 'UpdatePayment-modal' : 'UpdateBraintreePayment-modal'}" data-payment-${payment.processor_name}>
                                <span class="add-text">Send update email</span>
                            </a>
                        </p>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>`
     }


    /**
     * Create Active Subscriptions HTML 
    */
    _createActiveSubscriptionsHTML(){
        activeSubscriptions=allSubscriptions.filter((subscription)=>{
            if (subscription.status.toLowerCase() == 'active') {
                return subscription
            }
        })

        this.dashboard.querySelector('[data-active-subscriptions]').innerHTML="";
        if (activeSubscriptions.length > 0) {
            this.dashboard.querySelector('[data-active-subscriptions]').classList.remove('d-none');
            var activeHtml="";
            activeSubscriptions.map((sub)=>{
                activeHtml=activeHtml+this._activeSubscriptionRowHTML(sub);
            });
            this.dashboard.querySelector('[data-active-subscriptions]').innerHTML=activeHtml;
        }else{
            this.dashboard.querySelector('[data-active-subscriptions]').classList.add('d-none');
        }
    }

    /**
     * ROW Active Subscriptions HTML 
     * @param {JSON} subscription 
    */
    _activeSubscriptionRowHTML(subscription){
        var variant=graphQLProductsJSON[subscription.external_product_id.ecommerce].variants.filter((itm)=>{
            if (itm.id == subscription.external_variant_id.ecommerce ) {
                return itm
            }
        })

        variant=variant[0]
        var x = this._activeHTMLstyle1(subscription,variant);
        return x
    }

    // style1
    _activeHTMLstyle1(subscription,variant){
        //To add addon
        let addonHtml = this._addonHtml(subscription.id)+`<a href="#" data-modal-opener="one-time-product-popup" class="btn btn-primary btn-block rounded-0 add-one-time-product">+ add one-time products</a>`;
                
        return `
            <div class="recharge-active ${subscription.next_charge_scheduled_at != null ?  '' : 'disabled'}" data-single-active-subscription="${subscription.id}" data-subscription-id="${subscription.id}">
                <div class="border recharge-item">
                    <div class="d-md-flex align-items-center recharge-item-wrapper justify-content-between pe-xl-4">
                        <div class="d-flex align-items-center flex-grow-1 recharge-item-img-txt mb-3 mb-lg-0">
                            <img src="${variant.image.src ? variant.image.src : graphQLProductsJSON[subscription.external_product_id.ecommerce].images[0].src}" alt="${subscription.product_title}" class="d-none d-lg-block recharge-img">
                            <div class="ps-lg-5 flex-grow-1">
                                <div class="d-flex align-items-center justify-content-between d-md-block">
                                    <div class="pe-4 pe-md-0">
                                        <p class="ls-sm text-uppercase mb-1 mb-lg-0 order-id">#${subscription.id}</p>
                                        <h5 class="fw-semibold">${subscription.product_title}</h5>
                                        ${subscription.variant_title ? `<p class="ls-sm text-uppercase mb-1 mb-lg-0 order-id">${subscription.variant_title}</p>` : '' }
                                        <p class="ls-sm text-uppercase mb-1 mb-lg-0 order-id">Qty: <span>${subscription.quantity}</span></p>
                                        <span class="fw-bold text-primary">${Shopify.formatMoney(subscription.price * subscription.quantity * 100, window.globalVariables.money_format)}</span>
                                        <s class="ms-2 ps-1 font-size-md text-secondary-300">${Shopify.formatMoney(variant.price * subscription.quantity * 100, window.globalVariables.money_format)}</s>
                                    </div>
                                    <img src="${graphQLProductsJSON[subscription.external_product_id.ecommerce].images[0].src}" alt="${subscription.product_title}" class="d-md-none recharge-img">
                                </div>
                                <p class="font-size-lg order-line-txt mb-0 mt-2">${subscription.order_interval_frequency} ${subscription.order_interval_unit} ${subscription.is_prepaid ? `Prepay` : '' }  - Ships every ${subscription.order_interval_unit}</p>
                            </div>
                        </div>

                        <a href="#" class="btn btn-primary" data-modal-opener="editsubscription-modal"><span class="add-text">edit</span><span class="spinner"></span></a>
                    </div>

                    <div class="recharge-item-info-box" data-direct_action>
                        <div class="row mx-n1 recharge-item-info-list">
                            <div class="shipment-item px-1">
                                <p class="mb-1 info-heading text-uppercase font-size-sm ls-sm fw-bold">Next shipment:</p>
                                <div class="d-flex align-items-center d-md-block">
                                    <p class="mb-0 mb-md-1 font-size-md me-3 me-md-0">${subscription.next_charge_scheduled_at != null ?  moment(subscription.next_charge_scheduled_at).format('MMMM DD, YYYY') : this._checkChargeError(subscription)}</p>
                                    <p class="mb-0 font-size-md"><a href="#" class="fw-medium" data-default_open="skip" data-modal-opener="skipnextshipment-modal">Skip</a> or <a href="#" class="fw-medium" data-default_open="pause" data-modal-opener="skipnextshipment-modal">Pause</a></p>
                                </div>
                            </div>
                            <div class="address-item px-1">
                                <p class="mb-1 info-heading text-uppercase font-size-sm ls-sm fw-bold">Shipping address:</p>
                                <address class="mb-1 font-size-md fst-normal text-capitalize data-chargeError">${customerAddresses[subscription.address_id].address1} ${customerAddresses[subscription.address_id].address2 ? customerAddresses[subscription.address_id].address2 : '- - -'}<br>
                                ${customerAddresses[subscription.address_id].city}, ${customerAddresses[subscription.address_id].province} ${customerAddresses[subscription.address_id].zip}, ${customerAddresses[subscription.address_id].zip} ${customerAddresses[subscription.address_id].country_code} </address>
                                <p class="mb-0 font-size-md"><a href="#" data-customer_address_id="${subscription.address_id}" data-modal-opener="shippingaddress-modal" class="fw-medium">Edit</a></p>
                            </div>

                            <div class="payment-method-item px-1">
                                <p class="mb-1 info-heading text-uppercase font-size-sm ls-sm fw-bold">Payment method:</p>
                                <p class="mb-2 d-flex align-items-center font-size-md"><img src="https://cdn.shopify.com/shopifycloud/shopify/assets/payment_icons/visa-319d545c6fd255c9aad5eeaad21fd6f7f7b4fdbdb1a35ce83b89cca12a187f00.svg" alt="visa" class="me-2" />************${customerPaymentMethods[customerAddresses[subscription.address_id].payment_method_id].payment_details.last4}</p>
                                <p class="mb-0 font-size-md"><a href="#" data-modal-opener="UpdatePayment-modal" class="fw-medium">Edit</a></p>
                            </div>

                        </div>
                    </div>
                    ${addonHtml}
                </div>
            </div>
        `;
    }


    _createSubscriptionHTML() {
        // active subscriptions
        activeSubscriptions=allSubscriptions.filter((subscription)=>{
            if (subscription.status.toLowerCase() == 'active') {
                return subscription
            }
        })
        // inactive subscriptions
        inActiveSubscriptions=allSubscriptions.filter((subscription)=>{
            if (subscription.status.toLowerCase() == 'cancelled') {
                return subscription
            }
        })
        // address html
        var addresses = window.customerDetails.rechargeCustomerAddress;
        this.dashboard.querySelector('[data-active-subscriptions]').innerHTML="";
        var viewHTML = ''
        if (addresses.length > 0) {
            this.dashboard.querySelector('[data-active-subscriptions]').classList.remove('d-none');
            activeSubscriptions.map((sub)=>{
                viewHTML=viewHTML+this._activeSubscriptionRowHTML(sub);
            });

            this.dashboard.querySelector('[data-inactive-subscriptions]').innerHTML="";
            if (inActiveSubscriptions.length > 0) {
                this.dashboard.querySelector('[data-inactive-subscriptions]').classList.remove('d-none');
                var inActiveHtml="";
                inActiveSubscriptions.map((sub)=>{
                    inActiveHtml=inActiveHtml+this._inActiveSubscriptionRowHTML(sub);
                })
                this.dashboard.querySelector('[data-inactive-subscriptions]').innerHTML=inActiveHtml;
                this.dashboard.querySelectorAll('[data-reactive_subscription]').forEach(ele => {
                    ele.addEventListener('click',(event)=>{
                        event.stopImmediatePropagation();
                        event.preventDefault();
                        let id=event.target.closest('[data-single-inactive-subscription]').getAttribute('data-single-inactive-subscription');
                        event.target.closest('[data-reactive_subscription]')?.classList.add('loading');
                        this._disableButton();
                        this._reActivateSubscription(id)
                    })
                });
            }
            this.dashboard.querySelector('[data-active-subscriptions]').innerHTML = viewHTML;

            // set listners to reactive btn
            this.dashboard.querySelectorAll('[data-reactive_subscription]').forEach(ele => {
                ele.addEventListener('click',(event)=>{
                    event.stopImmediatePropagation();
                    event.preventDefault();
                    let id=event.target.closest('[data-single-inactive-subscription]').getAttribute('data-single-inactive-subscription');
                    event.target.closest('[data-reactive_subscription]')?.classList.add('loading');
                    this._disableButton();
                    this._reActivateSubscription(id)
                })
            });
        } else {
            this.dashboard.querySelector('[data-active-subscriptions]').classList.add('d-none');
        }
    }

    
    /**
     * Create address row 
     * @param {JSON} address 
    */
    _addressRowHTML(address){
    
        // var style = this._activeHTMLstyle2(subscription,variant);
        var style = `
        <div class="d-flex align-items-center pb-4 mx-md-n3 mx-0 justify-content-between">
            <div class="mb-md-0 mb-6 ps-xl-4 ps-md-3 pe-md-3 px-0 border-end border-dark">
                <div class="mb-1">
                    <p class="font-size-xl fw-bold ls-0 mb-md-2 mb-1" data-customer_name>${address.first_name} ${address.last_name}</p>
                    <p class="font-size-xl fw-bold ls-0 mb-1 pb-md-0 pb-1" data-customer_address>
                        ${address.address1} ${address.address2} ${address.city}, ${address.province} ${address.zip}
                    </p>
                </div>
                <a href="#" class="fill-details font-size-sm fw-medium text-decoration-underline" data-customer_address_id="${address.id}" data-modal-opener="shippingaddress-modal">Edit Shipping Address</a>
            </div>
            <div class="ps-md-7 ps-md-3 pe-md-3 px-0">
                <p class="font-size-xl fw-bold ls-0 mb-1"><span class="text-capitalize lh-base" data-visa="">visa</span> ****<span data-4digit="">9938</span></p>
                <div class="d-flex align-items-center justify-content-between">
                    <a href="#" class="fill-details fw-medium font-size-sm text-decoration-underline" data-update-billing-link="">Update Billing</a>
                </div>
            </div>
            </div>
        `

        return style;
    }


    /**
     * Create AddOn HTML 
    */
    _addonHtml(subscriptionId){
        var connectedAddons = [];
        window.customerDetails.rechargeOnetimes.map((addon)=>{
            addon.properties.map((prop)=>{
                if (prop.name == 'connected_subscription_id' && prop.value == subscriptionId) {
                    connectedAddons.push(addon);
                }
            });
        });

        let addonHtml='';
        if(connectedAddons.length > 0){
            addonHtml+='<div class="add-ons-products" data-addon-wrap=""><h5 class="fw-semibold mb-3">One-Time Add Ons</h5><div class="row m-n2">';
        }
        
        connectedAddons.map((addon)=>{
            var addon_img_src = "";
            if (graphQLProductsJSON[addon.external_product_id.ecommerce].images == null) {
                addon_img_src = window.globalVariables.settings.no_image_replacement;
            } else {
                // get variant image
                var var_img = graphQLProductsJSON[addon.external_product_id.ecommerce].variants.filter((ele)=>{
                    if(ele.id == addon.external_variant_id.ecommerce ){
                        return ele;
                    }
                });
                addon_img_src = var_img[0].image.src;
            }

            let varTitle = '';
            if(addon.variant_title != null){
                varTitle = `<p class="mb-0"><span>${addon.variant_title}</span></p>`;
            }
            var tempAddonHtml = `
            <div class="col-12 col-md-6 p-2" data-onetime-id="${addon.id}">
                <div class="border d-flex align-items-center position-relative add-ons-product-box">
                    <a href="#" class="add-ons-product-close text-secondary btn p-0" data-addon-remove="${addon.id}">
                        <span class="add-text"><i class="icon-close"></i></span><span class="spinner"></span></a>
                    <img src="${addon_img_src}" alt="${addon.product_title}"> 
                    <div class="ps-3 ps-lg-5">
                        <p class="ls-sm text-uppercase mb-1 mb-lg-0 order-id">Qty: <span>${addon.quantity}</span></p>
                        <p class="mb-1 mb-lg-2 fw-bold">${addon.product_title}</p>
                        ${varTitle}
                        <span>${Shopify.formatMoney(addon.price * addon.quantity * 100, window.globalVariables.money_format)}</span>
                        <p>${addon.next_charge_scheduled_at}</p>
                    </div>
                    <a href="#" class="btn text-end text-right" data-modal-opener="editaddon-modal">
                        <span class="add-text">edit</span><span class="spinner"></span></a>
                </div>
            </div>
            `;
            addonHtml += tempAddonHtml;
        })
        
        if(connectedAddons.length > 0){
            addonHtml+='</div></div>';
        }

        return addonHtml;
    }
    /**
     * Create In-Active Subscriptions HTML 
    */
    _createInActiveSubscriptionsHTML(){
        inActiveSubscriptions=allSubscriptions.filter((subscription)=>{
            if (subscription.status.toLowerCase() == 'cancelled') {
                return subscription
            }
        })

        this.dashboard.querySelector('[data-inactive-subscriptions]').innerHTML="";
        if (inActiveSubscriptions.length > 0) {
            this.dashboard.querySelector('[data-inactive-subscriptions]').classList.remove('d-none');
            var inActiveHtml="";
            inActiveSubscriptions.map((sub)=>{
                inActiveHtml=inActiveHtml+this._inActiveSubscriptionRowHTML(sub);
            })
            this.dashboard.querySelector('[data-inactive-subscriptions]').innerHTML=inActiveHtml;
            this.dashboard.querySelectorAll('[data-reactive_subscription]').forEach(ele => {
                ele.addEventListener('click',(event)=>{
                    event.stopImmediatePropagation();
                    event.preventDefault();
                    let id=event.target.closest('[data-single-inactive-subscription]').getAttribute('data-single-inactive-subscription');
                    event.target.closest('[data-reactive_subscription]')?.classList.add('loading');
                    this._disableButton();
                    this._reActivateSubscription(id)
                })
            });
        }else{
            this.dashboard.querySelector('[data-inactive-subscriptions]').classList.add('d-none')
        }
    }

    /**
     * ROW In-Active Subscriptions HTML
     * @param {JSON} subscription  
    */
    _inActiveSubscriptionRowHTML(subscription){
        var variant=graphQLProductsJSON[subscription.external_product_id.ecommerce].variants.filter((itm)=>{
            if (itm.id == subscription.external_variant_id.ecommerce ) {
                return itm
            }
        })
        variant=variant[0]
        var x = this._inActiveHTMLstyle1(subscription,variant);
        return x;
    }
    
    //Style 1
    _inActiveHTMLstyle1(subscription,variant){
        return `
        <div class="border recharge-item recharge-inactive" data-single-inactive-subscription="${subscription.id}">
            <div class="d-md-flex align-items-center recharge-item-wrapper justify-content-between pe-xl-4">
                <div class="d-flex align-items-center flex-grow-1 recharge-item-img-txt mb-3 mb-lg-0">
                    <img src="${variant.image.src ? variant.image.src : graphQLProductsJSON[subscription.external_product_id.ecommerce].images[0].src}" alt="${subscription.product_title}" class="d-none d-lg-block recharge-img">
                    <div class="ps-lg-5 flex-grow-1">
                        <div class="d-flex align-items-center justify-content-between d-md-block">
                            <div class="pe-4 pe-md-0">
                                <p class="ls-sm text-uppercase mb-1 mb-lg-0 order-id">#${subscription.id}</p>
                                <h5 class="fw-semibold">${subscription.product_title}</h5>
                                <p class="ls-sm text-uppercase mb-1 mb-lg-0 order-id">Qty: <span>${subscription.quantity}</span></p>
                                <span class="fw-bold text-primary">${Shopify.formatMoney(subscription.price * subscription.quantity * 100, window.globalVariables.money_format)}</span>
                                <s class="ms-2 ps-1 font-size-md text-secondary-300">${Shopify.formatMoney(variant.price * subscription.quantity * 100, window.globalVariables.money_format)}</s>
                            </div>
                            <img src="${variant.image.src ? variant.image.src : graphQLProductsJSON[subscription.external_product_id.ecommerce].images[0].src}" alt="${subscription.product_title}" class="d-md-none recharge-img">
                        </div>
                        <p class="font-size-lg order-line-txt mb-0 mt-2">${subscription.order_interval_frequency} ${subscription.order_interval_unit} ${subscription.is_prepaid ? `Prepay` : '' }  - Ships every ${subscription.order_interval_unit}</p>
                    </div>
                </div>
            <a href="#" class="btn mb-1" data-reactive_subscription><span class="add-text">reactivate</span><span class="spinner"></span></a>
            </div>
        </div>
        `;
    }

    // Display Charges Error
    _checkChargeError(subscription){
        var subscriptionCharges=[];
        subscriptionCharges=allCharges.filter((charge)=>{
            let itm=charge.line_items.find((item) => {return item.purchase_item_id == subscription.id})
            if (itm != undefined){ return itm }
        })
        let chargeError=subscriptionCharges.filter((charge)=>{
            if (charge.error_type != null) {
                return charge
            }
        }) 
        chargeError=chargeError[0];
        console.log(chargeError.error_type,'chargeError.error_typechargeError.error_type')
        return `<strong class="text-danger">${chargeError.error_type}</strong>`;
    }
    /**
     * Bind Modal Events After Loading All The Subscriptions 
    */
    _bindModalEvents(){
        this.dashboard.querySelectorAll('[data-modal-opener]').forEach(ele => {
            ele.addEventListener('click',(event)=>{
                event.preventDefault();
                event.stopPropagation();
                this.dashboard.querySelectorAll('.modal.open').forEach(modal => {
                    modal.classList.remove('open')
                });
                let id=ele.getAttribute('data-modal-opener');
                document.querySelector(`#${id}`).show();
                this._showCurrentSubscription(event,id,ele);

                if (id == 'PopupModal-promocode') {
                    subscriptionAddressId=ele.closest('[data-address-id]').getAttribute('data-address-id');
                }
            })
        });

        if(this.dashboard.querySelectorAll('[data-addon-remove]') != null){
        this.dashboard.querySelectorAll('[data-addon-remove]').forEach(ele =>{
            var addon_id = ele.getAttribute('data-addon-remove');
            ele.addEventListener('click',(event)=>{
                event.preventDefault();
                event.target.closest('[data-addon-remove]')?.classList.add('loading');
                this._disableButton();
                var response =  RechargeUtilities._removeOnetimeAddon(addon_id);
                if (response) {
                    this.onLoadData();
                }
            })
        })
    }

    // To update variant for addon & edit subscription.
    
    this.dashboard.querySelectorAll('[data-edit-card]').forEach(ele =>{
        ele.querySelectorAll('[data-editProduct_variant]').forEach((option)=>{
            option.addEventListener('change',(event)=>{
                let productOptions=[];
                ele.querySelectorAll('[data-editProduct_variant]').forEach(ele => {
                    productOptions.push(ele.value)
                })
                var addonProduct = JSON.parse(ele.closest('[data-edit-card]').querySelector('[data-editProduct_productjson]').innerText);
                var addonVariants = addonProduct.variants;
                selectedAddonVariant = this._updateVariant(addonVariants,productOptions)
                if(ele.closest('[data-edit-card]').querySelector('[data-editProduct_option]')) {
                    ele.closest('[data-edit-card]').querySelector('[data-editProduct_option]').setAttribute('data-editProduct_option',selectedAddonVariant.id)
                }
                if(ele.closest('[data-edit-card]').querySelector('[data-currentprice]')){
                    ele.closest('[data-edit-card]').querySelector('[data-currentprice]').innerHTML = Shopify.formatMoney(selectedAddonVariant.price, window.globalVariables.money_format);
                }
            })
        })
        
    })
        this._bindOnLoadEvents()
    }

    /**
     * Bind useful events After Loading All The 
    */
    _bindOnLoadEvents(){
        // Bind Click Event on Changing Frequency Modal
        this.dashboard.querySelectorAll('[data-update-subscription_frq]').forEach(ele => {
            ele.addEventListener('click',(event)=>{
                event.stopImmediatePropagation();
                this._updateSubscriptionFrq(event);
            })
        });
        // Bind Click Event on Skipping Charge Date
        this.dashboard.querySelectorAll('[name="skip_next_shipment"]').forEach(ele => {
            ele.addEventListener('click',(event)=>{
                event.stopImmediatePropagation();
                if (ele.checked) {
                    if (ele.value == 'skip-subscription') {
                        this.dashboard.querySelector('[data-current_charge_date]').innerText=moment(subscriptionData.next_charge_scheduled_at).format('MMMM DD, YYYY');
                        let new_next_charge_date=moment(subscriptionData.next_charge_scheduled_at, "YYYY-MM-DD").add(subscriptionData.order_interval_frequency, subscriptionData.order_interval_unit)
                        this.dashboard.querySelector('[data-new_next_chargeDate]').innerText=moment(new_next_charge_date).format('MMMM DD, YYYY');
                        ele.closest('[data-updated-next-charge-date]').setAttribute('data-updated-next-charge-date',moment(new_next_charge_date).format('YYYY-MM-DD'));
                    }
                    if (ele.value == 'pause-subscription') {
                        this.dashboard.querySelector('[data-charge_datepicker]').value=moment(subscriptionData.next_charge_scheduled_at).format('YYYY-MM-DD');
                        this.dashboard.querySelector('[data-new_datepicker_next_chargeDate]').innerHTML=moment(subscriptionData.next_charge_scheduled_at).format('MMMM DD, YYYY');
                        this.dashboard.querySelector('[data-charge_datepicker]')?.addEventListener('change',(event)=>{
                            event.stopImmediatePropagation();
                            ele.closest('[data-updated-next-charge-date]').setAttribute('data-updated-next-charge-date',moment(event.target.value).format('YYYY-MM-DD'));
                            this.dashboard.querySelector('[data-new_datepicker_next_chargeDate]').innerHTML=moment(event.target.value).format('MMMM DD, YYYY');
                        })
                    }
                    if(ele.value == 'unskip-subscription') {
                        this.dashboard.querySelector('[data-current_charge_date_unskip]').innerText=moment(subscriptionData.next_charge_scheduled_at).format('MMMM DD, YYYY');
                        let new_next_charge_date=moment(subscriptionData.next_charge_scheduled_at, "YYYY-MM-DD").subtract(subscriptionData.order_interval_frequency, subscriptionData.order_interval_unit)
                        this.dashboard.querySelector('[data-new_next_chargeDate_unskip]').innerText=moment(new_next_charge_date).format('MMMM DD, YYYY');
                        ele.closest('[data-updated-next-charge-date]').setAttribute('data-updated-next-charge-date',moment(new_next_charge_date).format('YYYY-MM-DD'));
                    }
                }
            })
        });
        // Bind Click Event on Updating Charge Date Button
        this.dashboard.querySelectorAll('[data-update_charge_date]').forEach(ele => {
            ele.addEventListener('click',(event)=>{
                event.stopImmediatePropagation();
                this._updateChargeDate(event);
            })
        });
        // Bind Click Event on Change Subscription Modal
        this.dashboard.querySelectorAll('[data-update_subscription_btn]').forEach(ele => {
            ele.addEventListener('click',(event)=>{
                event.stopImmediatePropagation();
                this._swapSubscription(event)
            })
        });
        
        
        // Bind Click Event on Change Addon edit Modal
        this.dashboard.querySelectorAll('[data-update_addon_btn]').forEach(ele => {
            ele.addEventListener('click',(event)=>{
                event.stopImmediatePropagation();
                this._editAddon(event)
            })
        });

        //Bind event on subscription or onetime radio change to change price
        this.dashboard.addEventListener('input',(e)=>{
            e.stopImmediatePropagation();
            if(e.target.getAttribute('name')=="addon_type"){
                if(e.target.value == 'onetime'){
                    // hide frequency_selection
                    this.dashboard.querySelector('[data-addon_frequency_selection]').classList.add('d-none');
                    this._priceChange('onetime','addToMySubscription-modal');
                }else{
                    // show frequency_selection
                    this.dashboard.querySelector('[data-addon_frequency_selection]').classList.remove('d-none');
                    this._priceChange('subscription','addToMySubscription-modal')
                }
                
            }
        })

        // Bind Click Event on Change Addon edit Modal
        this.dashboard.querySelectorAll('[data-add_addon_btn]').forEach(ele => {
            ele.addEventListener('click',(event)=>{
                event.stopImmediatePropagation();
                let qty=this.dashboard.querySelector('#addToMySubscription-modal [data-qty-container] [data-qty-input]').value;
                // check if one time or subscription
                var type = this.dashboard.querySelector('input[name="addon_type"]:checked').value;
                if(type == 'onetime') {
                    event.target.closest('[data-add_addon_btn]')?.classList.add('loading');
                    this._disableButton();
                    successModalType="onetime-addon-success-modal";
                    this._createaddonObj(qty);
                    this._removeDisabledButton();
                } else {
                    var frequency = this.dashboard.querySelector('[data-addon-subscription-frequency]').value;
                    var intervalUnit = this.dashboard.querySelector('[data-addon-subscription-frequency-interval]').value;
                    event.target.closest('[data-add_addon_btn]')?.classList.add('loading');
                    this._disableButton();
                    successModalType="subscription-created-success-modal";
                    this._createSubscriptionObj(frequency, intervalUnit, qty);
                    this._removeDisabledButton();
                }
            })
        });

        // Bind Click Event on Cancel Subscription Modal
        this.dashboard.querySelectorAll('[data-cancel_subscriptions]').forEach(ele => {
            ele.addEventListener('click',(event)=>{
                event.stopImmediatePropagation();
                let reason=this.dashboard.querySelector('[data-select-cancel_reasons]')?.value;
                let feedback=this.dashboard.querySelector('[data-comment]')?.value;
                event.target.closest('[data-cancel_subscriptions]')?.classList.add('loading');
                this._disableButton();
                successModalType="cancelled-modal";
                this._cancelSubscription(subscriptionData.id,reason,feedback)
            })
        });

        // Bind Click Event on Send em email Notification
        this.dashboard.querySelector('[data-send_email]')?.addEventListener('click',(event)=>{
            // event.stopImmediatePropagation();
            event.target.closest('[data-send_email]')?.classList.add('loading');
            this._disableButton();
            successModalType="UpdatePaymentconfirmed-modal";
            this._updatePaymethodMethod();
            this._removeDisabledButton();
        })

        // Bind Click Event on Update Shipping Address Button
        this.dashboard.querySelectorAll('[data-update_shipping_address]').forEach(ele => {
            ele.addEventListener('click',(event)=>{
                event.stopImmediatePropagation();
                event.target.closest('[data-update_shipping_address]')?.classList.add('loading');
                this._disableButton();
                successModalType="shippingaddressConfirmed-modal";
                this._updateShippingAddress();
            })
        });

        // Bind Click event for addon products & edit subscription
        this.dashboard.querySelectorAll('[data-editProduct_option]').forEach(ele=>{
            ele.addEventListener('click', (event) => {
                event.stopImmediatePropagation();
                event.target.closest('[data-editProduct_option]')?.classList.add('loading');
                this._disableButton();
                selectedAddonVariant = ele.getAttribute('data-editProduct_option');
                if(ele.hasAttribute('data-edit-product')){
                    selectedProduct = ele.getAttribute('data-edit-product');
                    selectedVariant = ele.getAttribute('data-editProduct_option');
                    this._swapSubscriptionProduct();
                }else{
                    var qty = '1';
                    this._createaddonObj(qty);
                }
            });
        });

        

        // bind radio buttons events - set attribute & hide/show freqs selection
        this.dashboard.querySelectorAll('[data-addon_type_radio] input[name="addon_type"]').forEach( (ele) => {
            ele.addEventListener('change', (event) => {
                
                if(event.target.value == 'onetime') {
                    this.dashboard.querySelector('[data-product-type]').setAttribute('data-product-type', 'onetime');
                    if(!this.dashboard.querySelector('[data-addon_frequency_selection]').classList.contains('d-none')) {
                        this.dashboard.querySelector('[data-addon_frequency_selection]').classList.add('d-none');
                    }
                } else if(event.target.value == 'subscription') {
                    this.dashboard.querySelector('[data-product-type]').setAttribute('data-product-type', 'subscription');
                    this.dashboard.querySelector('[data-addon_frequency_selection]').classList.remove('d-none');
                }
            });
        });

        // committed this code as listener is on - data-add_addon_btn
        // bind one time product & subs product addon btn 
        // this.dashboard.querySelector('[data-add-onetime-subscription-btn]').addEventListener('click',(event)=>{
        //     event.stopImmediatePropagation();
        //     let qty=this.dashboard.querySelector('[data-quantity_parent] [data-qty-container] [data-qty-input]').value;

        //     // check if one time or subscription
        //     var type = this.dashboard.querySelector('[data-product-type]').getAttribute('data-product-type');
        //     if(type == 'onetime') {
        //         event.target.closest('[data-add-onetime-subscription-btn]')?.classList.add('loading');
        //         this._disableButton();
        //         successModalType="onetime-addon-success-modal";
        //         this._createaddonObj(qty);
        //         this._removeDisabledButton();
        //     } else {
        //         var frequency = this.dashboard.querySelector('[data-addon-subscription-frequency]').value;
        //         var intervalUnit = this.dashboard.querySelector('[data-addon-subscription-frequency-interval]').value;
        //         event.target.closest('[data-add-onetime-subscription-btn]')?.classList.add('loading');
        //         this._disableButton();
        //         successModalType="subscription-created-success-modal";
        //         this._createSubscriptionObj(frequency, intervalUnit, qty);
        //         this._removeDisabledButton();
        //     }
        // });

        // Bind delivery schedule
        this.dashboard.querySelector('[data-delivery-link]')?.addEventListener('click',(event)=>{
            if(!scheduleDeliveryFlag){
                this.dashboard.querySelector('[data-delivery_schedule]').innerHTML = `<div class="align-items-center bg-white d-flex h-100 justify-content-center position-absolute w-100" style="z-index: 5;opacity: 0.5;"><span class='spinner'></span></div>`;
                this.deliveryDetails();
                scheduleDeliveryFlag = true;
            }
        });

        // Bind click event on cancel trigger button 
        this.dashboard.querySelectorAll('[data-cancel_trigger]').forEach(ele => {
            ele.addEventListener('click',(event)=> {
                
                // check if value is not selected
                // if(this.dashboard.querySelector('[data-select-cancel_reasons]').value == 'null') {
                //     this.dashboard.querySelector('[data-cancel_subscriptions]').classList.add('disabled');
                // }

                // Function to decide which modal to show (cancel/apply discount before cancel)
                this._checkIfFirstTimeCancelled()
            })
        });

        // Bind click event when clicked on apply discount before cancel
        this.dashboard.querySelector('[data-apply_discount_before_cancel]')?.addEventListener('click', (event) => {
            event.stopImmediatePropagation();
            event.target.closest('[data-apply_discount_before_cancel]')?.classList.add('loading');
            this._disableButton();
            successModalType="cancelsub-discountConfirmed-modal";
            this._applyDiscountBeforeCancel();
        });

        //Number validation for CVV, Expiry date & card number
        this.dashboard.querySelectorAll('[data-card-details]').forEach(element =>{
            var target = element.getAttribute('data-card-details');
            var maxlength = element.getAttribute('maxlength') || 1;
            element.addEventListener('keypress',(event)=>{
                this._checkDigit(event,target);
            })
            element.addEventListener('input',(event)=>{
                this._checkValidation(event.target,target,maxlength);
            })
        });
        this.dashboard.querySelectorAll('[data-card-input]').forEach(element => {
            element.addEventListener('input',(event)=>{
                this.dashboard.querySelector('[data-add-card]')?.classList.remove('disabled');
                this.dashboard.querySelectorAll('[data-card-input]').forEach(ele => {
                    if(ele.querySelector('input').value == "" || ele.querySelector('[data-card-error]').getAttribute('data-card-error') == 'true'){
                        this.dashboard.querySelector('[data-add-card]')?.classList.add('disabled');
                    }
                });
            });
        })
        //Bind function with add card button
        this.dashboard.querySelector("#braintreeData").addEventListener('submit',(event)=>{
            event.stopImmediatePropagation();
            var braintreeDatas = {};
            this.dashboard.querySelectorAll('[data-braintree-name]').forEach(ele=>{
                var key = ele.getAttribute('data-braintree-name');
                var val = ele.value;
                braintreeDatas[key] = val;
            });
            this._addCard(window.customerDetails.rechargeCustomerDetails.braintree_customer_token,braintreeDatas);
        })

        //Bind Apply Discount button
        this.dashboard.querySelector('[data-apply_promocode]').addEventListener(('click'),(event)=>{
            event.stopImmediatePropagation();
            this._applyDiscount(event) 
        })
    }

    async _applyDiscount(event){
        let promocode=event.target.closest('#PopupModal-promocode')?.querySelector('[data-promocode]')?.value;
        discounts.length == 0 && await this._getDiscount();
        if (promocode.length > 0) {
            let id=discounts[promocode.toLowerCase()]?.id;
            if (id) {
                event.target.closest('[data-update_addon_btn]')?.classList.add('loading');
                this._disableButton();
                successModalType="promocodeSuccess-modal";
                let shippingAddressObj={ discounts:[ { id } ] }
                await this._changeShippingAddress(subscriptionAddressId ,shippingAddressObj);
            }else{
                Utility.notification('Error','promocode is not valid','error')
            }
        }else{
            Utility.notification('Error','Please enter promocode','error')
        }
    }

    /**
     * Fetch Discounts
     */
    async _getDiscount(){
        discounts=await RechargeUtilities._getDiscounts();
        let rechargeDiscounts= {};
        discounts.map((discount, i) => {
            rechargeDiscounts[discount.code.toLowerCase()] = discount;
        });
        discounts = rechargeDiscounts;
    }
    /** 
    * Validation function on focusout
    **/
    _checkValidation(event,target,maxlength){
        event.classList.remove('border-danger');
        if(target == 'CN'){
            if (event.value.length > 0 && event.value.length < maxlength) {
                event.classList.add('border-danger');
                event.nextElementSibling.classList.remove('d-none');
                event.nextElementSibling.setAttribute('data-card-error','true');
            }else{
                event.nextElementSibling.classList.add('d-none');
                event.nextElementSibling.setAttribute('data-card-error','false');
            }
        }else if(target == 'EX'){
            if (event.value.length > 0 && event.value.length < maxlength) {
                event.classList.add('border-danger');
                event.nextElementSibling.setAttribute('data-card-error','true');
                event.nextElementSibling.classList.remove('d-none');
            }else{
                event.nextElementSibling.classList.add('d-none');
                event.nextElementSibling.setAttribute('data-card-error','false');
            }
        }else if(target == 'CVV'){
            if (event.value.length > 0 && event.value.length < maxlength) {
                event.classList.add('border-danger');
                event.nextElementSibling.classList.remove('d-none');
                event.nextElementSibling.setAttribute('data-card-error','true');
            }else{
                event.nextElementSibling.classList.add('d-none');
                event.nextElementSibling.setAttribute('data-card-error','false');
            }
        }
    }
    /** *
    * Add New Card 
    * 
    * @param {token} braintree_customer_token
    **/

    async _addCard(token,braintreeDatas){
        var response = await RechargeUtilities._addCard(token,braintreeDatas); 
        console.log(response);
        if(response){
            this.onLoadData();
        }
    }

      
    // Number validation & adding space or / when needed
    _checkDigit(e,target) {
        var keycode = e.which;
        if (!(keycode >= 48 && keycode <= 57)) {
            e.preventDefault();
            return false;
        }
        if(target == 'CN'){
            if (e.target.value.length == 4 || e.target.value.length == 9 || e.target.value.length == 14) {
                e.target.value = e.target.value + ' ';
              }
        }else if(target == 'EX'){
            if (e.target.value.length == 2) {
                e.target.value = e.target.value + '/';
              }
        }
    }

    /**
     * Generate HTML for variant selector 
    */
    _generateVariantSelectorHTML(addonProductJSON, currentSubsVariant) {
        console.log('currentSubsVariant=>',addonProductJSON);
        var allProductOptions = "";
        for (const [i, option] of addonProductJSON.entries()) {
            let optionHtml = ``;
            let title = currentSubsVariant.title.split('/')
            
            for (const value of option.values) { 
                //to keep option selected
                let selectedClass = '';
                title.filter((t)=>{ 
                    if(t.trim()==value.trim()){
                        selectedClass = 'selected';
                    }
                });
                
                let temp = `<option value="${value}" ${selectedClass}>${value}</option>`;
                optionHtml += temp;
            }
            let tempHtml = `
                <div class="col-md-4 col-6  pe-2 ${option.name.toLowerCase() == 'title' ? 'd-none' : ''}">
                    <h6 class="text-uppercase font-size-xs ls-sm" >${option.name}:</h6>
                    <select name="pdp-${option.name}" id="pdp-${option.name}" data-product_option>
                        ${optionHtml}
                    </select>
                </div>
            `;
            allProductOptions += tempHtml;
        }
        this.dashboard.querySelector('[data-addon-onetime-subs-update] [data-subscription_options]').innerHTML = allProductOptions;
    }


    /**
     * Hide subscription radio option if it dosent exist in recharge
    */
    _hideSubscriptionRadio() {
        if(currentSubsVariant.selling_plan_allocations.length == 0) {
            this.dashboard.querySelector('[data-subscription-div').classList.add('d-none')
        } else {
            if(this.dashboard.querySelector('[data-subscription-div').classList.contains('d-none')) {
                this.dashboard.querySelector('[data-subscription-div').classList.remove('d-none')
            }
        }
    }

    /**
     * Function to update variant price
    */
    _priceUpdate(currentSubsVariant) { 
        let qty=this.dashboard.querySelector('[data-addon-onetime-subs-update] [data-quantity_parent] [data-qty-container] [data-qty-input]').value;
        let price = currentSubsVariant.price;
        price=`${Shopify.formatMoney(price * qty, window.globalVariables.money_format)}`;
        this.dashboard.querySelector('[data-onetime-div] [data-addon-onetime-price]').innerHTML=price;
    }

    /**
     * Function to decide which modal to show (cancel/apply discount before cancel)
    */
    _checkIfFirstTimeCancelled() {
        // Logic to show modal of cancel or discount
        var discountShowStatus = this.dashboard.querySelector('[data-cancel_trigger]').getAttribute('data-show_discount');
        if(discountShowStatus == 'true') {
            var cancellation_status = subscriptionData.properties.find( x => x.name === "is_cancel_firsttime") || null ;
            // check if it has properties (which means that its not first time)  
            if(cancellation_status == null) {
                // this means that its first time - show apply discount modal
                this.dashboard.querySelectorAll('.modal.open').forEach(modal => {
                    modal.classList.remove('open')
                });
                this.dashboard.querySelector(`#cancelsub-discount-modal`).show();
            } else {
                // this means that its not first time, show cancel modal
                this._showCancelModal();
            }
        } else {
            // this means that its not first time - show cancel modal
            this._showCancelModal();
        }
    }

    /**
     * Function to populate addon modal
    */      
    _populateAddonModal(addonProductJSON) {

        let price;
        let img;
        // get variant data - price, image 
        addonProductJSON.variants.forEach((variant) => {
            if(currentSubsVariant.id == variant.id) {
                price = variant.price;
                if(variant.featured_image == null)
                    img = addonProductJSON.featured_image;
                else
                    img = variant.featured_image.src;
            }
        });
        var priceOnetime = Shopify.formatMoney(price, window.globalVariables.money_format)
        this.dashboard.querySelector('[data-addon-product-img]').src = img;
        this.dashboard.querySelector('[data-addon-product-title]').innerHTML = addonProductJSON.title; 
        this.dashboard.querySelector('[data-addon-onetime-price]').innerHTML = priceOnetime;
    }
           

    /**
     * Function to show cancel modal
     */
    _showCancelModal(){
        this.dashboard.querySelectorAll('.modal.open').forEach(modal => {
            modal.classList.remove('open')
        });
        this.dashboard.querySelector(`#cancelsub-modal`).show();
    }

    /**
      * Function to apply discount before cancellation  
     */

    async _applyDiscountBeforeCancel() {
        // Get discount value from theme settings
        var discountpercent = this.dashboard.querySelector('[data-apply_discount_before_cancel]').getAttribute('data-discount_amount');
        
        // Update the price with applying discount
        var subscriptionPrice = subscriptionData.price;
        var updatedPrice = (subscriptionPrice - ((discountpercent * subscriptionPrice)/100)).toFixed(2);
        
        var subscriptionProperties = subscriptionData.properties;
        // Append new value to properties array
        subscriptionProperties.push({name: 'is_cancel_firsttime',value: 'false'})
        
        var updatedSubscriptionObj = {
            "price": updatedPrice,
            properties: subscriptionProperties
        }
        await this._updateSubscription(subscriptionData.id,updatedSubscriptionObj);
    }

    /**
     * 
     * @param {String} eventType : Performing specified action on specified event type modal
     * @param {element} element 
     */
    async _showCurrentSubscription(event,eventType,element){

        if(element.closest('[data-onetime-id]')){ // Set data when edit onetime
            currentAddon = element.closest('[data-onetime-id]').getAttribute('data-onetime-id'); 
            let subscriptions = window.customerDetails.rechargeOnetimes.filter((addon)=>{
                if(addon.id == currentAddon){
                    return graphQLProductsJSON[addon.external_product_id.ecommerce]
                }
            });

            if (subscriptions.length > 0) {
                subscriptionData = subscriptions[0];
            }

        }else if (element.closest('[data-subscription-id]')) {
            // Stores the current subscription data when any modal is opened
            let subscriptionId=parseInt(element.closest('[data-subscription-id]')?.getAttribute('data-subscription-id'));
            let subscriptions=activeSubscriptions.filter((subscription)=>{
                if (subscriptionId == subscription.id) {
                        return subscription
                }
            }) 
            if (subscriptions.length > 0) {
                subscriptionData=subscriptions[0];
            }  
        }

        // if(eventType == 'addToMySubscription-modal') {
        //     var handle=graphQLProductsJSON[addonProductJSON.id].handle;
        //     // Get Shopify Product JSON of Current Subscription Product
        //     if (productsJson[addonProductJSON.id]) {
        //         selectedProduct=productsJson[addonProductJSON.id]
        //     }else{
        //         //Display loader in popup before HTML structure is created
        //         this.dashboard.querySelectorAll('[data-loader_popup]').forEach((loader)=>{
        //             loader.classList.remove('d-none');
        //         });
        //         // selectedProduct=await RechargeUtilities._getStoreFrontProductJSON(handle);
        //         // selectedProduct= await this._getStoreFrontProductJSON(handle);
        //         productsJson[selectedProduct.id]=selectedProduct;
        //     } 
        //     selectedVariant = ele.getAttribute('data-addon_option'); 
        // }

        if(subscriptionData.id != undefined){
            var handle=graphQLProductsJSON[subscriptionData.external_product_id?.ecommerce].handle;
            // Get Shopify Product JSON of Current Subscription Product
            if (productsJson[subscriptionData.external_product_id?.ecommerce]) {
                selectedProduct=productsJson[subscriptionData.external_product_id?.ecommerce]
            }else{
                //Display loader in popup before HTML structure is created
                this.dashboard.querySelectorAll('[data-loader_popup]').forEach((loader)=>{
                    loader.classList.remove('d-none');
                });
                selectedProduct= await RechargeUtilities._getStoreFrontProductJSON(handle);
                productsJson[selectedProduct.id]=selectedProduct;
            }  
            
            selectedAddons=[];
            // Create addon array connected with subscription
            window.customerDetails.rechargeOnetimes.map((addon)=>{
                addon.properties.map((prop)=>{
                    if (prop.name == 'connected_subscription_id' && prop.value == subscriptionData.id) {
                        selectedAddons.push(addon);
                    }
                });
            });
            // Fetch Cancellation Reasons from Recharge admin side for cancellation modal 
            if (storeCancellationReason.length == 0) {
                this._fetchCancellationReason();
            }
        }
        // Highlight Frequency Of Current Subscription
        if (eventType === 'deliveryfrequency-modal') {
            this._createDeliveryFrequencyHTML()
            this.dashboard.querySelectorAll('[data-subscription-frq]').forEach(ele => {
                if (ele.querySelector('[data-subscription-frq-unit]') != null) {
                    ele.querySelector('[data-subscription-frq-unit]').innerText=subscriptionData?.order_interval_unit;
                }
            });
            this.dashboard.querySelector(`[data-subscription-frq="${subscriptionData.order_interval_frequency}"] label`)?.click();
        }

        // Actions on Skipping Modal
        if (eventType == 'skipnextshipment-modal') {
            
            // hide - unhide skip/unskip
            let is_skipped = 'false';
            subscriptionData.properties.forEach( (property) => {
                if(property.name == 'is_skipped') {
                    is_skipped = property.value
                }
            })

            if(is_skipped == 'false') {
                // show skip 
                this.dashboard.querySelector('#order-skip-next').closest('.radio-col').classList.remove('d-none');
                this.dashboard.querySelector('#order-unskip-next').closest('.radio-col').classList.add('d-none'); 
                this.dashboard.querySelector('#order-skip-next').click();
            } else {
                // show unskip
                this.dashboard.querySelector('#order-unskip-next').closest('.radio-col').classList.remove('d-none');
                this.dashboard.querySelector('#order-skip-next').closest('.radio-col').classList.add('d-none');
                this.dashboard.querySelector('#order-unskip-next').click();
            }

            if(event.target.closest('[data-default_open]').getAttribute('data-default_open') == 'pause'){
                if (this.dashboard.querySelector('#order-pause-subscription') != null) {
                    this.dashboard.querySelector('#order-pause-subscription').click();
                }
            }else{
                if (this.dashboard.querySelector('#order-skip-next') != null) {
                    this.dashboard.querySelector('#order-skip-next').click();
                }
            }
           
        }

        // Actions on update subscription modal
        if (eventType == 'changesubscription-modal' || eventType == 'editaddon-modal') {
            if (subscriptionData) {
                this._generateProductHtml(eventType);
            }
        }
        //for addon or subscription
        if(eventType == 'addToMySubscription-modal'){
            selectedProduct = JSON.parse(element.closest('[data-edit-card]').querySelector('[data-editProduct_productjson]').innerText);
            selectedProductOptions = JSON.parse(element.closest('[data-edit-card]').querySelector('[data-editProduct_productOptionjson]').innerText);
            this._generateProductHtml(eventType);
        }
        // Action on Edit Shipping Address Modal
        if (eventType == 'shippingaddress-modal') {
            new Shopify.CountryProvinceSelector('shipping_country', 'shipping_province', {
                hideElement: 'shippingProvinceContainer'
            });

            if(element.closest('[data-customer_address_id]')) {
                // from Address tab
                customerAddressId = element.closest('[data-customer_address_id]').getAttribute('data-customer_address_id');
                this.dashboard.querySelector('#shippingaddress-modal [data-back_button]').classList.add('d-none');
                this._fillShippingAddress(customerAddressId);
            } else {
                // from manage subscription tab
                this.dashboard.querySelector('#shippingaddress-modal [data-back_button]').classList.remove('d-none');
                this._fillShippingAddress(subscriptionData.address_id);
            }
        }
        // Action on Edit Shipping Address Modal
        if (eventType == 'UpdateBraintreePayment-modal') {
            this.dashboard.querySelector('#UpdateBraintreePayment-modal [data-add-card]')?.classList.add('disabled');
            this.dashboard.querySelectorAll('#UpdateBraintreePayment-modal [data-card-input] input').forEach(ele => {
                ele.value = "";
            });
        }
    }

    _fillShippingAddress(address_id){
        const regionNames = new Intl.DisplayNames(
            ['en'], {type: 'region'}
        );
        this.dashboard.querySelectorAll('[data-shipping_address]').forEach(ele => {
            if (ele.getAttribute('data-shipping_address') != 'country_code') {
                ele.value=customerAddresses[address_id][ele.getAttribute('data-shipping_address')];
            }
            if (ele.getAttribute('data-shipping_address') == 'country_code') {
                ele.value=regionNames.of(customerAddresses[address_id][ele.getAttribute('data-shipping_address')])
            }
        });
    }
    _createDeliveryFrequencyHTML(){
        let html=``;
        for (const selling_plan of selectedProduct.selling_plan_groups[0].selling_plans) {
            let frq="";
            if (selling_plan.options[0].value.toLowerCase().includes(' ')) {
                frq=selling_plan.options[0].value.split(' ')[0];
            }
            let tempHTML=`
            <div class="col-12 col-md-6 p-2" data-subscription-frq="${frq}">
                <div class="frequency-box h-100">
                    <input type="radio" id="frequency-${frq}" name="frequency" value="${frq}" class="d-none">
                    <label class="mb-0 d-flex align-items-center justify-content-center" for="frequency-${frq}">
                        <div class="checkmark-icon d-flex">
                            <svg width="17" height="17" viewBox="0 0 17 17">
                                <path id="Icon_ionic-ios-checkmark-circle" data-name="Icon ionic-ios-checkmark-circle" d="M11.875,3.375a8.5,8.5,0,1,0,8.5,8.5A8.5,8.5,0,0,0,11.875,3.375Zm4.352,6.15-5.464,5.488h0a.738.738,0,0,1-.474.225.715.715,0,0,1-.478-.233L7.519,12.717a.163.163,0,0,1,0-.233l.727-.727a.158.158,0,0,1,.229,0l1.814,1.814,4.986-5.022a.161.161,0,0,1,.114-.049h0a.148.148,0,0,1,.114.049l.715.74A.161.161,0,0,1,16.227,9.525Z" transform="translate(-3.375 -3.375)" fill="#f36a10"/>
                            </svg>
                        </div>
                        <p class="mb-0 font-size-md fw-medium text-center text-capitalize"> every ${frq} <span data-subscription-frq-unit></span></p>
                    </label>
                </div>
            </div>
            `;
            html+=tempHTML;
        }
        this.dashboard.querySelector('[data-subscription_frequencies]').innerHTML=html;
    }
    /**
     * Fetch Cancellation Reason and Render Reasons in Cancellation Modal
    */
    async _fetchCancellationReason(){
        storeCancellationReason= await RechargeUtilities._listRetentionStrategies();
        let cancelHTML="";
        for (const [i,cancelReason] of storeCancellationReason.entries()) {
            let reasonHTML=`
            ${i == 0 ? `<option value=null>Select a Reason</option>` : `<option value="${cancelReason.id}">${cancelReason.reason}</option>`}`;
            cancelHTML+=reasonHTML;
        }
        this.dashboard.querySelector('[data-select-cancel_reasons]').innerHTML=cancelHTML;
        // disable button
        this.dashboard.querySelector('[data-cancel_subscriptions]').classList.add('disabled');

        this.dashboard.querySelector('[data-select-cancel_reasons]').addEventListener('change',(event)=>{
            if (event.target.closest('[data-select-cancel_reasons]').value == 'null') {
                event.target.closest('[data-select-cancel_reasons]').classList.add('border-danger');
                this.dashboard.querySelector('[data-cancel_subscriptions]').classList.add('disabled');
            }else{
                event.target.closest('[data-select-cancel_reasons]').classList.remove('border-danger');
                this.dashboard.querySelector('[data-cancel_subscriptions]').classList.remove('disabled');
            }
        })
    }

    /**
     *  Generate current subscription shopify products options and price and Qty modal 
    */
    _generateProductHtml(eventType){
        var optionsList = [];
        if(eventType == 'addToMySubscription-modal'){
            selectedVariant=selectedProduct.variants;
            optionsList = selectedProductOptions;
        }else{
            selectedVariant=selectedProduct.variants.filter((itm)=>{
                if (itm.id == subscriptionData.external_variant_id.ecommerce ) {
                    return itm
                }
            });
            optionsList = selectedProduct.options;
        }
        selectedVariant=selectedVariant[0];
        selectedAddonVariant = selectedVariant.id;

        this.dashboard.querySelector('[data-qty-container] [data-qty-input]').value=subscriptionData.quantity;

        // Update selectedVariant object and variant's price and image on changing options
        this._updateDataOnVariantChange(eventType);

        // Generate available options HTML for changing option
        var allProductOptions = "";
        for (const [i, option] of optionsList.entries()) {
            let optionHtml = ``;
            let title = selectedVariant.title.split('/')
             
            for (const value of option.values) { 
                //to keep option selected
                let selectedClass = '';
                title.filter((t)=>{ 
                    if(t.trim()==value.trim()){
                        selectedClass = 'selected';
                    }
                });
                
                let temp = `<option value="${value}" ${selectedClass}>${value}</option>`;
                optionHtml += temp;
            }
            let tempHtml = `
                <div class="col-md-4 col-6  pe-2 ${option.name.toLowerCase() == 'title' ? 'd-none' : ''}">
                    <h6 class="text-uppercase font-size-xs ls-sm" >${option.name}:</h6>
                    <select name="pdp-${option.name}" id="pdp-${option.name}" data-product_option>
                        ${optionHtml}
                    </select>
                </div>
            `;
            allProductOptions += tempHtml;
        }

        // for edit addon html
        if(eventType =='editaddon-modal' || eventType == 'addToMySubscription-modal'){
            this.dashboard.querySelector(`#${eventType} [data-addon-update] [data-subscription_options]`).innerHTML = allProductOptions;
        }else{
            this.dashboard.querySelector('[data-subscription-update] [data-subscription_options]').innerHTML = allProductOptions;
        }

        // hide subscription radio for non-subscription products
        if(eventType == 'addToMySubscription-modal'){
            this._hideSubscriptionRadio();
        }

        //Bind Increment / Decrement Qty wrapper events 
        this.dashboard.querySelectorAll('[data-qty-btn]').forEach(ele => {
            ele.addEventListener('click', (event) => {
                event.stopImmediatePropagation();
                let action = ele.getAttribute('data-qty-btn');
                this._qtyUpdate(event, action);
                let eventType = event.target.closest('modal-dialog').getAttribute('id');
                this._updateDataOnVariantChange(eventType);
            })
        }); 

        // Set variant on option changing
        this.dashboard.querySelectorAll('[data-product_option]').forEach(ele => {
            ele.addEventListener('change',(event)=>{
                event.stopImmediatePropagation();
                let productOptions=[];
                this.dashboard.querySelectorAll('[data-product_option]').forEach(ele => {
                    productOptions.push(ele.value)
                })
            
                let variantsArray = selectedProduct.variants
                selectedVariant = this._updateVariant(variantsArray,productOptions)
                selectedAddonVariant = selectedVariant.id;
                this._updateDataOnVariantChange(eventType);
            })
        });

        // this.dashboard.querySelector('[data-addon-update]').classList.remove('d-none');
        this.dashboard.querySelectorAll('[data-loader_popup]').forEach((loader)=>{
            loader.classList.add('d-none');
        });
    }

    /**
     * Function to hide subscription radio for non-subscription prodcuts (addon)  
    */
    _hideSubscriptionRadio() {
        if(selectedVariant.selling_plan_allocations.length == 0) {
           this.dashboard.querySelector('[data-subscription-div').classList.add('d-none')
        } else {
           if(this.dashboard.querySelector('[data-subscription-div').classList.contains('d-none')) {
               this.dashboard.querySelector('[data-subscription-div').classList.remove('d-none')
           }
        }
    }

    /**
     * Update variant image and price on variant changed
    */
    _updateDataOnVariantChange(eventType){
        let imgSrc=null;
        if(selectedVariant.featured_image){
            imgSrc=selectedVariant.featured_image.src;
        }else if(selectedProduct.featured_image){
            imgSrc=selectedProduct.featured_image
        }else{
            imgSrc=window.customerDetails.no_image_replacement;
        }
        
        var productType = 'subscription'
        if (eventType == 'editaddon-modal') {
            productType = 'onetime'
        }else if(eventType == 'addToMySubscription-modal'){
            productType = this.dashboard.querySelector('input[name="addon_type"]:checked')?.value || 'onetime'
        }
        if(productType == 'onetime'){
            this.dashboard.querySelector(`#${eventType} [data-addon-update] [data-update_subscription] [data-update_subscription_img]`).setAttribute('src',imgSrc);
        }else{
            this.dashboard.querySelector(`#${eventType} [data-update_subscription_img]`).setAttribute('src',imgSrc);
        }
        this._priceChange(productType,eventType)
    }
 
    _priceChange(productType,eventType){
        let discountedPrice=selectedVariant.price;

        //for edit addon with subscription change here
        if(productType == 'subscription' && selectedVariant.selling_plan_allocations[0]){
            discountedPrice=selectedVariant.selling_plan_allocations[0].price;
        }

        if(eventType =='editaddon-modal' || eventType == 'addToMySubscription-modal'){
            var qty=this.dashboard.querySelector(`#${eventType} [data-addon-update] [data-qty-container] [data-qty-input]`).value;
        }else{
            var qty=this.dashboard.querySelector('[data-subscription-update] [data-qty-container] [data-qty-input]').value;
        }
        let price=`${Shopify.formatMoney(discountedPrice * qty, window.globalVariables.money_format)}`;
        if(eventType =='editaddon-modal' || eventType == 'addToMySubscription-modal'){
            this.dashboard.querySelector(`#${eventType} [data-addon-update] [data-subscription_price]`).innerHTML=price;
        }else{
            this.dashboard.querySelector('[data-subscription-update] [data-subscription_price]').innerHTML=price;
        }
        
    }
    /**
     * Update variant on option changed
    */
    _updateVariant(variantsArray,productOptions){
        let updatedVariant = variantsArray[0];    
        variantsArray.find((variant) => {
            // get true or false based on options value presented in variant
            // value format would be [true/false,true/false,true/false] boolean value based on options present or not
            let variant_options=[];
            for (let i = 1; i <= 3; i++) {
                if (variant[`option${i}`] != null) {
                    variant_options.push(variant[`option${i}`]);
                }
            }
            let mappedValues = variant_options.map((option, index) => {
                return productOptions[index] === option;
            });
            
            // assign variant details to this.currentVariant if all options are present
            if(!mappedValues.includes(false)){
                updatedVariant = variant;
            }
        });
        return updatedVariant
    }
    /**
     * Swap Subscription Function and prepare object for Updating subscription
    */
    async _swapSubscription(event){
        let qty=this.dashboard.querySelector('[data-subscription-update] [data-qty-container] [data-qty-input]').value;
        var updateSubscriptionObj={
            'use_shopify_variant_defaults': true,
            'external_variant_id': {
                'ecommerce': `${(selectedVariant.id).toString()}`
            },
            'quantity': qty
        }
        event.target.closest('[data-update_subscription_btn]')?.classList.add('loading');
        this._disableButton();
        successModalType="planchangeconfirmed-modal";
        await this._updateSubscription(subscriptionData.id,updateSubscriptionObj);
    }
    /**
     * Swap Subscription Function with exchange of product and prepare object for Updating subscription
    */
    async _swapSubscriptionProduct(){
        var updateSubscriptionObj={
            'use_shopify_variant_defaults': true,
            'external_variant_id': {
                'ecommerce': `${selectedVariant.toString()}`
            },
            "external_product_id": {
               "ecommerce": `${selectedProduct.toString()}`
            }
        }
        successModalType="planchangeconfirmed-modal";
        await this._updateSubscription(subscriptionData.id,updateSubscriptionObj);
    }

    /**
     * Edit Addon function
    */
     async _editAddon(event){
        let qty=this.dashboard.querySelector('#editaddon-modal [data-addon-update] [data-qty-container] [data-qty-input]').value;
        var addonObj={
            'external_variant_id': {
                'ecommerce': `${(selectedVariant.id).toString()}`
            },
            'quantity': qty
        }
        event.target.closest('[data-update_addon_btn]')?.classList.add('loading');
        this._disableButton();
        successModalType="addonchangeconfirmed-modal";
        await this._updateOnetimeAddon(currentAddon,addonObj);
        
    }

    /**
     * Open Confirmation Modal Dialog
    */
    _showSuccessModal(){
        this.dashboard.querySelectorAll('.modal.open').forEach(modal => {
            modal.classList.remove('open')
        });
        this.dashboard.querySelector(`#${successModalType}`).show();
        successModalType=null;
    }

    /**
     * Update Subscription Frequency
    */
    async _updateSubscriptionFrq(event){
        let frq=event.target.closest('#deliveryfrequency-modal').querySelector('input:checked').value;
        let frq_unit=subscriptionData.order_interval_unit;
        var updateSubscriptionObj={
            charge_interval_frequency : frq,
            order_interval_frequency: frq,
            order_interval_unit: frq_unit
        }
        event.target.closest('[data-update-subscription_frq]')?.classList.add('loading');
        this._disableButton();
        successModalType="frequencyconfirmed-modal";
        await this._updateSubscription(subscriptionData.id,updateSubscriptionObj);
    }

    /**
     * Update Next Charge Date 
    */
    async _updateChargeDate(event){

        event.target.closest('[data-update_charge_date]')?.classList.add('loading');
        this._disableButton();
        let newChargeDate=event.target.closest('[data-updated-next-charge-date]').getAttribute('data-updated-next-charge-date');

        // check for unskip 
        let action = this.dashboard.querySelector('input[name="skip_next_shipment"]:checked').value;
        
        if(action == 'unskip-subscription') {
            this._unSkipChargeDate(subscriptionData,newChargeDate);
            this.dashboard.querySelector('[data-successChargeDate_unskip]').innerText=moment(newChargeDate).format('MMMM DD, YYYY');
        } else {
            if(action == 'skip-subscription') {
                this._skipChargeDate(subscriptionData,newChargeDate);
                this.dashboard.querySelector('[data-successChargeDate]').innerText=moment(newChargeDate).format('MMMM DD, YYYY');
            } else {
                this._pauseSubscription(subscriptionData.id, newChargeDate);
                this.dashboard.querySelector('[data-successChargeDate_pause]').innerText=moment(newChargeDate).format('MMMM DD, YYYY');
            }
        }

        
    }

    /**
     * Unskip subscription 
    */
    async _unSkipChargeDate(subscriptionData,newChargeDate) {
        successModalType="unskipconfirmed-modal";
        var updatedSubsObj = {
            "charge_interval_frequency": subscriptionData.charge_interval_frequency,
            "order_interval_unit": subscriptionData.order_interval_unit,
            "order_interval_frequency": subscriptionData.order_interval_frequency,
            "next_charge_scheduled_at": newChargeDate,
            properties: [ 
                { name: 'is_skipped', value: 'false' } 
            ]
        };
        var response = await RechargeUtilities._updateSubscription(subscriptionData.id, updatedSubsObj); 
        if (response) {
            // If Addons are connected with subscription change their dates also
            if (selectedAddons.length > 0){
                 var response2 = await RechargeUtilities._changeChargeDateAddon(selectedAddons,newChargeDate)
                 if(response2){this.onLoadData();}
            }else{
                this.onLoadData();
            }
        }
    }

    /**
     * Skip subscription 
    */
    async _skipChargeDate(subscriptionData,newChargeDate) {
        successModalType="skipconfirmed-modal";
        var updatedSubsObj = {
            "charge_interval_frequency": subscriptionData.charge_interval_frequency,
            "order_interval_unit": subscriptionData.order_interval_unit,
            "order_interval_frequency": subscriptionData.order_interval_frequency,
            "next_charge_scheduled_at": newChargeDate,
            properties: [ 
                { name: 'is_skipped', value: 'true' } 
            ]
        };
        var response = await RechargeUtilities._updateSubscription(subscriptionData.id, updatedSubsObj); 
        if (response) {
            // If Addons are connected with subscription change their dates also
            if (selectedAddons.length > 0){
                 var response2 = await RechargeUtilities._changeChargeDateAddon(selectedAddons,newChargeDate)
                 if(response2){this.onLoadData();}
            }else{
                this.onLoadData();
            }
        }
    }

    /**
     * Pause subscription 
    */
    async _pauseSubscription(subscriptionId,newChargeDate) {
        successModalType="pauseconfirmed-modal";
        await this._setNextChargeDate(subscriptionId,newChargeDate);
    }

    /**
     * Update Shipping Address
    */
     async _updateShippingAddress(event){
        let shippingAddressObj={};
        this.dashboard.querySelectorAll('[data-shipping_address]').forEach(ele => {
            if (ele.getAttribute('data-shipping_address') != 'country_code') {
                shippingAddressObj[ele.getAttribute('data-shipping_address')]=ele.value;
            }
        });
        successModalType="shippingaddressConfirmed-modal";
        await this._changeShippingAddress(subscriptionData.address_id || customerAddressId ,shippingAddressObj);
        
    }

    /**
     * Create addon object
    */
    _createaddonObj(qty){
        var addonObj={
            address_id: subscriptionData.address_id,
            next_charge_scheduled_at: subscriptionData.next_charge_scheduled_at,
            use_shopify_variant_defaults: true,
            external_variant_id:{
                ecommerce: `${selectedVariant.id}`
            },
            quantity: qty,
            properties: [
                {
                    name: "connected_subscription_id",
                    value: `${subscriptionData.id}`
                }
            ]
        }
        this._createOnetimeAddon(addonObj);
    }

    /**
     * Function to create subscription data object 
    */
      _createSubscriptionObj(frequency, intervalUnit, qty){
        var subsDataObj = {
            "address_id": subscriptionData.address_id,
            "next_charge_scheduled_at": subscriptionData.next_charge_scheduled_at,
            "charge_interval_frequency": frequency,
            "order_interval_frequency": frequency,
            "order_interval_unit": intervalUnit,
            "external_variant_id":{
                'ecommerce': `${(selectedVariant.id).toString()}`
            },
            "quantity": qty
        }
        console.log(subsDataObj);
        this._createSubscriptionProduct(subsDataObj);
    }
    
    /**
     * Function to create subscription data object 
    */
    _createSubscriptionObj(frequency, intervalUnit, qty){
        var subsDataObj = {
            address_id: subscriptionData.address_id,
            next_charge_scheduled_at: subscriptionData.next_charge_scheduled_at,
            charge_interval_frequency: frequency,
            order_interval_frequency: frequency,
            order_interval_unit: intervalUnit,
            external_variant_id:{
              ecommerce: `${currentSubsVariant.id}`
            },
            quantity: qty
        }
        console.log(subsDataObj);
        this._createSubscriptionProduct(subsDataObj);
    }

    /**
     * 
     * @param {event} event 
     * @param {String} action : value must be Plus / Minus 
     */
    _qtyUpdate(event,action){
        let qty = parseInt(event.target.closest('[data-qty-container]').querySelector('input').value);
        if (action == 'plus') {
            event.target.closest('[data-qty-container]').querySelector('input').value = qty + 1;
        } else {
            if (qty > 1) {
                event.target.closest('[data-qty-container]').querySelector('input').value = qty - 1;
            }
        }
    }

    /**
     * Disable each button once any api is called
    */
    _disableButton(){
        this.dashboard.querySelectorAll('.btn').forEach(ele => {
            ele.classList.add('disabled')
        });
    }

    /**
     * Enable each button once any api call is completed
    */
    _removeDisabledButton(){
        this.dashboard.querySelectorAll('.btn').forEach(ele => {
            ele.classList.remove('disabled')
        });
    }
    
}
customElements.define('custom-dashboard', dashboard);