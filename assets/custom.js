/*
const customSelectors = {};
class customJS {
    constructor() {
    }
}

typeof customJS !== 'undefined' && new customJS();
*/
colproductdataSec = document.getElementById('collection-product-grid-2') || null;
if (colproductdataSec){
colproductdataSec.addEventListener('click', (e)=>{
    var quickshopLayout2 =  document.querySelectorAll('.quickshop-layout2') || null;
    console.log('quickshopLayout2 ', quickshopLayout2);
    console.log('event.Target ', e.target);
if (quickshopLayout2 != null){
    console.log('pas');
    if(e.target.className.includes('icon-quickview') || e.target.className.includes('quickshop-layout2')){
    // quickshopLayout2.forEach(quickbtn => quickbtn.addEventListener('click', (event)=>{
        // event.preventDefault();
        phandleelement = e.target;
        console.log('phandleelement', phandleelement);
        phandle = phandleelement.getAttribute('data-handle') || phandleelement.closest('.quickshop-layout2').getAttribute('data-handle');
        console.log('phandle', phandle);
        loadquickshopLayout2(phandle).then(quickShopDataLayout2 =>{
            targetquickshop = document.querySelector('quick-shop');
            targetquickshop.innerHTML = quickShopDataLayout2;
            siteOverlay.prototype.showOverlay();
            document.querySelector('quick-shop .modal').classList.add('open');
            closequickshopl2 = document.querySelector('quick-shop .close-quickshop') || null;
            closequickshopfun(closequickshopl2);
        });
    }
}
    // ));

    function closequickshopfun(closequickshopl2){
        closequickshopl2.addEventListener('click', (event)=>{
            event.preventDefault();
            targetquickshop = document.querySelector('quick-shop');
            targetquickshop.innerHTML = '';
            siteOverlay.prototype.hideOverlay();
        })
    }

})
}

/*
let quickshopLayout2 =  document.querySelectorAll('.quickshop-layout2') || null;
if (quickshopLayout2 != null){
    quickshopLayout2.forEach(quickbtn => quickbtn.addEventListener('click', (event)=>{
        event.preventDefault();
        phandleelement = event.currentTarget;
        console.log('phandleelement', phandleelement);
        phandle = phandleelement.getAttribute('data-handle');
        console.log('phandle', phandle);
        loadquickshopLayout2(phandle).then(quickShopDataLayout2 =>{
            targetquickshop = document.querySelector('quick-shop');
            targetquickshop.innerHTML = quickShopDataLayout2;
            siteOverlay.prototype.showOverlay();
            document.querySelector('quick-shop .modal').classList.add('open');
            closequickshopl2 = document.querySelector('quick-shop .close-quickshop') || null;
            closequickshopfun(closequickshopl2);
        });
    }
    ));

    function closequickshopfun(closequickshopl2){
        closequickshopl2.addEventListener('click', (event)=>{
            event.preventDefault();
            targetquickshop = document.querySelector('quick-shop');
            targetquickshop.innerHTML = '';
            siteOverlay.prototype.hideOverlay();
        })
    }
}
*/

async function loadquickshopLayout2(handle){
    let requestURL = `/products/${handle}?view=quickshop&sections=template-product-quickshop`;
    const response = await fetch(requestURL);
    const quickShopDataLayout2 = await response.json();
    return quickShopDataLayout2['template-product-quickshop'];
}


class faqAccordian extends HTMLElement {
  constructor() {
    super();
    this.faqaccordian_toggle = this.querySelectorAll('.faqaccordian_toggle');
    this.faqaccordian_toggle.forEach(button => button.addEventListener('click', this.toggleAccordion.bind(this)));
  }
  toggleAccordion(event){
    console.log(event.currentTarget);
    const toggleButton = event.currentTarget;
    const toggleButtonContainer = toggleButton.closest('.faqaccordian_container');
    const toggleButtonContainerContent = toggleButtonContainer.querySelector('.faqaccordian_toggle_content');
    console.log(toggleOpenCondition);
      if(toggleButtonContainerContent.classList.contains('d-none')){
        toggleButtonContainerContent.classList.remove('d-none');
      }else{
        toggleButtonContainerContent.classList.add('d-none');
      }
  }
}
customElements.define("faq-accordian", faqAccordian);
