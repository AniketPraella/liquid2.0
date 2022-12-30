  var selectedPlan = null ;
  var selectedPlansize = null;
  var allProducts = [];
  var selectedAddons=[];
  var selectedLineItems=[];
  var finalItems =[];
  var addPlan = {};
  var sellingPlanId = null;
  var deliveryDate = null ; 
  class subscriptionFunnel extends HTMLElement {
      constructor() {
        super();
        this.funnel=document.querySelector('subscription-funnel');
        this.domEvents();
      }
      /**
       * Bind Events On page load
      */
      domEvents = () => {
        this.nav_steps = this.querySelectorAll(`[data-nav_step]`);
        this.nav_steps.forEach(button => button.addEventListener('click', this._hideShowSteps.bind(this)));
        // Step 1
        this.mealsPlans = this.querySelectorAll('[data-choosePlan]');
        this.mealsPlans.forEach(button => button.addEventListener('click', this.choosePlan.bind(this)));
        // Step 2
        this.qtyBtns = this.querySelectorAll('select-product [data-qty-btn]');
        this.qtyBtns.forEach(qtyBtn => qtyBtn.addEventListener('click', this.manageQtyBtn.bind(this)));
        this.save_items_btn = this.querySelector('[data-save_items]');
        this.save_items_btn.addEventListener('click',this._saveItems.bind(this))
        // Step 3
        this.qtyAddonBtns = this.querySelectorAll('select-addons [data-qty-btn]');
        this.qtyAddonBtns.forEach(qtyBtn => qtyBtn.addEventListener('click', this.manageQtyAddonBtn.bind(this)));
        this.addon_btn=this.querySelector('[data-save_addon]');
        this.addon_btn.addEventListener('click',this._saveAddons.bind(this));
        // Step 4
        this.add_to_cart=this.querySelector('[data-add_to_cart]');
        this.add_to_cart.addEventListener('click',this.addToCart.bind(this));
        this.delivery_date_input=this.querySelector('[data-date_input]');
        this.delivery_date_input.addEventListener('change',this.saveDeliveryDate.bind(this));
        this.remove_sidebar_pro = this.querySelectorAll('[data-remove-item]');
        this.remove_sidebar_pro.forEach(button => button.addEventListener('click', this.removeItem.bind(this)));
      }
      /***** Step 1  *****/
      /**
      * Choose plan and goto next step
      * @param {event} event 
      */
      choosePlan = (event) => {
          event.preventDefault();
          event.stopImmediatePropagation();
          let nextStep = this._findNextStep(event);
          let selectedProId = event.target.closest('[data-choosePlan]').getAttribute('data-planProId');
          sellingPlanId = event.target.closest('[data-choosePlan]').getAttribute('data-sellingPlanId')
          selectedPlansize = parseInt(event.target.closest('[data-choosePlan]').getAttribute('data-planSize'));
          this.querySelector('[data-nav-subscription_breadcrumbs]').classList.remove('d-none');
          let planJson = this.querySelector(`select-plan [data-selected_planId="${selectedProId}"]`).innerHTML
          selectedPlan = JSON.parse(planJson);
          this.displayStep(nextStep);
          this.manageBreadcrumbs(nextStep);
          this._manageSelection(event,nextStep-1);
          this.clearAllItems();
      }
      /***** end step 1 methods*****/
    /***** Step 2 Methods *****/
    /**
     * Manage Normal product qty
     *
     * @param {event} Event instance
    */
    manageQtyBtn(event) {
      event.preventDefault();
      event.stopImmediatePropagation();
      let currentTarget = event.currentTarget;
      let action = currentTarget.dataset.for || 'increase';
      let $qtyInput = currentTarget.closest('[data-qty-container]').querySelector('[data-qty-input]');
      let currentQty = parseInt($qtyInput.value) || 0;
      let finalQty =  $qtyInput.value;
      var qtyToadd = 1 ; 
      this.querySelectorAll('.choose-plan-products [data-qty-input]').forEach ( ele => {
        qtyToadd += parseInt(ele.value);
      }) 
      if(action == 'decrease' && currentQty < 1){
        return false;
      }else if(action == 'decrease'){
        finalQty = currentQty - 1;
      }
      else if( qtyToadd <=  parseInt(selectedPlansize)){
        finalQty = currentQty + 1;
      }
      else{
        this.snotify('error',`You can add only ${qtyToadd - 1} products`,'')
      }
      let product_id=currentTarget.closest('[data-qty-container]').getAttribute('data-qty-container')
      currentTarget.closest('[data-selector]').querySelectorAll(`[data-qty-container="${product_id}"]`).forEach(ele => {
        ele.querySelector('input').value=finalQty;
      });
      this.manageSideBarProduct();
      this.displaySidebarSummary();
      //code to toggle container in mobile
      if(!this.querySelector('.accordion__container').classList.contains('open')){
        this.querySelector('.accordion__container a.accordion__toggle').click();
      }
    }
    /**
     * 
     * @param {productId } - productId of selected products
     * @param { qty } - qty of selected product
    */
    manageSideBarProduct = () => {
        var productJson=null;
        var selected_product=null;
        allProducts = [];
        this.querySelectorAll('select-product [data-ProductJson]').forEach(element => {
            productJson =  element.innerHTML;
            selected_product = JSON.parse(productJson);
            selected_product['quantity'] =  parseInt(this.querySelector(`select-product [data-qty-input][data-productid="${selected_product.id}"]`).value)  || 0 ;
            allProducts.push(selected_product);
        });
    }
    /**
     * sideBar summary display dynamic HTMl
     */
    displaySidebarSummary = () => {
      let selected_product_wrapper = this.querySelector('[data-selectedProducts]');
      let selectedMealCount=0;
      selected_product_wrapper.innerHTML = '';
      allProducts.forEach( pro => {
        if(pro.quantity > 0 ){
          selected_product_wrapper.innerHTML += `
          <div class="d-flex align-items-center justify-content-between" data-qty-container="${pro.id}">
          <div class="quantity-wrapper d-flex flex-column" >
              <label for="Quantity" class="d-none" title="${pro.title}"></label>
              <div class="input-group input-group-sm">
                <div class="input-group-prepend">
                  <a href="#" class="input-group-text" rel="nofollow" aria-label="quantity-minus" title="quantity-minus" data-for="decrease" data-qty-btn>
                    <span class="btn-decrease"><span class="icon-minus"></span></span>
                    <span class="visually-hidden">quantity-minus</span>
                  </a>
                </div>
                <input type="number"  name="quantity" aria-label="Quantity"
                    value="${pro.quantity}" step="1" min="0"
                    inputmode="numeric" data-qty-input class="quantity form-control text-center border-0 ps-lg-3 p-0 ms-0"  readonly>
                <div class="input-group-append m-0">
                  <a href="#" class="input-group-text" rel="nofollow" aria-label="quantity-plus" title="quantity-plus" data-for="increase" data-qty-btn>
                    <span class="btn-increase"><span class="icon-plus"></span></span>
                    <span class="visually-hidden">quantity-plus</span>
                  </a>
                </div>
              </div>
            </div>
            <h6> ${pro.title} </h6>
            <div class="pro_image">
            <img src="${pro.featured_image}" class="w-100" alt="" loading="lazy" width="20" height="20"/>
            </div>
            <div>
                <a href="#" data-productId="${pro.id}" data-remove-item data-qty="${pro.quantity}">
                <i class="icon-close"></i>
                </a>
            </div>
        </div>
          `
          selectedMealCount+=pro.quantity;
        }
      })
      this.querySelector('[data-selectedProductCount]').innerHTML = `${selectedPlansize - selectedMealCount }+` ;
      if (selectedMealCount < selectedPlansize) {
        this.querySelector('[data-planselectionMsg]').classList.remove('d-none');
        this.querySelector('[data-save_items]').classList.remove('disabled');
        this.querySelector('[data-save_items]').classList.add('disabled');
      }else{
        this.querySelector('[data-planselectionMsg]').classList.add('d-none');
        this.querySelector('[data-save_items]').classList.remove('disabled');
      }
      this.domEvents();
    }
    /**
       * Remove Item from selected list of products
       *
       * @param {event} Event instance
    */
    removeItem(event) {
      event.preventDefault();
      event.stopImmediatePropagation()
      let currentTarget=event.target;
      let product_id=currentTarget.closest('[data-productid').getAttribute('data-productid')
      this.funnel.querySelectorAll(`[data-qty-container="${product_id}"]`).forEach(ele => {
        ele.querySelector('input').value=0;
      });
       this.manageSideBarProduct();
       this.displaySidebarSummary();
    }
    /**
     * Clear all selected products
     *
     * @param {event} Event instance
    */
    clearAllItems() {
      this.funnel.querySelectorAll(`[data-qty-container`).forEach(ele => {
        ele.querySelector('input').value=0;
      });
      this.manageSideBarProduct();
      this.displaySidebarSummary();
    }
    _saveItems(event){
      let nextStep=this._findNextStep(event);
      this.displayStep(nextStep);
    }
    /***** end Step 2 Methods *****/
      /***** step 3 methods *****/
       /**
       * Manage Addon Qty
       *
       * @param {event} Event instance
      */
      manageQtyAddonBtn(event) {
        event.preventDefault();
        event.stopImmediatePropagation();
        let currentTarget = event.currentTarget;
        let action = currentTarget.dataset.for || 'increase';
        let $qtyInput = currentTarget.closest('[data-qty-container]').querySelector('[data-qty-input]');
        let currentQty = parseInt($qtyInput.value) || 0;
        let finalQty =  $qtyInput.value;

        if(action == 'decrease' && currentQty < 1){
          return false;
        }else if(action == 'decrease'){
          finalQty = currentQty - 1;
        }
        else{
          finalQty = currentQty + 1;
        }
        $qtyInput.value=finalQty
      }
      /**
       * Add The addons in array for adding to cart
       * @param {Event} event 
      */
      _saveAddons(event){
        event.preventDefault();
        event.stopImmediatePropagation();
        selectedAddons=[];
        this.funnel.querySelectorAll('select-addons [data-product-grid]').forEach(ele => {
          let qty=parseInt(ele.querySelector('[data-qty-container] input').value);
          let variant_json = JSON.parse(ele.querySelector(`[data-product-grid] [data-variantJSON]`).innerHTML);
          if (qty > 0) {
            variant_json[0]['quantity']=qty;
            selectedAddons.push(variant_json[0]);
          }
        });
        let nextStep=this._findNextStep(event);
        this.displayStep(nextStep);
        this._displaySummary();
      }
      /***** end Step 3 methods *****/
      /***** step 4 methods *****/
      /**
       * Display Box summary
      */
      _displaySummary = () => {
        let properties = {} ;
        this.initDatePicker();
        this.querySelector('[data-productsSelected] [data-selectedProductDetails]').innerHTML = '';
        this.querySelector('[data-addons] [data-addonDetails]').innerHTML = '';
        this.querySelector('[data-summaryDetails] [data-productDetails] [data-productTitle]').innerHTML = `${selectedPlan.title}`
        this.querySelector('[data-add_to_cart]').classList.add('disabled');
        this.querySelector('[data-summaryDetails] [data-proPrice]').innerHTML = `${Shopify.formatMoney(selectedPlan.price, window.globalVariables.money_format)}`;
        allProducts.forEach( (item , i ) => {
          if(item.quantity > 0){
            this.querySelector('[data-productsSelected] [data-selectedProductDetails]').innerHTML += `<p class="mb-0">${item.quantity} * ${item.title} </p>`
          }
          properties[`item_${i}`] = `${item.title}--${item.quantity}--${item.id}`
        })
        let totalPrice=selectedPlan.price;;
        selectedAddons.forEach( item => {
          totalPrice+=item.price*item.quantity;
          this.querySelector('[data-addons] [data-addonDetails]').innerHTML += `<div class="d-flex justify-content-between"><p class="mb-0" >${item.quantity}*${item.name}</p><p class="mb-0">${Shopify.formatMoney(item.price*item.quantity, window.globalVariables.money_format)}</p></div>`
        })
        this.funnel.querySelector('[data-totalPrice]').innerHTML=Shopify.formatMoney(totalPrice, window.globalVariables.money_format)
      }
      /**
       * flat pickr datepicker 
      */
      initDatePicker = () => {
        this.querySelector('[data-date_input]').flatpickr(minDate: "today");
      }
      /**
       * Adding Products to cart
       * @param {event} event 
       */
      addToCart = (event) => {
        event.preventDefault();
        event.stopImmediatePropagation();
        this._prepareArray();
        event.target.closest('.btn').classList.add('loading')
        let formData = {
          'items': finalItems,
          "attributes": {"delivery_date": deliveryDate}
         };
         fetch('/cart/add.js', {
           method: 'POST',
           headers: {
             'Content-Type': 'application/json'
           },
           body: JSON.stringify(formData)
         })
         .then(response => {
           return response.json();
         }).then( data => {
            window.location.href="/cart";
            console.log(data)
         }) 
         .catch((error) => {
           console.error('Error:', error);
         });
      }
      _prepareArray(){
        let properties={};
        allProducts.forEach( (item , i ) => {
          properties[`item_${i}`] = `${item.title}--${item.quantity}--${item.id}`
        })
        let obj = {
          quantity:1,
          id: selectedPlan.variants[0].id,
          selling_plan:parseInt(sellingPlanId),
          properties:properties
        }
        finalItems.push(obj);
        selectedAddons.forEach(item => {
          let tempObj={
            id:item.id,
            quantity:item.quantity,
            properties: {'_product_type': "addon"}
          }
          finalItems.push(tempObj)
        });
      }
      /**
       * Save delivery date to global variable
       * @param { event }  
       */
      saveDeliveryDate = (event) => {
        deliveryDate = event.target.closest('[data-deliveryDate]').value;
        this.querySelector('[data-add_to_cart]').classList.remove('disabled');
      }
      /***** end Step 4 methods *****/
      /***** General methods *****/
      _findNextStep(event){
        return parseInt(event.target.closest('[data-selector]').querySelector('[data-next_selector]').getAttribute('data-next_selector'))
      }
      /**
       * 
       * @param {index} - step index to be dispalyed 
       */    
      displayStep = (index) => {
        this.querySelectorAll('[data-selector]').forEach ( ele => {
          ele.classList.add('d-none');
        }) 
        this.querySelector(`[data-selector = "${index}"]`).classList.remove('d-none');
      }
      /**
       * Manage a breadcrumbs based on selected steps
       * @param {active_ste} = Active step index 
      */
      manageBreadcrumbs = (active_step) => {
        this.querySelectorAll(`.breadcrumbs-funnel [data-nav_step]`).forEach(ele => {
          let step=parseInt(ele.getAttribute('data-nav_step'))
          active_step=parseInt(active_step)
          if (step+1 > active_step){
            ele.classList.remove('active-step');
          }
        })
         this.querySelector(`.breadcrumbs-funnel [data-nav_step="${active_step}"]`).classList.add('active-step');
      }
      /**
       * Go back to previous step
       * @param {*} event 
       */
      _hideShowSteps = (event) => {
        event.preventDefault();
        event.stopImmediatePropagation();
        let stepNumber = parseInt(event.target.closest('[data-nav_step]').getAttribute('data-nav_step'));
        this.displayStep(stepNumber);
      }
      /**
       * Notifications
       * @param {success | error} type 
       * @param {string} title 
       * @param {string} body 
       */
      snotify=(type,title, body)=>{
        window.notificationEle.updateNotification(title, body, {
          type: type,
          timeout: 2000
          });
      }
      /**
       * Add Selected class on the user selection
       * @param {event} event 
       * @param {number} currentStep 
       */
      _manageSelection(event,currentStep){
        this.querySelectorAll(`[data-selector="${currentStep}"] .selected`).forEach(ele => {
          ele.classList.remove('selected')
        });
        event.target.closest('[data-selection-box]').classList.add('selected');
      }
  }
  customElements.define("subscription-funnel", subscriptionFunnel);
