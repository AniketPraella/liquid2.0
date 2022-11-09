const selectors = {
  accountPages: '[data-account-pages]',
  resetPassword : '[data-recover-link]',
  hideResetPass : '[data-hideResetPass]',
  resetPasswordForm : '[data-recover-password-form]',
  loginForm : '[data-login-form]'
};

class accountPages {
  constructor() {
    this.elements = this._getElements();
    if (Object.keys(this.elements).length === 0) return;
    this._setupEventListeners();

    const windowURL = window.location.href;
    const showRecoverForm = windowURL.indexOf('#recover');
    if(showRecoverForm >= 0){
      this.elements.showResetPassword.dispatchEvent(new Event('click'));
    }
  }

  /**
   * Fecth Selector of login form inputs
   */
  _getElements() {
    const container = document.querySelector(selectors.accountPages);
    return container ? {
      container,
      showResetPassword: document.querySelector(selectors.resetPassword),
      hideResetPass: document.querySelector(selectors.hideResetPass),
      resetPasswordForm: document.querySelector(selectors.resetPasswordForm),
      loginForm: document.querySelector(selectors.loginForm)
    } : {};
  }

  /**
   * Bind Click events on hide/show password field
   */
  _setupEventListeners() {
      this.elements.showResetPassword.addEventListener('click', this._handleResetPassword.bind(this));
      this.elements.hideResetPass.addEventListener('click', this._handleResetPassword.bind(this));
  }
  /**
   * Reset Password
   * @param {event} event 
   */
  _handleResetPassword(event){
      event.preventDefault();
      const _this = event.currentTarget;
      if(_this.classList.contains('hide-resetform')){
        this.elements.loginForm.style.display = 'block';
        this.elements.resetPasswordForm.style.display = 'none';
        if(window.location.href.indexOf("#recover") > -1) {
          window.history.replaceState({ }, '', location.href.replace("#recover", ""));
        }
      }else{
          this.elements.loginForm.style.display = 'none';
          this.elements.resetPasswordForm.style.display = 'block';
      }
  }
}

typeof accountPages !== 'undefined' && new accountPages();