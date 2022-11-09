// Sticky Header
class StickyHeader extends HTMLElement {
    constructor() {
      super();
    }
  
    /**
     * Calls when Component is Initialized in DOM
     *
     */
    connectedCallback() {
      this.header = document.getElementById('shopify-section-header');
      this.headerBounds = {};
      this.currentScrollTop = 0;
  
      this.onScrollHandler = this.onScroll.bind(this);
  
      window.addEventListener('scroll', this.onScrollHandler, false);
  
      this.createObserver();
    }
  
    /**
     * Calls when Component is removed from DOM
     *
     */
    disconnectedCallback() {
      window.removeEventListener('scroll', this.onScrollHandler);
    }
  
    /**
     * To observe Sticky header visibility on User Scroll
     *
     */
    createObserver() {
      let observer = new IntersectionObserver((entries, observer) => {
        this.headerBounds = entries[0].intersectionRect;
        observer.disconnect();
      });
  
      observer.observe(this.header);
    }
  
    /**
     * Window Scroll event
     *
     */
    onScroll() {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
  
      if (scrollTop > this.currentScrollTop && scrollTop > this.headerBounds.bottom) {
        requestAnimationFrame(this.hide.bind(this));
      } else if (scrollTop < this.currentScrollTop && scrollTop > this.headerBounds.bottom) {
        requestAnimationFrame(this.reveal.bind(this));
      } else if (scrollTop <= this.headerBounds.top) {
        requestAnimationFrame(this.reset.bind(this));
      }
  
      this.currentScrollTop = scrollTop;
    }
  
    /**
     * Hide Sticky header
     * Close Menu Drawer / Seach Modal / Cart Drawer
     *
     */
    hide() {
      this.header.classList.add('shopify-section-header-hidden', 'shopify-section-header-sticky');
      this.closeSearchModal();
      this.closeMenuDropdowns();
    }
  
    /**
     * Show Sticky Header
     *
     */
    reveal() {
      this.header.classList.add('shopify-section-header-sticky', 'animate');
      this.header.classList.remove('shopify-section-header-hidden');
    }
  
    reset() {
      this.header.classList.remove('shopify-section-header-hidden', 'shopify-section-header-sticky', 'animate');
    }
  
    /**
     * Close Search Modal on Window Scroll
     *
     */
    closeSearchModal() {
      this.searchModal = this.searchModal || document.querySelector('search-modal');
      if(!this.searchModal) return;
      this.searchModal.close(false);
    }
  
    /**
     * Close Menu Dropdowns
     *
     */
    closeMenuDropdowns() {
      let openDropdowns = Array.from(document.querySelectorAll('.dropdown.open'));
      openDropdowns.forEach((ele) => {
        ele.classList.remove('open');
      });
    }
  }
  customElements.define('sticky-header', StickyHeader);