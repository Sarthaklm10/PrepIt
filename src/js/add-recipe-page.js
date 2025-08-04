import * as model from './model.js';
import initTheme from './theme.js';

const container = document.querySelector('.container');
const recipeForm = document.querySelector('.recipe-form');
const ingredientsContainer = document.querySelector('.ingredients-container');
const addIngredientBtn = document.querySelector('.add-ingredient-btn');

let ingredientCount = 1;

const init = function () {
  initTheme();
  addEventListeners();
};

const addEventListeners = function () {
  recipeForm.addEventListener('submit', handleFormSubmit);
  addIngredientBtn.addEventListener('click', addIngredientField);
  ingredientsContainer.addEventListener('click', handleIngredientRemove);
};

const handleFormSubmit = async function (e) {
  e.preventDefault();
  
  try {
    // Show loading state
    const submitBtn = recipeForm.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<svg><use href="src/img/icons.svg#icon-loader"></use></svg> Creating...';
    submitBtn.disabled = true;
    
    // Get form data
    const formData = new FormData(recipeForm);
    const recipeData = getRecipeData(formData);
    
    // Upload recipe
    await model.uploadRecipe(recipeData);
    
    // Show success message
    showSuccessMessage();
    
    // Reset form
    recipeForm.reset();
    resetIngredients();
    
    // Restore button
    submitBtn.innerHTML = originalText;
    submitBtn.disabled = false;
    
  } catch (err) {
    console.error(err);
    showErrorMessage(err.message);
    
    // Restore button
    const submitBtn = recipeForm.querySelector('button[type="submit"]');
    submitBtn.innerHTML = '<svg><use href="src/img/icons.svg#icon-check"></use></svg> Create Recipe';
    submitBtn.disabled = false;
  }
};

const getRecipeData = function (formData) {
  // Get basic recipe data
  const recipe = {
    title: formData.get('title'),
    sourceUrl: formData.get('sourceUrl') || '',
    image: formData.get('image'),
    publisher: formData.get('publisher'),
    cookingTime: +formData.get('cookingTime'),
    servings: +formData.get('servings'),
  };
  
  // Get ingredients
  const ingredients = [];
  let i = 1;
  while (formData.get(`ingredient-${i}`)) {
    const ingredient = formData.get(`ingredient-${i}`);
    if (ingredient.trim()) {
      ingredients.push(ingredient);
    }
    i++;
  }
  
  // Add ingredients to recipe
  ingredients.forEach((ing, index) => {
    recipe[`ingredient-${index + 1}`] = ing;
  });
  
  return recipe;
};

const addIngredientField = function () {
  ingredientCount++;
  
  const ingredientHTML = `
    <div class="ingredient-item">
      <input name="ingredient-${ingredientCount}" type="text" placeholder="1,tbsp,olive oil" />
      <button type="button" class="btn-remove-ingredient">Remove</button>
    </div>
  `;
  
  ingredientsContainer.insertAdjacentHTML('beforeend', ingredientHTML);
  updateRemoveButtons();
};

const handleIngredientRemove = function (e) {
  if (e.target.classList.contains('btn-remove-ingredient')) {
    const ingredientItem = e.target.closest('.ingredient-item');
    ingredientItem.remove();
    updateRemoveButtons();
  }
};

const updateRemoveButtons = function () {
  const removeButtons = ingredientsContainer.querySelectorAll('.btn-remove-ingredient');
  removeButtons.forEach((btn, index) => {
    btn.disabled = removeButtons.length === 1;
  });
};

const resetIngredients = function () {
  ingredientCount = 1;
  ingredientsContainer.innerHTML = `
    <div class="ingredient-item">
      <input name="ingredient-1" type="text" placeholder="2,cups,flour" required />
      <button type="button" class="btn-remove-ingredient" disabled>Remove</button>
    </div>
  `;
};

const showSuccessMessage = function () {
  const message = document.createElement('div');
  message.className = 'success-message';
  message.innerHTML = `
    <svg>
      <use href="src/img/icons.svg#icon-check-circle"></use>
    </svg>
    <span>Recipe created successfully!</span>
  `;
  
  document.body.appendChild(message);
  
  setTimeout(() => {
    message.remove();
  }, 3000);
};

const showErrorMessage = function (errorText) {
  const message = document.createElement('div');
  message.className = 'error-message';
  message.innerHTML = `
    <svg>
      <use href="src/img/icons.svg#icon-alert-circle"></use>
    </svg>
    <span>Error: ${errorText}</span>
  `;
  
  document.body.appendChild(message);
  
  setTimeout(() => {
    message.remove();
  }, 5000);
};

init();