(function() {
  console.log('📚 Загрузка каталога...');

  // === ВСПОМОГАТЕЛЬНАЯ ФУНКЦИЯ: Расчет рейтинга из отзывов ===
  function getMerged(rose) {
    if (window.RoseRatings && RoseRatings.getMergedRating) {
      return RoseRatings.getMergedRating(rose.id);
    }
    const arr = Array.isArray(rose.reviews) ? rose.reviews : [];
    const sum = arr.reduce((s, r) => s + (Number(r.score) || 0), 0);
    const avg = arr.length ? sum / arr.length : (parseFloat(rose.rating) || 0);
    return { avg: Math.round(avg * 10) / 10, count: arr.length };
  }

  // === ТЕКСТЫ ОПИСАНИЙ ДЛЯ КАЖДОЙ КАТЕГОРИИ ===
  const CATEGORY_DESCRIPTIONS = {
    'all': 'Здесь представлен каталог популярных сортов роз. Всего в природе насчитывается от 300 до 400 видов дикорастущих роз (шиповника), а количество культурных сортов превышает 25000—30000 и постоянно растет. Многообразие роз поражает. Как же разобраться, к какой группе принадлежит определенный цветок? Выберите категорию или воспользуйтесь поиском, чтобы найти идеальный цветок для вашего сада. Розы классифицируют по внешним признакам и особенностям выращивания. Здесь представлены 10 садовых групп, среди них 9 официальных ботанических классов и отдельная группа "Парковые розы", включающая самые неприхотливые, зимостойкие розы, которые не требуют укрытия на зиму и используются для озеленения парков.',
    'floribunda': 'Обильно цветущие кустарники с крупными соцветиями, результат скрещивания карликовых полиантовых роз с чайно-гибридными. Их цветение не только обильное, но и продолжительное (с июля до поздней осени), непрерывное. Цветки могут быть как простыми, так и махровыми.  Отличаются высокой устойчивостью к болезням и идеальны для создания ярких клумб.',
    'grandiflora': 'Сравнительно молодой класс роз. Это мощные, высокие кусты, сочетающие в себе крупные изящные цветки чайно-гибридных роз и обильное букетное цветение группы флорибунда. Благодаря длинным прочным побегам и повышенной зимостойкости они идеально подходят как для эффектного украшения сада, так и для срезки. Класс был выделен в 1954 году, а его эталоном и первым представителем стал знаменитый сорт Queen Elizabeth («Королева Елизавета»).',
    'tea-hybrid': 'Классические розы с крупными одиночными бокаловидными бутонами на длинных стеблях. Они  произошли от теплолюбивых китайских чайных роз, скрещенных с ремонтантными. Благодаря этому удалось получить цветы, которые по характеристикам превосходили все известные до них виды и сорта. Идеальны для срезки и составления букетов. Чайно-гибридные розы теплолюбивы, требовательны к месту произрастания. Нередко их поражают болезни и атакуют вредители. Однако при правильном уходе и хорошем зимнем укрытии они обильно цветут все лето.',
    'climbing': 'Розы с длинными гибкими побегами, которым требуется опора. Цветут на побегах прошлого или текущего года. У этих роз мелкие цветки (диаметром 2-5 см), собранные в крупные соцветия, и длинные, стелющиеся побеги (плети). обычно делят на 2 группы: мелкоцветковые (рамблеры, с побегами длиной до 5 м, мелкими цветками без запаха, которые цветут однократно) и крупноцветковые (клаймберы, с более крупными цветками, по форме напоминающими чайно-гибридные розы, в течение лета они могут зацветать повторно). Прекрасно подходят для арок, пергол и вертикального озеленения.',
    'miniature': 'Компактные кустики с мелкими листьями и  мелкими махровыми цветками самой разнообразной окраски (от зеленоватой до фиолетовой), их нередко выращивают в комнатных условиях. Отлично  смотрятся в каменистых горках, альпинариях и бордюрах, а еще их используют при создании бутоньерок для украшения причесок или праздничных нарядов.',
    'shrub': 'Крупные, мощные кустарники, которые отличаются высоким ростом, обильным и продолжительным, но однократным цветением и хорошей устойчивостью к неблагоприятным условиям произрастания. К этой группе также относятся большие дикорастущие кустарники роз и английские розы Остина – с густомахровыми цветками, источающими насыщенный аромат. Универсальны в ландшафтном дизайне.',
    'ground_cover': 'Крупные, мощные кустарники с густооблиственными длинными побегами (до 4 м), обильным и продолжительным цветением. Растут вширь, стелются по земле плотным ковром. Цветки могут быть простыми, махровыми или полумахровыми, мелкими или средними. Большинство сортов почвопокровных рост отличаются продолжительным и обильным цветением. Устойчивы к болезням и неприхотливы. Универсальны в ландшафтном дизайне.',
    'polyantha': 'Сегодня в садовых центрах их практически полностью вытеснили розы Флорибунда (которые и были получены путем скрещивания полиантовых роз с чайно-гибридными). Особенности этой группы — низкорослые, очень выносливые кусты с огромными щитковидными соцветиями из мелких цветков. Они почти не пахнут, но цветут непрерывно до заморозков.',
    'hybrid perpetual': 'Официально ремонтантные розы относятся к категории Старинных садовых роз (Old Garden Roses), а не современных. Они были очень популярны в XIX веке, но в XX веке их вытеснили Чайно-гибридные розы (первая в мире чайно-гибридная роза La France как раз родилась от скрещивания ремонтантной и чайной розы).  Главное их достоинство для своего времени — способность зацветать повторно (ремонтировать) во второй половине лета, хотя первая волна всегда была намного обильнее. Это крупные, мощные кусты с крупными ароматными цветами.',
    'park roses': 'В эту группу объединяют самые неприхотливые, зимостойкие розы, которые не требуют укрытия на зиму и используются для озеленения парков. К ним относят: дикорастущие шиповники и их гибриды (например, розы Ругоза); старинные зимостойкие группы (Альба, Галльские); некоторые современные крупные кустовые розы (Шрабы / Shrubs), обладающие повышенной морозостойкостью.'
  };

  // === ПОЛУЧАЕМ ЭЛЕМЕНТЫ ===
  const container = document.getElementById('catalogCards');
  const searchInput = document.getElementById('searchInput');
  const sortSelect = document.getElementById('sortSelect');
  const filterBtns = document.querySelectorAll('.filter-btn');
  const countEl = document.getElementById('catalogCount');

  // Автоматически создаём блок описания, если его нет
  let descEl = document.getElementById('categoryDescription');
  if (!descEl) {
    descEl = document.createElement('div');
    descEl.id = 'categoryDescription';
    descEl.className = 'category-description';
    if (countEl && countEl.parentNode) {
      countEl.parentNode.insertBefore(descEl, countEl);
    }
  }

  if (!container) {
    console.error('❌ Контейнер #catalogCards не найден');
    return;
  }

  // === СОСТОЯНИЕ ФИЛЬТРАЦИИ ===
  const state = {
    category: 'all',
    search: '',
    sort: 'default',
    filters: {
      color: [],
      bloom: [],
      scent: [],
      frostResistance: [],
      diseaseResistance: [],
      purpose: []
    },
    ranges: {
      heightMin: 0, heightMax: 300,
      widthMin: 0,  widthMax: 250,
      sizeMin: 2,   sizeMax: 15
    }
  };

  // === ЧЕЛОВЕЧЕСКИЕ НАЗВАНИЯ ДЛЯ ЧИПСОВ ===
  const FILTER_LABELS = {
    color: 'Цвет',
    bloom: 'Цветение',
    scent: 'Аромат',
    frostResistance: 'Морозостойкость',
    diseaseResistance: 'Болезни',
    purpose: 'Назначение',
  };

  // === ЧИПСЫ АКТИВНЫХ ФИЛЬТРОВ ===
  function renderActiveFilters() {
    const wrap = document.getElementById('activeFilters');
    const list = document.getElementById('activeFiltersList');
    if (!wrap || !list) return;

    const chips = [];

    // Чекбоксы
    Object.entries(state.filters).forEach(([key, values]) => {
      values.forEach(val => {
        chips.push({
          label: `${FILTER_LABELS[key] || key}: ${val}`,
          onRemove: () => {
            state.filters[key] = state.filters[key].filter(v => v !== val);
            // Снимаем галочку в сайдбаре
            document.querySelectorAll(`input[data-filter="${key}"][value="${val}"]`)
              .forEach(cb => cb.checked = false);
            renderCatalog();
          }
        });
      });
    });
  
    // Поиск
    if (state.search.trim()) {
      chips.push({
        label: `Поиск: "${state.search}"`,
        onRemove: () => {
          state.search = '';
          if (searchInput) searchInput.value = '';
          renderCatalog();
        }
      });
    }

    // Рендер
    if (chips.length === 0) {
      wrap.hidden = true;
      list.innerHTML = '';
      return;
    }
    wrap.hidden = false;
    list.innerHTML = chips.map((c, i) =>
      `<button class="active-filter-chip" data-chip="${i}" type="button">
         <span>${c.label}</span>
         <span class="active-filter-chip__remove">×</span>
       </button>`
    ).join('');

    list.querySelectorAll('.active-filter-chip').forEach((btn, i) => {
      btn.addEventListener('click', () => chips[i].onRemove());
    });
  }

   // === СЧЁТЧИКИ ВЫБРАННОГО В ЗАГОЛОВКАХ ГРУПП ===
  function updateGroupCounters() {
    document.querySelectorAll('.filter-group').forEach(group => {
      const key = group.dataset.group;
      const count = (state.filters[key] || []).length;
      const title = group.querySelector('.filter-group__title');
      if (!title) return;

      // Убираем старый бейдж
      title.querySelector('.filter-group__count')?.remove();

      if (count > 0) {
        const badge = document.createElement('span');
        badge.className = 'filter-group__count';
        badge.textContent = count;
        title.insertBefore(badge, title.querySelector('.arrow'));
      }
    });
  }

  // === ФУНКЦИЯ РЕНДЕРИНГА ===
  function renderCatalog() {
    // 0. Обновляем описание категории
    if (descEl) {
      descEl.textContent = CATEGORY_DESCRIPTIONS[state.category] || CATEGORY_DESCRIPTIONS['all'];
    }

    // 1. Фильтр по категории
    let filtered = [...roses];
    if (state.category !== 'all') {
      filtered = filtered.filter(rose =>
        rose.category === state.category ||
        rose.categoryLabel?.toLowerCase() === state.category.toLowerCase()
      );
    }

    // 2. Поиск
    if (state.search.trim()) {
      const query = state.search.toLowerCase().trim();
      filtered = filtered.filter(rose =>
        rose.name.toLowerCase().includes(query) ||
        (rose.latinName && rose.latinName.toLowerCase().includes(query))
      );
    }

    // 3. Чекбоксы (цвет, тип цветения, аромат, устойчивости, назначение)
    ['color', 'bloom', 'scent', 'frostResistance', 'diseaseResistance', 'purpose'].forEach(key => {
      const values = state.filters[key];
      if (values.length > 0) {
        filtered = filtered.filter(rose => {
          const roseValue = rose[key];
          if (!roseValue) return false; // если у розы нет поля — исключаем
          // Разбиваем значение по "/", ",", " и " — например "красный/белый" → ["красный", "белый"]
          const parts = roseValue.split(/[\/,]|\s+и\s+/).map(s => s.trim()).filter(Boolean);

          // Совпадение, если хотя бы один выбранный цвет содержится в любом из компонентов                     
          return values.includes(String(roseValue).toLowerCase());
        });
      }
    });

    // 4. Диапазоны (высота, ширина, размер цветка)
    filtered = filtered.filter(rose => {
      const h = Number(rose.height);
      const w = Number(rose.width);
      const s = Number(rose.flowerSize);

      // Если поля нет — не отсеиваем (защита от отсутствующих данных)
      if (!isNaN(h) && (h < state.ranges.heightMin || h > state.ranges.heightMax)) return false;
      if (!isNaN(w) && (w < state.ranges.widthMin  || w > state.ranges.widthMax))  return false;
      if (!isNaN(s) && (s < state.ranges.sizeMin   || s > state.ranges.sizeMax))   return false;
      return true;
    });

    // 5. Сортировка
    switch (state.sort) {
      case 'rating':
        filtered.sort((a, b) => getMerged(b).avg - getMerged(a).avg);
        break;
      case 'name':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      default:
        break;
    }

    // 6. Счетчик
    if (countEl) {
      countEl.textContent = `Найдено ${filtered.length} сортов`;
    }

    // 7. Рендер карточек
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

    // Каскадное появление карточек
    container.querySelectorAll('.card').forEach((card, i) => {
      card.style.animationDelay = `${Math.min(i * 25, 300)}ms`;
    });

    // Анимации
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

    // Обработчики «В избранное»
    container.querySelectorAll('.card__fav-btn').forEach(btn => {
      btn.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        const id = this.dataset.id;
        toggleFavorite(id, this);
        const isNowFavorite = isInFavorites(id);
        this.textContent = isNowFavorite ? '❤️ В избранное' : '♡ В избранное';
        this.classList.toggle('active', isNowFavorite);
      });
    });

    console.log(`✅ Отображено ${filtered.length} сортов`);
  
    // Обновляем чипсы активных фильтров
    renderActiveFilters();
  }

  // === ФУНКЦИЯ РЕНДЕРИНГА КАРТОЧКИ (без изменений) ===
  function renderCard(rose) {
    const isFav = isInFavorites(rose.id);

    let imageSrc = '';
    if (rose.images && Array.isArray(rose.images) && rose.images.length > 0) {
      const fileName = rose.images[0];
      if (fileName) {
        if (!fileName.includes('/')) {
          imageSrc = `img/${fileName}`;
        } else {
          imageSrc = fileName;
        }
      }
    }

    const { avg: ratingNum, count: reviewsCount } = getMerged(rose);
    const category = rose.categoryLabel || rose.category || 'Сорт';

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

  // === ОБРАБОТЧИКИ: КАТЕГОРИИ, ПОИСК, СОРТИРОВКА ===
  if (searchInput) {
    searchInput.addEventListener('input', function() {
      state.search = this.value;
      renderCatalog();
    });
  }

  if (sortSelect) {
    sortSelect.addEventListener('change', function() {
      state.sort = this.value;
      renderCatalog();
    });
  }

  filterBtns.forEach(btn => {
    btn.addEventListener('click', function() {
      filterBtns.forEach(b => b.classList.remove('active'));
      this.classList.add('active');
      state.category = this.dataset.filter;
      renderCatalog();
    });
  });

  // === НОВОЕ: ЧЕКБОКСЫ ФИЛЬТРОВ ===
  document.querySelectorAll('input[type="checkbox"][data-filter]').forEach(cb => {
    cb.addEventListener('change', () => {
      const key = cb.dataset.filter;
      const val = String(cb.value).toLowerCase();
      if (cb.checked) {
        if (!state.filters[key].includes(val)) state.filters[key].push(val);
      } else {
        state.filters[key] = state.filters[key].filter(v => v !== val);
      }
      renderCatalog();
    });
  });

  // === НОВОЕ: СЛАЙДЕРЫ ===
  const rangeBindings = [
    ['heightMin', 'heightMinVal', v => state.ranges.heightMin = +v],
    ['heightMax', 'heightMaxVal', v => state.ranges.heightMax = +v],
    ['widthMin',  'widthMinVal',  v => state.ranges.widthMin  = +v],
    ['widthMax',  'widthMaxVal',  v => state.ranges.widthMax  = +v],
    ['sizeMin',   'sizeMinVal',   v => state.ranges.sizeMin   = +v],
    ['sizeMax',   'sizeMaxVal',   v => state.ranges.sizeMax   = +v],
  ];

  rangeBindings.forEach(([dataAttr, labelId, setter]) => {
    const input = document.querySelector(`[data-range="${dataAttr}"]`);
    if (!input) return;
    input.addEventListener('input', (e) => {
      const label = document.getElementById(labelId);
      if (label) label.textContent = e.target.value;
      setter(e.target.value);
      renderCatalog();
    });
  });

  // === НОВОЕ: АККОРДЕОНЫ ===
  document.querySelectorAll('.filter-group__title').forEach(title => {
    title.addEventListener('click', () => {
      title.parentElement.classList.toggle('open');
    });
  });

  // === НОВОЕ: СБРОС ФИЛЬТРОВ ===
  const resetBtn = document.getElementById('resetFilters');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      // Сброс чекбоксов
      document.querySelectorAll('input[type="checkbox"][data-filter]').forEach(cb => cb.checked = false);
      // Сброс диапазонов
      document.querySelectorAll('input[type="range"]').forEach(input => {
        input.value = input.dataset.range.endsWith('Min') ? input.min : input.max;
      });
      // Сброс подписей
      ['heightMinVal','widthMinVal','sizeMinVal'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.textContent = el.id === 'sizeMinVal' ? '2' : '0';
      });
      ['heightMaxVal','widthMaxVal','sizeMaxVal'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.textContent = el.id === 'sizeMaxVal' ? '15' : (el.id === 'widthMaxVal' ? '250' : '300');
      });
      // Сброс поиска/сортировки
      if (searchInput) searchInput.value = '';
      if (sortSelect) sortSelect.value = 'default';

      // Сброс state
      state.filters = { color: [], bloom: [], scent: [], frostResistance: [], diseaseResistance: [], purpose: [] };
      state.ranges = { heightMin: 0, heightMax: 300, widthMin: 0, widthMax: 250, sizeMin: 2, sizeMax: 15 };
      state.search = '';
      state.sort = 'default';

      renderCatalog();
    });
  }

  // === ОЧИСТИТЬ ВСЁ ИЗ ЧИПСОВ ===
  const clearAllBtn = document.getElementById('clearAllFilters');
  if (clearAllBtn) {
    clearAllBtn.addEventListener('click', () => {
      resetBtn?.click();
    });
  }

  // === НОВОЕ: МОБИЛЬНАЯ КНОПКА "ФИЛЬТРЫ" ===
  const mobileToggle = document.getElementById('mobileFilterToggle');
  const sidebar = document.getElementById('catalogSidebar');
  if (mobileToggle && sidebar) {
    mobileToggle.addEventListener('click', () => {
      sidebar.classList.toggle('open');
    });
    // Закрытие при клике вне сайдбара (на мобильных)
    document.addEventListener('click', (e) => {
      if (window.innerWidth > 900) return;
      if (!sidebar.classList.contains('open')) return;
      if (sidebar.contains(e.target) || mobileToggle.contains(e.target)) return;
      sidebar.classList.remove('open');
    });
  }

  // === ПЛАВНЫЙ СЧЁТЧИК ===
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

