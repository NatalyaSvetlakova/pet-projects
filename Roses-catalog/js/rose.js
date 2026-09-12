// ============================================
// ROSE.JS — ЛОГИКА СТРАНИЦЫ СОРТА
// ============================================

// ============================================
// ХРАНЕНИЕ ГОЛОСОВ "ПОЛЕЗНО" ДЛЯ ОТЗЫВОВ
// (ОБЪЯВЛЕНО СВЕРХУ, ЧТОБЫ БЫЛО ДОСТУПНО ВЕЗДЕ)
// ============================================

window.getHelpfulCount = function(roseId, reviewId) {
  const key = `helpful_${roseId}_${reviewId}`;
  const count = localStorage.getItem(key + '_count');
  return count ? parseInt(count, 10) : 0;
};

window.isHelpfulVoted = function(roseId, reviewId) {
  const key = `helpful_${roseId}_${reviewId}`;
  return localStorage.getItem(key + '_voted') === 'true';
};

window.toggleReviewHelpful = function(button, roseId, reviewId) {
  const key = `helpful_${roseId}_${reviewId}`;
  const countSpan = button.querySelector('.helpful-count');
  let count = parseInt(countSpan.textContent, 10) || 0;
  const isVoted = localStorage.getItem(key + '_voted') === 'true';

  if (isVoted) {
    count = Math.max(0, count - 1);
    button.classList.remove('active');
    localStorage.setItem(key + '_voted', 'false');
  } else {
    count += 1;
    button.classList.add('active');
    localStorage.setItem(key + '_voted', 'true');
  }

  countSpan.textContent = count;
  localStorage.setItem(key + '_count', count);
};

