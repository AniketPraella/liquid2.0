const selectors = {
    cartCheckout: document.querySelector('#cart-checkoutbtn'),
    checkoutSticky: document.querySelector('.checkoutbtn-sticky')
};

class templateCartJS {
    constructor() {
        this.stickyCheckout();
    }

    // Sticky checkout container on oage scroll
    stickyCheckout(){
        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if(entry.isIntersecting){
                    selectors.checkoutSticky.classList.remove('active');
                } else {
                    selectors.checkoutSticky.classList.add('active');
                }
            })
        });
            
        observer.observe(selectors.cartCheckout);
    }
}

typeof templateCartJS !== 'undefined' && new templateCartJS();
