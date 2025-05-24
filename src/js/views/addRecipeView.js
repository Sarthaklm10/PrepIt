import View from "./View";
import icons from 'url:../../img/icons.svg';

class AddRecipeView extends View {
  _parentElement = document.querySelector('.upload');
  _message = 'Recipe uploaded successfully.'
  _window = document.querySelector(".add-recipe-window");
  _overlay = document.querySelector(".overlay");
  _btnOpen = document.querySelector(".nav__btn--add-recipe");
  _btnClose = document.querySelector(".btn--close-modal");
  _ingredientCount = 6; // Keep track of how many ingredient fields we have

  toggleWindow() {
    this._overlay.classList.toggle('hidden');
    this._window.classList.toggle('hidden');
  }

  constructor() {
    super();
    this._btnOpen.addEventListener('click', () => this.toggleWindow());
    this._btnClose.addEventListener('click', () => this.toggleWindow());
    this._overlay.addEventListener('click', () => this.toggleWindow());
    this._addAddIngredientHandler();
  }

  _addAddIngredientHandler() {
    this._parentElement.addEventListener('click', e => {
      const btn = e.target.closest('.btn--add-ingredient');
      if (!btn) return;
      
      this._addIngredientField();
    });
  }

  _addIngredientField() {
    this._ingredientCount++;
    
    // Get the ingredient section container
    const ingredientSection = this._parentElement.querySelector('.ingredient-container');
    
    // Create label element
    const label = document.createElement('label');
    label.textContent = `Ingredient ${this._ingredientCount}`;
    
    // Create input element
    const input = document.createElement('input');
    input.type = 'text';
    input.name = `ingredient-${this._ingredientCount}`;
    input.placeholder = "'Quantity,Unit,Description'";
    
    // Append the elements to the ingredient section
    ingredientSection.appendChild(label);
    ingredientSection.appendChild(input);
  }

  addHandlerUpload(handler) {
    this._parentElement.addEventListener("submit", e => {
      e.preventDefault();
      console.log(`addHandlerUpload RUNNING`);

      const dataArr = [...new FormData(this._parentElement)];
      const data = Object.fromEntries(dataArr);
      handler(data);
    });
  }

  resetForm() {
    this._parentElement.reset();
    
    // Reset ingredient count and remove any dynamically added fields
    const ingredientContainer = this._parentElement.querySelector('.ingredient-container');
    
    // If container exists, restore to original state (6 ingredients)
    if (ingredientContainer) {
      const labels = ingredientContainer.querySelectorAll('label');
      const inputs = ingredientContainer.querySelectorAll('input');
      
      // Remove any ingredients beyond the original 6
      for (let i = 6; i < labels.length; i++) {
        ingredientContainer.removeChild(labels[i]);
        ingredientContainer.removeChild(inputs[i]);
      }
      
      this._ingredientCount = 6;
    }
  }
}

export default new AddRecipeView();