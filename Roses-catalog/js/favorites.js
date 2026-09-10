// favorites.js — логика работы с избранным через localStorage
// Предоставляет: isInFavorites, toggleFavorite, getFavorites

/**
 * Ключ для localStorage
 */
const FAVORITES_KEY = 'roses-catalog-favorites';

/**
 * Получить список ID избранных сортов
 * @returns {string[]} Массив ID
 */
function getFavorites() {
  const stored = localStorage.getItem(FAVORITES_KEY);
  if (!stored) return [];
  try {
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.warn('favorites.js: повреждённые данные в localStorage, сброс.');
    localStorage.removeItem(FAVORITES_KEY);
    return [];
  }
}

/**
 * Проверить, есть ли сорт в избранном
 * @param {string} id - ID сорта
 * @returns {boolean}
 */
function isInFavorites(id) {
  return getFavorites().includes(id);
}

/**
 * Переключить статус избранного для сорта
 * Обновляет кнопку визуально и сохраняет в localStorage
 * @param {string} id - ID сорта
 * @param {HTMLElement} [btn] - Кнопка (опционально), чтобы обновить её текст/класс
 */
function toggleFavorite(id, btn) {
  let favorites = getFavorites();
  const index = favorites.indexOf(id);

  if (index === -1) {
    // Добавляем в избранное
    favorites.push(id);
  } else {
    // Удаляем из избранного
    favorites.splice(index, 1);
  }

  // Сохраняем обратно
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));

  // Обновляем кнопку, если передали
  if (btn) {
    updateFavoriteButton(btn, id);
  }
}

/**
 * Обновить кнопку «В избранное» по текущему состоянию
 * @param {HTMLElement} btn - Кнопка
 * @param {string} id - ID сорта
 */
function updateFavoriteButton(btn, id) {
  const isFav = isInFavorites(id);
  btn.classList.toggle('active', isFav);
  btn.textContent = isFav ? '♥ В избранном' : '♡ В избранное';
}

/**
 * Получить полные данные избранных сортов (объекты из roses)
 * Полезно для страницы favorites.html
 * @returns {Object[]} Массив объектов сортов
 */
function getFavoriteRoses() {
  const favIds = getFavorites();
  if (!Array.isArray(roses)) return [];
  return roses.filter(rose => favIds.includes(rose.id));
}

// --- Авто-обновление кнопок на странице при загрузке (опционально) ---
// Если хочешь, чтобы при перезагрузке страницы кнопки сразу были «активными»,
// можно вызвать это на нужных страницах или оставить на усмотрение page-скриптов.
document.addEventListener('DOMContentLoaded', () => {
  // Находим все кнопки с data-id и обновляем их состояние
  document.querySelectorAll('.card__fav-btn[data-id]').forEach(btn => {
    const id = btn.getAttribute('data-id');
    if (id) {
      updateFavoriteButton(btn, id);
    }
  });
});

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