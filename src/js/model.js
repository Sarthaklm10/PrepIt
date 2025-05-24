import { async } from 'regenerator-runtime';
import { API_URL, RES_PER_PAGE, KEY } from './config.js';
// import { getJSON, sendJSON } from './helpers.js';
import { AJAX } from './helpers.js';

export const state = {
  recipe: {},
  search: {
    query: '',
    results: [],
    page: 1,
    resultsPerPage: RES_PER_PAGE,
    dietFilters: {
      vegetarian: false,
      vegan: false,
      glutenFree: false,
    },
  },
  bookmarks: [],
};

const createRecipeObject = function (data) {
  const { recipe } = data.data;
  return {
    id: recipe.id,
    title: recipe.title,
    publisher: recipe.publisher,
    sourceUrl: recipe.source_url,
    image: recipe.image_url,
    servings: recipe.servings,
    cookingTime: recipe.cooking_time,
    ingredients: recipe.ingredients,

    //adds `key` property only if it exists in recipe
    ...(recipe.key && { key: recipe.key }),
  };
};

// Add a list of non-vegetarian ingredients
const nonVegetarianIngredients = [
  'beef', 'chicken', 'pork', 'lamb', 'veal', 'turkey', 'duck', 'goose', 'fish',
  'salmon', 'tuna', 'cod', 'shrimp', 'prawn', 'crab', 'lobster', 'oyster', 'clam',
  'mussel', 'squid', 'octopus', 'bacon', 'ham', 'sausage', 'pepperoni', 'steak',
  'ground beef', 'ground pork', 'ground turkey', 'salami', 'anchovy', 'tilapia',
  'halibut', 'venison', 'bison', 'quail', 'pheasant', 'meat', 'meatball', 'ribs',
  'liver', 'kidney', 'tripe', 'bone marrow', 'bone broth', 'caviar', 'roe',
  'gelatin', 'lard', 'suet', 'trout', 'mackerel', 'sardine', 'haddock', 'mahi mahi',
  'sea bass', 'scallop', 'calamari', 'prosciutto', 'pancetta', 'chorizo', 'bologna',
  'pastrami', 'corned beef', 'foie gras', 'hot dog', 'bratwurst', 'frankfurter',
  'goat', 'lamb', 'veal', 'turkey', 'duck', 'goose', 'fish', 'salmon', 'tuna', 'cod', 'shrimp', 'prawn', 'crab', 'lobster', 'oyster', 'clam',
];

// List of non-vegan ingredients (including dairy and eggs)
const nonVeganIngredients = [
  ...nonVegetarianIngredients,
  'milk', 'cheese', 'butter', 'cream', 'yogurt', 'egg', 'honey', 'whey', 'ghee',
  'gelatin', 'mayonnaise', 'parmesan', 'mozzarella', 'cheddar', 'brie', 'ice cream',
  'buttermilk', 'cottage cheese', 'ricotta', 'sour cream', 'custard', 'quark',
  'casein', 'lactose', 'royal jelly', 'egg white', 'egg yolk', 'albumin',
  'eggnog', 'feta', 'gouda', 'mascarpone', 'provolone', 'romano', 'blue cheese',
  'camembert', 'condensed milk', 'evaporated milk', 'kefir', 'goat milk',
  'heavy cream', 'half-and-half', 'skyr', 'frosting', 'meringue', 'hollandaise',
  'aioli', 'béarnaise sauce', 'crème fraîche', 'whipped cream', 'milkshake'
];

// List of gluten-containing ingredients
const glutenIngredients = [
  'wheat', 'flour', 'barley', 'rye', 'malt', 'bread', 'pasta', 'couscous',
  'semolina', 'spelt', 'durum', 'matzo', 'graham', 'seitan', 'bulgur',
  'farina', 'soy sauce', 'wheat germ', 'wheat bran', 'wheat starch',
  'cake flour', 'all-purpose flour', 'bread flour', 'pastry flour',
  'noodles', 'cracker', 'cookie', 'pretzel', 'wafer', 'cereal', 'beer',
  'ale', 'lager', 'whiskey', 'bourbon', 'rye whiskey', 'farro',
  'orzo', 'panko', 'crouton', 'biscuit', 'croissant', 'bagel',
  'pita', 'tortilla', 'udon', 'ramen', 'soba', 'triticale',
  'kamut', 'einkorn', 'emmer', 'wheat berries', 'crumbs', 'batter'
];

