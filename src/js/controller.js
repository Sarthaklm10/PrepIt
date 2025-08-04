import * as model from './model.js';
import { MODAL_CLOSE_SEC } from './config.js';
import recipeView from './views/recipeView.js';
import resultsView from './views/resultsView.js';
import searchView from './views/searchView.js';
import bookmarksView from './views/bookmarksView.js';
import paginationView from './views/paginationView.js';
import addRecipeView from './views/addRecipeView.js';
import dietFiltersView from './views/dietFiltersView.js';
import initTheme from './theme.js';
import authView from './views/authView.js';
import { KEY } from './config.js';
import { async } from 'regenerator-runtime';
import 'regenerator-runtime/runtime';
import 'core-js/stable';

// Featured recipe IDs by category
const FEATURED_RECIPES = {
  pizzas: [
    '664c8f193e7aa067e94e897b',
    '664c8f193e7aa067e94e8906',
    '664c8f193e7aa067e94e86ba',
  ],
  burgers: [
    '664c8f193e7aa067e94e8757',
    '664c8f193e7aa067e94e82eb',
    '664c8f193e7aa067e94e8a9a',
  ],
  cakes: [
    '664c8f193e7aa067e94e83fa',
    '664c8f193e7aa067e94e8a87',
    '664c8f193e7aa067e94e833d',
  ],
  noodles: [
    '664c8f193e7aa067e94e86bc',
    '664c8f193e7aa067e94e89fb',
    '664c8f193e7aa067e94e86e3',
  ],
};

// Make model accessible to the dietFiltersView for state reading
window.model = model;

const container = document.querySelector('.container');

const scrollToTop = function () {
  // Reset window scroll position
  window.scrollTo(0, 0);

  // Reset recipe container scroll if it exists
  const recipeContainer = document.querySelector('.recipe');
  if (recipeContainer) recipeContainer.scrollTop = 0;
};

const transitionViews = function (callback) {
  // Slight fade by adding a class to the container
  const container = document.querySelector('.container');
  if (container) container.classList.add('fading');

  // Execute the callback after a short delay
  setTimeout(() => {
    // Reset scroll position
    scrollToTop();

    // Execute the content change
    callback();

    // Remove the fading class
    if (container) container.classList.remove('fading');
  }, 200);
};

// Update the hash change event listener
window.addEventListener('hashchange', function () {
  // Reset scroll position whenever the hash changes
  scrollToTop();
});

// Only add this function to your controller.js
const resetScroll = function () {
  window.scrollTo(0, 0);
  document.documentElement.scrollTop = 0;
  document.body.scrollTop = 0;
};

const controlAuth = async function (action, userData) {
  try {
    authView.renderSpinner();
    if (action === 'register') {
      await model.register(userData);
    } else if (action === 'login') {
      await model.login(userData);
    }
    authView.toggleWindow();
    authView.updateNav(true, userData.username);
    // Reload bookmarks for the logged-in user
    controlBookmarks();
  } catch (err) {
    authView.renderError(err.message);
  }
};

const controlLogout = function () {
  model.logout();
  authView.updateNav(false);
  bookmarksView.render([]); // Render an empty bookmarks list
};

const checkUserStatus = function () {
  const token = localStorage.getItem('token');
  const username = localStorage.getItem('username');
  if (token && username) {
    authView.updateNav(true, username);
    controlBookmarks();
  }
};

// Update controlRecipes
const controlRecipes = async function () {
  try {
    const id = window.location.hash.slice(1);

    if (!id) {
      // No ID - show homepage or search message
      if (!model.state.search.query) {
        container.classList.add('fullscreen-mode');
        controlWelcomePage();
      } else {
        container.classList.remove('fullscreen-mode');
        // Show diet filters if we have search results
        showDietFilters();
        recipeView.renderMessage('Select a recipe to view details.');
      }
      return;
    }

    // Recipe selected - normal layout
    container.classList.remove('fullscreen-mode');
    
    // Show diet filters if we have search results
    if (model.state.search.query) {
      showDietFilters();
    }
    
    recipeView.renderSpinner();

    // Update results view to mark selected search result
    resultsView.update(model.getSearchResultsPage());

    // Updating bookmarks view
    bookmarksView.update(model.state.bookmarks);

    // Loading recipe data
    await model.loadRecipe(id);

    // Rendering recipe - this is the crucial step
    recipeView.render(model.state.recipe);

    // After render, reset scroll position
    window.scrollTo(0, 0);
  } catch (err) {
    recipeView.renderError();
    console.error(err);
  }
};

