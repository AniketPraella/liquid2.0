class CollectionFilters extends HTMLElement {
  constructor() {
    super();
    this.accordionType = this.dataset.accordiontype;
    this.filterParent = this.closest('#filtersCollapse');
    this.onActiveFilterClick = this.onActiveFilterClick.bind(this);
    this.filterForm = this.querySelector('form');
    this.quickshop = document.querySelector('quick-shop');
    this.filterType = this.dataset.filtertype;

    const toggleBtns = this.querySelectorAll('.filter__toggle');
    toggleBtns.forEach(button => button.addEventListener('click', this.toggleFilterBlock.bind(this)));

    /*********** Open Drawer on Filter or SortBy button click. Close Drawer on close button click *************/
    this.openFilterDrawer = document.getElementById('filter-drawer');
    if(this.openFilterDrawer) this.openFilterDrawer.addEventListener('click', this.toggleFilterDrawer.bind(this));

    this.openSortbyDrawer = document.getElementById('sortby-drawer');
    if(this.openSortbyDrawer) this.openSortbyDrawer.addEventListener('click', this.toggleFilterDrawer.bind(this));

    this.closeFilterDrawer = this.filterParent.querySelector('.collection-filters-close');
    if(this.closeFilterDrawer) this.closeFilterDrawer.addEventListener('click', this.toggleFilterDrawer.bind(this));

    if(this.filterType == 'horizontal-filters'){
      document.body.addEventListener('click', (_event)=>{
        const openFilters = document.querySelectorAll('.filter__container.open');
        openFilters.forEach((target) => {
          target.querySelector('.filter__toggle').click();
        })
      });
  
      const filterContainers = document.querySelectorAll('.filter__container');
      filterContainers.forEach((target) => {
        target.addEventListener('click', (event)=>{
          event.stopPropagation();
        });
      });
    }
    /*********** End of Open Drawer on Filter or SortBy button click. Close Drawer on close button click ********/

    this.sortby_values = document.querySelectorAll('[data-sortby] .sortby_options');
    this.sortby_values.forEach(input => input.addEventListener('change', this.updateSortBy.bind(this)));

    this.pagination_value = document.querySelectorAll('[data-custom-pagination] .pagination_value');
    this.pagination_value.forEach(input => input.addEventListener('change', this.updatePagination.bind(this)));

    this.subCollectionLinks = document.querySelectorAll('[data-subCollections] .collection-entry');
    this.subCollectionLinks.forEach(link => link.addEventListener('click', this._manageSubCollections.bind(this)));

    this.filterParent.addEventListener('keyup', (event) => {
      if (event.code.toUpperCase() === 'ESCAPE'){ this.closeFilterDrawer.dispatchEvent(new Event('click')); }
    });

    this.debouncedOnSubmit = Utility.debounce((event) => {
      this.onSubmitHandler(event);
    }, 500);

    if(this.filterForm){
      this.filterForm.addEventListener('input', this.debouncedOnSubmit.bind(this));
      this.filterForm.addEventListener('submit', this.debouncedOnSubmit.bind(this));
      window.addEventListener('popstate', this.onHistoryChange.bind(this));
    }

    const applyBtn = this.querySelector('[data-applyFilters]');
    if(applyBtn){
      applyBtn.addEventListener('click', () => {
        this.filterForm.dispatchEvent(new Event('submit', {'bubbles' : true, 'cancelable' : true }));
        setTimeout(() => {
          this.closeFilterDrawer.dispatchEvent(new Event('click'));
        }, 1000);
      });
    }

    const paginationLinks = document.querySelectorAll('[data-pagination]');
    paginationLinks.forEach(link => link.addEventListener('click', this._managePagination.bind(this)));

    this.bindActiveFilterButtonEvents();
    this.addAccessibilityAttributes(toggleBtns);
    this.colorOptionsStyling();
  }

  /**
   * Filter Block Toggle event
   * @param {NodeList} toggleBtns Open filter block buttons
   */
  addAccessibilityAttributes(toggleBtns) {
    toggleBtns.forEach(element => {
      element.setAttribute('role', 'button');
      element.setAttribute('aria-expanded', false);
      element.setAttribute('aria-controls', element.nextElementSibling.id);
    });
  }

  /**
   * Collection filter form Input event
   * @param {event} event Event Instance
   */
  onSubmitHandler(event) {
    event.preventDefault();
    if(event.type == 'input' && this.filterParent.classList.contains('filter-active')){
      return;
    }

    let closestForm = document.getElementById('CollectionFiltersForm');
    if(event.target && event.target.closest('form')){ closestForm = event.target.closest('form'); }
    if(!closestForm) return;

    const searchParams = this._finalQueryString(closestForm)
    this.renderPage(searchParams);
  }

  /**
   * click event To Remove current selections
   * @param {element} form Collection page filter form
   */
  _finalQueryString(form){
    const formData = new FormData(form);
    let searchParams = '';
    let constraints = '';
    formData.forEach((val, key) => {
      if(key.indexOf('price-list') >= 0){
        searchParams += '&' + val;
      }else if(key.indexOf('custom_sort_by') >= 0){
        //  Code for SortBy
      }else if(key.indexOf('tagsFilter-') > -1){
        if(constraints === ''){ constraints = val; }
        else{ constraints += `+${val}`; }
      }else if(val != null && val.length > 0){
        if(searchParams === ''){ searchParams = key + '=' + val;}
        else{ searchParams += '&' + key + '=' + val; }
      }
    });

    if(constraints != ''){
      if(searchParams == ''){
        searchParams = `?constraint=${constraints}`;
      }else{
        searchParams += `&constraint=${constraints}`;
      }
    }

    return searchParams;
  }

  /**
   * Add background color in label of Color options
   */
  colorOptionsStyling(){
    const colorSwatchContainer = this.querySelector('[data-colorFilter]');
    if(colorSwatchContainer){
      const colorSwatches = colorSwatchContainer.querySelectorAll('.color-options');
      colorSwatches.forEach(swatch => {
        let colorHandle = swatch.querySelector('input[type="checkbox"]').dataset.handle;
        let swatchStyle = Utility.getSwatchStyle(colorHandle);
        swatch.querySelector('.option-label').setAttribute('style', swatchStyle);
      });
    }
  }

  /**
   * click event To Remove current selections
   * @param {event} event Event Instance
   */
   onActiveFilterClick(event) {
    event.preventDefault();
    event.stopPropagation();
    let currentTarget = event.target;
    let URLString = null;
    if(currentTarget.dataset.type == 'tag_based'){
      const inputValue = currentTarget.dataset.remove;
      const inputElement  = document.querySelector(`input[data-tagslist][value="${inputValue}"]`);
      if(inputElement) inputElement.checked = false;

      let closestForm = document.getElementById('CollectionFiltersForm');
      if(!closestForm) return;
      URLString = this._finalQueryString(closestForm);
    }else{
      if(event.target.closest('.filter-option-clear').classList.contains('filter-option-clear')){ 
        currentTarget = event.target.closest('.filter-option-clear');
        URLString = new URL(currentTarget.href).searchParams.toString();
      }
    }
    if(URLString != null)
      this.renderPage(URLString);
  }

   /**
   * Update Window URL as per active filters
   * @param {event} event Event Instance
   */
  onHistoryChange(event) {
    const searchParams = event.state?.searchParams || '';
    this.renderPage(searchParams, false);
  }

  /**
   * 
   * @param {String} searchParams Query Parameters
   * @param {String} updateURLHash true/false
   */
  renderPage(searchParams, updateURLHash = true) {
    document.getElementById('collection-product-grid').querySelector('#template-collection').classList.add('loading');

    const url = `${window.location.pathname}?${searchParams}`;
    this.renderGridFromFetch(url, 'filter');

    if (updateURLHash) this.updateURLHash(searchParams);
  }

  /**
   * 
   * @param {String} url URL for fetching results
   * @param {String} type filter / pagination / sub_collection_filter
   */
  renderGridFromFetch(url, type) {
    if(!url) return;
    fetch(url)
      .then(response => response.text())
      .then((responseText) => {
        const html = responseText;
        this.renderProductGrid(html, type);
      });
  }

  /**
   * 
   * @param {HTMlResponse} html 
   * @param {String} type filter / pagination / sub_collection_filter
   */
  renderProductGrid(html, type) {
    const innerHTML = new DOMParser().parseFromString(html, 'text/html');

    // We have used individuals components replacement code because of load more feature
    let paginationType = 'numbers';
    if(document.querySelector('[data-pagination]')){
      paginationType = document.querySelector('[data-pagination]').dataset.type || 'numbers';
    }
    if(type == 'filter' || type == 'sub_collection_filter'){
      const gridHTML = innerHTML.getElementById('collection-product-grid').innerHTML;
      document.getElementById('collection-product-grid').innerHTML = gridHTML;

      if(type == 'sub_collection_filter'){
        let bannerHTML = innerHTML.querySelector('[data-collectionBanner]').innerHTML;
        document.querySelector('[data-collectionBanner]').innerHTML = bannerHTML;
      }
    }else{
      if(paginationType == 'loadmore'){
        let productGrids = innerHTML.getElementById('template-collection').innerHTML;
        let loadMoreBtn =  innerHTML.getElementById('load-more');
        document.getElementById('template-collection').insertAdjacentHTML('beforeend', productGrids);
        if(loadMoreBtn && document.getElementById('load-more')){ 
          document.getElementById('load-more').parentNode.replaceChild(loadMoreBtn, document.getElementById('load-more')); 
        }
        else if(document.getElementById('load-more')){ document.getElementById('load-more').remove(); }
      }else{
        const gridHTML = innerHTML.getElementById('collection-product-grid').innerHTML;
        document.getElementById('collection-product-grid').innerHTML = gridHTML;
      }
    }

    const openFilters = document.querySelectorAll('.filter__container.open');
    const filterInnerHTML = innerHTML.getElementById('main-collection-filters').innerHTML;
    document.getElementById('main-collection-filters').innerHTML = filterInnerHTML;

    if(this.filterType != 'horizontal-filters'){
      // reopen filter blocks which are active before HTML update
      openFilters.forEach(openFilter => {
        if(openFilter.querySelector('.filter__toggle')){
          openFilter.querySelector('.filter__toggle').setAttribute('aria-expanded', true);
        }
        let filterBlock = document.querySelector('.filter__container[data-index="'+openFilter.dataset.index+'"]');
        filterBlock.classList.add('open');
        filterBlock.querySelector('.filter__block').classList.add('open');
      });
    }

    const filterContainers = document.querySelectorAll('.filter__container');
    filterContainers.forEach(filter => {
      const tagList = filter.querySelectorAll('.filter__item');
      if(tagList.length <= 0){
        filter.classList.add('d-none');
        filter.style.display = 'none';
      }
    });
    
    const totalProducts = innerHTML.querySelector('[data-totalProducts]');
    if(totalProducts) document.querySelector('[data-totalProducts]').innerHTML = totalProducts.innerHTML;

    const activeFilters = innerHTML.querySelector('[data-activeFilters]');
    if(activeFilters) document.querySelector('[data-activeFilters]').innerHTML = activeFilters.innerHTML;
    this.bindActiveFilterButtonEvents();
    if(this.quickshop){this.quickshop.updateEvents();}
  }

  /**
   * Re-Binding events on active filters after ajax request
   */
  bindActiveFilterButtonEvents() {
    document.querySelectorAll('.filter-option-clear').forEach((element) => {
      element.addEventListener('click', this.onActiveFilterClick, { once: true });
    });
  }

  /**
   * Update the url
   * @param {String} searchParams 
   */
  updateURLHash(searchParams) {
    history.pushState({ searchParams }, '', `${window.location.pathname}${searchParams && '?'.concat(searchParams)}`);
  }

  /**
   * 
   * @param {event} event 
   */
  updateSortBy(event){
    let _this = event.currentTarget;
    let currentvalue = document.querySelector('[data-sortby] [name="custom_sort_by_mobile"]:checked').value;
    if(_this.name == 'custom_sort_by_desktop'){
      currentvalue = document.querySelector('[data-sortby] [name="custom_sort_by_desktop"]:checked').value;
    }

    this.querySelector('[name="sort_by"]').value = currentvalue;
    this.querySelector('[name="sort_by"]').dispatchEvent(new Event('input', {
      bubbles: true,
      cancelable: true,
    }));
  }

  /**
   * 
   * @param {event} event 
   */
  updatePagination(event){
    event.preventDefault();
    let _this = event.currentTarget;
    let currentvalue = document.querySelector('[data-custom-pagination] [type="radio"]:checked').value;

    this.querySelector('[name="count"]').value = currentvalue;
    this.querySelector('[name="count"]').dispatchEvent(new Event('input', {
      bubbles: true,
      cancelable: true,
    }));

  }
  /**
   * 
   * @param {event} event 
   */
  _manageSubCollections(event){
    event.preventDefault();
    const _this =  event.currentTarget;
    let closestForm = document.getElementById('CollectionFiltersForm');
    if(_this.closest('form')){ closestForm = event.target.closest('form'); }
    const queryString = this._finalQueryString(closestForm);

    let collURL = _this.href + '?' + queryString;
    this.renderGridFromFetch(collURL, 'sub_collection_filter');
    setTimeout(() => {
      history.pushState({}, '', collURL);
    }, 500);
  }

  /**
   * 
   * @param {event} event 
   */
  _managePagination(event){
    event.preventDefault();
    let _this = event.currentTarget;
    var nextPageLink = _this.href;
    var product_count=parseInt(event.target.closest('[data-pagination_bar]')?.getAttribute('data-pagination_bar'))
    if (nextPageLink && nextPageLink.includes('?') && nextPageLink.includes('=')) {
      nextPageLink=nextPageLink+`&count=${product_count}`
    }
    this.renderGridFromFetch(nextPageLink, 'pagination');

    setTimeout(() => {
      history.pushState({}, '', nextPageLink);
    }, 500);
  }

  /**
   * Toggle Filter drawer
   * @param {event} event 
   */
  toggleFilterDrawer(event){
    event.preventDefault();
    let button = event.currentTarget;
    if(button.id == 'filter-drawer' || button.id == 'sortby-drawer'){
      this.filterParent.classList.add('filter-active');
      button.setAttribute('aria-expanded', true);
      button.setAttribute('tabindex', '-1');

      if(button.id == 'sortby-drawer'){ this.filterParent.classList.add('sortby-drawer'); }
      else{ this.filterParent.classList.remove('sortby-drawer'); }

      Utility.trapFocus(this.filterParent);
      Utility.forceFocus(this.closeFilterDrawer);
      siteOverlay.prototype.showOverlay();
    }else{
      this.filterParent.classList.remove('filter-active');
      this.filterParent.classList.remove('sortby-drawer');
      if(this.openFilterDrawer){
        this.openFilterDrawer.setAttribute('aria-expanded', false);
        this.openFilterDrawer.removeAttribute('tabindex');
      }
      if(this.openSortbyDrawer){
        this.openSortbyDrawer.setAttribute('aria-expanded', false);
        this.openSortbyDrawer.removeAttribute('tabindex');
      }

      Utility.removeTrapFocus(this.filterParent);
      siteOverlay.prototype.hideOverlay();
    }
  }

  /**
   * Toggle Filter drawer
   * @param {event} event 
  */
  toggleFilterBlock(event) {
    event.preventDefault();
    const toggleFilterBtn = event.currentTarget;
    const filterContainer = toggleFilterBtn.parentNode;
    const isOpen = filterContainer.classList.contains('open');
    isOpen ? this.closeFilterBlock(toggleFilterBtn) : this.openFilterBlock(toggleFilterBtn);
  }

  /**
   * Open Filter Block
   * @param {element} toggleFilterBtn 
   */
  openFilterBlock(toggleFilterBtn){
    let filterContainer = toggleFilterBtn.parentNode;
    toggleFilterBtn.setAttribute('aria-expanded', true);
    Utility.toggleElement(filterContainer, 'open');
    if(this.accordionType == 'single'){
      let siblingBlocks = filterContainer.parentNode.querySelectorAll('.filter__container');
      siblingBlocks.forEach(element => {
        if(element == filterContainer){ return; }
        element.classList.remove('open');
        element.querySelector('.filter__block').classList.remove('open');
        element.querySelector('.filter__toggle').setAttribute('aria-expanded', false);
      });
    }
    Utility.trapFocus(filterContainer);
  }

  /**
   * Close Filter Block
   * @param {element} toggleFilterBtn 
   */
  closeFilterBlock(toggleFilterBtn){
    const filterContainer = toggleFilterBtn.parentNode;
    toggleFilterBtn.setAttribute('aria-expanded', false);
    Utility.toggleElement(filterContainer, 'close');
    Utility.removeTrapFocus(filterContainer);
  }
}