// Ловит прокрутку колесом только внутри сайдбара (фильтры).
// Если сайдбар уже прокручен до конца в нужную сторону — отменяет событие, и страница не двигается. Во всех остальных случаях работает штатно. 
const sidebar = document.querySelector('.catalog-sidebar');

if (sidebar) {
  sidebar.addEventListener('wheel', (e) => {
    const atTop = sidebar.scrollTop === 0;
    const atBottom = sidebar.scrollTop + sidebar.clientHeight >= sidebar.scrollHeight - 1;

    // Если уже на краю — блокируем событие, чтобы страница не скроллилась
    if ((atTop && e.deltaY < 0) || (atBottom && e.deltaY > 0)) {
      e.preventDefault();
    }
    // Иначе — обычная прокрутка сайдбара (браузер делает это сам)
  }, { passive: false });
}

// 
// 
// 
// КОД ДО ДОБАВЛЕНИЯ ФИЛЬТРА СЛЕВА
// (function() {
//   console.log('📚 Загрузка каталога...');

//   // === ВСПОМОГАТЕЛЬНАЯ ФУНКЦИЯ: Расчет рейтинга из отзывов ===
//   // Берёт объединённый рейтинг: отзывы из data.js + отзывы пользователя
// function getMerged(rose) {
//   if (window.RoseRatings && RoseRatings.getMergedRating) {
//     return RoseRatings.getMergedRating(rose.id);
//   }
//   // Fallback — если RoseRatings почему-то не загрузился
//   const arr = Array.isArray(rose.reviews) ? rose.reviews : [];
//   const sum = arr.reduce((s, r) => s + (Number(r.score) || 0), 0);
//   const avg = arr.length ? sum / arr.length : (parseFloat(rose.rating) || 0);
//   return { avg: Math.round(avg * 10) / 10, count: arr.length };
// }

