/*
const customSelectors = {};
class customJS {
    constructor() {
    }
}

typeof customJS !== 'undefined' && new customJS();
*/
colproductdataSec.addEventListener('click', (e)=>{
    var quickshopLayout2 =  document.querySelectorAll('.quickshop-layout2') || null;
    console.log('quickshopLayout2 ', quickshopLayout2);
    console.log('event.currentTarget ', e.target);
if (quickshopLayout2 != null){
    console.log('pas');
    quickshopLayout2.forEach(quickbtn => quickbtn.addEventListener('click', (event)=>{
        // event.preventDefault();
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
e.stopPropagation();
})

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