// Simple wrapper for loadRecipe that doesn't affect the main state
const loadRecipeData = async function (id) {
  try {
    // Create a temporary API request to get recipe data
    const API_URL = 'https://forkify-api.herokuapp.com/api/v2/recipes/';
    const KEY = '59a2f5e1-2f01-4604-a81e-8a64e6e95d0b';

    // FASTER Response time
    // const KEY = 'b94c6896-4db0-42e8-89df-2115c449c311';
    const res = await fetch(`${API_URL}${id}?key=${KEY}`);

    const data = await res.json();
    if (!res.ok) throw new Error(`${data.message} (${res.status})`);

    let { recipe } = data.data;
    return {
      id: recipe.id,
      title: recipe.title,
      publisher: recipe.publisher,
      sourceUrl: recipe.source_url,
      image: recipe.image_url,
      servings: recipe.servings,
      cookingTime: recipe.cooking_time,
      ingredients: recipe.ingredients,
      ...(recipe.key && { key: recipe.key }),
    };
  } catch (err) {
    console.error(`Error loading recipe ${id}:`, err);
    throw err;
  }
};

// Function to initialize the welcome page and start loading categories
const controlWelcomePage = function () {
  // Hide diet filters on welcome page
  hideDietFilters();
  
  // Render the welcome page with empty categories
  recipeView.renderWelcomePage({});

  // Load each category separately to avoid state conflicts
  Object.entries(FEATURED_RECIPES).forEach(([category, ids]) => {
    loadCategoryRecipes(category, ids);
  });
};

// Function to load recipes for a specific category
const loadCategoryRecipes = async function (category, ids) {
  try {
    const recipes = [];

    // Load each recipe individually
    for (const id of ids) {
      try {
        // Use our wrapper function that doesn't affect the main state
        const recipeData = await loadRecipeData(id);
        if (recipeData) {
          recipes.push(recipeData);
        }
      } catch (err) {
        console.error(`Failed to load recipe ${id}:`, err);
      }
    }

    // Update the UI with the loaded recipes
    if (recipes.length > 0) {
      recipeView.updateCategorySection(category, recipes);
    } else {
      recipeView.updateCategoryError(category);
    }
  } catch (err) {
    console.error(`Error loading ${category} category:`, err);
    recipeView.updateCategoryError(category);
  }
};

const showDietFilters = function() {
  const dietFiltersElement = document.querySelector('.diet-filters');
  if (dietFiltersElement) {
    dietFiltersElement.classList.remove('hidden');
  }
};

const hideDietFilters = function() {
  const dietFiltersElement = document.querySelector('.diet-filters');
  if (dietFiltersElement) {
    dietFiltersElement.classList.add('hidden');
  }
};

// Update controlSearchResults to use transition
const controlSearchResults = async function () {
  try {
    const query = searchView.getQuery();

    if (!query) {
      // No search - show welcome page and hide filters
      hideDietFilters();
      transitionViews(() => {
        container.classList.add('fullscreen-mode');
        controlWelcomePage();
      });
      return;
    }

    // Search active - show results and filters
    transitionViews(() => {
      container.classList.remove('fullscreen-mode');
      resultsView.renderSpinner();
    });

    // Load search results
    await model.loadSearchResults(query);
    console.log('Search results loaded:', model.state.search.results.length);

    // Reset diet filters
    Object.keys(model.state.search.dietFilters).forEach(key => {
      model.state.search.dietFilters[key] = false;
    });

    // Show diet filters
    showDietFilters();

    // Clear diet filters container before rendering
    if (dietFiltersView._parentElement) {
      dietFiltersView._parentElement.innerHTML = '';
    }

    // Render diet filters
    dietFiltersView.render({});

    // Render search results
    resultsView.render(model.getSearchResultsPage(1));

    // RENDER PAGINATION
    paginationView.render(model.state.search);

    // If no hash, show empty recipe view with message
    if (!window.location.hash) {
      recipeView.renderMessage('Select a recipe to view details.');
    }
  } catch (err) {
    console.error('Search error:', err);
    resultsView.renderError();
  }
};