//   // === НОВОЕ: ТЕКСТЫ ОПИСАНИЙ ДЛЯ КАЖДОЙ КАТЕГОРИИ ===
//   // Ключи должны совпадать с data-filter в ваших кнопках!
//   const CATEGORY_DESCRIPTIONS = {
//     'all': 'Полный каталог сортов роз. Многообразие роз поражает. Как же разобраться, к какой группе принадлежит определенный цветок? Выберите категорию или воспользуйтесь поиском, чтобы найти идеальный цветок для вашего сада. Розы классифицируют по внешним признакам и особенностям выращивания. Здесь представлены 10 садовых групп, среди них 9 официальных ботанических классов и отдельная группа "Парковые розы", включающая самые неприхотливые, зимостойкие розы, которые не требуют укрытия на зиму и используются для озеленения парков.',
//     'floribunda': 'Обильно цветущие кустарники с крупными соцветиями, результат скрещивания карликовых полиантовых роз с чайно-гибридными. Их цветение не только обильное, но и продолжительное (с июля до поздней осени), непрерывное. Цветки могут быть как простыми, так и махровыми.  Отличаются высокой устойчивостью к болезням и идеальны для создания ярких клумб.',
//     'grandiflora': 'Сравнительно молодой класс роз. Это мощные, высокие кусты, сочетающие в себе крупные изящные цветки чайно-гибридных роз и обильное букетное цветение группы флорибунда. Благодаря длинным прочным побегам и повышенной зимостойкости они идеально подходят как для эффектного украшения сада, так и для срезки. Класс был выделен в 1954 году, а его эталоном и первым представителем стал знаменитый сорт Queen Elizabeth («Королева Елизавета»).', 
//     'tea-hybrid': 'Классические розы с крупными одиночными бокаловидными бутонами на длинных стеблях. Они  произошли от теплолюбивых китайских чайных роз, скрещенных с ремонтантными. Благодаря этому удалось получить цветы, которые по характеристикам превосходили все известные до них виды и сорта. Идеальны для срезки и составления букетов. Чайно-гибридные розы теплолюбивы, требовательны к месту произрастания. Нередко их поражают болезни и атакуют вредители. Однако при правильном уходе и хорошем зимнем укрытии они обильно цветут все лето.',
//     'climbing': 'Розы с длинными гибкими побегами, которым требуется опора. Цветут на побегах прошлого или текущего года. У этих роз мелкие цветки (диаметром 2-5 см), собранные в крупные соцветия, и длинные, стелющиеся побеги (плети). обычно делят на 2 группы: мелкоцветковые (рамблеры, с побегами длиной до 5 м, мелкими цветками без запаха, которые цветут однократно) и крупноцветковые (клаймберы, с более крупными цветками, по форме напоминающими чайно-гибридные розы, в течение лета они могут зацветать повторно). Прекрасно подходят для арок, пергол и вертикального озеленения.',
//     'miniature': 'Компактные кустики с мелкими листьями и  мелкими махровыми цветками самой разнообразной окраски (от зеленоватой до фиолетовой), их нередко выращивают в комнатных условиях. Отлично  смотрятся в каменистых горках, альпинариях и бордюрах, а еще их используют при создании бутоньерок для украшения причесок или праздничных нарядов.',
//     'shrub': 'Крупные, мощные кустарники, которые отличаются высоким ростом, обильным и продолжительным, но однократным цветением и хорошей устойчивостью к неблагоприятным условиям произрастания. К этой группе также относятся большие дикорастущие кустарники роз и английские розы Остина – с густомахровыми цветками, источающими насыщенный аромат. Универсальны в ландшафтном дизайне.',
//     'ground_cover': 'Крупные, мощные кустарники с густооблиственными длинными побегами (до 4 м), обильным и продолжительным цветением. Растут вширь, стелются по земле плотным ковром. Цветки могут быть простыми, махровыми или полумахровыми, мелкими или средними. Большинство сортов почвопокровных рост отличаются продолжительным и обильным цветением. Устойчивы к болезням и неприхотливы. Универсальны в ландшафтном дизайне.',
//     'polyantha': 'Сегодня в садовых центрах их практически полностью вытеснили розы Флорибунда (которые и были получены путем скрещивания полиантовых роз с чайно-гибридными). Особенности этой группы —  низкорослые, очень выносливые кусты с огромными щитковидными соцветиями из мелких цветков. Они почти не пахнут, но цветут непрерывно до заморозков.',
//     'hybrid perpetual': 'Официально ремонтантные розы относятся к категории Старинных садовых роз (Old Garden Roses), а не современных. Они были очень популярны в XIX веке, но в XX веке их вытеснили Чайно-гибридные розы (первая в мире чайно-гибридная роза La France как раз родилась от скрещивания ремонтантной и чайной розы).  Главное их достоинство для своего времени — способность зацветать повторно (ремонтировать) во второй половине лета, хотя первая волна всегда была намного обильнее. Это крупные, мощные кусты с крупными ароматными цветами.',
//     'park roses': 'В эту группу объединяют самые неприхотливые, зимостойкие розы, которые не требуют укрытия на зиму и используются для озеленения парков. К ним относят: дикорастущие шиповники и их гибриды (например, розы Ругоза); старинные зимостойкие группы (Альба, Галльские); некоторые современные крупные кустовые розы (Шрабы / Shrubs), обладающие повышенной морозостойкостью.'
//   };

