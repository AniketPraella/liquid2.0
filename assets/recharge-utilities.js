
/*

    Add this code in in theme.liquid for getting basic details globally.

    <script type="text/javascript">
      window.customerDetails={
        customerTags: '{{customer.tags | json}}',
        email: "{{customer.email}}",
        id: "{{customer.id}}",
        url: "{{shop.url}}",
        rechargeCustomerDetails:null,
        rechargeSubscriptions:null,
        rechargeGiftSubscriptions:null,
        rechargeCustomerAddress : null,
        rechargePaymentMethods : null,
        rechargeOnetimes : null,
        rechargeDeliverySchedule: null,
        shopifyProductsJSON : null,
      }
    </script>

*/
 
var existingProductIds=[];
class rechargeUtilities {
    /*
        General Functions
    */

    header() {
        return {
            "Accept": "application/json",
            "Content-Type": "application/json",
            "X-Shop": window.customerDetails.url
        };
    }

    braintreeHeader(){
        return {
            "Accept": "application/json",
            "Content-Type": "application/json",
            "X-Shop": window.location.origin.split('//')[1]
          };
    }
    
    //For using recharge APIs
    rechargeCommonApi(){
        return window.customerDetails.rechargeCommonApi
    }

    //For using shopify REST APIs
    shopifyCommonApi(){
        return window.customerDetails.shopifyCommonApi
    }

    //Common Recharge Body
    rechargeCommonBody(config){
        return {
            method: 'POST',
            headers: this.header(),
            body: JSON.stringify(config)
        }
    }

    /*
        GET APIs CALLS
    */

    /**
      Get Customer details of the recharge 
      
     * Customer can be fetched in two ways
     * 1. @param {String} - email - Email Address of the recharge customer
     * 2. @param {Number|String} - customer_id - Recharge Id of the customer ( Not shopify customer id )
     * We need to fetch the recharge customer details by email as we don't have recharge customer id on page load
     
     * @return  {JSON} - data.customers[0]
     
     * For more information : https://developer.rechargepayments.com/2021-11/customers/customers_retrieve
    */

    async _getCustomerDetails() {
        var config = {
            url: `/customers`, 
            method: 'GET',
            timestamp: window.APImanagerKey.timeStamp,
            hash: window.APImanagerKey.key1,
            data: {
                'email': window.customerDetails.email
            }
        };
 
        const response = await fetch(this.rechargeCommonApi(), this.rechargeCommonBody(config));
        const data = await response.json();

        // Customer Details
        window.customerDetails.rechargeCustomerDetails=data.customers[0]
        if (response.ok) {
            console.log('Recharge Customer Details ===>',data) 
            return await data;
        }else{
            Utility.notification('Something went wrong','Error in fetching customer details','error')
            console.error('Error in fetching customer details ===>',data)
            alert('something went wrong');
        }
    }

    /**
      Fetch All Subscriptions of logged in customer
      
     * @param {Number|String} - customer_id - Recharge Id of the customer
     
     * @return  {JSON} - data.subscriptions
     
     * For more information : https://developer.rechargepayments.com/2021-11/subscriptions/subscriptions_list
    */
    async _getSubscriptions() {
        var config = {
            url: `/subscriptions`,
            method: 'GET',
            timestamp: window.APImanagerKey.timeStamp,
            hash: window.APImanagerKey.key2,
            data: {
                'customer_id': window.customerDetails.rechargeCustomerDetails.id
            }
        };

        const response = await fetch(this.rechargeCommonApi(), this.rechargeCommonBody(config));
        const data = await response.json();

        // All Subscriptions
        window.customerDetails.rechargeSubscriptions=data.subscriptions;
        existingProductIds=[...existingProductIds,...data.subscriptions.map((sub)=>{return sub.external_product_id ? sub.external_product_id.ecommerce : sub.shopify_product_id })]
        if (response.ok) {
            console.log('Subscriptions ===>',data)
            return await data;
        }else{
            Utility.notification('Something went wrong','Error in fetching subscriptions','error')
            console.error('Error in fetching subscriptions ===>',data)
            alert('something went wrong');
        }
    }

    /**
      Create subscription product 

     * @param {JSON} - subsDataObj - need to pass shopify product id , address id, frequency, frequency unit, qty
     * @return  {JSON} - data
    
     * For more information : https://developer.rechargepayments.com/2021-11/subscriptions/subscriptions_create
    */
      async _createSubscriptionProduct(subsDataObj){
        var config = {
            url: `/subscriptions`,
            method: 'POST',
            data: subsDataObj
        };

        const response = await fetch(this.rechargeCommonApi(), this.rechargeCommonBody(config));
        const data = await response.json();

        // Added onetime addon
        if (response.ok) {
            console.log('Subscription created Successfully ===>',data)
            return await true;
        }else{
            console.error('error in adding onetime Addon ===>',data)
            alert('something went wrong');
        }
    }
    