// ============================================
// ОСНОВНАЯ ЛОГИКА СТРАНИЦЫ
// ============================================
(function() {
  'use strict';

  console.log('🌹 Загрузка страницы сорта...');

  const params = new URLSearchParams(window.location.search);
  const roseId = params.get('id');
  const container = document.querySelector('#rosePage');

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

  if (!roseId) {
    showError('Сорт не найден', 'Не указан ID сорта');
    return;
  }

  if (typeof roses === 'undefined') {
    showError('Ошибка загрузки данных', 'Проверьте подключение data.js');
    return;
  }

  const rose = roses.find(r => r.id === roseId);
  console.log('🌹 Найденный сорт:', rose);

  if (!rose) {
    showError('Сорт не найден', `Сорт с ID "${roseId}" не существует`);
    return;
  }

  // Заполняем информацию
  const elements = {
    name:        document.querySelector('#roseName'),
    category:    document.querySelector('#roseCategory'),
    description: document.querySelector('#roseDescription'),
    color:       document.querySelector('#specColor'),
    height:      document.querySelector('#specHeight'),
    diameter:    document.querySelector('#specDiameter'),
    aroma:       document.querySelector('#specAroma'),
    frost:       document.querySelector('#specFrost'),
    flowering:   document.querySelector('#specFlowering')
  };

  if (elements.name)        elements.name.textContent        = rose.name || '—';
  if (elements.category)    elements.category.textContent    = rose.categoryLabel || rose.category || 'Сорт розы';
  if (elements.description) elements.description.textContent = rose.description || 'Красивый сорт розы.';
  if (elements.color)       elements.color.textContent       = rose.color || '—';
  if (elements.height)      elements.height.textContent      = rose.height || '—';
  if (elements.diameter)    elements.diameter.textContent    = rose.flowerSize || rose.diameter || '—';
  if (elements.aroma)       elements.aroma.textContent       = rose.aroma || '—';
  if (elements.frost)       elements.frost.textContent       = rose.coldResistance || rose.frostResistance || '—';
  if (elements.flowering)   elements.flowering.textContent   = rose.bloomPeriod || rose.flowering || '—';

  // Слайдер
  const sliderContainer = document.querySelector('#rose-gallery-slider');
  if (sliderContainer) {
    const hasImages = rose.images && rose.images.length > 0;
    if (hasImages) {
      const slides = rose.images.map((img, index) => ({
        image: img,
        title: index === 0 ? rose.name : null,
        subtitle: index === 0 ? rose.color : null,
        link: null
      }));
      try {
        if (typeof RoseSlider === 'undefined') throw new Error('Класс RoseSlider не найден.');
        new RoseSlider({
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
      } catch (e) {
        console.error('❌ Ошибка слайдера:', e);
        sliderContainer.innerHTML = `<div style="text-align:center;padding:40px;color:#999;">Ошибка загрузки слайдера</div>`;
      }
    } else {
      sliderContainer.innerHTML = `<div style="text-align:center;padding:40px;color:#999;">Нет изображений</div>`;
    }
  }

  // Кнопка "В избранное"
  const favBtn = document.querySelector('#favToggleBtn');
  if (favBtn) {
    if (typeof isInFavorites === 'function') {
      const isFav = isInFavorites(rose.id);
      favBtn.textContent = isFav ? '❤️ В избранном' : '♡ В избранное';
      favBtn.classList.toggle('active', isFav);
    }
    favBtn.addEventListener('click', function () {
      if (typeof toggleFavorite === 'function') toggleFavorite(rose.id, favBtn);
    });
  }

  document.title = `${rose.name} — Азбука Роз`;

  // Инициализация отзывов
  if (typeof initReviews === 'function') {
    initReviews(rose);
  } else {
    console.warn('⚠️ initReviews не найдена');
  }

  // Инициализация вопросов (привязка к конкретному сорту через rose.id)
  if (typeof initQuestions === 'function') {
    initQuestions(rose);
  } else {
    console.warn('⚠️ initQuestions не найдена — проверьте подключение qna.js');
  }

  console.log('✅ Страница сорта загружена');
})();

// ============================================
// ЛОГИКА ОТЗЫВОВ
// ============================================
function initReviews(rose) {
  const listEl     = document.getElementById('reviewsList');
  const avgStarsEl = document.getElementById('reviewsAvgStars');
  const avgTextEl  = document.getElementById('reviewsAvgText');
  const sortEl     = document.getElementById('reviewsSort');
  const openBtn    = document.getElementById('reviewsOpenFormBtn');
  const form       = document.getElementById('reviewForm');
  const cancelBtn  = document.getElementById('reviewCancelBtn');
  const errorEl    = document.getElementById('reviewError');
  const scoreInput = document.getElementById('reviewScore');
  const hint       = document.getElementById('ratingHint');

  if (!listEl) return;
  if (typeof getReviews !== 'function') {
    listEl.innerHTML = '<li class="reviews-empty">Не удалось загрузить отзывы (нет reviews.js)</li>';
    return;
  }

  let currentSort = sortEl ? sortEl.value : 'date-desc';

  function renderReviews() {
    const reviews = getReviews(rose);

    const avg = getAverageRating(rose);
    
    // === Обновляем счётчик в табе ===
    const countEl = document.getElementById('reviewsCount');
    if (countEl) countEl.textContent = reviews.length;

    if (avgStarsEl) avgStarsEl.style.setProperty('--rating', avg);
    if (avgTextEl) {
      avgTextEl.textContent = reviews.length === 0
        ? 'Пока нет оценок'
        : `${avg} из 5 · ${reviews.length} ${plural(reviews.length)}`;
    }

    if (reviews.length === 0) {
      listEl.innerHTML = `<li class="reviews-empty">Отзывов пока нет — станьте первым!</li>`;
      return;
    }

    const sorted = [...reviews].sort(getComparator(currentSort));

    listEl.innerHTML = sorted.map(r => {
      const dt = r.date ? formatDate(r.date) : '';
      const isUser = r.userAdded;
      const origIndex = isUser ? reviews.indexOf(r) : -1;
      
      // Используем индекс как надежный уникальный ключ
      const reviewId = reviews.indexOf(r); 
      
      const helpfulCount = getHelpfulCount(rose.id, reviewId);
      const isHelpfulActive = isHelpfulVoted(rose.id, reviewId);

      return `
        <li class="review${isUser ? ' review--user' : ''}">
          <div class="review__head">
            <span class="review__author">${escapeHtml(r.author || 'Аноним')}</span>
            <span class="review__date">${dt}</span>
          </div>
          <div class="review__stars">
            <span class="stars-visual" style="--rating: ${r.score || 0}"></span>
          </div>
          <p class="review__text">${escapeHtml(r.text || '')}</p>
          
          <div class="review__footer">
            <span class="review__helpful-label">Вам помог этот отзыв?</span>
            <button type="button" 
                    class="helpful-btn ${isHelpfulActive ? 'active' : ''}" 
                    onclick="toggleReviewHelpful(this, '${rose.id}', ${reviewId})">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path>
              </svg>
              Да <span class="helpful-count">${helpfulCount}</span>
            </button>
          </div>

          ${isUser && origIndex >= 0 ? `
            <button type="button" class="review__delete" data-index="${origIndex}" title="Удалить">✕</button>
          ` : ''}
        </li>
      `;
    }).join('');

    listEl.querySelectorAll('.review__delete').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.dataset.index, 10);
        if (!isNaN(idx)) {
          deleteReview(rose.id, idx);
          renderReviews();
        }
      });
    });
  }

  function getComparator(sort) {
    switch (sort) {
      case 'date-asc':   return (a, b) => (a.date || '').localeCompare(b.date || '');
      case 'score-desc': return (a, b) => (b.score || 0) - (a.score || 0);
      case 'score-asc':  return (a, b) => (a.score || 0) - (b.score || 0);
      case 'date-desc':
      default:           return (a, b) => (b.date || '').localeCompare(a.date || '');
    }
  }

  if (openBtn && form) {
    openBtn.addEventListener('click', () => {
      form.hidden = false;
      openBtn.hidden = true;
      form.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
  }
  if (cancelBtn && form && openBtn) {
    cancelBtn.addEventListener('click', () => {
      form.hidden = true;
      openBtn.hidden = false;
      resetForm();
    });
  }

  const stars = form ? form.querySelectorAll('.rating-input__star') : [];
  function paintStars(n) {
    stars.forEach(s => s.classList.toggle('active', +s.dataset.value <= n));
  }
  stars.forEach(star => {
    star.addEventListener('mouseenter', () => paintStars(+star.dataset.value));
    star.addEventListener('mouseleave', () => paintStars(+scoreInput.value || 0));
    star.addEventListener('click', () => {
      scoreInput.value = star.dataset.value;
      paintStars(+star.dataset.value);
      if (hint) hint.textContent = `Ваша оценка: ${star.dataset.value} из 5`;
    });
  });

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const score  = parseInt(scoreInput.value, 10);
      const text   = document.getElementById('reviewText').value.trim();
      const author = document.getElementById('reviewAuthor').value.trim();

      if (!score)          return showError('Поставьте оценку — нажмите на звёзды.');
      if (text.length < 5) return showError('Отзыв слишком короткий (минимум 5 символов).');

      addReview(rose.id, { author, score, text });
      resetForm();
      form.hidden = true;
      if (openBtn) openBtn.hidden = false;
      renderReviews();
    });
  }

  function showError(msg) {
    if (!errorEl) return;
    errorEl.textContent = msg;
    errorEl.hidden = false;
  }

  function resetForm() {
    if (!form) return;
    form.reset();
    if (scoreInput) scoreInput.value = '0';
    paintStars(0);
    if (hint) hint.textContent = 'Нажмите на звёзды';
    if (errorEl) errorEl.hidden = true;
  }

  if (sortEl) {
    sortEl.addEventListener('change', () => {
      currentSort = sortEl.value;
      renderReviews();
    });
  }

  function plural(n) {
    const m10 = n % 10, m100 = n % 100;
    if (m10 === 1 && m100 !== 11) return 'отзыв';
    if (m10 >= 2 && m10 <= 4 && (m100 < 10 || m100 >= 20)) return 'отзыва';
    return 'отзывов';
  }

  function formatDate(iso) {
    const d = new Date(iso);
    if (isNaN(d)) return iso;
    return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  renderReviews();
}