//   // === ПОЛУЧАЕМ ЭЛЕМЕНТЫ ===
//   const container = document.getElementById('catalogCards');
//   const searchInput = document.getElementById('searchInput');
//   const sortSelect = document.getElementById('sortSelect');
//   const filterBtns = document.querySelectorAll('.filter-btn');
//   const countEl = document.getElementById('catalogCount');

//   // === НОВОЕ: Автоматически создаём блок описания, если его нет ===
//   let descEl = document.getElementById('categoryDescription');
//   if (!descEl) {
//     descEl = document.createElement('div');
//     descEl.id = 'categoryDescription';
//     descEl.className = 'category-description';
//     // Вставляем его прямо перед счетчиком "Найдено"
//     if (countEl && countEl.parentNode) {
//       countEl.parentNode.insertBefore(descEl, countEl);
//     } else if (container && container.parentNode) {
//       container.parentNode.insertBefore(descEl, container);
//     }
//   }

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
//     // === 0. НОВОЕ: ОБНОВЛЯЕМ ОПИСАНИЕ КАТЕГОРИИ ===
//     if (descEl) {
//       const filterKey = currentFilter || 'all';
//       // Если для фильтра нет текста, показываем описание для 'all'
//       descEl.textContent = CATEGORY_DESCRIPTIONS[filterKey] || CATEGORY_DESCRIPTIONS['all'];
//     }
//     // 1. Фильтрация по категории (БЕЗ ИЗМЕНЕНИЙ)
//     let filtered = [...roses];
//     if (currentFilter !== 'all') {
//       filtered = filtered.filter(rose => 
//         rose.category === currentFilter || 
//         rose.categoryLabel?.toLowerCase() === currentFilter.toLowerCase()
//       );
//     }