    /**
      Fetch All Recharge Addresses of logged in customer
      
     * @param {Number|String} - customer_id - Recharge Id of the customer
     
     * @return  {JSON} - data.addresses
     
     * For more information : https://developer.rechargepayments.com/2021-11/addresses/list_addresses
    */
    async _getCustomerAddresses() {
        var config = {
            url: `/addresses`,
            method: 'GET',
            timestamp: window.APImanagerKey.timeStamp,
            hash: window.APImanagerKey.key3,
            data: {
                'customer_id': window.customerDetails.rechargeCustomerDetails.id
            }
        };

        const response = await fetch(this.rechargeCommonApi(), this.rechargeCommonBody(config));
        const data = await response.json();

        // Recharge Customer Addresses
        window.customerDetails.rechargeCustomerAddress=data.addresses;
        if (response.ok) {
            console.log('Addresses ===>',data)
            return await data;
        }else{
            Utility.notification('Something went wrong','Error in fetching Addresses','error')
            console.error('Error in fetching Addresses ===>',data)
            alert('something went wrong');
        }
    }

    /**
      Fetch All Registered payment methods of logged in customer
      
     * @param {Number|String} - customer_id - Recharge Id of the customer
     
     * @return  {JSON} - data.payment_methods
     
     * For more information : https://developer.rechargepayments.com/2021-11/payment_methods/payment_methods_list
    */
   
    async _getPaymentMethods() {
        var config = {
            url: `/payment_methods`,
            method: 'GET',
            timestamp: window.APImanagerKey.timeStamp,
            hash: window.APImanagerKey.key4,
            data: {
                'customer_id': window.customerDetails.rechargeCustomerDetails.id
            }
        };

        const response = await fetch(this.rechargeCommonApi(), this.rechargeCommonBody(config));
        const data = await response.json();

        // Recharge Payment Methods
        window.customerDetails.rechargePaymentMethods=data.payment_methods;
        if (response.ok) {
            console.log('PaymentMethods ===>',data)
            return await data;
        }else{
            Utility.notification('Something went wrong','Error in fetching PaymentMethods','error')
            console.error('Error in fetching PaymentMethods ===>',data)
            alert('something went wrong');
        }
    }

    /**
      Fetch All Onetime Addons of logged in customer
      
     * @param {Number|String} - customer_id - Recharge Id of the customer
     
     * @return  {JSON} - data.onetimes
     
     * For more information : https://developer.rechargepayments.com/2021-11/onetimes/onetimes_list
    */

    async _getOnetimes() {
        var config = {
            url: `/onetimes`,
            method: 'GET',
            timestamp: window.APImanagerKey.timeStamp,
            hash: window.APImanagerKey.key5,
            data: {
                'customer_id': window.customerDetails.rechargeCustomerDetails.id
            }
        };

        const response = await fetch(this.rechargeCommonApi(), this.rechargeCommonBody(config));
        const data = await response.json();

        // Recharge Onetimes Addons
        window.customerDetails.rechargeOnetimes=data.onetimes;
        existingProductIds=[...existingProductIds,...data.onetimes.map((sub)=>{return sub.external_product_id.ecommerce})]
        existingProductIds=this.getUniqueValues(existingProductIds)
        if (response.ok) {
            console.log('Onetimes ===>',data.onetimes)
            return await data;
        }else{
            Utility.notification('Something went wrong','Error in fetching onetimes','error')
            console.error('Error in fetching onetimes ===>',data)
            alert('something went wrong');
        }
    }
    
    /**
      Fetch Subscription using subscription id
      
     * @param {String} - subscription ids - Format  : "22346789,1326789,31546789"
     
     * @return  {JSON} - data.subscriptions
     
     * For more information : https://developer.rechargepayments.com/2021-11/subscriptions/subscriptions_list
    */

