// ============================================================
// js/rose-tabs.js — код, который раньше был inline в rose.html
// ============================================================

// -------- 1. Синхронизация нового отзыва с RoseRatings --------
window.rosesReady.then(() => {
  const reviewForm = document.getElementById('reviewForm');
  if (!reviewForm) return;

  // capture:true — чтобы прочитать поля раньше, чем reviews.js их очистит
  reviewForm.addEventListener('submit', () => {
    const roseId = new URLSearchParams(location.search).get('id') || 'unknown';

    const score  = Number(document.getElementById('reviewScore').value) || 0;
    const text   = (document.getElementById('reviewText').value  || '').trim();
    const author = (document.getElementById('reviewAuthor').value || 'Гость').trim();

    // Синхронизируем только валидные отзывы
    if (score < 1 || text.length < 5) return;

    if (window.RoseRatings && typeof RoseRatings.addUserReview === 'function') {
      RoseRatings.addUserReview(roseId, {
        rating: score,
        text: text,
        author: author
      });
    }
  }, true); // ← обязательно capture: true
});

// -------- 3. Переключение вкладок «Отзывы / Вопросы» --------
document.addEventListener('click', function (e) {
  const btn = e.target.closest('.tab-btn');
  if (!btn) return;
  e.preventDefault();

  const targetId = btn.getAttribute('data-tab');
  if (!targetId) return;

  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));

  btn.classList.add('active');
  const target = document.getElementById(targetId);
  if (target) target.classList.add('active');
});