targetloadmore = document.getElementById('load-more-product');
colproductdataSec = document.getElementById('collection-product-grid-2');
if(targetloadmore != null){
    if(targetloadmore.href == window.location.href){
        targetloadmore.style.display = 'none';
    }
 
targetloadmore.addEventListener('click', async (event)=>{
    event.preventDefault();
    getnewbutton = event.currentTarget;
    console.log('getnewbutton ', getnewbutton)
    getnewbuttonhref = getnewbutton.href;
    console.log('getnewbuttonhref ', getnewbuttonhref)
    collectionprodata = await getcolprodata(getnewbuttonhref);
  history.pushState({}, '', getnewbuttonhref);
    console.log('collectionprodata ', collectionprodata);
    collectionprodataparsed = document.createElement('div');
    collectionprodataparsed.innerHTML = collectionprodata['template-collection-layout-2']
    // console.log("data", collectionprodata['template-collection-layout-2']);
    // console.log(collectionprodataparsed);
    collectionprodataget = collectionprodataparsed.querySelector('#collection-product-grid-2');
    collectionprodataget = collectionprodataget.querySelectorAll('.col-12.col-lg-3.col-md-4.col-sm-6');
    changetargetloadmore = collectionprodataparsed.querySelector('#load-more-product').href;
    console.log('changetargetloadmore ', changetargetloadmore);
    console.log('collectionprodataget ', collectionprodataget);
    for(var i=0; i < collectionprodataget.length; i++){
        colproductdataSec.append(collectionprodataget[i]);
        console.log(collectionprodataget[i]);
    }
    if(targetloadmore != null){
      targetloadmore.setAttribute("href", changetargetloadmore);
      if(changetargetloadmore == window.location.href){
          targetloadmore.style.display = 'none';
      }
    }
    
})
 }

/****************************************
 *********************  

 Collection product sort  

**********************
**************************************/


document.getElementById('sort-by').addEventListener('change', async function(e) {
    e.preventDefault();
    let searchparams = new URLSearchParams(window.location.search);
    let searchparamsvalue = searchparams.get('sort_by');
    if(window.location.href.includes('?') == false){
      history.pushState({}, '', `${window.location.href}?`);
    }
    if(searchparamsvalue != null){
      let currentUrl = window.location.href;
      let updatedUrl = currentUrl.replace(`&sort_by=${searchparamsvalue}`, `&sort_by=${e.target.value}`);
      history.pushState({}, '', updatedUrl);
      console.log('updatedUrl', updatedUrl);
    }else{
      let currentUrl = window.location.href;
      history.pushState({}, '', `${currentUrl}&sort_by=${e.target.value}`);
    }
    
    option_value = await getcolprodata(`${window.location.href}`);
    console.log('option_value ', option_value);
    collectionnewdataparsed = document.createElement('div');
    collectionnewdataparsed.innerHTML = option_value['template-collection-layout-2'];
    collectionnewdataget = collectionnewdataparsed.querySelectorAll('#collection-product-grid-2 .col-12.col-lg-3.col-md-4.col-sm-6');
    console.log('collectionnewdataget ', collectionnewdataget);
    newtargetloadmore = collectionnewdataparsed.querySelector('#load-more-product').href;
    if(targetloadmore != null){
      targetloadmore.setAttribute("href", newtargetloadmore);
      targetloadmore.style.display = '';
    }
    
    colproductdata_sec = document.querySelector('#collection-product-grid-2');
    colproductdata_sec.innerHTML = '';
    for(var i=0; i < collectionnewdataget.length; i++){
        colproductdata_sec.append(collectionnewdataget[i]);
        console.log(collectionnewdataget[i]);
    }
})


/****************************************
 *********************  

 Collection product sort  END
 
**********************
**************************************/


/****************************************
 *********************  

 Collection product Filter
 
**********************
**************************************/


class myProductFilter extends HTMLElement {
  constructor() {
    super();
    this.inputall = this.querySelectorAll('input');
    console.log(this.inputall);
    // this.printFilterLable();
    this.checkActiveFilters();
    this.inputall.forEach(button => button.addEventListener('change', this.filterProduct.bind(this)));
  }
  filterProduct(event){
    const clickedInput = event.currentTarget;
    const name = clickedInput.name;
    const value = clickedInput.value;
    if(window.location.href.includes('?') == false){
      history.pushState({}, '', `${window.location.href}?`);
    }
    if (clickedInput.checked == true && name.includes('availability')) {
      console.log(name);
      console.log(value);
      let currentUrl = window.location.href;
      console.log(currentUrl);
      let newUrl = `${currentUrl}&${name}=${value}`;
      history.pushState({}, '', newUrl);
      console.log('newUrl', newUrl);
      this.getFilterProductData();

      // for tag filter
    }else if(clickedInput.checked == true && name.includes('constraint')){
      let searchparams = new URLSearchParams(window.location.search);
      let searchparamsvalue = searchparams.get(name);
      if(searchparamsvalue != null){
        let currentUrl = window.location.href;
        console.log(currentUrl);
        let updatedUrl = currentUrl.replace(`&${name}=${searchparamsvalue}`, `&${name}=${searchparamsvalue}+${value}`);
        history.pushState({}, '', updatedUrl);
        console.log('updatedUrl', updatedUrl);
      }else{
        let currentUrl = window.location.href;
        console.log(currentUrl);
        let newUrl = `${currentUrl}&${name}=${value}`;
        history.pushState({}, '', newUrl);
        console.log('newUrl', newUrl);
      }
      this.getFilterProductData();
      
      // for price filter
    }else if(name.includes('price')){
      let price_range_min_value = document.getElementById('price_range_min_value');
      let price_range_max_value = document.getElementById('price_range_max_value');
      let min_price_value = 'filter.v.price.gte';
      let max_price_value = 'filter.v.price.lte';
      let searchparams = new URLSearchParams(window.location.search);
      let searchparamsvalue = searchparams.get(name);
      if(searchparamsvalue != null){
        let updatedUrl = window.location.href.replace(`&${name}=${searchparamsvalue}`, '');
        history.pushState({}, '', updatedUrl);
      }

      let currentUrl = window.location.href;
      console.log(currentUrl);
      let newUrl = `${currentUrl}&${name}=${value}`;
      history.pushState({}, '', newUrl);
      if(name == min_price_value){
        price_range_min_value.innerHTML = value;
      }
      if(name == max_price_value){
        price_range_max_value.innerHTML = value;
      }
      console.log('newUrl', newUrl);
      this.getFilterProductData();

    }else{
      this.removeFilterProduct(name, value);
    }
  }