const controlPagination = function (goToPage) {
  // 1) Render NEW results
  resultsView.render(model.getSearchResultsPage(goToPage));

  // 2) Render NEW pagination buttons
  paginationView.render(model.state.search);
};

const controlServings = function (newServings) {
  // UPDATE RECIPE SERVINGS
  model.updateServings(newServings);

  // UPDATES entire RECIPE VIEW
  // recipeView.render(model.state.recipe);

  // Update the recipe view
  recipeView.update(model.state.recipe);
};
const controlAddBookmark = async function () {
  try {
    if (!localStorage.getItem('token'))
      throw new Error('Please log in to bookmark recipes.');

    if (!model.state.recipe.bookmarked)
      await model.addBookmark(model.state.recipe);
    else await model.removeBookmark(model.state.recipe.id);

    recipeView.update(model.state.recipe);
    bookmarksView.render(model.state.bookmarks);
  } catch (err) {
    // Call the new temporary message function instead of renderError
    recipeView.renderTemporaryMessage(err.message);
  }
};
const controlBookmarks = async function () {
  try {
    // 1. Load bookmarks from the server
    await model.loadBookmarks();
    // 2. Render bookmarks
    bookmarksView.render(model.state.bookmarks);
  } catch (err) {
    bookmarksView.renderError('Could not load bookmarks.');
  }
};

// const controlAddBookmark = function () {
//   if (!model.state.recipe.bookmarked) model.addBookmark(model.state.recipe);
//   else model.removeBookmark(model.state.recipe.id);
//   recipeView.update(model.state.recipe);
//   bookmarksView.render(model.state.bookmarks);
// };
// const controlBookmarks = function () {
//   bookmarksView.render(model.state.bookmarks);
// };

const controlAddRecipe = async function (newRecipe) {
  try {
    //Loading spinner
    addRecipeView.renderSpinner();

    // Upload new recipe data
    await model.uploadRecipe(newRecipe);
    console.log(model.state.recipe);

    // Render recipe
    recipeView.render(model.state.recipe);

    // Success message
    addRecipeView.renderMessage();

    // Update bookmark view(add new recipe)
    bookmarksView.render(model.state.bookmarks);

    // Update ID in URL
    window.history.pushState(null, '', `#${model.state.recipe.id}`);

    // Close form window
    setTimeout(function () {
      addRecipeView.toggleWindow();
    }, MODAL_CLOSE_SEC * 1000);
  } catch (err) {
    console.error('💥', err);
    addRecipeView.renderError(err.message);
  }
};

const controlDietFilter = function (filterType) {
  try {
    // Validate filter type
    if (
      !filterType ||
      !model.state.search.dietFilters.hasOwnProperty(filterType)
    ) {
      console.error('Invalid filter type:', filterType);
      return;
    }

    console.log(`Applying ${filterType} filter...`);

    // Toggle the selected filter in the model
    const isActive = model.toggleDietFilter(filterType);
    console.log(
      `${filterType} filter is now ${isActive ? 'active' : 'inactive'}`
    );

    // Update the UI to show active filter
    dietFiltersView.toggleActiveClass(filterType, isActive);

    // Re-render the search results with the filter applied
    const filteredResults = model.getSearchResultsPage(1);
    console.log(`Showing ${filteredResults.length} filtered results on page 1`);
    resultsView.render(filteredResults);

    // Re-render pagination based on new filtered results
    console.log(`Total filtered results: ${model.state.search.filteredCount}`);
    console.log(
      `Pages: ${Math.ceil(
        model.state.search.filteredCount / model.state.search.resultsPerPage
      )}`
    );
    paginationView.render(model.state.search);

    // Log the current filter state
    console.log('Current filter state:', model.state.search.dietFilters);
  } catch (error) {
    console.error('Error applying diet filter:', error);
  }
};

