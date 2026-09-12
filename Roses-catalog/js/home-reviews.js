/* =========================================================
   home-reviews.js — блок «Последние отзывы» на главной
   Читает пользовательские отзывы из localStorage (reviews.js)
   ========================================================= */

(function () {
  console.log('💬 home-reviews.js: загрузка последних отзывов...');

  const container = document.getElementById('latestReviews');
  if (!container) {
    console.info('ℹ️ home-reviews.js: контейнер #latestReviews не найден — пропускаем');
    return;
  }

  if (typeof roses === 'undefined' || !Array.isArray(roses)) {
    console.error('❌ home-reviews.js: массив roses не найден');
    return;
  }

  if (typeof getAllUserReviews !== 'function') {
    console.warn('⚠️ home-reviews.js: reviews.js не подключён — блок пуст');
    renderEmpty();
    return;
  }

  // === Собираем все пользовательские отзывы в один плоский массив ===
   const allReviews = getAllUserReviews();  // { roseId: [review, …] }

  const flat = [];
  for (const roseId in allReviews) {
    const list = allReviews[roseId];
    if (!Array.isArray(list)) continue;

    const rose = roses.find(r => String(r.id) === String(roseId));
    if (!rose) continue;

    list.forEach(review => {
      flat.push({ rose, review: { ...review, userAdded: true } });
    });
  }

  // Дополняем встроенными отзывами из data.js
  roses.forEach(rose => {
    if (!Array.isArray(rose.reviews)) return;
    rose.reviews.forEach(review => {
      flat.push({ rose, review });
    });
  });

  // Ничего нет — показываем заглушку
  if (flat.length === 0) {
    renderEmpty();
    return;
  }

  // === Сортируем по дате (новые сверху) ===
  flat.sort((a, b) => (b.review.date || '').localeCompare(a.review.date || ''));

  // === Берём последние 3 ===
  const latest = flat.slice(0, 3);

  // === Рендер ===
  container.innerHTML = latest.map(renderItem).join('');
  console.log(`✅ home-reviews.js: показано ${latest.length} отзывов`);

  /* ============ ВСПОМОГАТЕЛЬНЫЕ ============ */

  function renderItem({ rose, review }) {
    const imageSrc = getImageSrc(rose);
    const dateText = formatDate(review.date);
    const score = Number(review.score) || 0;

    return `
      <a href="rose.html?id=${rose.id}" class="latest-review">
        <div class="latest-review__thumb">
          ${imageSrc
            ? `<img src="${imageSrc}" alt="${escapeHtml(rose.name)}" loading="lazy">`
            : `<div class="latest-review__thumb-empty">🌹</div>`}
        </div>
        <div class="latest-review__body">
          <div class="latest-review__rose">${escapeHtml(rose.name)}</div>
          <div class="latest-review__stars">
            <span class="stars-visual" style="--rating: ${score}"></span>
          </div>
          <p class="latest-review__text">«${escapeHtml(truncate(review.text, 120))}»</p>
          <div class="latest-review__meta">
            <span class="latest-review__author">— ${escapeHtml(review.author || 'Аноним')}</span>
            ${dateText ? `<span class="latest-review__date">${dateText}</span>` : ''}
          </div>
        </div>
      </a>
    `;
  }

  function renderEmpty() {
    container.innerHTML = `
      <div class="latest-reviews__empty">
        <div class="latest-reviews__empty-icon">💬</div>
        <p>Пока никто не оставил отзывов.</p>
        <p class="latest-reviews__empty-hint">
          Загляните в <a href="catalog.html">каталог</a>, откройте сорт
          и поделитесь впечатлениями первым.
        </p>
      </div>
    `;
  }

  /* --- Путь к изображению --- */
  function getImageSrc(rose) {
    if (Array.isArray(rose.images) && rose.images.length > 0) {
      const fileName = rose.images[0];
      if (!fileName) return '';
      return fileName.includes('/') ? fileName : `img/${fileName}`;
    }
    return '';
  }

  /* --- Дата --- */
  function formatDate(iso) {
    if (!iso) return '';
    const d = new Date(iso);
    if (isNaN(d)) return iso;

    const now = new Date();
    const diffMs = now - d;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'сегодня';
    if (diffDays === 1) return 'вчера';
    if (diffDays < 7)   return `${diffDays} дн. назад`;

    return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' });
  }

  /* --- Обрезка текста --- */
  function truncate(s, max) {
    s = String(s || '');
    return s.length > max ? s.slice(0, max).trim() + '…' : s;
  }

  /* --- Экранирование HTML --- */
  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }
})();