  /*
  printFilterLable(){
    let printFilterLableDiv = document.getElementById('filtered-data');
    printFilterLableDiv.innerHTML = '';
    let searchparams = new URLSearchParams(window.location.search);
    let searchparamsentries = searchparams.entries();
    let searchparamsentriesobject = Object.fromEntries(searchparamsentries);
    for (let x in searchparamsentriesobject) {
      printFilterLableDiv.innerHTML += `<span>${searchparamsentriesobject[x]}</span>`;
    };
  }
  */

  checkActiveFilters(){
    let printFilterLableDiv = document.getElementById('filtered-data');
    let inputall = document.querySelectorAll('myproduct-filter input');
    printFilterLableDiv.innerHTML = '';
    console.log('checkActiveFilters ', inputall);
    inputall.forEach((item)=>{
      if(item.checked == true){
        console.log('item.checked ', item.checked)
        let itemValue = item.getAttribute('data-filter-label');
        printFilterLableDiv.innerHTML += `<span>${itemValue}<span class="icon-close"></span></span>`;
      }
    })
    let searchparams = new URLSearchParams(window.location.search);
    let min_price_value = 'filter.v.price.gte';
    let max_price_value = 'filter.v.price.lte';
    let searchparamsvaluemin = searchparams.get(min_price_value);
    let searchparamsvaluemax = searchparams.get(max_price_value);
    let maxvalue = document.querySelector('.range-max').getAttribute('max');
    let minvalue = document.querySelector('.range-min').getAttribute('min');
    let store_currency_symbol = document.querySelector('.range-min').getAttribute('store-currency-symbol');

    if(searchparams != '' && window.location.search.includes('filter.v.price')){
      if(searchparamsvaluemax == null && searchparamsvaluemin == null){
        printFilterLableDiv.innerHTML += `<span>${store_currency_symbol}${minvalue} - ${store_currency_symbol}${maxvalue}<span class="icon-close"></span></span>`;
      }else if(searchparamsvaluemax == null){
        printFilterLableDiv.innerHTML += `<span>${store_currency_symbol}${searchparamsvaluemin} - ${store_currency_symbol}${maxvalue}<span class="icon-close"></span></span>`;
      }else if(searchparamsvaluemin == null){
        printFilterLableDiv.innerHTML += `<span>${store_currency_symbol}${minvalue} - ${store_currency_symbol}${searchparamsvaluemax}<span class="icon-close"></span></span>`;
      }else{
        printFilterLableDiv.innerHTML += `<span>${store_currency_symbol}${searchparamsvaluemin} - ${store_currency_symbol}${searchparamsvaluemax}<span class="icon-close"></span></span>`;
      }
    }
  }

  removeFilterProduct(name, value){
    console.log(name, value);
    let currentUrl = window.location.href;
    if(currentUrl.includes(`${value}+`)){
      let updatedUrl = currentUrl.replace(`${value}+`, '');
      history.pushState({}, '', updatedUrl);
    }else if(currentUrl.includes('+')){
      let updatedUrl = currentUrl.replace(`+${value}`, '');
      history.pushState({}, '', updatedUrl);
    }else{
      let updatedUrl = currentUrl.replace(`&${name}=${value}`, '');
      history.pushState({}, '', updatedUrl);
    }
    this.getFilterProductData();
  }
  async getFilterProductData(){
    let filterProductData = await getcolprodata(window.location.href);
    let collectionnewdataparsed = document.createElement('div');
    collectionnewdataparsed.innerHTML = filterProductData['template-collection-layout-2'];
    let collectionnewdataget = collectionnewdataparsed.querySelectorAll('#collection-product-grid-2 .col-12.col-lg-3.col-md-4.col-sm-6');
    let newtargetloadmore = collectionnewdataparsed.querySelector('#load-more-product');
    if(newtargetloadmore != null){
      let newtargetloadmoreurl = newtargetloadmore.href;
      if(targetloadmore != null){
        targetloadmore.setAttribute("href", newtargetloadmoreurl);
      }
      
    }
    if(targetloadmore != null){
      targetloadmore.style.display = '';
    }
    let colproductdata_sec = document.querySelector('#collection-product-grid-2');
    colproductdata_sec.innerHTML = '';
    for(var i=0; i < collectionnewdataget.length; i++){
        colproductdata_sec.append(collectionnewdataget[i]);
    }
  }
}
customElements.define("myproduct-filter", myProductFilter);


/****************************************
 *********************  

 Collection product Filter  END
 
**********************
**************************************/




async function getcolprodata(getnewbuttonhref) {
    const result = await fetch(`${getnewbuttonhref}&sections=template-collection-layout-2`);
  
    if (result.status === 200) {
        return result.json();
    }
  
    throw new Error(`Failed to get request, Shopify returned ${result.status} ${result.statusText}`);
  }