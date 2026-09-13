(function() {
  console.log('📚 Загрузка каталога...');

  // === ВСПОМОГАТЕЛЬНАЯ ФУНКЦИЯ: Расчет рейтинга из отзывов ===
  // Берёт объединённый рейтинг: отзывы из data.js + отзывы пользователя
function getMerged(rose) {
  if (window.RoseRatings && RoseRatings.getMergedRating) {
    return RoseRatings.getMergedRating(rose.id);
  }
  // Fallback — если RoseRatings почему-то не загрузился
  const arr = Array.isArray(rose.reviews) ? rose.reviews : [];
  const sum = arr.reduce((s, r) => s + (Number(r.score) || 0), 0);
  const avg = arr.length ? sum / arr.length : (parseFloat(rose.rating) || 0);
  return { avg: Math.round(avg * 10) / 10, count: arr.length };
}

  // === ПОЛУЧАЕМ ЭЛЕМЕНТЫ ===
  const container = document.getElementById('catalogCards');
  const searchInput = document.getElementById('searchInput');
  const sortSelect = document.getElementById('sortSelect');
  const filterBtns = document.querySelectorAll('.filter-btn');
  const countEl = document.getElementById('catalogCount');

  if (!container) {
    console.error('❌ Контейнер #catalogCards не найден');
    return;
  }

  // === ТЕКУЩИЕ НАСТРОЙКИ ФИЛЬТРАЦИИ ===
  let currentFilter = 'all';
  let currentSearch = '';
  let currentSort = 'default';

  // === ФУНКЦИЯ РЕНДЕРИНГА ===
  function renderCatalog() {
    // 1. Фильтрация по категории (БЕЗ ИЗМЕНЕНИЙ)
    let filtered = [...roses];
    if (currentFilter !== 'all') {
      filtered = filtered.filter(rose => 
        rose.category === currentFilter || 
        rose.categoryLabel?.toLowerCase() === currentFilter.toLowerCase()
      );
    }

    // 2. Поиск по названию (БЕЗ ИЗМЕНЕНИЙ)
    if (currentSearch.trim()) {
      const query = currentSearch.toLowerCase().trim();
      filtered = filtered.filter(rose =>
        rose.name.toLowerCase().includes(query) ||
        (rose.latinName && rose.latinName.toLowerCase().includes(query))
      );
    }

    // 3. Сортировка (ОБНОВЛЕНО: используем нашу функцию getRatingValue)
    switch (currentSort) {
      case 'rating':
        filtered.sort((a, b) => getMerged(b).avg - getMerged(a).avg);
        break;
      case 'name':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      default:
        break;
    }

    // 4. Обновляем счетчик (БЕЗ ИЗМЕНЕНИЙ)
    if (countEl) {
      countEl.textContent = `Найдено ${filtered.length} сортов`;
    }

    // 5. Рендерим карточки (БЕЗ ИЗМЕНЕНИЙ логика вызова)
    if (filtered.length === 0) {
      container.innerHTML = `
        <div style="text-align:center;padding:60px 20px;color:#999;grid-column:1/-1;">
          <p style="font-size:3rem;">🌹</p>
          <p style="font-family:Georgia,serif;font-size:1.2rem;">Ничего не найдено</p>
          <p style="color:#bbb;">Попробуйте изменить параметры поиска</p>
        </div>
      `;
      return;
    }

    container.innerHTML = filtered.map(rose => renderCard(rose)).join('');

    // Анимация: цифра в бейдже — счётчиком, звёзды — плавной заливкой
  container.querySelectorAll('.card__badge[data-rating]').forEach(badge => {
    const valueEl = badge.querySelector('.card__badge-value');
    if (valueEl) animateNumber(valueEl, parseFloat(badge.dataset.rating), '');
  });
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      container.querySelectorAll('.stars-visual[data-rating]').forEach(el => {
        el.style.setProperty('--rating', el.dataset.rating);
      });
    });
  });

    // Вешаем обработчики на кнопки "В избранное" (БЕЗ ИЗМЕНЕНИЙ)
    container.querySelectorAll('.card__fav-btn').forEach(btn => {
  btn.addEventListener('click', function(e) {
    e.preventDefault();
    e.stopPropagation();
    const id = this.dataset.id;
    toggleFavorite(id, this);                    // функция сама переключит состояние
    const isNowFavorite = isInFavorites(id);     // ← читаем новое состояние
    this.textContent = isNowFavorite ? '❤️ В избранное' : '♡ В избранное';
    this.classList.toggle('active', isNowFavorite);
  });
});

    console.log(`✅ Отображено ${filtered.length} сортов`);
  }

  // === ФУНКЦИЯ РЕНДЕРИНГА КАРТОЧКИ (ОБНОВЛЕНА) ===
  function renderCard(rose) {
    const isFav = isInFavorites(rose.id);
    
    // --- ИСПРАВЛЕННАЯ ЛОГИКА ДЛЯ МАССИВА ---
    let imageSrc = '';
    
    // 1. Проверяем, что images существует и это массив
    if (rose.images && Array.isArray(rose.images) && rose.images.length > 0) {
      // 2. Берем ПЕРВЫЙ элемент массива. 
      // Раньше тут была ошибка: мы брали весь массив целиком.
      const fileName = rose.images[0]; 
      
      // 3. Формируем путь
      if (fileName) {
        // Если в имени нет слэша, считаем, что это просто имя файла, добавляем папку img/
        if (!fileName.includes('/')) {
          imageSrc = `img/${fileName}`;
        } else {
          imageSrc = fileName;
        }
      }
    }
    // ---------------------------------------

    const { avg: ratingNum, count: reviewsCount } = getMerged(rose);
    const ratingText = ratingNum > 0 ? `${ratingNum.toFixed(1)} ★` : '—';
    const category = rose.categoryLabel || rose.category || 'Сорт';

    // ВАЖНО: Вся строка ниже должна быть строго в обратных кавычках ` ... `
    return `
     <div class="card" data-id="${rose.id}">
    <a href="rose.html?id=${rose.id}" class="card__link">
      <div class="card__image-wrap">
        <img src="${imageSrc}" alt="${rose.name}" class="card__image" loading="lazy" onerror="this.style.display='none'">
        ${ratingNum > 0 ? `
          <span class="card__badge" data-rating="${ratingNum}">
            <span class="card__badge-star" aria-hidden="true">★</span>
            <span class="card__badge-value">0.0</span>
          </span>
        ` : ''}
      </div>
      <div class="card__body">
        <span class="card__category">${category}</span>
        <h3 class="card__title">${rose.name}</h3>
        ${rose.latinName ? `<p class="card__latin">${rose.latinName}</p>` : ''}
        <p class="card__desc">${rose.color || 'Красивый сорт розы'}</p>
        <div class="card__footer">
          <div class="stars-wrapper">
            <span class="stars-visual" data-rating="${ratingNum}" style="--rating:0" aria-label="Рейтинг ${ratingNum} из 5"></span>
            ${reviewsCount > 0 ? `<span class="rating-count">${reviewsCount}</span>` : ''}
          </div>
          <button class="card__fav-btn ${isFav ? 'active' : ''}" data-id="${rose.id}">
            ${isFav ? '❤️' : '♡'} В избранное
          </button>
        </div>
      </div>
    </a>
  </div>
`;
  }

  // === ОБРАБОТЧИКИ СОБЫТИЙ (БЕЗ ИЗМЕНЕНИЙ) ===

  if (searchInput) {
    searchInput.addEventListener('input', function() {
      currentSearch = this.value;
      renderCatalog();
    });
  }

  if (sortSelect) {
    sortSelect.addEventListener('change', function() {
      currentSort = this.value;
      renderCatalog();
    });
  }

  filterBtns.forEach(btn => {
    btn.addEventListener('click', function() {
      filterBtns.forEach(b => b.classList.remove('active'));
      this.classList.add('active');
      currentFilter = this.dataset.filter;
      renderCatalog();
    });
  });

  // Плавный счётчик для цифры рейтинга
  function animateNumber(el, target, suffix = '') {
  const dur = 800;
  const t0 = performance.now();
  function tick(now) {
    const p = Math.min(1, (now - t0) / dur);
    const eased = 1 - Math.pow(1 - p, 3);
    const val = target * eased;
    el.textContent = val.toFixed(1) + suffix;
    if (p < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

  // === ПЕРВЫЙ РЕНДЕРИНГ ===
  renderCatalog();

  console.log('📚 Каталог загружен');
})();
// 
// ВТОРАЯ ВЕРСИЯ КОДА
// // ============================================
// // CATALOG.JS — СТРАНИЦА КАТАЛОГА
// // ============================================

// (function() {
//   console.log('📚 Загрузка каталога...');

//   // === ПОЛУЧАЕМ ЭЛЕМЕНТЫ ===
//   const container = document.getElementById('catalogCards');
//   const searchInput = document.getElementById('searchInput');
//   const sortSelect = document.getElementById('sortSelect');
//   const filterBtns = document.querySelectorAll('.filter-btn');
//   const countEl = document.getElementById('catalogCount');

//   if (!container) {
//     console.error('❌ Контейнер #catalogCards не найден');
//     return;
//   }

//   // === ТЕКУЩИЕ НАСТРОЙКИ ФИЛЬТРАЦИИ ===
//   let currentFilter = 'all';
//   let currentSearch = '';
//   let currentSort = 'default';

//   // === ФУНКЦИЯ РЕНДЕРИНГА ===
//   function renderCatalog() {
//     // 1. Фильтрация по категории
//     let filtered = [...roses];
//     if (currentFilter !== 'all') {
//       filtered = filtered.filter(rose => 
//         rose.category === currentFilter || 
//         rose.categoryLabel?.toLowerCase() === currentFilter.toLowerCase()
//       );
//     }

//     // 2. Поиск по названию
//     if (currentSearch.trim()) {
//       const query = currentSearch.toLowerCase().trim();
//       filtered = filtered.filter(rose =>
//         rose.name.toLowerCase().includes(query) ||
//         (rose.latinName && rose.latinName.toLowerCase().includes(query))
//       );
//     }

//     // 3. Сортировка
//     switch (currentSort) {
//       case 'rating':
//         filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
//         break;
//       case 'name':
//         filtered.sort((a, b) => a.name.localeCompare(b.name));
//         break;
//       default:
//         // по умолчанию — по порядку в массиве
//         break;
//     }

//     // 4. Обновляем счетчик
//     if (countEl) {
//       countEl.textContent = `Найдено ${filtered.length} сортов`;
//     }

//     // 5. Рендерим карточки
//     if (filtered.length === 0) {
//       container.innerHTML = `
//         <div style="text-align:center;padding:60px 20px;color:#999;grid-column:1/-1;">
//           <p style="font-size:3rem;">🌹</p>
//           <p style="font-family:Georgia,serif;font-size:1.2rem;">Ничего не найдено</p>
//           <p style="color:#bbb;">Попробуйте изменить параметры поиска</p>
//         </div>
//       `;
//       return;
//     }

//     container.innerHTML = filtered.map(rose => renderCard(rose)).join('');

//     // Вешаем обработчики на кнопки "В избранное"
//     container.querySelectorAll('.card__fav-btn').forEach(btn => {
//       btn.addEventListener('click', function(e) {
//         e.stopPropagation();
//         const id = this.dataset.id;
//         const isNowFavorite = favorites.toggle(id);
//         this.textContent = isNowFavorite ? '❤️ В избранное' : '♡ В избранное';
//         this.classList.toggle('active', isNowFavorite);
//       });
//     });

//     console.log(`✅ Отображено ${filtered.length} сортов`);
//   }

//   // === ФУНКЦИЯ РЕНДЕРИНГА КАРТОЧКИ ===
//   function renderCard(rose) {
//     const isFav = favorites.isFavorite(rose.id);
//     const image = rose.images && rose.images[0] ? rose.images[0] : '';
//     const rating = rose.rating || '—';
//     const category = rose.categoryLabel || rose.category || 'Сорт';
    
//     return `
//       <div class="card" data-id="${rose.id}">
//         <a href="rose.html?id=${rose.id}" class="card__link">
//           <div class="card__image-wrap">
//             <img src="${image}" alt="${rose.name}" class="card__image" loading="lazy" onerror="this.style.display='none'">
//             <span class="card__badge">★ ${rating}</span>
//           </div>
//           <div class="card__body">
//             <span class="card__category">${category}</span>
//             <h3 class="card__title">${rose.name}</h3>
//             ${rose.latinName ? `<p class="card__latin">${rose.latinName}</p>` : ''}
//             <p class="card__desc">${rose.color || 'Красивый сорт розы'}</p>
//             <div class="card__footer">
//               <span class="card__rating">★ ${rating}</span>
//               <button class="card__fav-btn ${isFav ? 'active' : ''}" data-id="${rose.id}">
//                 ${isFav ? '❤️' : '♡'} В избранное
//               </button>
//             </div>
//           </div>
//         </a>
//       </div>
//     `;
//   }

//   // === ОБРАБОТЧИКИ СОБЫТИЙ ===

//   // Поиск
//   if (searchInput) {
//     searchInput.addEventListener('input', function() {
//       currentSearch = this.value;
//       renderCatalog();
//     });
//   }

//   // Сортировка
//   if (sortSelect) {
//     sortSelect.addEventListener('change', function() {
//       currentSort = this.value;
//       renderCatalog();
//     });
//   }

//   // Фильтры
//   filterBtns.forEach(btn => {
//     btn.addEventListener('click', function() {
//       filterBtns.forEach(b => b.classList.remove('active'));
//       this.classList.add('active');
//       currentFilter = this.dataset.filter;
//       renderCatalog();
//     });
//   });

//   // === ПЕРВЫЙ РЕНДЕРИНГ ===
//   renderCatalog();

//   console.log('📚 Каталог загружен');
// })();


// СТАРЫЙ ПЕРВОНАЧАЛЬНЫЙ КОД
// document.addEventListener('DOMContentLoaded', () => {
//   const filterButtons = document.getElementById('filterButtons');
//   const searchBox = document.getElementById('searchBox');
//   const sortSelect = document.getElementById('sortSelect');
//   const catalogGrid = document.getElementById('catalogGrid');
//   const catalogCount = document.getElementById('catalogCount');

//   if (!catalogGrid) return; // если страницы нет — выходим

//   // Состояние фильтров
//   let state = {
//     category: 'all',
//     search: '',
//     sort: 'default'
//   };

//   // --- Кнопки категорий ---
//   // categories — должен быть в data.js как массив: [{value: 'hybrid_tea', label: 'Чайно-гибридные'}, ...]
//   if (filterButtons && Array.isArray(categories)) {
//     categories.forEach(cat => {
//       const btn = document.createElement('button');
//       btn.className = `filter-btn ${cat.value === state.category ? 'active' : ''}`;
//       btn.textContent = cat.label;
//       btn.dataset.category = cat.value;

//       btn.addEventListener('click', () => {
//         filterButtons.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
//         btn.classList.add('active');
//         state.category = cat.value;
//         renderCatalog();
//       });

//       filterButtons.appendChild(btn);
//     });
//   }

//   // --- Поиск ---
//   if (searchBox) {
//     searchBox.addEventListener('input', (e) => {
//       state.search = e.target.value.trim().toLowerCase();
//       renderCatalog();
//     });
//   }

//   // --- Сортировка ---
//   if (sortSelect) {
//     sortSelect.addEventListener('change', (e) => {
//       state.sort = e.target.value;
//       renderCatalog();
//     });
//   }

//   function createRoseCard(rose) {
//     const card = document.createElement('a');
//     card.href = `rose.html?id=${rose.id}`;
//     card.className = 'card';
//     // ...
//     return card;
//   }

//   function renderCatalog() {
//     // 1. Фильтр по категории
//     let filtered = roses.filter(rose => {
//       if (state.category === 'all') return true;
//       return rose.category === state.category;
//     });

//     // 2. Поиск по названию и латинскому названию
//     if (state.search) {
//       filtered = filtered.filter(rose =>
//         rose.name.toLowerCase().includes(state.search) ||
//         (rose.latinName && rose.latinName.toLowerCase().includes(state.search))
//       );
//     }

//     // 3. Сортировка
//     switch (state.sort) {
//       case 'name-asc':
//         filtered.sort((a, b) => a.name.localeCompare(b.name, 'ru'));
//         break;
//       case 'name-desc':
//         filtered.sort((a, b) => b.name.localeCompare(a.name, 'ru'));
//         break;
//       case 'rating-desc':
//         filtered.sort((a, b) => b.rating - a.rating);
//         break;
//       case 'rating-asc':
//         filtered.sort((a, b) => a.rating - b.rating);
//         break;
//       default:
//         // по умолчанию — порядок в data.js
//         break;
//     }

//     // 4. Отрисовка
//     catalogGrid.innerHTML = '';

//     const count = filtered.length;
//     const word = count === 1 ? 'сорт' : (count >= 2 && count <= 4) ? 'сорта' : 'сортов';
//     if (catalogCount) {
//       catalogCount.textContent = `Найдено: ${count} ${word}`;
//     }

//     if (count === 0) {
//       catalogGrid.innerHTML = `
//         <div class="catalog__empty">
//           <p>Ничего не найдено.</p>
//           <p style="margin-top:8px; color:#777;">Попробуйте изменить фильтр, категорию или запрос.</p>
//         </div>`;
//       return;
//     }

//     filtered.forEach(rose => {
//       // createRoseCard — из main.js (универсальная функция карточки)
//       catalogGrid.appendChild(createRoseCard(rose));
//     });
//   }

//   renderCatalog(); // первый рендер
// });