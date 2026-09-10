// ============================================
// CATALOG.JS — СТРАНИЦА КАТАЛОГА
// ============================================

(function() {
  console.log('📚 Загрузка каталога...');

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
    // 1. Фильтрация по категории
    let filtered = [...roses];
    if (currentFilter !== 'all') {
      filtered = filtered.filter(rose => 
        rose.category === currentFilter || 
        rose.categoryLabel?.toLowerCase() === currentFilter.toLowerCase()
      );
    }

    // 2. Поиск по названию
    if (currentSearch.trim()) {
      const query = currentSearch.toLowerCase().trim();
      filtered = filtered.filter(rose =>
        rose.name.toLowerCase().includes(query) ||
        (rose.latinName && rose.latinName.toLowerCase().includes(query))
      );
    }

    // 3. Сортировка
    switch (currentSort) {
      case 'rating':
        filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case 'name':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      default:
        // по умолчанию — по порядку в массиве
        break;
    }

    // 4. Обновляем счетчик
    if (countEl) {
      countEl.textContent = `Найдено ${filtered.length} сортов`;
    }

    // 5. Рендерим карточки
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

    // Вешаем обработчики на кнопки "В избранное"
    container.querySelectorAll('.card__fav-btn').forEach(btn => {
      btn.addEventListener('click', function(e) {
        e.stopPropagation();
        const id = this.dataset.id;
        const isNowFavorite = favorites.toggle(id);
        this.textContent = isNowFavorite ? '❤️ В избранное' : '♡ В избранное';
        this.classList.toggle('active', isNowFavorite);
      });
    });

    console.log(`✅ Отображено ${filtered.length} сортов`);
  }

  // === ФУНКЦИЯ РЕНДЕРИНГА КАРТОЧКИ ===
  function renderCard(rose) {
    const isFav = favorites.isFavorite(rose.id);
    const image = rose.images && rose.images[0] ? rose.images[0] : '';
    const rating = rose.rating || '—';
    const category = rose.categoryLabel || rose.category || 'Сорт';
    
    return `
      <div class="card" data-id="${rose.id}">
        <a href="rose.html?id=${rose.id}" class="card__link">
          <div class="card__image-wrap">
            <img src="${image}" alt="${rose.name}" class="card__image" loading="lazy" onerror="this.style.display='none'">
            <span class="card__badge">★ ${rating}</span>
          </div>
          <div class="card__body">
            <span class="card__category">${category}</span>
            <h3 class="card__title">${rose.name}</h3>
            ${rose.latinName ? `<p class="card__latin">${rose.latinName}</p>` : ''}
            <p class="card__desc">${rose.color || 'Красивый сорт розы'}</p>
            <div class="card__footer">
              <span class="card__rating">★ ${rating}</span>
              <button class="card__fav-btn ${isFav ? 'active' : ''}" data-id="${rose.id}">
                ${isFav ? '❤️' : '♡'} В избранное
              </button>
            </div>
          </div>
        </a>
      </div>
    `;
  }

  // === ОБРАБОТЧИКИ СОБЫТИЙ ===

  // Поиск
  if (searchInput) {
    searchInput.addEventListener('input', function() {
      currentSearch = this.value;
      renderCatalog();
    });
  }

  // Сортировка
  if (sortSelect) {
    sortSelect.addEventListener('change', function() {
      currentSort = this.value;
      renderCatalog();
    });
  }

  // Фильтры
  filterBtns.forEach(btn => {
    btn.addEventListener('click', function() {
      filterBtns.forEach(b => b.classList.remove('active'));
      this.classList.add('active');
      currentFilter = this.dataset.filter;
      renderCatalog();
    });
  });

  // === ПЕРВЫЙ РЕНДЕРИНГ ===
  renderCatalog();

  console.log('📚 Каталог загружен');
})();


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