const init = function () {
  initTheme();

  checkUserStatus();

  authView.addHandlerAuth(controlAuth);
  // Listen for clicks on the logout button
  authView.addHandlerLogout(controlLogout);

  // Set initial layout state
  if (!model.state.search.query) {
    container.classList.add('fullscreen-mode');
  } else {
    container.classList.remove('fullscreen-mode');
  }

  bookmarksView.addHandlerRender(controlBookmarks);
  recipeView.addHandlerRender(controlRecipes);
  recipeView.addHandlerUpdateServings(controlServings);
  recipeView.addHandlerAddBookmark(controlAddBookmark);
  searchView.addHandlerSearch(controlSearchResults);
  paginationView.addHandlerClick(controlPagination);
  addRecipeView.addHandlerUpload(controlAddRecipe);
  dietFiltersView.addHandlerFilter(controlDietFilter);

  // Render welcome page on initial load
  if (!window.location.hash) {
    controlWelcomePage();
  }

  // Add event listener for hash changes to reset scroll
  window.addEventListener('hashchange', resetScroll);
  window.model = model;
  
  // Add hover functionality for My Recipes
  initMyRecipesHover();
};
const initMyRecipesHover = function () {
  const myRecipesItem = document.querySelector('.nav__item--my-recipes');
  const previewContainer = document.querySelector('.nav__bookmarks-preview');
  const previewList = document.querySelector('.nav__bookmarks-list');
  
  if (!myRecipesItem || !previewContainer || !previewList) return;
  
  let hoverTimeout;
  
  myRecipesItem.addEventListener('mouseenter', async function () {
    clearTimeout(hoverTimeout);
    try {
      await model.loadBookmarks();
      const bookmarks = model.state.bookmarks.slice(0, 5); // Show only first 5
      
      if (bookmarks.length === 0) {
        previewList.innerHTML = '<li class="nav__bookmark-empty">No saved recipes yet</li>';
      } else {
        const markup = bookmarks.map(bookmark => `
          <li class="nav__bookmark-item">
            <a href="/?id=${bookmark.id}" class="nav__bookmark-link">
              <img src="${bookmark.image}" alt="${bookmark.title}" class="nav__bookmark-image" />
              <div class="nav__bookmark-info">
                <span class="nav__bookmark-title">${bookmark.title.length > 25 ? bookmark.title.slice(0, 25) + '...' : bookmark.title}</span>
                <span class="nav__bookmark-publisher">${bookmark.publisher}</span>
              </div>
            </a>
          </li>
        `).join('');
        previewList.innerHTML = markup;
      }
      
      previewContainer.classList.remove('hidden');
    } catch (err) {
      console.error('Failed to load bookmarks preview:', err);
      previewList.innerHTML = '<li class="nav__bookmark-empty">Failed to load recipes</li>';
      previewContainer.classList.remove('hidden');
    }
  });
  
  myRecipesItem.addEventListener('mouseleave', function () {
    hoverTimeout = setTimeout(() => {
      previewContainer.classList.add('hidden');
    }, 200); // Small delay to allow moving to preview
  });
  
  previewContainer.addEventListener('mouseenter', function () {
    clearTimeout(hoverTimeout);
  });
  
  previewContainer.addEventListener('mouseleave', function () {
    previewContainer.classList.add('hidden');
  });
};

init();

const clear = function () {
  localStorage.clear();
};

// clear();
// window.addEventListener('load', controlRecipes);
// window.addEventListener('hashchange', controlRecipes);

///////////////////////////////////////
