import icons from 'url:../../img/icons.svg'; // Parcel 2

export default class View {
  _data;

  /**
   * Render the received object to the DOM
   * @param {Object | Object[]} data The data to be rendered (e.g. recipe)
   * @param {boolean} [render=true] If false, create markup string 
   * @returns {undefined | string} Markup string is returned if render=false
   * @this {Object} View instance
   * @author Sarthak
   */
  render(data, render = true) {
    if (!this._parentElement) {
      console.error(`Parent element not found for ${this.constructor.name}`);
      return;
    }
    
    // If this is RecipeView and no data (initial state), show welcome page
    if (this.constructor.name === 'RecipeView' && !data) {
      const markup = this._generateWelcomeMarkup();
      this._clear();
      this._parentElement.insertAdjacentHTML('afterbegin', markup);
      return;
    }

    // Don't treat empty objects as missing data
    const dataIsMissing = 
      data === undefined || 
      data === null || 
      (Array.isArray(data) && data.length === 0);
    
    if (dataIsMissing) {
      console.log(`No data provided to render for ${this.constructor.name}, showing error`);
      return this.renderError();
    }

    this._data = data;
    
    try {
      const markup = this._generateMarkup();

      if (!render) return markup;

      this._clear();
      this._parentElement.insertAdjacentHTML('afterbegin', markup);
    } catch (error) {
      console.error(`Error rendering view for ${this.constructor.name}:`, error);
      this.renderError('Something went wrong. Please try again.');
    }
  }

  /**
   * Efficiently updates the DOM using virtual DOM diffing
   * @param {Object} data Updated data to be patched into the view
   * @this {View}
   */
  update(data) {
    if (!this._parentElement) {
      console.error('Parent element not found');
      return;
    }
    
    if (!data) return;
    
    this._data = data;
    
    try {
      const newMarkup = this._generateMarkup();

      // Convert string to new DOM object(virtual DOM)
      const newDOM = document.createRange().createContextualFragment(newMarkup);
      const newElements = Array.from(newDOM.querySelectorAll('*'));
      const curElements = Array.from(this._parentElement.querySelectorAll('*'));

      newElements.forEach((newEl, i) => {
        const curEl = curElements[i];
        if (!curEl) return;
        
        // Update the textcontent of the current element
        if (
          !newEl.isEqualNode(curEl) &&
          newEl.firstChild?.nodeValue.trim() !== ''
        ) {
          curEl.textContent = newEl.textContent;
        }

        // Update attributes of current elt
        if (!newEl.isEqualNode(curEl))
          Array.from(newEl.attributes).forEach(attr =>
            curEl.setAttribute(attr.name, attr.value)
          );
      });
    } catch (error) {
      console.error('Error updating view:', error);
    }
  }

  /**
   * Clears the parent element's content
   * @private
   * @this {View}
   */
  _clear() {
    if (this._parentElement)
      this._parentElement.innerHTML = '';
  }

  /**
     * Render a loading spinner inside parent element
     * @this {View}
     */
  renderSpinner() {
    if (!this._parentElement) return;
    
    const markup = `
      <div class="spinner">
        <svg>
          <use href="${icons}#icon-loader"></use>
        </svg>
      </div>
    `;
    this._clear();
    this._parentElement.insertAdjacentHTML('afterbegin', markup);
  }
  /**
    * Render an error message to the DOM
    * @param {string} [message=this._errorMessage] The message to show
    * @this {View}
    */
  renderError(message = this._errorMessage) {
    if (!this._parentElement) return;
    
    console.log(`Rendering error in ${this.constructor.name}: "${message}"`);
    
    const markup = `
      <div class="error">
        <div>
          <svg>
            <use href="${icons}#icon-alert-triangle"></use>
          </svg>
        </div>
        <p>${message || 'An error occurred. Please try again.'}</p>
      </div>
    `;
    this._clear();
    this._parentElement.insertAdjacentHTML('afterbegin', markup);
  }

  /**
   * Render a generic success message to the DOM
   * @param {string} [message=this._message] The message to show
   * @this {View}
   */
  renderMessage(message = this._message) {
    const markup = `
      <div class="message">
        <div>
          <svg>
            <use href="${icons}#icon-smile"></use>
          </svg>
        </div>
        <p>${message}</p>
      </div>
    `;
    this._clear();
    this._parentElement.insertAdjacentHTML('afterbegin', markup);
  }
}