    async _getSubscriptionsById(SubscriptionsIds) {
        var config = {
            url: `/subscriptions`,
            method: 'GET',
            timestamp: window.APImanagerKey.timeStamp,
            hash: window.APImanagerKey.key6,
            data: {
                'ids': SubscriptionsIds.toString()
            }
        };

        const response = await fetch(this.rechargeCommonApi(), this.rechargeCommonBody(config));
        const data = await response.json();

        // Recharge Onetimes Addons
        window.customerDetails.rechargeGiftSubscriptions=data.subscriptions;
        existingProductIds=[...existingProductIds,...data.subscriptions.map((sub)=>{return sub.external_product_id.ecommerce})]
        existingProductIds=this.getUniqueValues(existingProductIds)
        if (response.ok) {
            console.log('Gift Subscriptions ===>',data.subscriptions)
            return await data;
        }
        else if(response.status == 404){
            Utility.notification('Something went wrong','Gift Subscriptions is not found','error')
            console.log('Gift Subscriptions is not found')
        }
        else{
            Utility.notification('Something went wrong','Error in fetching Gift Subscriptions','error')
            console.error('Error in fetching Gift Subscriptions ===>',data)
            alert('something went wrong');
        }
    }

    /**
      Fetch Shopify Product variants price and images by GRAPHQL call
      
     * @param {String} - ids - Recharge Id of the customer (Example : {'ids' : '632910392,63291234,63212347'}  )
     
     * @return  {JSON} - data.products
     
    */