// Our current loaded recipe with ingredients
let loadedRecipeCache = {};

// Function to check if a recipe is vegetarian based on its ingredients
const isVegetarian = function (recipe) {
  // If we don't have the recipe's ingredients loaded yet, we'll need to check the cache
  if (loadedRecipeCache[recipe.id]) {
    // Use cached recipe data with ingredients
    const ingredients = loadedRecipeCache[recipe.id].ingredients;
    if (!ingredients) return true; // If no ingredients data, assume it is vegetarian

    // Check if any ingredient matches non-vegetarian list
    return !ingredients.some(ingredient => {
      const description = ingredient.description.toLowerCase();
      return nonVegetarianIngredients.some(item => description.includes(item));
    });
  }

  // If we don't have the recipe in cache, we'll make our best guess from the title
  const title = recipe.title.toLowerCase();
  return !nonVegetarianIngredients.some(item => title.includes(item));
};

// Function to check if a recipe is vegan
const isVegan = function (recipe) {
  // If we don't have the recipe's ingredients loaded yet, we'll need to check the cache
  if (loadedRecipeCache[recipe.id]) {
    // Use cached recipe data with ingredients
    const ingredients = loadedRecipeCache[recipe.id].ingredients;
    if (!ingredients) return true; // If no ingredients data, assume it is vegan

    // Check if any ingredient matches non-vegan list
    return !ingredients.some(ingredient => {
      const description = ingredient.description.toLowerCase();
      return nonVeganIngredients.some(item => description.includes(item));
    });
  }

  // If we don't have the recipe in cache, we'll make our best guess from the title
  const title = recipe.title.toLowerCase();
  return !nonVeganIngredients.some(item => title.includes(item));
};

// Function to check if a recipe is gluten-free
const isGlutenFree = function (recipe) {
  // If we don't have the recipe's ingredients loaded yet, we'll need to check the cache
  if (loadedRecipeCache[recipe.id]) {
    // Use cached recipe data with ingredients
    const ingredients = loadedRecipeCache[recipe.id].ingredients;
    if (!ingredients) return true; // If no ingredients data, assume it is gluten-free

    // Check if any ingredient matches gluten list
    return !ingredients.some(ingredient => {
      const description = ingredient.description.toLowerCase();
      return glutenIngredients.some(item => description.includes(item));
    });
  }

  // If we don't have the recipe in cache, we'll make our best guess from the title
  const title = recipe.title.toLowerCase();
  return !glutenIngredients.some(item => title.includes(item));
};

export const loadRecipe = async function (id) {
  try {
    const data = await AJAX(`${API_URL}${id}?key=${KEY}`);
    state.recipe = createRecipeObject(data);

    // Cache this recipe for future dietary checks
    loadedRecipeCache[id] = state.recipe;

    if (state.bookmarks.some(bookmark => bookmark.id === id))
      state.recipe.bookmarked = true;
    else state.recipe.bookmarked = false;

    // console.log(state.recipe);
  } catch (err) {
    // Temp error handling
    console.error(`${err} 💥💥💥`);
    throw err;
  }
};

export const loadSearchResults = async function (query) {
  try {
    state.search.query = query;
    const data = await AJAX(`${API_URL}?search=${query}&key=${KEY}`);
    // console.log(data.data.recipes);

    state.search.results = data.data.recipes.map(rec => ({
      id: rec.id,
      title: rec.title,
      publisher: rec.publisher,
      image: rec.image_url,
      ...(rec.key && { key: rec.key }),
    }));

    state.search.page = 1;
  } catch (err) {
    console.error(`${err}🔥`);
    throw err;
  }
};

export const toggleDietFilter = function (filterType) {
  state.search.dietFilters[filterType] = !state.search.dietFilters[filterType];
  return state.search.dietFilters[filterType];
};

