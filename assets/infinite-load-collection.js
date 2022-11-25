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
    collectionprodataget = collectionprodataparsed.querySelector('#collection-product-grid-2').children;
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
async function getcolprodata(getnewbuttonhref) {
    const result = await fetch(`${getnewbuttonhref}&sections=template-collection-layout-2`);
  
    if (result.status === 200) {
        return result.json();
    }
  
    throw new Error(`Failed to get request, Shopify returned ${result.status} ${result.statusText}`);
  }