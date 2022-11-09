const selectors = {
    productContainer: document.querySelector('.product-details-wrapper'),
    productMedia: document.querySelector('[data-productMedia]')
  };

  const mediaJSON = JSON.parse(selectors.productMedia.innerHTML);
  window.productMedia = mediaJSON;
  class TemplateProductJS {
    constructor() {
      // Custom code for product page goes here
    }
}

typeof TemplateProductJS !== 'undefined' && new TemplateProductJS();