export const getFilteredResults = function () {
  // If results are empty, return empty array
  if (!state.search.results || state.search.results.length === 0) {
    console.log('No search results to filter');
    state.search.filteredCount = 0;
    return [];
  }
  
  // If diet filters object is missing, fix it
  if (!state.search.dietFilters) {
    state.search.dietFilters = {
      vegetarian: false,
      vegan: false,
      glutenFree: false,
    };
  }
  
  // If no filters are active, return all results
  const { vegetarian, vegan, glutenFree } = state.search.dietFilters;
  console.log('Active filters:', { vegetarian, vegan, glutenFree });
  
  if (!vegetarian && !vegan && !glutenFree) {
    console.log('No filters active, returning all results:', state.search.results.length);
    state.search.filteredCount = state.search.results.length;
    return state.search.results;
  }
  
  // Apply dietary filters based on our ingredient checking functions
  const filteredResults = state.search.results.filter(recipe => {
    if (vegetarian && !isVegetarian(recipe)) {
      return false;
    }
    
    if (vegan && !isVegan(recipe)) {
      return false;
    }
    
    if (glutenFree && !isGlutenFree(recipe)) {
      return false;
    }
    
    return true;
  });
  
  console.log(`Filtered results: ${filteredResults.length} of ${state.search.results.length}`);
  state.search.filteredCount = filteredResults.length;
  return filteredResults;
};

export const getSearchResultsPage = function (page = state.search.page) {
  state.search.page = page;

  // Get filtered results
  const filteredResults = getFilteredResults();
  
  // Calculate total pages
  const totalPages = Math.ceil(filteredResults.length / state.search.resultsPerPage);
  
  // If current page is greater than total pages and total pages > 0, reset to page 1
  if (state.search.page > totalPages && totalPages > 0) {
    state.search.page = 1;
  }

  const start = (state.search.page - 1) * state.search.resultsPerPage;
  const end = state.search.page * state.search.resultsPerPage;

  return filteredResults.slice(start, end);
};

export const updateServings = function (newServings) {
  state.recipe.ingredients.forEach(ing => {
    ing.quantity = (ing.quantity * newServings) / state.recipe.servings;
    // newQt = oldQt * newServings / oldServings // 2 * 8 / 4 = 4
  });

  state.recipe.servings = newServings;
};

const persistBookmarks = function () {
  localStorage.setItem('bookmarks', JSON.stringify(state.bookmarks));
};

export const addBookmark = function (recipe) {
  // Add bookmark
  state.bookmarks.push(recipe);

  // Mark current recipe as bookmarked
  if (recipe.id === state.recipe.id) state.recipe.bookmarked = true;

  persistBookmarks();
};

export const removeBookmark = function (id) {
  // Delete bookmark
  const index = state.bookmarks.findIndex(el => el.id === id);
  state.bookmarks.splice(index, 1);

  // Mark current recipe as NOT bookmarked
  if (id === state.recipe.id) state.recipe.bookmarked = false;

  persistBookmarks();
};

const init = function () {
  const storage = localStorage.getItem('bookmarks');
  if (storage) state.bookmarks = JSON.parse(storage);
};
init();

const clearBookmarks = function () {
  localStorage.clear('bookmarks');
};
// clearBookmarks();

export const uploadRecipe = async function (newRecipe) {
  try {
    const ingredients = Object.entries(newRecipe)
      .filter(entry => entry[0].startsWith("ingredient") && entry[1] !== "")
      .map(ing => {
        const ingArr = ing[1].split(',').map(el => el.trim());
        if (ingArr.length !== 3 || ingArr[2] === '')
          throw new Error("Wrong format! Please use the format: 'Quantity,Unit,Description'");

        const [quantity, unit, description] = ingArr;
        return {
          quantity: quantity ? +quantity : null,
          unit,
          description
        };
      });

    const recipe = {
      title: newRecipe.title,
      source_url: newRecipe.sourceUrl,
      image_url: newRecipe.image,
      publisher: newRecipe.publisher,
      cooking_time: Number(newRecipe.cookingTime),
      servings: Number(newRecipe.servings),
      ingredients,
    };

    // console.log(recipe);

    const data = await AJAX(`${API_URL}?key=${KEY}`, recipe);
    state.recipe = createRecipeObject(data);

    // Add bookmark to the new recipe
    addBookmark(state.recipe);

  }
  catch (err) {
    throw err;
  }
};
