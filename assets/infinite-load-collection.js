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
    console.log('collectionprodata ', collectionprodata);
    collectionprodataparsed = document.createElement('div');
    collectionprodataparsed.innerHTML = collectionprodata['template-collection-layout-2']
    console.log("data", collectionprodata['template-collection-layout-2']);
    console.log(collectionprodataparsed);
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




async function getcolprodata(getnewbuttonhref) {
    const result = await fetch(`${getnewbuttonhref}&sections=template-collection-layout-2`);
  
    if (result.status === 200) {
        return result.json();
    }
  
    throw new Error(`Failed to get request, Shopify returned ${result.status} ${result.statusText}`);
  }