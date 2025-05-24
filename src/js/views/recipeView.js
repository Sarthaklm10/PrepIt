import View from './View.js';

import icons from 'url:../../img/icons.svg'; // Parcel 2
import { Fraction } from 'fractional';
import { FEATURED_RECIPES } from '../config.js';

class RecipeView extends View {
  _parentElement = document.querySelector('.recipe');
  _errorMessage = 'We could not find that recipe. Please try another one!';
  _message = '';

  addHandlerRender(handler) {
    ['hashchange', 'load'].forEach(ev => window.addEventListener(ev, handler));
  }

  addHandlerUpdateServings(handler) {
    this._parentElement.addEventListener('click', function (e) {
      const btn = e.target.closest('.btn--update-servings');
      if (!btn) return;
      const { updateTo } = btn.dataset;
      if (+updateTo > 0) handler(+updateTo);
    });
  }

  addHandlerAddBookmark(handler) {
    this._parentElement.addEventListener('click', function (e) {
      const btn = e.target.closest('.btn--bookmark');
      if (!btn) return;
      handler();
    });
  }

  renderWelcomePage(categorizedRecipes = {}) {
    const markup = this._generateWelcomeMarkup(categorizedRecipes);
    this._clear();
    this._parentElement.insertAdjacentHTML('afterbegin', markup);

    // Add smooth scrolling for category links
    this._addCategoryScrolling();
  }

  updateCategorySection(category, recipes) {
    const sectionId = `${category.slice(0, -1)}-section`;
    const section = document.getElementById(sectionId);
    
    if (section) {
      const container = section.querySelector('.welcome-section__featured');
      if (container && recipes && recipes.length > 0) {
        container.innerHTML = this._generateCategoryRecipes(recipes);
      }
    }
  }

  updateCategoryError(category) {
    const sectionId = `${category.slice(0, -1)}-section`;
    const section = document.getElementById(sectionId);
    
    if (section) {
      const container = section.querySelector('.welcome-section__featured');
      if (container) {
        container.innerHTML = `<p class="welcome-section__error">Failed to load recipes. Please try again later.</p>`;
      }
    }
  }

  _addCategoryScrolling() {
    const categoryLinks = document.querySelectorAll('.welcome-section__category-link');
    categoryLinks.forEach(link => {
      link.addEventListener('click', function (e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        const targetSection = document.querySelector(targetId);
        if (targetSection) {
          targetSection.scrollIntoView({ behavior: 'smooth' });
        }
      });
    });
  }

  _generateMarkup() {
    return `
      <figure class="recipe__fig">
        <img src="${this._data.image}" alt="${this._data.title}" class="recipe__img" />
        <h1 class="recipe__title">
          <span>${this._data.title}</span>
        </h1>
      </figure>

      <div class="recipe__details">
        <div class="recipe__info">
          <svg class="recipe__info-icon">
            <use href="${icons}#icon-clock"></use>
          </svg>
          <span class="recipe__info-data recipe__info-data--minutes">${this._data.cookingTime}</span>
          <span class="recipe__info-text">minutes</span>
        </div>
        <div class="recipe__info">
          <svg class="recipe__info-icon">
            <use href="${icons}#icon-users"></use>
          </svg>
          <span class="recipe__info-data recipe__info-data--people">${this._data.servings}</span>
          <span class="recipe__info-text">servings</span>

          <div class="recipe__info-buttons">
            <button class="btn--tiny btn--update-servings" data-update-to="${this._data.servings - 1}">
              <svg>
                <use href="${icons}#icon-minus-circle"></use>
              </svg>
            </button>
            <button class="btn--tiny btn--update-servings" data-update-to="${this._data.servings + 1}">
              <svg>
                <use href="${icons}#icon-plus-circle"></use>
              </svg>
            </button>
          </div>
        </div>

        <div class="recipe__user-generated ${this._data.key ? '' : 'hidden'}">
          <svg>
            <use href="${icons}#icon-user"></use>
          </svg>
        </div>
        <button class="btn--round btn--bookmark">
          <svg class="">
            <use href="${icons}#icon-bookmark${this._data.bookmarked ? '-fill' : ''}"></use>
          </svg>
        </button>
      </div>

      <div class="recipe__ingredients">
        <h2 class="heading--2">Recipe ingredients</h2>
        <ul class="recipe__ingredient-list">
          ${this._data.ingredients.map(this._generateMarkupIngredient).join('')}
        </ul>
      </div>

      <div class="recipe__directions">
        <h2 class="heading--2">How to cook it</h2>
        <p class="recipe__directions-text">
          This recipe was carefully designed and tested by
          <span class="recipe__publisher">${this._data.publisher}</span>. Please check out
          directions at their website.
        </p>
        <a
          class="btn--small recipe__btn"
          href="${this._data.sourceUrl}"
          target="_blank"
        >
          <span>Directions</span>
          <svg class="search__icon">
            <use href="${icons}#icon-arrow-right"></use>
          </svg>
        </a>
      </div>
    `;
  }

