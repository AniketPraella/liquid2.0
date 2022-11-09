const trapFocusHandlers = {};
class Utilities {

  /**
    * Gathers all focusable elements and returs Node Array
    *
    * @return {Node array} elements - Focusable elements
  */
  getFocusableElements(container) {
    return Array.from(
      container.querySelectorAll(
        ".filter__container, [type='button'], a[href], a[data-href], button:enabled, [tabindex]:not([tabindex^='-']), [draggable], area, input:not([type=hidden]):enabled, select:enabled, textarea:enabled, object, iframe"
      )
    );
  }

  /**
    * Attempts to focus an element, and if unsuccessful adds tabindex to the
    * element and focuses it. Tabindex is removed on element blur.
    *
    * @param {HTML Node} element - The element to be focused
  */
  forceFocus(element) {
    element.focus();

    let isFocused = false;
    if (element == document.activeElement) {
      isFocused = true;
    }
    if(isFocused == false){
      element.setAttribute('tabindex', '0');
      setTimeout(function(){
        element.focus();
      }, 500);
    }
  }

  /**
    * Trap focus within container between first and last element
    *
    * @param {Node Array} elements - container to trap focus
  */
  trapFocus(container, elementToFocus = container) {
    var elements = this.getFocusableElements(container);
    var first = elements[0];
    var last = elements[elements.length - 1];
    
    this.removeTrapFocus();

    trapFocusHandlers.focusin = (event) => {
      if (
        event.target !== container &&
        event.target !== last &&
        event.target !== first
      )
        return;

      document.addEventListener('keydown', trapFocusHandlers.keydown);
    };

    trapFocusHandlers.focusout = function() {
      document.removeEventListener('keydown', trapFocusHandlers.keydown);
    };

    trapFocusHandlers.keydown = function(event) {
      if (event.code.toUpperCase() !== 'TAB') return; // If not TAB key
      // On the last focusable element and tab forward, focus the first element.
      if (event.target === last && !event.shiftKey) {
        event.preventDefault();
        first.focus();
      }

      //  On the first focusable element and tab backward, focus the last element.
      if (
        (event.target === container || event.target === first) &&
        event.shiftKey
      ) {
        event.preventDefault();
        last.focus();
      }
    };

    document.addEventListener('focusout', trapFocusHandlers.focusout);
    document.addEventListener('focusin', trapFocusHandlers.focusin);

    elementToFocus.focus();
  }

  /**
    * Release focus from focused elements
    *
    * @param {Node Array} elements - Release focus from these elements
  */
  removeTrapFocus(elementToFocus = null) {
    document.removeEventListener('focusin', trapFocusHandlers.focusin);
    document.removeEventListener('focusout', trapFocusHandlers.focusout);
    document.removeEventListener('keydown', trapFocusHandlers.keydown);

    if (elementToFocus) elementToFocus.focus();
  }

  /**
    * Limit the number of times a function is called within defined timeout
    *
    * @param {function} fn - function to execute
    * @param {integer} wait - Timeout to fire event
  */
  debounce(fn, wait) {
    let t;
    return (...args) => {
      clearTimeout(t);
      t = setTimeout(() => fn.apply(this, args), wait);
    };
  }

  /**
   * Return an object from an array of objects that matches the provided key and value
   *
   * @param {array} array - Array of objects
   * @param {string} key - Key to match the value against
   * @param {string} value - Value to get match of
   */
  findInstance(array, key, value) { // Return an object from an array of objects that matches the provided key and value
    for (let i = 0; i < array.length; i += 1) {
      if (array[i][key] === value) {
        return array[i];
      }
    }
    return null;
  }

  /**
   * Remove an object from an array of objects by matching the provided key and value
   *
   * @param {array} array - Array of objects
   * @param {string} key - Key to match the value against
   * @param {string} value - Value to get match of
   */
   removeInstance(array, key, value) {
    let i = array.length;
    while (i--) {
      if (array[i][key] === value) {
        array.splice(i, 1);
        break;
      }
    }
    return array;
  }

