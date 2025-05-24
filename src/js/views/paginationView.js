import View from './View.js';
import icons from 'url:../../img/icons.svg'; // Parcel 2

class PaginationView extends View {
  _parentElement = document.querySelector('.pagination');

  addHandlerClick(handler) {
    this._parentElement.addEventListener('click', function (e) {
      const btn = e.target.closest('.btn--inline');
      if (!btn) return;

      const goToPage = +btn.dataset.goto;
      handler(goToPage);
    });
  }

  _generateMarkup() {
    const curPage = this._data.page;
    const numResults = this._data.filteredCount !== undefined ? 
      this._data.filteredCount : 
      this._data.results.length;
    
    const numPages = Math.ceil(numResults / this._data.resultsPerPage);

    // Page 1 with other pages
    if (curPage === 1 && numPages > 1) {
      return `
        <div class="pagination__container">
          <div class="pagination__placeholder"></div>
          <div class="pagination__current-page">
            <span>Page ${curPage} of ${numPages}</span>
          </div>
          <button data-goto="${curPage + 1}" class="btn--inline pagination__btn--next">
            <span>Next</span>
            <svg class="search__icon">
              <use href="${icons}#icon-arrow-right"></use>
            </svg>
          </button>
        </div>
      `;
    }

    // Last page
    if (curPage === numPages && numPages > 1) {
      return `
        <div class="pagination__container">
          <button data-goto="${curPage - 1}" class="btn--inline pagination__btn--prev">
            <svg class="search__icon">
              <use href="${icons}#icon-arrow-left"></use>
            </svg>
            <span>Prev</span>
          </button>
          <div class="pagination__current-page">
            <span>Page ${curPage} of ${numPages}</span>
          </div>
          <div class="pagination__placeholder"></div>
        </div>
      `;
    }

    // Middle pages
    if (curPage < numPages) {
      return `
        <div class="pagination__container">
          <button data-goto="${curPage - 1}" class="btn--inline pagination__btn--prev">
            <svg class="search__icon">
              <use href="${icons}#icon-arrow-left"></use>
            </svg>
            <span>Prev</span>
          </button>
          <div class="pagination__current-page">
            <span>Page ${curPage} of ${numPages}</span>
          </div>
          <button data-goto="${curPage + 1}" class="btn--inline pagination__btn--next">
            <span>Next</span>
            <svg class="search__icon">
              <use href="${icons}#icon-arrow-right"></use>
            </svg>
          </button>
        </div>
      `;
    }

    // ONLY PAGE 1
    return '';
  }
}

export default new PaginationView();