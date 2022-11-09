 /**
    * Bind function to element
    *
    * @param {function} fn - Function to bind
    * @param {element} scope - Element function binds to
    */
Shopify.bind = function(fn, scope) {
  return function() {
    return fn.apply(scope, arguments);
  }
};

Shopify.setSelectorByValue = function(selector, value) {
  for (let i = 0, count = selector.options.length; i < count; i++) {
    let option = selector.options[i];
    if (value == option.value || value == option.innerHTML) {
      selector.selectedIndex = i;
      return i;
    }
  }
};

Shopify.addListener = function(target, eventName, callback) {
  target.addEventListener ? target.addEventListener(eventName, callback, false) : target.attachEvent('on'+eventName, callback);
};

Shopify.postLink = function(path, options) {
  options = options || {};
  let method = options['method'] || 'post';
  let params = options['parameters'] || {};

  let form = document.createElement("form");
  form.setAttribute("method", method);
  form.setAttribute("action", path);

  for(let key in params) {
    let hiddenField = document.createElement("input");
    hiddenField.setAttribute("type", "hidden");
    hiddenField.setAttribute("name", key);
    hiddenField.setAttribute("value", params[key]);
    form.appendChild(hiddenField);
  }
  document.body.appendChild(form);
  form.submit();
  document.body.removeChild(form);
};

/**
 * 
 * @param {target} country_domid 
 * @param {target} province_domid 
 * @param {target} options 
 */
Shopify.CountryProvinceSelector = function(country_domid, province_domid, options) {
  this.countryEl         = document.getElementById(country_domid);
  this.provinceEl        = document.getElementById(province_domid);
  this.provinceContainer = document.getElementById(options['hideElement'] || province_domid);

  Shopify.addListener(this.countryEl, 'change', Shopify.bind(this.countryHandler,this));

  this.initCountry();
  this.initProvince();
};

Shopify.CountryProvinceSelector.prototype = {
  initCountry: function() {
    let value = this.countryEl.getAttribute('data-default');
    Shopify.setSelectorByValue(this.countryEl, value);
    this.countryHandler();
  },

  initProvince: function() {
    let value = this.provinceEl.getAttribute('data-default');
    if (value && this.provinceEl.options.length > 0) {
      Shopify.setSelectorByValue(this.provinceEl, value);
    }
  },

  countryHandler: function(_e) {
    let opt       = this.countryEl.options[this.countryEl.selectedIndex];
    let raw       = opt.getAttribute('data-provinces');
    let provinces = JSON.parse(raw);

    this.clearOptions(this.provinceEl);
    if (provinces && provinces.length == 0) {
      this.provinceContainer.style.display = 'none';
    } else {
      provinces.forEach((city)=>{
        let option = document.createElement('option');
        option.value = city[0];
        option.innerHTML = city[1];
        this.provinceEl.appendChild(option);
      });
      this.provinceContainer.style.display = "";
    }
  },

  clearOptions: function(selector) {
    while (selector.firstChild) {
      selector.removeChild(selector.firstChild);
    }
  },

  setOptions: function(selector, values) {
    values.forEach((val)=>{
      let option = document.createElement('option');
      option.value = val;
      option.innerHTML = val;
      selector.appendChild(option);
    });
  }
};

const selectors = {
    customerAddresses: '[data-customer-addresses]',
    addressCountrySelect: '[data-address-country-select]',
    toggleAddressButton: '[data-edit-address]',
    cancelAddressButton: '[data-reset-address]',
    deleteAddressButton: '[data-confirm-message]'
};
  
class CustomerAddresses {
    constructor() {
      this.elements = this._getElements();
      if (Object.keys(this.elements).length === 0) return;

      
      this._setupCountries();
      this._setupEventListeners();
    }
  