//     // 2. Поиск по названию (БЕЗ ИЗМЕНЕНИЙ)
//     if (currentSearch.trim()) {
//       const query = currentSearch.toLowerCase().trim();
//       filtered = filtered.filter(rose =>
//         rose.name.toLowerCase().includes(query) ||
//         (rose.latinName && rose.latinName.toLowerCase().includes(query))
//       );
//     }

//     // 3. Сортировка (ОБНОВЛЕНО: используем нашу функцию getRatingValue)
//     switch (currentSort) {
//       case 'rating':
//         filtered.sort((a, b) => getMerged(b).avg - getMerged(a).avg);
//         break;
//       case 'name':
//         filtered.sort((a, b) => a.name.localeCompare(b.name));
//         break;
//       default:
//         break;
//     }

//     // 4. Обновляем счетчик (БЕЗ ИЗМЕНЕНИЙ)
//     if (countEl) {
//       countEl.textContent = `Найдено ${filtered.length} сортов`;
//     }

//     // 5. Рендерим карточки (БЕЗ ИЗМЕНЕНИЙ логика вызова)
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

//     // Анимация: цифра в бейдже — счётчиком, звёзды — плавной заливкой
//   container.querySelectorAll('.card__badge[data-rating]').forEach(badge => {
//     const valueEl = badge.querySelector('.card__badge-value');
//     if (valueEl) animateNumber(valueEl, parseFloat(badge.dataset.rating), '');
//   });
//   requestAnimationFrame(() => {
//     requestAnimationFrame(() => {
//       container.querySelectorAll('.stars-visual[data-rating]').forEach(el => {
//         el.style.setProperty('--rating', el.dataset.rating);
//       });
//     });
//   });

