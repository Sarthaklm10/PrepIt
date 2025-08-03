// import View from './View.js';

// class AuthView extends View {
//   _parentElement = document.querySelector('.auth-container');
//   _errorMessage = 'An error occurred. Please try again.';
//   _window = document.querySelector('.auth-window');
//   _overlay = document.querySelector('.overlay');
//   _nav = document.querySelector('.nav');

//   // Selectors for permanent elements
//   _btnLogin = this._nav.querySelector('.nav__btn--login');
//   _userMenu = this._nav.querySelector('.nav__user');
//   _userName = this._nav.querySelector('.span.nav__user-name');
//   _btnClose = this._window.querySelector('.btn--close-modal');

//   constructor() {
//     super();
//     this._addHandlerShowWindow();
//     this._addHandlerHideWindow();
//     this._addHandlerSwitchForm();
//   }

//   toggleWindow() {
//     this._overlay.classList.toggle('hidden');
//     this._window.classList.toggle('hidden');
//   }

//   // --- EVENT HANDLERS ---
//   _addHandlerShowWindow() {
//     // Event delegation on the nav for the login button
//     this._nav.addEventListener('click', e => {
//       const btn = e.target.closest('.nav__btn--login');
//       if (!btn) return;
//       this.render(); // Renders the form inside the modal
//       this.toggleWindow();
//     });
//   }

//   _addHandlerHideWindow() {
//     this._btnClose.addEventListener('click', this.toggleWindow.bind(this));
//     this._overlay.addEventListener('click', this.toggleWindow.bind(this));
//   }

//   addHandlerAuth(handler) {
//     this._parentElement.addEventListener('submit', function (e) {
//       e.preventDefault();
//       const form = e.target;
//       const data = Object.fromEntries(new FormData(form));
//       const action = form.dataset.action;
//       handler(action, data);
//     });
//   }

//   addHandlerLogout(handler) {
//     // Event delegation for the logout button
//     this._nav.addEventListener('click', e => {
//       const btn = e.target.closest('.nav__btn--logout');
//       if (!btn) return;
//       handler();
//     });
//   }

//   _addHandlerSwitchForm() {
//     this._parentElement.addEventListener('click', e => {
//       const link = e.target.closest('.auth__switch-link');
//       if (!link) return;
//       this.render(link.dataset.form);
//     });
//   }

//   updateNav(isLoggedIn, username = '') {
//     const authNavItem = document.querySelector('.nav__item--auth');
//     const loginButton = authNavItem.querySelector('.nav__btn--login');
//     const userMenu = authNavItem.querySelector('.nav__user');
//     const userNameSpan = authNavItem.querySelector('.nav__user-name');

//     if (isLoggedIn) {
//       loginButton.classList.add('hidden');
//       userMenu.classList.remove('hidden');
//       userNameSpan.textContent = username;
//     } else {
//       loginButton.classList.remove('hidden');
//       userMenu.classList.add('hidden');
//     }
//   }

//   render(formType = 'login') {
//     const markup = this._generateMarkup(formType);
//     this._clear();
//     this._parentElement.insertAdjacentHTML('afterbegin', markup);
//   }

//   // --- MARKUP GENERATION (for modal forms) ---
//   _generateMarkup(formType = 'login') {
//     return formType === 'login'
//       ? this._generateLoginForm()
//       : this._generateRegisterForm();
//   }

//   _generateLoginForm() {
//     return `
//       <form class="auth__form" data-action="login">
//         <h2 class="auth__heading">Login</h2>
//         <label>Username</label>
//         <input type="text" name="username" required />
//         <label>Password</label>
//         <input type="password" name="password" required />
//         <button class="btn auth__btn">Login</button>
//         <p class="auth__switch-text">No account? <a href="#" class="auth__switch-link" data-form="register">Sign up</a></p>
//       </form>
//     `;
//   }

