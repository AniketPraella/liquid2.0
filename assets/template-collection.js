const selectors = {
    readMoreBtn: document.querySelector('[data-readMoreBtn]'),
    readMoreContainer: document.querySelector('[data-readMoreContainer]')
  };
  class templateCollectionJS {
    constructor() {
        this.readMore();
    }

    // Read More and Read Less
    readMore(){
        if(selectors.readMoreBtn){
            selectors.readMoreBtn.addEventListener('click', (e)=>{
                e.preventDefault();
                let currentTarget = e.target;
                let readMoreEle = selectors.readMoreContainer.querySelector('.hidden-text');
                if(readMoreEle){ 
                    if(selectors.readMoreContainer.classList.contains('open')){
                        Utility.toggleElement(selectors.readMoreContainer, 'close');
                        currentTarget.innerHTML = 'Read More'
                    }else{
                        Utility.toggleElement(selectors.readMoreContainer, 'open');
                        currentTarget.innerHTML = 'Read Less'
                    }
                }
            });
        }
    }
}

typeof templateCollectionJS !== 'undefined' && new templateCollectionJS();

 