  /**
   * _.compact from lodash
   * Remove empty/false items from array
   * Source: https://github.com/lodash/lodash/blob/master/compact.js
   *
   * @param {array} array
   */
   compact(array) {
    let index = -1;
    const length = array == null ? 0 : array.length;
    let resIndex = 0;
    const result = [];

    while (++index < length) {
      const value = array[index];
      if (value) {
        result[resIndex++] = value;
      }
    }
    return result;
  }

  /**
   * Remove duplicates from an array of objects
   * @param arr - Array of objects
   * @param prop - Property of each object to compare
   * @returns {Array}
   */
  removeDuplicates(arr, key = 'id') {
    const map = new Map();
    // eslint-disable-next-line array-callback-return
    arr.map((el) => {
      if (!map.has(el[key])) {
        map.set(el[key], el);
      }
    });
    return [...map.values()];
  }

  /**
   * Format date
   * @param  {string}
   * @return {String} value - formatted value
   */
  formatDate(value) {
    let date = new Date(value);
    let ye = new Intl.DateTimeFormat('en', { year: 'numeric' }).format(date);
    let mo = new Intl.DateTimeFormat('en', { month: 'short' }).format(date);
    let da = new Intl.DateTimeFormat('en', { day: '2-digit' }).format(date);
    return `${mo} ${da} ${ye}`;
  }

  /**
   * Converts a string as handle
   *
   * @param {*} str - String to check
   * @returns {*} - Returns the resolved string
   */
  handleize(str) {
    str = str.toLowerCase().replace(/[^\w\u00C0-\u024f]+/g, '-').replace(/^-+|-+$/g, '');
    return str;
  }

  /**
   * Converts a handle to readable friendly format
   *
   * @param {*} str - String to check
   * @returns {*} - Returns the resolved string
   */
  unhandleize(str) {
    str = str.replace(/-/g, ' ');
    str = this._toCamelCase(str);
    return str;
  }

  /**
   * Pre-loads an image in memory and uses the browsers cache to store it until needed.
   *
   * @param {Array} images - A list of image urls
   * @param {String} size - A shopify image size attribute
   */

  preload(images, size) {

    if (typeof images === 'string') {
      images = [images];
    }

    for (let i = 0; i < images.length; i += 1) {
      const image = images[i];
      this.loadImage(this.getSizedImageUrl(image, size));
    }
  }

  /**
   * Loads and caches an image in the browsers cache.
   * @param {string} path - An image url
   */
  loadImage(path) {
    new Image().src = path;
  }

  /**
   * Adds a Shopify size attribute to a URL
   *
   * @param {string} src
   * @param {string} size
   * @returns {*}
   */
  getSizedImageUrl(src, size) {
    let match;

    if (src === null) {
      return;
    }

    if (typeof (src) === 'object') {
      src = src.src;
    }

    if (size === 'master') {
      src = this.removeProtocol(src);
    }

    if (src) {
      match = src.match(/\.(jpg|jpeg|gif|png|bmp|bitmap|tiff|tif)(\?v=\d+)?$/i);
    }

    if (match) {
      const prefix = src.split(match[0]);
      const suffix = match[0];

      src = this.removeProtocol(`${prefix[0]}_${size}${suffix}`);
    }
    return src;
  }

  removeProtocol(path) {
    return path.replace(/http(s)?:/, '');
  }

  setCookie(c_name, value, exdays) { // set cookies
    let exdate = new Date();
    exdate.setDate(exdate.getDate() + exdays);
    let c_value = escape(value) + ((exdays == null) ? "" : "; expires=" + exdate.toUTCString() + "; path=/");
    document.cookie = c_name + "=" + c_value;

    return document.cookie;
  }

  getCookie(c_name) { // get cookies
    let i, x, y, ARRcookies = document.cookie.split(";");
      for (i = 0; i < ARRcookies.length; i++) {
      x = ARRcookies[i].substr(0, ARRcookies[i].indexOf("="));
      y = ARRcookies[i].substr(ARRcookies[i].indexOf("=") + 1);
      x = x.replace(/^\s+|\s+$/g, "");
      if (x == c_name) {
          return unescape(y);
      }
    }
  }

