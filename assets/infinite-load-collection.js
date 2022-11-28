targetloadmore = document.getElementById('load-more-product');
colproductdataSec = document.getElementById('collection-product-grid-2');
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
    targetloadmore.setAttribute("href", changetargetloadmore);
    if(changetargetloadmore == window.location.href){
        targetloadmore.style.display = 'none';
    }
})


/****************************************
 *********************  

 Collection product sort  

**********************
**************************************/


document.getElementById('sort-by').addEventListener('change', async function(e) {
    e.preventDefault();
    option_value = await getcolprodata(`?sort_by=${e.target.value}`);
  history.pushState({}, '', `?sort_by=${e.target.value}`);
    console.log('option_value ', option_value);
    collectionnewdataparsed = document.createElement('div');
    collectionnewdataparsed.innerHTML = option_value['template-collection-layout-2'];
    collectionnewdataget = collectionnewdataparsed.querySelectorAll('#collection-product-grid-2 .col-12.col-lg-3.col-md-4.col-sm-6');
    console.log('collectionnewdataget ', collectionnewdataget);
    newtargetloadmore = collectionnewdataparsed.querySelector('#load-more-product').href;
    targetloadmore.setAttribute("href", newtargetloadmore);
  targetloadmore.style.display = '';
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
    this.inputall.forEach(button => button.addEventListener('click', this.filterProduct.bind(this)));
  }
  filterProduct(event){
    const clickedInput = event.currentTarget;
    const name = clickedInput.name;
    const value = clickedInput.value;
    if (clickedInput.checked == true || name.includes('price')){
      console.log(name);
      console.log(value);
      if(window.location.href.includes('?') == false){
        history.pushState({}, '', `${window.location.href}?`);
      }
      let currentUrl = window.location.href;
      console.log(currentUrl);
      let newUrl = `${currentUrl}&${name}=${value}`;
      history.pushState({}, '', newUrl);
      if(window.location.href.includes('price') && name.includes('price')){
        let searchparamarray = [];
        let searchparams = new URLSearchParams(window.location.search)
        for (const searchparam of searchparams) {
          console.log(searchparam)
          searchparamarray.push(...searchparam);
        }
        // let updatedUrl = newUrl.replace(`&${name}=${value}`, '');
        // history.pushState({}, '', updatedUrl);
      }
      this.getFilterProductData();
    }else{
      this.removeFilterProduct(name, value);
    }
  }
  removeFilterProduct(name, value){
    console.log(name, value);
    let currentUrl = window.location.href;
    let updatedUrl = currentUrl.replace(`&${name}=${value}`, '');
    history.pushState({}, '', updatedUrl);
    this.getFilterProductData();
  }
  async getFilterProductData(){
    let filterProductData = await getcolprodata(window.location.href);
    console.log('filterProductData ', filterProductData);
    let collectionnewdataparsed = document.createElement('div');
    collectionnewdataparsed.innerHTML = filterProductData['template-collection-layout-2'];
    let collectionnewdataget = collectionnewdataparsed.querySelectorAll('#collection-product-grid-2 .col-12.col-lg-3.col-md-4.col-sm-6');
    console.log('collectionnewdataget ', collectionnewdataget);
    let newtargetloadmore = collectionnewdataparsed.querySelector('#load-more-product');
    if(newtargetloadmore != null){
      let newtargetloadmoreurl = newtargetloadmore.href;
      targetloadmore.setAttribute("href", newtargetloadmoreurl);
    }
    targetloadmore.style.display = '';
    let colproductdata_sec = document.querySelector('#collection-product-grid-2');
    colproductdata_sec.innerHTML = '';
    for(var i=0; i < collectionnewdataget.length; i++){
        colproductdata_sec.append(collectionnewdataget[i]);
        console.log(collectionnewdataget[i]);
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