    async _getProductsJsonByGraphQl() {
        let query="";
        console.log(existingProductIds);
        for (const id of existingProductIds) {
            let tempQuery=`
                product_${id.toString()}: product(id: "gid://shopify/Product/${id}") {
                    id
                    handle
                    images(first: 20) {
                        edges {
                            node {
                            src
                            }
                        }
                    }
                    variants(first: 99) {
                        edges {
                            node {
                            id
                            price
                                image {
                                    src
                                }
                            }
                        }
                    }
                }
            `;
            query+=tempQuery;
        }
        const response = await fetch('/api/2021-07/graphql.json', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                "Access-Control-Origin": "*",
                'X-Shopify-Storefront-Access-Token': "ddf7228b3e428ffe625a44f5862e3593"
            },
            body: JSON.stringify({query : `{${query}}`}),
        })
        const data = await response.json();
        
        let tempData=data.data;
        let tempGraphQLjson={};
        for (const key in tempData) {
            let id=key.split('product_')[1];
            let handle=tempData[key].handle;
            let obj={
                id,
                handle,
                images: {},
                variants:{}
            };
            var images=tempData[key].images.edges.map((img)=>{
                return img.node;
            })
            obj['images']=images;

            let variants=tempData[key].variants.edges.map((variant)=>{
                variant=variant.node;
                let variantObj={
                    id: atob(variant.id).replace('gid://shopify/ProductVariant/',''),
                    image: variant.image,
                    price: variant.price
                }
                return variantObj;
            })
            obj['variants']=variants
            tempGraphQLjson[id]=obj
        }
        window.customerDetails.graphQLProductsJSON=tempGraphQLjson;
        return await tempGraphQLjson;
    }

    /**
      Fetch Shopify Products JSON of subscription products
      
     * @param {String} - ids - Recharge Id of the customer (Example : {'ids' : '632910392,63291234,63212347'}  )
     
     * @return  {JSON} - data.products
     
     * For more information : https://shopify.dev/api/admin-rest/2022-07/resources/product#get-products
    */ 

    async _getStoreFrontProductJSON(handle) {
        const response = await fetch(`/products/${handle}.js`);
        const data = await response.json() ;

        if (response.ok) {
            console.log('Products Json ===>',data)
            return await data;
        }else{
            Utility.notification('Something went wrong','Please try again later','error')
            console.error('Error in fetching product JSON===>',data)
            alert('something went wrong'); 
        }
    }

    /**
      Fetch Shopify Products JSON of subscription products
      
     * @param {String} - ids - Recharge Id of the customer (Example : {'ids' : '632910392,63291234,63212347'}  )
     
     * @return  {JSON} - data.products
     
     * For more information : https://shopify.dev/api/admin-rest/2022-07/resources/product#get-products
    */

    async _getProductsJSON() {
        let rechargeOnetimes=window.customerDetails.rechargeOnetimes.map((sub)=>{return sub.external_product_id.ecommerce});

        var config = {
            url: `/products.json`,
            method: 'GET',
            timestamp: window.APImanagerKey.timeStamp,
            hash: window.APImanagerKey.key8,
            data: {
                'ids': rechargeOnetimes.toString()
            }
        };
        const response = await fetch(this.shopifyCommonApi(), this.rechargeCommonBody(config));
        const data = await response.json();

        var productsJson = [];
        productsJson = data.products;
        let obj = {};
        productsJson.map((item, i) => {
            obj[item.id] = item;
        });
        productsJson = obj;
        
        // All Shopify Products JSON
        window.customerDetails.shopifyProductsJSON=productsJson;
        if (response.ok) {
            console.log('Products Json ===>',data)
            return await data;
        }else{
            Utility.notification('Something went wrong','Please try again later','error')
            console.error('Error in fetching products JSON===>',data)
            alert('something went wrong');
        }
    }
    
    /**
      Fetch Upcoming Charges 
     * @param {Number|String} - customer_id - Recharge Id of the customer
     * @param {String} - status - possible values : queued , success , refunded , partially_refunded
     
     * @return  {JSON} - data.charges
     
     * For more information : https://developer.rechargepayments.com/2021-11/charges/charge_list
    */
    async _getUpcomingCharges(){
        var config = {
            url: `/charges?customer_id=${window.customerDetails.rechargeCustomerDetails.id} && status=queued`, 
            method: 'GET',
            timestamp: window.APImanagerKey.timeStamp,
            hash: window.APImanagerKey.key9
        };

        const response = await fetch(this.rechargeCommonApi(), this.rechargeCommonBody(config));
        const data = await response.json();
        // Upcoming Charge
        if (response.ok) {
            console.log('Upcoming Charges ===>',data.charges)
            return await data.charges;
        }else{
            Utility.notification('Something went wrong','Please try again later','error')
            console.error('error in fetching upcoming charges ===>',response)
            alert('something went wrong');
        }
    }
    
    /**
      Fetch Delivery Schedule
     * @param {Number|String} - customer_id - Recharge Id of the customer
     * @param {String} - future_interval - default: 90, max=365
     
     * @return  {JSON} - data.deliveries

     *   For more information : https://developer.rechargepayments.com/2021-11/customers/customer_delivery_schedule
    */
    async _getDeliverySchedule(){
        var config = {
            url: `/customers/${window.customerDetails.rechargeCustomerDetails.id}/delivery_schedule?future_interval=365`, 
            method: 'GET',
            timestamp: window.APImanagerKey.timeStamp,
            hash: window.APImanagerKey.key10,
        };

        const response = await fetch(this.rechargeCommonApi(), this.rechargeCommonBody(config));
        const data = await response.json();
        
        // Customer Delivery Schedule
        window.customerDetails.rechargeDeliverySchedule = data.deliveries;
        
        if (response.ok) {
            console.log('Delivery Schedule ===>',data)
            return await data;
        }else{
            Utility.notification('Something went wrong','Error in fetching Delivery Schedule','error')
            console.error('Error in fetching Delivery Schedule ===>',data)
            alert('something went wrong');
        }
    }

    /*

        UPDATE APIs CALLS

    */

    /**
      Change Charge Date
     * @param {Date} - next_charge_date {Format : 'YYYY-MM-DD'} - (Date must be future date)
     
     * @return  {JSON} - data
     
     * For more information : https://developer.rechargepayments.com/2021-11/subscriptions/subscriptions_change_next_charge
    */
    async _changeChargeDate(subscription_id,next_charge_date){
        var config = {
            url: `/subscriptions/${subscription_id}/set_next_charge_date`,
            method: 'POST',
            timestamp: window.APImanagerKey.timeStamp,
            hash: window.APImanagerKey.key11,
            data: {
                'date': next_charge_date
            }
        };

        const response = await fetch(this.rechargeCommonApi(), this.rechargeCommonBody(config));
        const data = await response.json();

        // Updated Charge Date
        if (response.ok) {
            console.log('updated charge date successfully ===>',data)
            return await true;
        }else{
            Utility.notification('Something went wrong','Error in updating charge date','error')
            console.error('error in updating charge date ===>',data)
            alert('something went wrong');
        }
    }


    /**
      Update One-time Addon 

     * @param {Number|String} - addon_id - Addon Id

     * @param {JSON} - addonObj - can be change charge date / Address Id / Price / Quantity
     
     * @return  {JSON} - data
    
     * For more information : https://developer.rechargepayments.com/2021-11/onetimes/onetimes_update
    */
      async _changeChargeDateAddon(addonsList,newChargeDate){
        let promises = [];
        for (let addon of addonsList) {
            var addonObj={
                'commit_update': true,
                'next_charge_scheduled_at': newChargeDate
            }
            var config = {
                url: `/onetimes/${addon.id}`,
                method: 'PUT',
                timestamp: window.APImanagerKey.timeStamp,
                hash: window.APImanagerKey.key12,
                data: addonObj
            };
            promises.push(await fetch(this.rechargeCommonApi(), this.rechargeCommonBody(config)));
        }
        
        const response = await Promise.all(promises);
        if(response){
            return await true;
        }
    }

    /**
      Cancel Subscriptions
     * @param {Number|String} - subscription_id
     * @param {String} - cancellation_reason
     * @param {String} - cancellation_reason_comments 

     
     * @return  {JSON} - data
     
     * For more information : https://developer.rechargepayments.com/2021-11/subscriptions/subscriptions_cancel
    */
    async _cancelSubscription(subscription_id,reason,feedback){
        var config = {
            url: `/subscriptions/${subscription_id}/cancel`,
            method: 'POST',
            timestamp: window.APImanagerKey.timeStamp,
            hash: window.APImanagerKey.key13,
            data: {
                cancellation_reason: reason,
                cancellation_reason_comments: feedback
            }
        };
        const response = await fetch(this.rechargeCommonApi(), this.rechargeCommonBody(config));
        const data = await response.json();

        // Cancelled subscription
        if (response.ok) {
            console.log('Cancel successfully ===>',data)
            return await true;
        }else{
            Utility.notification('Something went wrong','Error in cancelling subscription','error')
            console.error('error in cancelling subscription ===>',data)
            alert('something went wrong');
        }
    }

    /**
      Reactivate Subscriptions
     * @param {Number|String} - subscription_id

     * @return  {JSON} - data
     
     * For more information : https://developer.rechargepayments.com/2021-11/subscriptions/subscriptions_activate
    */

    async _reActivateSubscription(subscription_id){
        var config = {
            url: `/subscriptions/${subscription_id}/activate`,
            method: 'POST',
            timestamp: window.APImanagerKey.timeStamp,
            hash: window.APImanagerKey.key14,
            data: {}
        };

        const response = await fetch(this.rechargeCommonApi(), this.rechargeCommonBody(config));
        const data = await response.json();

        // Reactivate Subscription
        if (response.ok) {
            console.log('Reactivate successfully ===>',data)
            return await true;
        }else{
            Utility.notification('Something went wrong','Error in Reactivating subscription','error')
            console.error('error in Reactivating subscription ===>',data)
            alert('something went wrong');
        }
    }

    /**
      Change Shipping Address

     * @param {Number|String} - addressId 
     * @param {Number|String} - updatedAddressObj - can be change shipping address / Shipping charge / Apply discount / remove discount

      Take reference from : https://developer.rechargepayments.com/2021-11/addresses/update_address

     * @return  {JSON} - data
    */
    async _changeShippingAddress(addressId,updatedAddressObj){
        var config = {
            url: `/addresses/${addressId}`,
            method: 'PUT',
            timestamp: window.APImanagerKey.timeStamp,
            hash: window.APImanagerKey.key15,
            data: updatedAddressObj
        };

        const response = await fetch(this.rechargeCommonApi(), this.rechargeCommonBody(config));
        const data = await response.json();

        // Update shipping address
        if (response.ok) {
            console.log('Address Updated Successfully ===>',data)
            return await true;
        }else if(response.status == 422){
            Utility.notification('Enter Valid Address',data.errors.province,'error')
            console.error('error in updating address ===>',data);
        }else{
            Utility.notification('Something went wrong','Error in Updating address','error')
            console.error('error in updating address ===>',data);
            alert('something went wrong');
        }
    }

    /**
      Update Subscription

     * @param {Number|String} - subscription_id 
     * @param {Number|String} - updateSubscriptionObj - can be change Subscription price / Shipping Frequency / Product / variant

      Take reference from : https://developer.rechargepayments.com/2021-11/subscriptions/subscriptions_update

     * @return  {JSON} - data
      
     *Note*: For changing Subscription Frequency , must need to pass these three parameters : https://d.pr/i/y32aVI 
    */
    async _updateSubscription(subscription_id,updateSubscriptionObj){
        var config = {
            url: `/subscriptions/${subscription_id}`,
            method: 'PUT',
            timestamp: window.APImanagerKey.timeStamp,
            hash: window.APImanagerKey.key16,
            data: updateSubscriptionObj
        };

        const response = await fetch(this.rechargeCommonApi(), this.rechargeCommonBody(config));
        const data = await response.json();

        // Updated subscription
        if (response.ok) {
            console.log('Subscription Updated Successfully ===>',data)
            return await true;
        }else{
            Utility.notification('Something went wrong','Error in Updating subscription','error')
            console.error('error in updating subscription ===>',data)
            alert('something went wrong');
        }
    }

    /**
      Send Mail-Notification For Updating Payment Method to customer

     * @param {Number|String} - Customer Id 
     * @param {String} - type - email
     * @param {String} - template_type - shopify_update_payment_information

      
     For more information : https://developer.rechargepayments.com/2021-11/notifications/notifications_send
    */
    async _updatePaymethodMethod(){
        var config = {
            url: `/customers/${window.customerDetails.rechargeCustomerDetails.id}/notifications`,
            method: 'POST',
            timestamp: window.APImanagerKey.timeStamp,
            hash: window.APImanagerKey.key17,
            data: {
                'type': 'email',
                'template_type': 'shopify_update_payment_information'
            }
        };

        const response = await fetch(this.rechargeCommonApi(), this.rechargeCommonBody(config));

        // Mail Notification
        if (response.ok) {
            console.log('Sent Mail-Notification to the customer ===>',response)
            return await true;
        }else{
            Utility.notification('Something went wrong','Error in sending mail notification','error')
            console.warn('There is some error in sending mail notification===>',response)
            alert('something went wrong');
        }
    }
    /**
      Add One-time Addon

     * @param {JSON} - addonObj - need to pass shopify product id , shopify variant id and address id
     
     *Note* : Add to next charge : https://d.pr/i/tRC129 => if you set the true , then addon date should be added with first upcoming charge date in specified address id
            if you want to set manual charge date then you need to pass : https://d.pr/i/m2vYID , but you can use both these param
     
     * @return  {JSON} - data
    
     * For more information : https://developer.rechargepayments.com/2021-11/onetimes/onetimes_create
    */
    async _createOnetimeAddon(addonObj){
        var config = {
            url: `/onetimes`,
            method: 'POST',
            timestamp: window.APImanagerKey.timeStamp,
            hash: window.APImanagerKey.key18,
            data: addonObj
        };

        const response = await fetch(this.rechargeCommonApi(), this.rechargeCommonBody(config));
        const data = await response.json();

        // Added onetime addon
        if (response.ok) {
            console.log('Addon added Successfully ===>',data)
            return await true;
        }else{
            Utility.notification('Something went wrong','Error in Adding onetime Addon','error')
            console.error('error in adding onetime Addon ===>',data)
            alert('something went wrong');
        }
    }

    /**
      Create subscription product 

     * @param {JSON} - subsDataObj - need to pass shopify product id , address id, frequency, frequency unit, qty
     * @return  {JSON} - data
    
     * For more information : https://developer.rechargepayments.com/2021-11/subscriptions/subscriptions_create
    */
    async _createSubscriptionProduct(subsDataObj){
        var config = {
            url: `/subscriptions`,
            method: 'POST',
            data: subsDataObj
        };

        const response = await fetch(this.rechargeCommonApi(), this.rechargeCommonBody(config));
        const data = await response.json();

        // Added onetime addon
        if (response.ok) {
            console.log('Subscription created Successfully ===>',data)
            return await true;
        }else{
            console.error('error in adding onetime Addon ===>',data)
            alert('something went wrong');
        }
    }

    /**
      Update One-time Addon 

     * @param {Number|String} - addon_id - Addon Id

     * @param {JSON} - addonObj - can be change charge date / Address Id / Price / Quantity
     
     * @return  {JSON} - data
    
     * For more information : https://developer.rechargepayments.com/2021-11/onetimes/onetimes_update
    */
    async _updateOnetimeAddon(addon_id,addonObj){
        var config = {
            url: `/onetimes/${addon_id}`,
            method: 'PUT',
            timestamp: window.APImanagerKey.timeStamp,
            hash: window.APImanagerKey.key19,
            data: addonObj
        };

        const response = await fetch(this.rechargeCommonApi(), this.rechargeCommonBody(config));
        const data = await response.json();

        // Updated onetime addon
        if (response.ok) {
            console.log('updated onetime addon Successfully ===>',data)
            return await true;
        }else{
            Utility.notification('Something went wrong','Error in Updating onetime Addon','error')
            console.error('error in updating onetime Addon ===>',data)
            alert('something went wrong');
        }
    }

    /**
      Remove One-time Addon 

     * @param {Number|String} - addon_id - Addon Id
     
    
     * For more information : https://developer.rechargepayments.com/2021-11/onetimes/onetimes_delete
    */
    async _removeOnetimeAddon(addon_id){
        var config = {
            url: `/onetimes/${addon_id}`,
            method: 'DELETE',
            timestamp: window.APImanagerKey.timeStamp,
            hash: window.APImanagerKey.key20,
        };

        const response = await fetch(this.rechargeCommonApi(), this.rechargeCommonBody(config));

        // Remove onetime addon
        if (response.ok) {
            console.log('Remove Addon Successfully ===>',response)
            return await true;
        }else{
            Utility.notification('Something went wrong','Error in Removing onetime Addon','error')
            console.error('error in Removing Addon ===>',data)
            alert('something went wrong');
        }
    }

    /**
      Remove One-time Addon 

     * @param {JSON} - addonsList - Addon ID Object to delete addons
     
    
     * For more information : https://developer.rechargepayments.com/2021-11/onetimes/onetimes_delete
    */
      async _cancelOnetimeAddon(addonsList){

        let promises = [];
        for (let addon of addonsList) {
            let config = {
                url: `/onetimes/${addon.id}`,
                method: 'DELETE',
                timestamp: window.APImanagerKey.timeStamp,
                hash: window.APImanagerKey.key21,
            };
            
            const response = await fetch(this.rechargeCommonApi(), this.rechargeCommonBody(config));
            promises.push(response);
        };
        
        const response = await Promise.all(promises);
        if(response){
            return await true;
        }
    }

    /**
      List Discounts from recharge
     * For more information : https://developer.rechargepayments.com/2021-11/discounts/discounts_list
    */
      async _getDiscounts(){

        var config = {
            url: `/discounts`, 
            method: 'GET'
        };

        const response = await fetch(this.rechargeCommonApi(), this.rechargeCommonBody(config));
        const data = await response.json();

        // Upcoming Charge
        if (response.ok) {
            console.log('Discounts ===>',data)
            window.customerDetails.rechargeDiscounts=data.discounts;
            return await window.customerDetails.rechargeDiscounts;
        }
        else{
            Utility.notification('Something went wrong','Error in Applying Discount','error')
            console.error('error in Fetching Discount ===>',data)
            alert('something went wrong');
        }
    }

    /**
      Apply Discount on specific Charge 

     * @param {Number|String} - charge_id - Charge Id ( For getting charge id , you need to call _getUpcomingCharges() method )
     * @param {Number|String} - discount_id - or - * @param {String} - discount_code
     
    
     * For more information : https://developer.rechargepayments.com/2021-11/charges/apply_discount
    */
    async _applyDiscountOnCharge(charge_id,discount_id){

        var config = {
            url: `/charges/${charge_id}/apply_discount`, 
            method: 'POST',
            timestamp: window.APImanagerKey.timeStamp,
            hash: window.APImanagerKey.key22,
            data:{
                discount_id
            }
        };

        const response = await fetch(this.rechargeCommonApi(), this.rechargeCommonBody(config));
        const data = await response.json();

        // Upcoming Charge
        if (response.ok) {
            console.log('Apply Discount Successfully ===>',data)
            return await true;
        }else if(response.status == 422 ){
            console.warn('There is an some error in Appling Discount ===>',data)
            alert(data.errors.discount)
        }
        else{
            Utility.notification('Something went wrong','Error in Applying Discount','error')
            console.error('error in Applying Discount ===>',data)
            alert('something went wrong');
        }
    }

    /**
      Retention Strategies

      Take reference from : https://developer.rechargepayments.com/2021-11/retention_strategies/retention_strategies_list

     * @return  {JSON} - data
      
    */
     async _listRetentionStrategies(){
        var config = {
            url: `/retention_strategies`,
            timestamp: window.APImanagerKey.timeStamp,
            hash: window.APImanagerKey.key23,
            method: 'GET'
        };

        const response = await fetch(this.rechargeCommonApi(), this.rechargeCommonBody(config));
        const data = await response.json();

        // Updated subscription
        if (response.ok) {
            console.log('List of Retention Strategies  ===>',data.retention_strategies)
            return await data.retention_strategies;
        }else{
            Utility.notification('Something went wrong','Please try again later','error')
            console.error('error in Listing Retention Strategies ===>',data)
        }
    }

    /**
      Skip a charge

      * @param {Number|String} - charge_id - Charge Id 
      * @param {Number|String} - purchase_id - Subscription Id 

      * For more information : https://developer.rechargepayments.com/2021-11/charges/charge_skip
    */
    async _skipCharge(charge_id, subscription_id){

        var config = {
            url: `/charges/${charge_id}/skip`, 
            method: 'POST',
            timestamp: window.APImanagerKey.timeStamp,
            hash: window.APImanagerKey.key24,
            data:{
                purchase_item_ids: [subscription_id] 
            }
        };

        const response = await fetch(this.rechargeCommonApi(), this.rechargeCommonBody(config));
        const data = await response.json();

        // Skipped a charge
        if (response.ok) {
            console.log('Skipped a charge Successfully ===>',data)
            return await true;
        }else{
            Utility.notification('Something went wrong','Error in skipping charge','error')
            console.error('error in skipping a charge ===>',data)
            alert('something went wrong');
        }
    }

    /**
      Unskip a charge

      * @param {Number|String} - charge_id - Charge Id
      * @param {Number|String} - purchase_id - Subscription Id 

      * For more information : https://developer.rechargepayments.com/2021-11/charges/charge_unskip
    */
      async _unSkipCharge(charge_id, subscription_id){

        var config = {
            url: `/charges/${charge_id}/unskip`, 
            method: 'POST',
            timestamp: window.APImanagerKey.timeStamp,
            hash: window.APImanagerKey.key25,
            data:{
                purchase_item_ids: [subscription_id] 
            }
        };

        const response = await fetch(this.rechargeCommonApi(), this.rechargeCommonBody(config));
        const data = await response.json();

        // Unskipped a charge
        if (response.ok) {
            console.log('Unskipped a charge Successfully ===>',data)
            return await true;
        }else{
            Utility.notification('Something went wrong','Error in unskipping charge','error')
            console.error('error in unskipping a charge ===>',data)
            alert('something went wrong');
        }
    }

    /** *
    * Add New Card 
    * 
    * @param {token} braintree_customer_token
    * @param {braintreeDatas|Object} -  new card details
    **/
    async _addCard(token,braintreeDatas){
        var card_name = braintreeDatas.card_fname.concat(' '+braintreeDatas.card_lname);
        var fetchUrl = 'https://api-manager.praella.app/api/production/payments/braintree/client-token';
        var fetchBraintree = 'https://api-manager.praella.app/api/production/payments/braintree';
        document.querySelector('[data-add-card]').classList.add('loading');
          const config = {
            'customer_id': token
          }
        
        const response = await fetch(fetchUrl, {
            method: 'POST',
            headers: this.header(), 
            body: JSON.stringify(config)
          })
          
        const data = await response.json();
        var _this = this;
        
        if (response.ok) {
            var client = new braintree.api.Client({clientToken: data.clientToken});
            client.tokenizeCard({
              number: braintreeDatas.card_number,
              cardholderName: card_name,
              // You can use either expirationDate
              expirationDate: braintreeDatas.expiration_date,
              // CVV if required
              cvv: braintreeDatas.cvv,
              // Address if AVS is on
              billingAddress: {
                postalCode: braintreeDatas.postal_code
              }
            }, async function (err, nonce) {
                console.log(nonce,'noncenonce')
                // Send nonce to your server
                var customerDetails = window.customerDetails.rechargeCustomerDetails;
                const config = {
                  customer_id: parseInt(customerDetails.braintree_customer_token),
                  payment_method_nonce: nonce,
                  recharge_customer_id: customerDetails.id,
                  default: true,
                  billing_address: {
                    "address1": customerDetails.billing_address1,
                    "address2": customerDetails.billing_address2,
                    "city": customerDetails.billing_city,
                    "company": customerDetails.billing_company,
                    "country": customerDetails.billing_country,
                    "first_name": braintreeDatas.card_fname,
                    "last_name": braintreeDatas.card_lname,
                    "phone": customerDetails.billing_phone,
                    "province": customerDetails.billing_province,
                    "zip": customerDetails.billing_zip
                  }
                }
                const response = await fetch(fetchBraintree, {
                  method: 'POST',
                  headers: _this.header(),
                  body: JSON.stringify(config),
                })
                const data = await response.json();
                if(response.ok){
                  if (data.payment_method_id == null || data.payment_method_id == '' || data.payment_method_id == undefined) { 
                      notificationEle.updateNotification('Error', 'Please add valid card details', {
                        type: 'error',
                        timeout: 3000
                      });
                      document.querySelector('[data-add-card]').classList.remove('loading');
                      return false;
                    } else {
                      document.querySelector('[data-add-card]').classList.remove('loading');
                      notificationEle.updateNotification('Success', 'Your card is added successfully!', {
                        type: 'success',
                        timeout: 3000
                      })
                      document.getElementById("braintreeData").reset();
                      return true;
                    } 
                }else{
                    Utility.notification('Something went wrong','Error in fetching customer details','error')
                    console.error('Error in fetching customer details ===>',data)
                    alert('something went wrong');
                    return false;
                }
              });
        }else{
            console.error('Error:', error);
            return false;
        };
    }
    /*
    
        General Functions

    */

    getUniqueValues(arr){
        return [... new Set(arr)]
    }

    _formatDate(date, format) {
        date = new Date(date);
        var newDate;
        const months = ["January","February","March","April","May","June","July","August","September","October","November","December"];
        var m = date.getMonth();

        var day = date.getDate();
        var month = date.getMonth() + 1;
        var year = date.getFullYear();

        if (format == 'YYYY-MM-DD') {
            newDate = `${year}-${month}-${day}`
            return newDate;
        }

        if (format == 'M DD, YYYY') {
            newDate = `${months[m]} ${day}, ${year}`
            return newDate;
        }

    }
}

var RechargeUtilities = new rechargeUtilities();