//     // Вешаем обработчики на кнопки "В избранное" (БЕЗ ИЗМЕНЕНИЙ)
//     container.querySelectorAll('.card__fav-btn').forEach(btn => {
//   btn.addEventListener('click', function(e) {
//     e.preventDefault();
//     e.stopPropagation();
//     const id = this.dataset.id;
//     toggleFavorite(id, this);                    // функция сама переключит состояние
//     const isNowFavorite = isInFavorites(id);     // ← читаем новое состояние
//     this.textContent = isNowFavorite ? '❤️ В избранное' : '♡ В избранное';
//     this.classList.toggle('active', isNowFavorite);
//   });
// });

//     console.log(`✅ Отображено ${filtered.length} сортов`);
//   }

//   // === ФУНКЦИЯ РЕНДЕРИНГА КАРТОЧКИ (ОБНОВЛЕНА) ===
//   function renderCard(rose) {
//     const isFav = isInFavorites(rose.id);
    
//     // --- ИСПРАВЛЕННАЯ ЛОГИКА ДЛЯ МАССИВА ---
//     let imageSrc = '';
    
//     // 1. Проверяем, что images существует и это массив
//     if (rose.images && Array.isArray(rose.images) && rose.images.length > 0) {
//       // 2. Берем ПЕРВЫЙ элемент массива. 
//       // Раньше тут была ошибка: мы брали весь массив целиком.
//       const fileName = rose.images[0]; 
      