// ============================================
// ЛОГИКА ВОПРОСОВ (привязана к конкретному сорту)
// ============================================
function initQuestions(rose) {
  const listEl         = document.getElementById('questionsList');
  const form           = document.getElementById('questionForm');
  const questionsCount = document.getElementById('questionsCount');

  if (!listEl) return;
  if (typeof getQuestions !== 'function') {
    listEl.innerHTML = '<p class="reviews-empty">Не удалось загрузить вопросы (нет qna.js)</p>';
    return;
  }

  // ============ Отрисовка списка ============
  function renderQuestions() {
    const questions = getQuestions(rose.id);   // ← только для этого сорта

    if (questions.length === 0) {
      listEl.innerHTML = '<p class="reviews-empty">Пока нет вопросов — задайте первый!</p>';
    } else {
      listEl.innerHTML = questions.map(q => {
        const repliesHtml = (q.replies || []).map(r => `
          <div class="reply-item">
            <div class="reply-author">${escapeHtml(r.author)}</div>
            <div class="reply-text">${escapeHtml(r.text)}</div>
          </div>
        `).join('');

        return `
          <div class="question-card" data-question-id="${q.id}">
            <div class="question-header">
              <div class="user-info">
                <div class="avatar">${escapeHtml((q.author || 'Г').charAt(0).toUpperCase())}</div>
                <div>
                  <div class="user-name">${escapeHtml(q.author || 'Гость')}</div>
                  <div class="review-meta">${q.date || ''}</div>
                </div>
              </div>
            </div>
            <div class="question-text">${escapeHtml(q.text)}</div>

            <div class="question-replies">${repliesHtml}</div>

            <div class="question-footer">
              <button class="helpful-btn" onclick="handleQuestionLike(this, '${rose.id}', ${q.id})">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path>
                </svg>
                <span class="helpful-count">${q.likes || 0}</span>
              </button>
              <button class="reply-btn" onclick="toggleReplyForm(this)">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
                  <polyline points="16 8 12 12 8 8"></polyline>
                </svg>
                Ответить
              </button>
            </div>

            <form class="reply-form" onsubmit="handleReplySubmit(event, this, '${rose.id}', ${q.id})">
              <input type="text" class="reply-author-input" placeholder="Ваше имя" style="width:100%; padding:8px 12px; margin-bottom:8px; border:1px solid #eaeaea; border-radius:8px; box-sizing:border-box;">
              <textarea placeholder="Напишите ваш ответ..." required></textarea>
              <button type="submit" class="submit-btn">Отправить</button>
            </form>
          </div>
        `;
      }).join('');
    }

    if (questionsCount) questionsCount.textContent = questions.length;
  }

  // ============ Отправка нового вопроса ============
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const text = document.getElementById('questionText').value.trim();
      const authorEl = document.getElementById('questionAuthor');
      const author = authorEl ? authorEl.value.trim() : 'Гость';
      if (!text) return;

      addQuestion(rose.id, text, author);   // ← привязано к rose.id
      form.reset();
      renderQuestions();
    });
  }

  // ============ Первый рендер ============
  renderQuestions();
}

