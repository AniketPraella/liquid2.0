const selectors = {
    searchSortBy: document.querySelectorAll('[data-sortby] [name="sort_by"]')
};
class TemplateSearchJS {
    constructor() {
      // Custom code for product page goes here
      if(selectors.searchSortBy){
        selectors.searchSortBy.forEach((input) =>{
            input.addEventListener('change', (_event)=>{
                let selectedRadio = document.querySelector('[data-sortby] [name="sort_by"]:checked');
                let urlHref = Utility.replaceUrlParam(window.location.href, 'sort_by', selectedRadio.value);
                window.location.href = urlHref;
            });
        });
      }
    }
}

typeof TemplateSearchJS !== 'undefined' && new TemplateSearchJS();