customElements.define('collection-filters', CollectionFilters);

class PriceRange extends HTMLElement {
  constructor() {
    super();
    this.querySelectorAll('input')
      .forEach(element => element.addEventListener('change', this.onRangeChange.bind(this)));

    this.setMinAndMaxValues();
  }

  /**
   * 
   * @param {event} event 
   */
  onRangeChange(event) {
    this.adjustToValidValues(event.currentTarget);
    this.setMinAndMaxValues();
  }

  setMinAndMaxValues() {
    const inputs = this.querySelectorAll('input');
    const minInput = inputs[0];
    const maxInput = inputs[1];
    if (maxInput.value) minInput.setAttribute('max', maxInput.value);
    if (minInput.value) maxInput.setAttribute('min', minInput.value);
    if (minInput.value === '') maxInput.setAttribute('min', 0);
    if (maxInput.value === '') minInput.setAttribute('max', maxInput.getAttribute('max'));
  }

  adjustToValidValues(input) {
    const value = Number(input.value);
    const min = Number(input.getAttribute('min'));
    const max = Number(input.getAttribute('max'));

    if (value < min) input.value = min;
    if (value > max) input.value = max;
  }
}
customElements.define('price-range', PriceRange);

class PriceRangeSlider extends HTMLElement {
  constructor() {
    super();

    let _this = this;
    let sliderSections = this.getElementsByClassName("range-slider");
    
      for(const element of sliderSections){
        let sliders = element.getElementsByTagName("input");
        for(const element of sliders){
          if(element.type ==="range" ){
            element.oninput = _this.getVals;
            element.oninput();
          }
        }
      }
  }
  
  // Get Price value from both range slider
  getVals(){
    let parent = this.parentNode;
    let slides = parent.getElementsByTagName("input");
    let slide1 = parseFloat(slides[0].value);
    let slide2 = parseFloat(slides[1].value);
      
    // Neither slider will clip the other, so make sure we determine which is larger
    if( slide1 > slide2 ){ let tmp = slide2; slide2 = slide1; slide1 = tmp; }
    
    let displayElement = parent.getElementsByClassName("rangeValues")[0];
    displayElement.innerHTML = Shopify.formatMoney((slide1*100), window.globalVariables.money_format)+ ' - ' + Shopify.formatMoney((slide2*100), window.globalVariables.money_format);
  }
}
customElements.define('range-slider', PriceRangeSlider);