// ============================================
// ГЛОБАЛЬНЫЕ ОБРАБОТЧИКИ ДЛЯ ВОПРОСОВ
// (вызываются через onclick из HTML)
// ============================================

// Клик по «Полезно» у вопроса
window.handleQuestionLike = function(button, roseId, questionId) {
  const countSpan = button.querySelector('.helpful-count');
  let count = parseInt(countSpan.textContent, 10) || 0;
  count += 1;
  countSpan.textContent = count;
  if (typeof updateQuestionLikes === 'function') {
    updateQuestionLikes(roseId, questionId, count);
  }
};

// Открытие/закрытие формы ответа под конкретным вопросом
window.toggleReplyForm = function(button) {
  const card = button.closest('.question-card');
  const form = card.querySelector('.reply-form');

  // Закрываем все другие открытые формы
  document.querySelectorAll('.reply-form.active').forEach(f => {
    if (f !== form) f.classList.remove('active');
  });

  form.classList.toggle('active');
  if (form.classList.contains('active')) {
    form.querySelector('textarea').focus();
  }
};

// Отправка ответа на конкретный вопрос
window.handleReplySubmit = function(event, form, roseId, questionId) {
  event.preventDefault();

  const text = form.querySelector('textarea').value.trim();
  const authorInput = form.querySelector('.reply-author-input');
  const author = authorInput ? authorInput.value.trim() : 'Гость';
  if (!text) return;

  if (typeof addReply === 'function') {
    addReply(roseId, questionId, text, author);   // ← привязано к roseId + questionId
  }

  // Перерисовываем вопросы — находим rose заново
  if (typeof roses !== 'undefined') {
    const rose = roses.find(r => r.id === roseId);
    if (rose && typeof initQuestions === 'function') initQuestions(rose);
  }
};