  removeCookie(c_name) { // remove cookie
    document.cookie = c_name + "=;max-age=0";

    return document.cookie;
  }

  /**
   * Build URL based on following parameters
   * @param {*} url 
   * @param {*} paramName 
   * @param {*} paramValue 
   */
  replaceUrlParam(url, paramName, paramValue){
    let pattern = new RegExp('(\\?|\\&)('+paramName+'=).*?(&|$)');
    let newUrl = url;
    if(url.search(pattern)>=0){
      newUrl = url.replace(pattern,'$1$2' + paramValue + '$3');
    }else{
      newUrl = newUrl + (newUrl.indexOf('?')>0 ? '&' : '?') + paramName + '=' + paramValue
    }
    return newUrl
  }


  /**
   * local storage handling code 
   * @param {*} key 
   * @param {*} value 
   * @returns 
   */
  setLocalStorage(key,value) {
    window.localStorage.setItem(key, value);

    return window.localStorage;
  }

  /**
   * Get Local Storage value based on key
   * @param {*} key 
   */
  getLocalStorage(key) {
    return window.localStorage.getItem(key);
  }

  /**
   * Remove Local Storage value based on key
   * @param {*} key 
   */
  removeFromLocalStorage(key) {
    window.localStorage.removeItem(key);
    return window.localStorage;
  }

  /**
   * session storage handling code
   * @param {*} key 
   * @param {*} value 
 */
  setSessionStorage(key,value) {
    window.sessionStorage.setItem(key, value);

    return window.sessionStorage;
  }

  /**
   * Get Session Storage value based on key
   * @param {*} key 
   */
  getSessionStorage(key) {
    return window.sessionStorage.getItem(key);
  }

  /**
   * Remove session storage based on key
   * @param {*} key 
   * @returns 
   */
  removeFromSessionStorage(key) {
    window.sessionStorage.removeItem(key);
    return window.sessionStorage;
  }

  /**
   * Get URL parameter
   */
  getUrlParameter(name) {
    name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
    const regex = new RegExp(`[\\?&]${name}=([^&#]*)`);
    const results = regex.exec(location.search);
    return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
  }

  /**
   * Vibrate mobile device
   */
  vibrateDevice() {
    // check for vibration support
    const vibrationEnabled = navigator.vibrate || navigator.webkitVibrate || navigator.mozVibrate || navigator.msVibrate;
    if (vibrationEnabled) {
      navigator.vibrate(100);
    }
  }

  /**
   * ajax call using javascript
  */
  _XMLHttpRequest(method, URL, data, callback) {
    let newDataRequest = new XMLHttpRequest();
    newDataRequest.open(method, URL, true);
    newDataRequest.setRequestHeader('Accept', 'application/json')
    newDataRequest.setRequestHeader('Content-Type', 'application/json')
    newDataRequest.onload = function () {
        callback(newDataRequest.status, this.response)
    }
    if(method == 'GET'){ newDataRequest.send();}
    else{ newDataRequest.send(JSON.stringify(data));}
  }

  /**
   * manage history
   */
  goBack() { // Previous page
    return window.history.back()
  }


  goForward() { // Forward page
    return window.history.forward()
  }

  /**
   * Push History State
   * @param {String} state 
   * @param {String} title 
   * @param {String} url 
   */
  pushHistoryState(state,title,url) {
    return window.history.pushState(state, title, url)
  }

  /**
   * Replace History State
   * @param {String} state 
   * @param {String} title 
   * @param {String} url 
   */
  replaceHistoryState(state,url) {
    return window.history.replaceState(state, '', url)
  }

  /**
   * Get swatch hex color code or image url
   *
   * @param {string} colorName
   * @returns {string} background style hex code
  */
  getSwatchStyle(colorName) {
    const swatchesColorList = JSON.parse(document.querySelector('[data-swatches-colorlist-json]').innerText);
    colorName = colorName.replace(/-|\s/g, '').toLowerCase();
    const swatch = swatchesColorList[colorName];
    let swatchStyle;
    if (typeof swatch !== 'undefined') {
      if (swatch.match(/\.(jpeg|jpg|png|gif)/g) != null) {
        swatchStyle = `background-image: url(${swatch})`;
      } else {
        swatchStyle = `background-color: ${swatch}`;
      }
      return swatchStyle;
    }

    return false;
  }

