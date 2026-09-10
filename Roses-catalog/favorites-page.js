// favorites-page.js — логика страницы избранного
// - рендерит карточки из localStorage
// - анимация удаления
// - пустое состояние с иллюстрацией

document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('favoritesContainer');
  if (!container) return;

  renderFavorites();

  function renderFavorites() {
    const favorites = getFavorites(); // массив ID из favorites.js

    container.innerHTML = '';

    // --- Пустое состояние ---
    if (favorites.length === 0) {
      container.innerHTML = `
        <div class="fav-empty">
          <div class="fav-empty__icon">🌹</div>
          <h2 class="fav-empty__title">Здесь пока пусто</h2>
          <p class="fav-empty__text">
            Вы ещё не добавили ни одного сорта в избранное.
            Загляните в каталог — там есть что посмотреть!
          </p>
          <a href="catalog.html" class="btn fav-empty__btn">Перейти в каталог</a>
        </div>
      `;
      return;
    }

    // --- Заголовок с счётчиком ---
    const count = favorites.length;
    const word = count === 1 ? 'сорт' : (count >= 2 && count <= 4) ? 'сорта' : 'сортов';

    const header = document.createElement('div');
    header.className = 'favorites-header';
    header.innerHTML = `
      <h1>Избранное</h1>
      <span class="favorites-header__count">${count} ${word}</span>
    `;
    container.appendChild(header);

    // --- Сетка карточек ---
    const grid = document.createElement('div');
    grid.className = 'fav-grid';

    // Находим полные данные сортов по ID
    const favRoses = favorites
      .map(id => roses.find(r => r.id === id))
      .filter(rose => rose !== undefined);

    favRoses.forEach(rose => {
      grid.appendChild(createFavCard(rose));
    });

    container.appendChild(grid);
  }

  function createFavCard(rose) {
    const card = document.createElement('div');
    card.className = 'fav-card';
    card.dataset.id = rose.id;

    card.innerHTML = `
      <a href="rose.html?id=${rose.id}" class="fav-card__link">
        <div class="fav-card__image-wrap">
          <span class="fav-card__badge">${rose.categoryLabel}</span>
          <img class="fav-card__image" src="${rose.images[0]}" alt="${rose.name}" loading="lazy">
        </div>
      </a>
      <div class="fav-card__body">
        <a href="rose.html?id=${rose.id}" class="fav-card__link">
          <h3 class="fav-card__title">${rose.name}</h3>
          <p class="fav-card__latin">${rose.latinName || ''}</p>
        </a>
        <p class="fav-card__desc">${rose.description}</p>
        <div class="fav-card__footer">
          <span class="fav-card__rating">★ ${rose.rating}</span>
          <button class="fav-card__remove" data-id="${rose.id}">
            <span>✕</span> Удалить
          </button>
        </div>
      </div>
    `;

    // Обработчик удаления
    const removeBtn = card.querySelector('.fav-card__remove');
    removeBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();

      // Анимация удаления
      card.classList.add('fav-card--removing');

      // Ждём завершения анимации, затем убираем из DOM и localStorage
      card.addEventListener('animationend', () => {
        // Удаляем из localStorage через favorites.js
        let favorites = getFavorites().filter(id => id !== rose.id);
        localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));

        // Перерисовываем страницу
        renderFavorites();
      }, { once: true });
    });

    return card;
  }
});