// // ============================================
// // ROSE.JS — ЛОГИКА СТРАНИЦЫ СОРТА
// // ============================================

// (function() {
//   'use strict';

//   console.log('🌹 Загрузка страницы сорта...');

//   // === ПОЛУЧАЕМ ID СОРТА ИЗ URL ===
//   const params = new URLSearchParams(window.location.search);
//   const roseId = params.get('id');
//   console.log('🔍 ID сорта из URL:', roseId);

//   // === ПОЛУЧАЕМ КОНТЕЙНЕР ===
//   const container = document.querySelector('#rosePage');

//   // === ФУНКЦИЯ ПОКАЗА ОШИБКИ ===
//   function showError(message, details = '') {
//     if (container) {
//       container.innerHTML = `
//         <div style="text-align:center;padding:60px 20px;color:#999;grid-column:1/-1;">
//           <h2 style="font-family:Georgia,serif;">🌹 ${message}</h2>
//           ${details ? `<p style="color:#bbb;">${details}</p>` : ''}
//           <a href="catalog.html" class="btn" style="margin-top:20px;display:inline-block;padding:12px 32px;background:#b72e4a;color:#fff;border-radius:50px;text-decoration:none;">Вернуться в каталог</a>
//         </div>
//       `;
//     }
//   }

//   // === ПРОВЕРКА ID ===
//   if (!roseId) {
//     showError('Сорт не найден', 'Не указан ID сорта');
//     return;
//   }

//   // === ПРОВЕРКА ДАННЫХ ===
//   if (typeof roses === 'undefined') {
//     showError('Ошибка загрузки данных', 'Проверьте подключение data.js');
//     return;
//   }

//   // === НАХОДИМ СОРТ ===
//   const rose = roses.find(r => r.id === roseId);
//   console.log('🌹 Найденный сорт:', rose);

//   if (!rose) {
//     showError('Сорт не найден', `Сорт с ID "${roseId}" не существует`);
//     return;
//   }

//   // ============================================
//   // ЗАПОЛНЯЕМ ИНФОРМАЦИЮ
//   // ============================================

//   // Элементы для заполнения
//   const elements = {
//     name: document.querySelector('#roseName'),
//     category: document.querySelector('#roseCategory'),
//     description: document.querySelector('#roseDescription'),
//     color: document.querySelector('#specColor'),
//     height: document.querySelector('#specHeight'),
//     diameter: document.querySelector('#specDiameter'),
//     aroma: document.querySelector('#specAroma'),
//     frost: document.querySelector('#specFrost'),
//     flowering: document.querySelector('#specFlowering')
//   };

//   // Заполняем данные
//   if (elements.name) elements.name.textContent = rose.name || '—';
//   if (elements.category) elements.category.textContent = rose.categoryLabel || rose.category || 'Сорт розы';
//   if (elements.description) elements.description.textContent = rose.description || 'Красивый сорт розы.';

//   if (elements.color) elements.color.textContent = rose.color || '—';
//   if (elements.height) elements.height.textContent = rose.height || '—';
//   if (elements.diameter) elements.diameter.textContent = rose.flowerSize || rose.diameter || '—';
//   if (elements.aroma) elements.aroma.textContent = rose.aroma || '—';
//   if (elements.frost) elements.frost.textContent = rose.coldResistance || rose.frostResistance || '—';
//   if (elements.flowering) elements.flowering.textContent = rose.bloomPeriod || rose.flowering || '—';

