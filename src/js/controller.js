import * as model from './model.js';
import { MODAL_CLOSE_SEC } from './config.js';
import recipeView from './views/recipeView.js';
import resultsView from './views/resultsView.js';
import searchView from './views/searchView.js';
import bookmarksView from './views/bookmarksView.js';
import paginationView from './views/paginationView.js';
import addRecipeView from './views/addRecipeView.js';

import { async } from 'regenerator-runtime';
import 'regenerator-runtime/runtime';
import 'core-js/stable';

const controlRecipes = async function () {
  try {
    const id = window.location.hash.slice(1);

    if (!id)
      return;
    recipeView.renderSpinner();

    // Update results view to mark selected search result
    resultsView.update(model.getSearchResultsPage());

    // Updating bookmarks view
    bookmarksView.update(model.state.bookmarks);

    // Loading recipe
    await model.loadRecipe(id);
    // console.log("✅ Loaded recipe data:", model.state.recipe);

    // Rendering recipe
    recipeView.render(model.state.recipe);

  }
  catch (err) {
    recipeView.renderError();
    console.error(err);
  }
};

const controlSearchResults = async function () {
  try {
    resultsView.renderSpinner();
    // console.log(resultsView);

    // Get search query from search bar
    const query = searchView.getQuery();
    if (!query) return;

    // Load search results 
    await model.loadSearchResults(query);

    // Render search results
    // resultsView.render(model.state.search.results);
    resultsView.render(model.getSearchResultsPage(1));

    // RENDER PAGINATION
    paginationView.render(model.state.search)
  }
  catch (err) {
    console.log(err);
  }
}

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

const controlAddBookmark = function () {

  // console.log("CONTROLLER FOR BOOKMARKS RUNNING");
  // ADD BOOKMARK
  if (!model.state.recipe.bookmarked) model.addBookmark(model.state.recipe);

  // Remove bookmark
  else model.removeBookmark(model.state.recipe.id);

  // 2) Update recipe view
  recipeView.update(model.state.recipe);

  bookmarksView.render(model.state.bookmarks);
};

const controlBookmarks = function () {
  bookmarksView.render(model.state.bookmarks);
};

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
    window.history.pushState(null, "", `#${model.state.recipe.id}`)

    // Close form window
    setTimeout(function () {
      addRecipeView.toggleWindow();
    }, MODAL_CLOSE_SEC * 1000);

  }
  catch (err) {
    console.error('💥', err);
    addRecipeView.renderError(err.message);
  }
};
// const checker = function () {
//   console.log("SETTING UP CONTINOUS DEPLOYMENT!");
// }
const init = function () {
  bookmarksView.addHandlerRender(controlBookmarks);
  recipeView.addHandlerRender(controlRecipes);
  recipeView.addHandlerUpdateServings(controlServings);
  recipeView.addHandlerAddBookmark(controlAddBookmark);
  searchView.addHandlerSearch(controlSearchResults);
  paginationView.addHandlerClick(controlPagination);
  addRecipeView.addHandlerUpload(controlAddRecipe);
};
init();

const clear = function () {
  localStorage.clear();
}

// clear();
// window.addEventListener('load', controlRecipes);
// window.addEventListener('hashchange', controlRecipes);

///////////////////////////////////////