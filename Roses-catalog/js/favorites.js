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

document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('favoritesContainer');
  if (!container) return;
// --- Авто-обновление кнопок на странице при загрузке (опционально) ---
// Если хочешь, чтобы при перезагрузке страницы кнопки сразу были «активными»,
// можно вызвать это на нужных страницах или оставить на усмотрение page-скриптов.
window.rosesReady.then(() => {
  document.addEventListener('DOMContentLoaded', () => {
    // Находим все кнопки с data-id и обновляем их состояние
    document.querySelectorAll('.card__fav-btn[data-id]').forEach(btn => {
      const id = btn.getAttribute('data-id');
      if (id) {
        updateFavoriteButton(btn, id);
      }
    });
  });
});
// favorites-page.js — логика страницы избранного
// - рендерит карточки из localStorage
// - анимация удаления
// - пустое состояние с иллюстрацией

window.rosesReady.then(() => {
  const container = document.getElementById('favoritesContainer');
  if (!container) return;

  // === ОБЪЕДИНЁННЫЙ РЕЙТИНГ (как в каталоге и на главной) ===
  function getMerged(rose) {
    if (window.RoseRatings && RoseRatings.getMergedRating) {
      return RoseRatings.getMergedRating(rose.id);
    }
    const arr = Array.isArray(rose.reviews) ? rose.reviews : [];
    const sum = arr.reduce((s, r) => s + (Number(r.score) || 0), 0);
    const avg = arr.length ? sum / arr.length : (parseFloat(rose.rating) || 0);
    return { avg: Math.round(avg * 10) / 10, count: arr.length };
  }

  // === КОРРЕКТНЫЙ ПУТЬ К КАРТИНКЕ ===
  function getImageSrc(rose) {
    if (Array.isArray(rose.images) && rose.images.length > 0) {
      const fileName = rose.images[0];
      if (!fileName) return '';
      return fileName.includes('/') ? fileName : `img/${fileName}`;
    }
    return '';
  }

  // === ПЛАВНЫЙ СЧЁТЧИК ЧИСЛА ===
  function animateNumber(el, target) {
    const dur = 800;
    const t0 = performance.now();
    function tick(now) {
      const p = Math.min(1, (now - t0) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = (target * eased).toFixed(1);
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  renderFavorites();

   function renderFavorites() {
    const favorites = getFavorites();

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
    header.innerHTML = `<span class="favorites-header__count">${count} ${word}</span>`;
    container.appendChild(header);

    // --- Сетка карточек: те же классы, что в каталоге ---
    const grid = document.createElement('div');
    grid.className = 'cards-grid';

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
    card.className = 'card';              // ← класс из каталога
    card.dataset.id = rose.id;

    const isFav = isInFavorites(rose.id);
    const { avg: ratingNum, count: reviewsCount } = getMerged(rose);
    const category = rose.categoryLabel || rose.category || 'Сорт';
    const imageSrc = getImageSrc(rose);

    card.innerHTML = `
  <a href="rose.html?id=${rose.id}" class="card__link">
    <div class="card__image-wrap">
      <img src="${imageSrc}" alt="${rose.name || 'Роза'}"
           class="card__image" loading="lazy" onerror="this.style.display='none'">
      ${ratingNum > 0 ? `
        <span class="card__badge" data-rating="${ratingNum}">
          <span class="card__badge-star" aria-hidden="true">★</span>
          <span class="card__badge-value">0.0</span>
        </span>` : ''}
    </div>
    <div class="card__body">
      <span class="card__category">${category}</span>
      <h3 class="card__title">${rose.name || 'Без названия'}</h3>
      ${rose.latinName ? `<p class="card__latin">${rose.latinName}</p>` : ''}
      <p class="card__desc">${rose.color || 'Красивый сорт розы'}</p>
    </div>
  </a>
  <div class="card__footer">
    <div class="stars-wrapper">
      <span class="stars-visual" data-rating="${ratingNum}" style="--rating:0"></span>
      ${reviewsCount > 0 ? `<span class="rating-count">${reviewsCount}</span>` : ''}
    </div>
    <button type="button" class="card__fav-btn active" data-id="${rose.id}">
      ❤️ В избранном
    </button>
  </div>
`;

    // Анимация: цифра счётчиком, звёзды заливкой
    const badge = card.querySelector('.card__badge[data-rating]');
    if (badge) {
      const valueEl = badge.querySelector('.card__badge-value');
      if (valueEl) animateNumber(valueEl, parseFloat(badge.dataset.rating));
    }
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        card.querySelectorAll('.stars-visual[data-rating]').forEach(el => {
          el.style.setProperty('--rating', el.dataset.rating);
        });
      });
    });

    // Клик по «В избранном» — удаляет с анимацией
    const favBtn = card.querySelector('.card__fav-btn');
    favBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();

      card.classList.add('fav-card--removing');
      card.addEventListener('animationend', () => {
        toggleFavorite(rose.id);   // функция сама удалит сорт из localStorage
        renderFavorites();
      }, { once: true });
    });

    return card;
  }
});
});