//   // ============================================
//   // ИНИЦИАЛИЗАЦИЯ СЛАЙДЕРА
//   // ============================================

//   const sliderContainer = document.querySelector('#rose-gallery-slider');
//   console.log('📦 Контейнер слайдера:', sliderContainer);

//   if (sliderContainer) {
//     const hasImages = rose.images && rose.images.length > 0;
//     console.log('🖼️ Фото:', hasImages ? rose.images.length : 'нет');

//     if (hasImages) {
//       const slides = rose.images.map((img, index) => ({
//         image: img,
//         title: index === 0 ? rose.name : null,
//         subtitle: index === 0 ? rose.color : null,
//         link: null
//       }));

//       console.log('📸 Слайдов для отображения:', slides.length);

//       try {
//         if (typeof RoseSlider === 'undefined') {
//           throw new Error('Класс RoseSlider не найден. Проверьте подключение slider.js');
//         }

//         const slider = new RoseSlider({
//           container: "#rose-gallery-slider",
//           slides: slides,
//           autoplay: true,
//           interval: 3500,
//           loop: true,
//           showDots: true,
//           showArrows: true,
//           keyboard: true,
//           pauseOnHover: true
//         });

//         console.log('✅ Слайдер для сорта', rose.name, 'успешно запущен!');

//       } catch (e) {
//         console.error('❌ Ошибка инициализации слайдера:', e);
//         sliderContainer.innerHTML = `
//           <div style="display:flex;align-items:center;justify-content:center;height:100%;background:#f5f0eb;color:#999;flex-direction:column;gap:10px;font-family:Georgia,serif;">
//             <span style="font-size:3rem;">🌹</span>
//             <p style="text-align:center;font-size:1.2rem;">Ошибка загрузки слайдера</p>
//             <p style="font-size:0.9rem;color:#bbb;">${e.message}</p>
//           </div>
//         `;
//       }
//     } else {
//       sliderContainer.innerHTML = `
//         <div style="display:flex;align-items:center;justify-content:center;height:100%;background:#f5f0eb;color:#999;flex-direction:column;gap:10px;font-family:Georgia,serif;">
//           <span style="font-size:3rem;">🌹</span>
//           <p style="text-align:center;font-size:1.2rem;">Нет изображений для этого сорта</p>
//         </div>
//       `;
//     }
//   }

//   // ============================================
//   // КНОПКА "В ИЗБРАННОЕ"
//   // ============================================

//   const favBtn = document.querySelector('#favToggleBtn');
//   if (favBtn) {
//     // Проверяем, есть ли функция favorites
//     if (typeof favorites !== 'undefined' && favorites.isFavorite) {
//       const isFavorite = favorites.isFavorite(rose.id);
//       favBtn.textContent = isFavorite ? '❤️ В избранном' : '♡ В избранное';
//       favBtn.classList.toggle('active', isFavorite);
//     }

//     favBtn.addEventListener('click', function() {
//       if (typeof favorites !== 'undefined' && favorites.toggle) {
//         const isNowFavorite = favorites.toggle(rose.id);
//         this.textContent = isNowFavorite ? '❤️ В избранном' : '♡ В избранное';
//         this.classList.toggle('active', isNowFavorite);
//       } else {
//         // Fallback через localStorage
//         try {
//           const favs = JSON.parse(localStorage.getItem('roseFavorites') || '[]');
//           const index = favs.indexOf(rose.id);
//           if (index === -1) {
//             favs.push(rose.id);
//             this.textContent = '❤️ В избранном';
//             this.classList.add('active');
//           } else {
//             favs.splice(index, 1);
//             this.textContent = '♡ В избранное';
//             this.classList.remove('active');
//           }
//           localStorage.setItem('roseFavorites', JSON.stringify(favs));
//         } catch (e) {
//           console.warn('Ошибка работы с избранным:', e);
//         }
//       }
//     });
//   }

//   // === ОБНОВЛЯЕМ ЗАГОЛОВОК СТРАНИЦЫ ===
//   document.title = `${rose.name} — Азбука Роз`;

//   console.log('✅ Страница сорта полностью загружена');
// })();