// ============================================
// ROSE.JS — ЛОГИКА СТРАНИЦЫ СОРТА
// ============================================

(function() {
  'use strict';

  console.log('🌹 Загрузка страницы сорта...');

  // === ПОЛУЧАЕМ ID СОРТА ИЗ URL ===
  const params = new URLSearchParams(window.location.search);
  const roseId = params.get('id');
  console.log('🔍 ID сорта из URL:', roseId);

  // === ПОЛУЧАЕМ КОНТЕЙНЕР ===
  const container = document.querySelector('#rosePage');

  // === ФУНКЦИЯ ПОКАЗА ОШИБКИ ===
  function showError(message, details = '') {
    if (container) {
      container.innerHTML = `
        <div style="text-align:center;padding:60px 20px;color:#999;grid-column:1/-1;">
          <h2 style="font-family:Georgia,serif;">🌹 ${message}</h2>
          ${details ? `<p style="color:#bbb;">${details}</p>` : ''}
          <a href="catalog.html" class="btn" style="margin-top:20px;display:inline-block;padding:12px 32px;background:#b72e4a;color:#fff;border-radius:50px;text-decoration:none;">Вернуться в каталог</a>
        </div>
      `;
    }
  }

  // === ПРОВЕРКА ID ===
  if (!roseId) {
    showError('Сорт не найден', 'Не указан ID сорта');
    return;
  }

  // === ПРОВЕРКА ДАННЫХ ===
  if (typeof roses === 'undefined') {
    showError('Ошибка загрузки данных', 'Проверьте подключение data.js');
    return;
  }

  // === НАХОДИМ СОРТ ===
  const rose = roses.find(r => r.id === roseId);
  console.log('🌹 Найденный сорт:', rose);

  if (!rose) {
    showError('Сорт не найден', `Сорт с ID "${roseId}" не существует`);
    return;
  }

  // ============================================
  // ЗАПОЛНЯЕМ ИНФОРМАЦИЮ
  // ============================================

  // Элементы для заполнения
  const elements = {
    name: document.querySelector('#roseName'),
    category: document.querySelector('#roseCategory'),
    description: document.querySelector('#roseDescription'),
    color: document.querySelector('#specColor'),
    height: document.querySelector('#specHeight'),
    diameter: document.querySelector('#specDiameter'),
    aroma: document.querySelector('#specAroma'),
    frost: document.querySelector('#specFrost'),
    flowering: document.querySelector('#specFlowering')
  };

  // Заполняем данные
  if (elements.name) elements.name.textContent = rose.name || '—';
  if (elements.category) elements.category.textContent = rose.categoryLabel || rose.category || 'Сорт розы';
  if (elements.description) elements.description.textContent = rose.description || 'Красивый сорт розы.';

  if (elements.color) elements.color.textContent = rose.color || '—';
  if (elements.height) elements.height.textContent = rose.height || '—';
  if (elements.diameter) elements.diameter.textContent = rose.flowerSize || rose.diameter || '—';
  if (elements.aroma) elements.aroma.textContent = rose.aroma || '—';
  if (elements.frost) elements.frost.textContent = rose.coldResistance || rose.frostResistance || '—';
  if (elements.flowering) elements.flowering.textContent = rose.bloomPeriod || rose.flowering || '—';

  // ============================================
  // ИНИЦИАЛИЗАЦИЯ СЛАЙДЕРА
  // ============================================

  const sliderContainer = document.querySelector('#rose-gallery-slider');
  console.log('📦 Контейнер слайдера:', sliderContainer);

  if (sliderContainer) {
    const hasImages = rose.images && rose.images.length > 0;
    console.log('🖼️ Фото:', hasImages ? rose.images.length : 'нет');

    if (hasImages) {
      const slides = rose.images.map((img, index) => ({
        image: img,
        title: index === 0 ? rose.name : null,
        subtitle: index === 0 ? rose.color : null,
        link: null
      }));

      console.log('📸 Слайдов для отображения:', slides.length);

      try {
        if (typeof RoseSlider === 'undefined') {
          throw new Error('Класс RoseSlider не найден. Проверьте подключение slider.js');
        }

        const slider = new RoseSlider({
          container: "#rose-gallery-slider",
          slides: slides,
          autoplay: true,
          interval: 3500,
          loop: true,
          showDots: true,
          showArrows: true,
          keyboard: true,
          pauseOnHover: true
        });

        console.log('✅ Слайдер для сорта', rose.name, 'успешно запущен!');

      } catch (e) {
        console.error('❌ Ошибка инициализации слайдера:', e);
        sliderContainer.innerHTML = `
          <div style="display:flex;align-items:center;justify-content:center;height:100%;background:#f5f0eb;color:#999;flex-direction:column;gap:10px;font-family:Georgia,serif;">
            <span style="font-size:3rem;">🌹</span>
            <p style="text-align:center;font-size:1.2rem;">Ошибка загрузки слайдера</p>
            <p style="font-size:0.9rem;color:#bbb;">${e.message}</p>
          </div>
        `;
      }
    } else {
      sliderContainer.innerHTML = `
        <div style="display:flex;align-items:center;justify-content:center;height:100%;background:#f5f0eb;color:#999;flex-direction:column;gap:10px;font-family:Georgia,serif;">
          <span style="font-size:3rem;">🌹</span>
          <p style="text-align:center;font-size:1.2rem;">Нет изображений для этого сорта</p>
        </div>
      `;
    }
  }

  // ============================================
  // КНОПКА "В ИЗБРАННОЕ"
  // ============================================

  const favBtn = document.querySelector('#favToggleBtn');
  if (favBtn) {
    // Проверяем, есть ли функция favorites
    if (typeof favorites !== 'undefined' && favorites.isFavorite) {
      const isFavorite = favorites.isFavorite(rose.id);
      favBtn.textContent = isFavorite ? '❤️ В избранном' : '♡ В избранное';
      favBtn.classList.toggle('active', isFavorite);
    }

    favBtn.addEventListener('click', function() {
      if (typeof favorites !== 'undefined' && favorites.toggle) {
        const isNowFavorite = favorites.toggle(rose.id);
        this.textContent = isNowFavorite ? '❤️ В избранном' : '♡ В избранное';
        this.classList.toggle('active', isNowFavorite);
      } else {
        // Fallback через localStorage
        try {
          const favs = JSON.parse(localStorage.getItem('roseFavorites') || '[]');
          const index = favs.indexOf(rose.id);
          if (index === -1) {
            favs.push(rose.id);
            this.textContent = '❤️ В избранном';
            this.classList.add('active');
          } else {
            favs.splice(index, 1);
            this.textContent = '♡ В избранное';
            this.classList.remove('active');
          }
          localStorage.setItem('roseFavorites', JSON.stringify(favs));
        } catch (e) {
          console.warn('Ошибка работы с избранным:', e);
        }
      }
    });
  }

  // === ОБНОВЛЯЕМ ЗАГОЛОВОК СТРАНИЦЫ ===
  document.title = `${rose.name} — Азбука Роз`;

  console.log('✅ Страница сорта полностью загружена');
})();