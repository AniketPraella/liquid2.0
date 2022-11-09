// Ajax cart JS for Drawer and Cart Page
class quickShop extends HTMLElement {
    constructor() {
      super();

      this.closeBy = this.querySelector('.close-quickshop');
      this.bindEvents();

      if (navigator.platform === 'iPhone') document.documentElement.style.setProperty('--viewport-height', `${window.innerHeight}px`);
    }
  
    /**
     * Escape Click event to close drawer when focused within Cart Drawer
     *
     * @param {event} Event instance
     */
    onKeyUp(event) {
      if(event.code.toUpperCase() !== 'ESCAPE') return;
      this.querySelector('.close-quickshop').dispatchEvent(new Event('click'));
    }

    /**
     * bind click and keyup event to Cart Icons
     * bind keyUp event to Cart drawer component
     * bind Other inside element events
     *
     */
    bindEvents() {
      this.openeBy = document.querySelectorAll('.quickshop--button');
      this.openeBy.forEach(btn => btn.addEventListener('click', this.openQuickShop.bind(this)));
      this.addEventListener('keyup', this.onKeyUp.bind(this));
    }
  
    /**
     * Re-bind events after page load or ajax call
     */
    updateEvents(){
      this.openeBy = document.querySelectorAll('.quickshop--button');
      if(this.openeBy) this.openeBy.forEach(btn => btn.addEventListener('click', this.openQuickShop.bind(this)));
    }

    /**
     * Fetch Product data using handle
     * @param {*} handle 
     */
    async _loadQuickShop(handle){
      let requestURL = `/products/${handle}?view=quickshop&sections=template-product-quickshop`;
      const response = await fetch(requestURL);
      const quickShopData = await response.json();
      return quickShopData['template-product-quickshop'];
    }

    /**
     * Open QuickShop modal and add focus to modal container
     *
     * @param {event} Event instance
     */
    openQuickShop(event) {
      event.preventDefault();
      const _this = event.currentTarget;
      const handle = _this.dataset.handle
      if(!handle) return;
      
      this._loadQuickShop(handle).then(quickShopData => {
        this.innerHTML = quickShopData;
        this.querySelector('.modal').classList.add('open');
        siteOverlay.prototype.showOverlay();

        if(this.querySelector('.product-title')) Utility.forceFocus(this.querySelector('.product-title'));
        this.closeBy = this.querySelector('.close-quickshop');
        if(this.closeBy) this.closeBy.addEventListener('click', this.closeQuickShop.bind(this));
        Utility.trapFocus(this, this.closeBy);

        if(event){
          _this.setAttribute('aria-expanded', true);
        }
      });
    }
  
    /**
     * Open QuickShop and Remove focus from modal container
     *
     * @param {event} Event instance
     */
    closeQuickShop(event, elementToFocus = false) {
      if (event !== undefined) {
        event.preventDefault();
        this.innerHTML = '';
        quickShopSlider = null;
        
        siteOverlay.prototype.hideOverlay();
        let openByEle = document.querySelector('.quickshop--button[aria-expanded="true"]');
        openByEle.setAttribute('aria-expanded', false);
        Utility.removeTrapFocus(elementToFocus);
        Utility.forceFocus(openByEle);
      }
    }
}
customElements.define("quick-shop", quickShop);
  