    /**
     * Fetch elements of address form
     */
    _getElements() {
      const container = document.querySelector(selectors.customerAddresses);
      return container ? {
        container,
        newAddressForm: document.querySelector(selectors.newAddressButton),
        editAddressToggle: document.querySelectorAll(selectors.toggleAddressButton),
        cancelButtons: container.querySelectorAll(selectors.cancelAddressButton),
        deleteButtons: container.querySelectorAll(selectors.deleteAddressButton),
        countrySelects: container.querySelectorAll(selectors.addressCountrySelect)
      } : {};
    }
  
    /**
     * Hide/Show province input based on country selection
     */
    _setupCountries() {
      if (Shopify && Shopify.CountryProvinceSelector) {
        // eslint-disable-next-line no-new
        new Shopify.CountryProvinceSelector('AddressCountryNew', 'AddressProvinceNew', {
          hideElement: 'AddressProvinceContainerNew'
        });
        this.elements.countrySelects.forEach((select) => {
          const formId = select.dataset.formId;
          if(!document.getElementById(`AddressCountry_${formId}`)) return;
          // eslint-disable-next-line no-new
          new Shopify.CountryProvinceSelector(`AddressCountry_${formId}`, `AddressProvince_${formId}`, {
            hideElement: `AddressProvinceContainer_${formId}`
          });
        });
      }
    }
  
    /**
     * Bind click events on toggle button
     */
    _setupEventListeners() {
        this.elements.editAddressToggle.forEach((element) => {
            element.addEventListener('click', this._handleToggleForm.bind(this));
        });
        this.elements.cancelButtons.forEach((element) => {
            element.addEventListener('click', this._handleCancelButtonClick.bind(this));
        });
        this.elements.deleteButtons.forEach((element) => {
            element.addEventListener('click', this._handleDeleteButtonClick);
        });
    }

    /**
     * Toggle Address Form
     * @param {event} event 
     */
    _handleToggleForm = (event) => {
        event.preventDefault();
        let formToggleContainer = document.querySelector('[data-editAddressContainer]');
        const addNewAddress = document.querySelector('[data-newAddressContainer]');
        const currentTarget = event.currentTarget;
        const targetFormID = currentTarget.dataset.target;
        const targetForm = document.querySelector(targetFormID);
        const formType = currentTarget.dataset.for;
        if(formType == 'add_address') formToggleContainer = addNewAddress;
        
        if(!targetForm) return;

        let isOpen = targetForm.classList.contains('open');
        if(isOpen){
            Utility.toggleElement(formToggleContainer, 'close');
            currentTarget.setAttribute('aria-expanded', false);
            targetForm.removeAttribute('data-type');
        }else{
            this._hideOpenforms();
            setTimeout(() => {
                currentTarget.setAttribute('aria-expanded', true);
                targetForm.setAttribute('data-type', 'content');
                Utility.toggleElement(formToggleContainer, 'open');
                targetForm.scrollIntoView({
                  behavior: 'smooth'
                });
            }, 500);
        }
    }
    /**
     * Close Opened Forms
     */
    _hideOpenforms(){
        // Close Opened Edit Address Forms
        const container = document.querySelector('[data-editAddressContainer]');
        let allForms = container.querySelectorAll('.customer-form.open');
        let toggleButtons = document.querySelectorAll('[data-edit-address][aria-expanded="true"]');
        toggleButtons.forEach(button => { button.setAttribute('aria-expanded', false); })
        allForms.forEach(form => { Utility.toggleElement(container, 'close'); form.removeAttribute('data-type'); });

        // Close Add new Address Forms
        let newAddForm = document.querySelector('[data-newAddressContainer]');
        Utility.toggleElement(newAddForm, 'close');
    }

    _handleCancelButtonClick = (event) => {
        event.preventDefault();
        this._hideOpenforms();
    }

    _handleDeleteButtonClick = ({ currentTarget }) => {
      // eslint-disable-next-line no-alert
      if (confirm(currentTarget.getAttribute('data-confirm-message'))) {
        Shopify.postLink(currentTarget.dataset.target, {
          parameters: { _method: 'delete' },
        });
      }
    }
}
typeof CustomerAddresses !== 'undefined' && new CustomerAddresses();