//   _generateRegisterForm() {
//     return `
//       <form class="auth__form" data-action="register">
//         <h2 class="auth__heading">Create Account</h2>
//         <label>Username</label>
//         <input type="text" name="username" required />
//         <label>Password</label>
//         <input type="password" name="password" required />
//         <button class="btn auth__btn">Register</button>
//         <p class="auth__switch-text">Have an account? <a href="#" class="auth__switch-link" data-form="login">Log in</a></p>
//       </form>
//     `;
//   }
// }

// export default new AuthView();
import View from './View.js';

class AuthView extends View {
  _parentElement = document.querySelector('.auth-container');
  _errorMessage = 'An error occurred. Please try again.';
  _window = document.querySelector('.auth-window');
  _overlay = document.querySelector('.overlay');
  _nav = document.querySelector('.nav');

  constructor() {
    super();
    this._addHandlerShowWindow();
    this._addHandlerHideWindow();
    this._addHandlerSwitchForm();
  }

  // --- EVENT HANDLERS ---
  _addHandlerShowWindow() {
    this._nav.addEventListener('click', e => {
      const btn = e.target.closest('.nav__btn--login');
      if (!btn) return;
      this.render(); // Renders the form inside the modal
      this.toggleWindow();
    });
  }

  _addHandlerHideWindow() {
    this._window
      .querySelector('.btn--close-modal')
      .addEventListener('click', this.toggleWindow.bind(this));
    this._overlay.addEventListener('click', this.toggleWindow.bind(this));
  }

  addHandlerAuth(handler) {
    this._parentElement.addEventListener('submit', function (e) {
      e.preventDefault();
      const form = e.target;
      const data = Object.fromEntries(new FormData(form));
      const action = form.dataset.action;
      handler(action, data);
    });
  }

  addHandlerLogout(handler) {
    this._nav.addEventListener('click', e => {
      const btn = e.target.closest('.nav__btn--logout');
      if (!btn) return;
      handler();
    });
  }

  _addHandlerSwitchForm() {
    this._parentElement.addEventListener('click', e => {
      const link = e.target.closest('.auth__switch-link');
      if (!link) return;
      this.render(link.dataset.form);
    });
  }

  // --- UI UPDATES ---
  toggleWindow() {
    this._overlay.classList.toggle('hidden');
    this._window.classList.toggle('hidden');
  }

  updateNav(isLoggedIn, username = '') {
    const loginButton = this._nav.querySelector('.nav__btn--login');
    const userMenu = this._nav.querySelector('.nav__user');
    const userNameSpan = this._nav.querySelector('.nav__user-name');

    if (isLoggedIn) {
      loginButton.classList.add('hidden');
      userMenu.classList.remove('hidden');
      userNameSpan.textContent = username;
    } else {
      loginButton.classList.remove('hidden');
      userMenu.classList.add('hidden');
    }
  }

  render(formType = 'login') {
    const markup = this._generateMarkup(formType);
    this._clear();
    this._parentElement.insertAdjacentHTML('afterbegin', markup);
  }

  _generateMarkup(formType = 'login') {
    return formType === 'login'
      ? this._generateLoginForm()
      : this._generateRegisterForm();
  }

  _generateLoginForm() {
    return `
      <form class="auth__form" data-action="login">
        <h2 class="auth__heading">Login</h2>
        <label> Username</label>
        <input type="text" name="username" required />
        <label>Password</label>
        <input type="password" name="password" required />
        <button class="btn auth__btn">Login</button>
        <p class="auth__switch-text">No account? <a href="#" class="auth__switch-link" data-form="register">Sign up</a></p>
      </form>
    `;
  }

  _generateRegisterForm() {
    return `
      <form class="auth__form" data-action="register">
        <h2 class="auth__heading">Create Account</h2>
        <label>Username</label>
        <input type="text" name="username" required />
        <label>Password</label>
        <input type="password" name="password" required />
        <button class="btn auth__btn">Register</button>
        <p class="auth__switch-text">Have an account? <a href="#" class="auth__switch-link" data-form="login">Log in</a></p>
      </form>
    `;
  }
}

export default new AuthView();
