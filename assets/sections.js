const sectionMethods = {

  _initSection() {
    // console.log('Section Method Loaded');
    document.addEventListener('shopify:section:load', e => { sectionMethods._onSectionLoad(e) });
    document.addEventListener('shopify:section:unload', e => {sectionMethods._onSectionUnload(e) });
    document.addEventListener('shopify:section:select', e => { sectionMethods._onSelect(e) });
    document.addEventListener('shopify:section:deselect', e => { sectionMethods._onDeselect(e) });
    document.addEventListener('shopify:block:select', e => { sectionMethods._onBlockSelect(e) });
    document.addEventListener('shopify:block:deselect', e => { sectionMethods._onBlockDeselect(e) });
  },

  _onSectionLoad: function(e) {
    // console.log('section load', e);
    const sectionId = e.detail.sectionId;
    window.dispatchEvent(new Event('resize'));
  },

  _onSectionUnload: function(e) {
    // console.log('section Unload', e);
    const sectionId = e.detail.sectionId;
  },

  _onSelect: function(e) {
    // console.log('section Select', e);
    const sectionId = e.detail.sectionId;

    switch (sectionId) {
      case 'header': {
        if(window.innerWidth < 1024){
          let burgerMenu = document.getElementById('mobile-menu');
          burgerMenu.dispatchEvent(new Event('click'));
        }
        break;
      }
      case 'newsletter': {
        const $newsletterPopup = document.querySelector('#PopupModal-newsletter .modal');
        if($newsletterPopup){
          $newsletterPopup.classList.add('open');
          siteOverlay.prototype.showOverlay();
        }
        break;
      }
      default: {
        
      }
    }
  },

  _onDeselect: function(e) {
    // console.log('section Deselect', e);
    const sectionId = e.detail.sectionId;

    switch (sectionId) {
      case 'header': {
        if(window.innerWidth < 1024){
          let burgerMenuClose = document.querySelector('.close-mobile--navbar');
          burgerMenuClose.dispatchEvent(new Event('click'));
        }
        break;
      }
      case 'newsletter': {
        const $newsletterPopup = document.querySelector('#PopupModal-newsletter .modal');
        if($newsletterPopup){
          $newsletterPopup.classList.remove('open');
          siteOverlay.prototype.hideOverlay();
        }
        break;
      }
      default: {
        break;
      }
    }
  },

  _onReorder: function(e) {
    // console.log('section Reorder', e);
    const sectionId = e.detail.sectionId;
  },

  _onBlockSelect: function(e) {
    // console.log('block Select', e);
    const sectionId = e.detail.sectionId;
    const blockId = e.detail.blockId;
    let sectionType = null;

    const section = document.querySelector('[data-section-id="'+sectionId+'"]');
    if(section){ sectionType = section.dataset.type || null; }

    switch (sectionType) {
      case 'slider': {
        if(section == null){ return;}
        let slideEle = document.querySelector('[data-block-id="'+blockId+'"]');
        let slideIndex = Array.from(slideEle.parentNode.children).indexOf(slideEle);
        if(slideIndex == null || slideIndex == undefined){ return; }

        let currentSlider = section.querySelector('.swiper-slider');
        let sliderOptions = currentSlider.getAttribute('data-slider');
        sliderOptions = JSON.parse(sliderOptions);
        let swiper = new Swiper(currentSlider, sliderOptions);
        setTimeout(() => {
          swiper.slideTo(slideIndex, 2000, true);
        }, 1000);
        break;
      }
      default: {
        break;
      }
    }
  },

  _onBlockDeselect: function(e) {
    // console.log('block Deselect', e);
    const sectionId = e.detail.sectionId;
  },

};

sectionMethods._initSection();