/**
 * Search Modal Component
 *
 */
class SearchModal extends HTMLElement {
  constructor() {
    super();

    let _this = this;
    this.openSearchModal = document.querySelectorAll('.open-searchform');
    this.searchFormContainer = this.querySelector('.searchform');

    this.searchFormContainer.addEventListener('keyup', (event) => {
      event.code.toUpperCase() === 'ESCAPE' && this.close()
    });

    this.openSearchModal.forEach(toggleBtn =>{
      toggleBtn.addEventListener('click', function(event){
        _this.onToggleBtnClick(event);
      });
      toggleBtn.setAttribute('role', 'button');
      toggleBtn.setAttribute('aria-expanded', 'false');
    });
    this.querySelector('.search-modal__close-button').addEventListener('click', this.close.bind(this));
  }

  /**
   * To check if search modal is open or closed
   * 
   * @returns {boolean} true/false
   */
  isOpen() {
    return this.searchFormContainer.hasAttribute('open');
  }

  /**
   * Toggle Search Modal on search Icon click
   *
   * @param {event} Event instance
   */
  onToggleBtnClick(event) {
    event.preventDefault();
    event.stopPropagation();
    this.searchFormContainer.hasAttribute('open')
      ? this.close()
      : this.open(event);
  }

  /**
   * Close Search Modal on body click if not within the Modal
   *
   * @param {event} Event instance
   */
  onBodyClick(event) {
    if (!this.contains(event.target)) this.close(false);
  }

  /**
   * Open Search Modal and add attributes, class and Events in DOM
   *
   * @param {event} Event instance
   */
  open(_event) {
    this.onBodyClickEvent = this.onBodyClickEvent || this.onBodyClick.bind(this);
    this.searchFormContainer.setAttribute('open', true);
    this.classList.add('open__modal');
    this.removeAttribute('style');
    document.body.addEventListener('click', this.onBodyClickEvent);

    Utility.trapFocus(this);
    Utility.forceFocus(document.getElementById('Search-In-Modal'))
  }

  /**
   * Close Search Modal and remove attributes, class and Events in DOM
   *
   * @param {event} Event instance
   */
  close(_focusToggle = true) {
    Utility.removeTrapFocus();
    this.searchFormContainer.removeAttribute('open');
    this.classList.remove('open__modal');
    document.body.removeEventListener('click', this.onBodyClickEvent);
  }
}
customElements.define('search-modal', SearchModal);