  _generateMarkupIngredient(ing) {
    return `
      <li class="recipe__ingredient">
        <svg class="recipe__icon">
          <use href="${icons}#icon-check"></use>
        </svg>
        <div class="recipe__quantity">${ing.quantity ? new Fraction(ing.quantity).toString() : ''}</div>
        <div class="recipe__description">
          <span class="recipe__unit">${ing.unit}</span>
          ${ing.description}
        </div>
      </li>
    `;
  }

  _generateWelcomeMarkup(categorizedRecipes) {
    return `
      <div class="welcome-section">
        <h1 class="welcome-section__title">Welcome to PrepIt!</h1>
        <p class="welcome-section__subtitle">
          Discover amazing recipes for your next meal
        </p>
        
        <!-- Pizza Section -->
        <div id="pizza-section" class="welcome-section__category">
          <h2 class="welcome-section__category-title">Pizza Recipes</h2>
          <div class="welcome-section__featured">
            ${this._generateSkeletonCards(3)}
          </div>
        </div>
        
        <!-- Burger Section -->
        <div id="burger-section" class="welcome-section__category">
          <h2 class="welcome-section__category-title">Burger Recipes</h2>
          <div class="welcome-section__featured">
            ${this._generateSkeletonCards(3)}
          </div>
        </div>
        
        <!-- Cake Section -->
        <div id="cake-section" class="welcome-section__category">
          <h2 class="welcome-section__category-title">Cake Recipes</h2>
          <div class="welcome-section__featured">
            ${this._generateSkeletonCards(3)}
          </div>
        </div>
        
        <!-- Noodle Section -->
        <div id="noodle-section" class="welcome-section__category">
          <h2 class="welcome-section__category-title">Noodle Recipes</h2>
          <div class="welcome-section__featured">
            ${this._generateSkeletonCards(3)}
          </div>
        </div>
      </div>
    `;
  }

  _generateSkeletonCards(count = 3) {
    let skeletons = '';
    for (let i = 0; i < count; i++) {
      skeletons += `
        <div class="welcome-section__card welcome-section__card--skeleton">
          <div class="skeleton-img"></div>
          <div class="welcome-section__card-content">
            <div class="skeleton-title"></div>
            <div class="skeleton-text"></div>
            <div class="welcome-section__card-meta">
              <div class="skeleton-meta"></div>
              <div class="skeleton-meta"></div>
            </div>
          </div>
        </div>
      `;
    }
    return skeletons;
  }

  _generateCategoryRecipes(recipes) {
    if (!recipes.length) return `<p class="welcome-section__empty">No recipes found</p>`;
    
    return recipes.map(recipe => this._generateFeaturedRecipeCard(recipe)).join('');
  }

  _generateFeaturedRecipeCard(recipe) {
    if (!recipe || !recipe.id) return '';
    
    return `
      <div class="welcome-section__card" onclick="window.location.hash='${recipe.id}'">
        <img src="${recipe.image}" alt="${recipe.title}" onerror="this.onerror=null; this.src='src/img/placeholder.png';">
        <div class="welcome-section__card-content">
          <h3 class="welcome-section__card-title">${recipe.title}</h3>
          <p class="welcome-section__card-description">By ${recipe.publisher}</p>
          <div class="welcome-section__card-meta">
            <span><svg><use href="${icons}#icon-clock"></use></svg>${recipe.cookingTime} mins</span>
            <span><svg><use href="${icons}#icon-users"></use></svg>${recipe.servings} servings</span>
          </div>
        </div>
      </div>
    `;
  }

  render(data, render = true) {
    // Call parent's render method first
    super.render(data, render);
    
    // After rendering, reset scroll position
    if (render && this._parentElement) {
      this._parentElement.scrollTop = 0;
      window.scrollTo(0, 0);
    }
  }

}

export default new RecipeView();