//       // 3. Формируем путь
//       if (fileName) {
//         // Если в имени нет слэша, считаем, что это просто имя файла, добавляем папку img/
//         if (!fileName.includes('/')) {
//           imageSrc = `img/${fileName}`;
//         } else {
//           imageSrc = fileName;
//         }
//       }
//     }
//     // ---------------------------------------

//     const { avg: ratingNum, count: reviewsCount } = getMerged(rose);
//     const ratingText = ratingNum > 0 ? `${ratingNum.toFixed(1)} ★` : '—';
//     const category = rose.categoryLabel || rose.category || 'Сорт';

//     // ВАЖНО: Вся строка ниже должна быть строго в обратных кавычках ` ... `
//     return `
//      <div class="card" data-id="${rose.id}">
//     <a href="rose.html?id=${rose.id}" class="card__link">
//       <div class="card__image-wrap">
//         <img src="${imageSrc}" alt="${rose.name}" class="card__image" loading="lazy" onerror="this.style.display='none'">
//         ${ratingNum > 0 ? `
//           <span class="card__badge" data-rating="${ratingNum}">
//             <span class="card__badge-star" aria-hidden="true">★</span>
//             <span class="card__badge-value">0.0</span>
//           </span>
//         ` : ''}
//       </div>
//       <div class="card__body">
//         <span class="card__category">${category}</span>
//         <h3 class="card__title">${rose.name}</h3>
//         ${rose.latinName ? `<p class="card__latin">${rose.latinName}</p>` : ''}
//         <p class="card__desc">${rose.color || 'Красивый сорт розы'}</p>
//         <div class="card__footer">
//           <div class="stars-wrapper">
//             <span class="stars-visual" data-rating="${ratingNum}" style="--rating:0" aria-label="Рейтинг ${ratingNum} из 5"></span>
//             ${reviewsCount > 0 ? `<span class="rating-count">${reviewsCount}</span>` : ''}
//           </div>
//           <button class="card__fav-btn ${isFav ? 'active' : ''}" data-id="${rose.id}">
//             ${isFav ? '❤️' : '♡'} В избранное
//           </button>
//         </div>
//       </div>
//     </a>
//   </div>
// `;
//   }

