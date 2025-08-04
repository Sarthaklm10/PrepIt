import * as model from './model.js';
import initTheme from './theme.js';

const container = document.querySelector('.container');
const bookmarksGrid = document.querySelector('.bookmarks-grid');
const emptyState = document.querySelector('.empty-state');

const init = async function () {
  initTheme();
  await loadBookmarks();
};

const loadBookmarks = async function () {
  try {
    await model.loadBookmarks();
    const bookmarks = model.state.bookmarks;
    
    if (bookmarks.length === 0) {
      bookmarksGrid.classList.add('hidden');
      emptyState.classList.remove('hidden');
      return;
    }
    
    emptyState.classList.add('hidden');
    bookmarksGrid.classList.remove('hidden');
    
    renderBookmarks(bookmarks);
  } catch (err) {
    console.error('Failed to load bookmarks:', err);
    bookmarksGrid.classList.add('hidden');
    emptyState.classList.remove('hidden');
  }
};

const renderBookmarks = function (bookmarks) {
  const markup = bookmarks.map(bookmark => createBookmarkHTML(bookmark)).join('');
  bookmarksGrid.innerHTML = markup;
  
  // Add event listeners for bookmark actions
  addBookmarkEventListeners();
};

const createBookmarkHTML = function (recipe) {
  return `
    <div class="bookmark-card" data-id="${recipe.id}">
      <div class="bookmark-image">
        <img src="${recipe.image}" alt="${recipe.title}" />
        <button class="bookmark-remove" title="Remove bookmark">
          <svg>
            <use href="src/img/icons.svg#icon-x"></use>
          </svg>
        </button>
      </div>
      <div class="bookmark-content">
        <h3 class="bookmark-title">${recipe.title}</h3>
        <p class="bookmark-publisher">${recipe.publisher}</p>
        <div class="bookmark-meta">
          <span class="bookmark-time">
            <svg>
              <use href="src/img/icons.svg#icon-clock"></use>
            </svg>
            ${recipe.cookingTime} min
          </span>
          <span class="bookmark-servings">
            <svg>
              <use href="src/img/icons.svg#icon-users"></use>
            </svg>
            ${recipe.servings} servings
          </span>
        </div>
        <a href="/?id=${recipe.id}" class="btn btn--small btn--primary">View Recipe</a>
      </div>
    </div>
  `;
};

const addBookmarkEventListeners = function () {
  const removeButtons = document.querySelectorAll('.bookmark-remove');
  
  removeButtons.forEach(btn => {
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      const bookmarkCard = e.target.closest('.bookmark-card');
      const recipeId = bookmarkCard.dataset.id;
      
      // Remove from model
      model.removeBookmark(recipeId);
      
      // Remove from display
      bookmarkCard.remove();
      
      // Check if we need to show empty state
      if (document.querySelectorAll('.bookmark-card').length === 0) {
        bookmarksGrid.classList.add('hidden');
        emptyState.classList.remove('hidden');
      }
    });
  });
};

init();