  /**
   * Truncates a given string
   *
   * @param {String} value - Value to check
   * @param {Number} count - Count number of words
   * @returns {*} - Returns the resolved value
   */
  truncate(value, count) {
    const strippedString = value.trim();
    const array = strippedString.split(' ');
    value = array.splice(0, count).join(' ');
    if (array.length > count) {
      value += '...';
    }
    return value;
  }

  /**
   * Cross browser resize event
   */
  triggerResize() {
    if (navigator.userAgent.indexOf('MSIE') !== -1 || navigator.appVersion.indexOf('Trident/') > 0) {
      const evt = document.createEvent('UIEvents');
      evt.initUIEvent('resize', true, false, window, 0);
      window.dispatchEvent(evt);
    } else {
      window.dispatchEvent(new Event('resize'));
    }
  }

  /**
   * detect if the device is touch based
   */

  is_touch_enabled() {
    return ( 'ontouchstart' in window ) || ( navigator.maxTouchPoints > 0 ) ||  ( navigator.msMaxTouchPoints > 0 );
  }

  /**
   * Toggle animation for element
   */
  toggleElement(container, activity) {
    let contentBlock = container.querySelector('[data-type="content"]') || container.querySelector('.toggle-content');
    if(!contentBlock) return;

    let contentBlockHeight = Utility._getHeightofHiddenEle(contentBlock);

    if(activity == 'open'){
      [contentBlock,container].forEach(ele => ele.classList.add('open'));
      contentBlock.style.height = contentBlockHeight + 'px';
      setTimeout(() => {
        contentBlock.style.height = '';
      }, 500);
    }else{
      contentBlock.style.height = contentBlockHeight + 'px';
      setTimeout(function () {
        contentBlock.style.height = '0';
      }, 1);
      setTimeout(() => {
        [contentBlock,container].forEach(ele => ele.classList.remove('open'));
      }, 500);
    }
  }

   /**
   * Fade Effect
   */
  fadeEffect(elem, action) {
    if(action == 'fadeIn'){
      let newValue = 0;
      elem.style.display = 'block';
      elem.style.opacity = 0;
      const fadeInInterval = setInterval(function(){ 
        if (newValue < 1) {
          newValue += 0.01;
        } else if (newValue === 1) {
          clearInterval(fadeInInterval);   
        }
        elem.style.opacity = newValue;
      }, 10);
    }else if(action == 'fadeOut'){
      let newValue = 1;
      elem.style.opacity = 1;
      const fadeOutInterval = setInterval(function(){ 
        if (newValue > 0) {
          newValue -= 0.01;
        } else if (newValue < 0) {
          elem.style.opacity = 0;
          elem.style.display = 'none';
          clearInterval(fadeOutInterval);
        }
        elem.style.opacity = newValue;
      }, 10);
    }
  }

  /**
   * detect when an object enters a viewport
   */

  in_Viewport(element) {
    const rect = element.getBoundingClientRect();
    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
  }

  /**
   * returns Height of Hidden element
   */
  _getHeightofHiddenEle(element){
    let height = element.offsetHeight;
    element.classList.add('calculating--height');
    height = element.scrollHeight;
    element.classList.remove('calculating--height');

    return height;
  }

  /**
   * load fonts when needed
   */

  loadFont(name,url,callback) {
    const Font = new FontFace(name,'url('+url+')');
    Font.load().then(function(loadedFont) {
        document.fonts.add(loadedFont)
        callback();
    }).catch(function(error) {
        console.log('Failed to load font: ' + error)
    })
  }

  /**
   * Check Device Type
   */
  deviceType(){
    if(window.innerWidth < 768){
      return 'Mobile';
    }else if(window.innerWidth < 991){
      return "Tablet"
    } else{
      return "Desktop"
    }
  }

  /**
   * Email Validation
   * @param {*} email 
   */
  validateEmail(email){
    return email.match(
      /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    );
  }

}

var Utility = new Utilities();