//   // === ОБРАБОТЧИКИ СОБЫТИЙ (БЕЗ ИЗМЕНЕНИЙ) ===

//   if (searchInput) {
//     searchInput.addEventListener('input', function() {
//       currentSearch = this.value;
//       renderCatalog();
//     });
//   }

//   if (sortSelect) {
//     sortSelect.addEventListener('change', function() {
//       currentSort = this.value;
//       renderCatalog();
//     });
//   }

//   filterBtns.forEach(btn => {
//     btn.addEventListener('click', function() {
//       filterBtns.forEach(b => b.classList.remove('active'));
//       this.classList.add('active');
//       currentFilter = this.dataset.filter;
//       renderCatalog();
//     });
//   });

//   // Плавный счётчик для цифры рейтинга
//   function animateNumber(el, target, suffix = '') {
//   const dur = 800;
//   const t0 = performance.now();
//   function tick(now) {
//     const p = Math.min(1, (now - t0) / dur);
//     const eased = 1 - Math.pow(1 - p, 3);
//     const val = target * eased;
//     el.textContent = val.toFixed(1) + suffix;
//     if (p < 1) requestAnimationFrame(tick);
//   }
//   requestAnimationFrame(tick);
// }

//   // === ПЕРВЫЙ РЕНДЕРИНГ ===
//   renderCatalog();

//   console.log('📚 Каталог загружен');
// })();
//
// 
// 
// 
// 
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