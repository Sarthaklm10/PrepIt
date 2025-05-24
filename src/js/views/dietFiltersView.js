import View from './View.js';
import icons from 'url:../../img/icons.svg';

class DietFiltersView extends View {
  _parentElement = document.querySelector('.diet-filters');
  _errorMessage = 'Filter options unavailable';
  _message = '';
  
  render(data = {}, render = true) {
    console.log('DietFiltersView render called');
    
    if (!this._parentElement) {
      console.error('Diet filters parent element not found');
      return;
    }
    
    try {
      const markup = this._generateMarkup();
      console.log('Diet filters markup generated');

      if (!render) return markup;

      this._clear();
      this._parentElement.insertAdjacentHTML('afterbegin', markup);
      
      // After rendering, add event listener for the dropdown toggle
      const dropdown = this._parentElement.querySelector('.diet-filters__dropdown');
      if (dropdown) {
        dropdown.addEventListener('click', function(e) {
          e.stopPropagation();
          document.querySelector('.diet-filters__menu').classList.toggle('hidden');
          // Toggle active class for icon rotation
          this.classList.toggle('active');
        });
        
        // Close dropdown when clicking elsewhere
        document.addEventListener('click', function() {
          document.querySelector('.diet-filters__menu').classList.add('hidden');
          dropdown.classList.remove('active');
        });
      }
      
      console.log('Diet filters rendered successfully');
    } catch (error) {
      console.error('Error in diet filters render:', error);
      this._parentElement.innerHTML = '';
    }
  }
  
  addHandlerFilter(handler) {
    if (!this._parentElement) {
      console.error('Parent element not found for diet filter handler');
      return;
    }
    
    this._parentElement.addEventListener('click', function(e) {
      const checkbox = e.target.closest('.diet-filters__checkbox');
      if (!checkbox) return;
      
      const filterType = checkbox.dataset.filter;
      console.log('Diet filter clicked:', filterType);
      handler(filterType);
      
      // Prevent closing the dropdown when clicking inside
      e.stopPropagation();
    });
  }

  toggleActiveClass(filterType, isActive) {
    if (!this._parentElement) {
      console.error('Parent element not found for toggleActiveClass');
      return;
    }
    
    const checkbox = this._parentElement.querySelector(`.diet-filters__checkbox[data-filter="${filterType}"]`);
    if (!checkbox) {
      console.error(`Checkbox for filter "${filterType}" not found`);
      return;
    }
    
    console.log(`Toggling ${filterType} to ${isActive ? 'active' : 'inactive'}`);
    checkbox.checked = isActive;
  }

  _generateMarkup() {
    console.log('Generating diet filters markup');
    
    // Get diet filter states from the model, if available
    const dietFilters = window.model?.state?.search?.dietFilters || {
      vegetarian: false,
      vegan: false,
      glutenFree: false
    };
    
    return `
      <div class="diet-filters__container">
        <button class="diet-filters__dropdown nav__btn">
          <svg class="nav__icon">
            <use href="${icons}#icon-edit"></use>
          </svg>
          <span>Filters</span>
        </button>
        
        <div class="diet-filters__menu hidden">
          <div class="diet-filters__option">
            <input 
              type="checkbox" 
              id="vegetarian-filter" 
              class="diet-filters__checkbox" 
              data-filter="vegetarian"
              ${dietFilters.vegetarian ? 'checked' : ''}
            >
            <label for="vegetarian-filter">Vegetarian</label>
          </div>
          
          <div class="diet-filters__option">
            <input 
              type="checkbox" 
              id="vegan-filter" 
              class="diet-filters__checkbox" 
              data-filter="vegan"
              ${dietFilters.vegan ? 'checked' : ''}
            >
            <label for="vegan-filter">Vegan</label>
          </div>
          
          <div class="diet-filters__option">
            <input 
              type="checkbox" 
              id="gluten-free-filter" 
              class="diet-filters__checkbox" 
              data-filter="glutenFree"
              ${dietFilters.glutenFree ? 'checked' : ''}
            >
            <label for="gluten-free-filter">Gluten Free</label>
          </div>
        </div>
      </div>
    `;
  }
}

export default new DietFiltersView(); 