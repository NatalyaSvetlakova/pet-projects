/* =========================================================
   reviews.js — отзывы пользователей в localStorage
   API: getReviews, addReview, getUserReviews,
        deleteReview, getAverageRating
   ========================================================= */

const REVIEWS_KEY = 'roses-catalog-reviews';

/**
 * Получить ВСЕ пользовательские отзывы (объект: { roseId: [review, …] })
 * @returns {Object}
 */
function getAllUserReviews() {
  const stored = localStorage.getItem(REVIEWS_KEY);
  if (!stored) return {};
  try {
    const parsed = JSON.parse(stored);
    return (parsed && typeof parsed === 'object') ? parsed : {};
  } catch (e) {
    console.warn('reviews.js: повреждённые данные, сброс.');
    localStorage.removeItem(REVIEWS_KEY);
    return {};
  }
}

/**
 * Сохранить все отзывы обратно в localStorage
 * @param {Object} data
 */
function saveAllUserReviews(data) {
  localStorage.setItem(REVIEWS_KEY, JSON.stringify(data));
}

/**
 * Получить отзывы ДЛЯ КОНКРЕТНОГО сорта (только пользовательские)
 * @param {string} roseId
 * @returns {Object[]}
 */
function getUserReviews(roseId) {
  const all = getAllUserReviews();
  return Array.isArray(all[roseId]) ? all[roseId] : [];
}

/**
 * Объединить «встроенные» (из data.js) и пользовательские отзывы
 * @param {Object} rose - объект сорта из data.js
 * @returns {Object[]}
 */
function getReviews(rose) {
  const builtin = Array.isArray(rose.reviews) ? rose.reviews : [];
  const user = getUserReviews(rose.id);
  // помечаем пользовательские, чтобы отличать их в UI
  const userMarked = user.map(r => ({ ...r, userAdded: true }));
  return [...userMarked, ...builtin];
}

/**
 * Добавить новый отзыв
 * @param {string} roseId
 * @param {{author:string, score:number, text:string}} review
 */
function addReview(roseId, review) {
  const all = getAllUserReviews();
  if (!Array.isArray(all[roseId])) all[roseId] = [];

  all[roseId].unshift({
    author: review.author.trim() || 'Аноним',
    score: Math.min(5, Math.max(1, parseInt(review.score, 10) || 5)),
    text: review.text.trim(),
    date: new Date().toISOString().slice(0, 10),
    userAdded: true   // ← ДОБАВЬТЕ ЭТУ СТРОКУ
  });

  saveAllUserReviews(all);
}

/**
 * Удалить пользовательский отзыв по индексу
 * @param {string} roseId
 * @param {number} index
 */
function deleteReview(roseId, index) {
  const all = getAllUserReviews();
  if (!Array.isArray(all[roseId])) return;
  all[roseId].splice(index, 1);
  if (all[roseId].length === 0) delete all[roseId];
  saveAllUserReviews(all);
}

/**
 * Средний рейтинг с учётом пользовательских отзывов
 * @param {Object} rose
 * @returns {number}
 */
function getAverageRating(rose) {
  const reviews = getReviews(rose);
  if (reviews.length === 0) return rose.rating ? parseFloat(rose.rating) : 0;
  const sum = reviews.reduce((acc, r) => acc + (Number(r.score) || 0), 0);
  return +(sum / reviews.length).toFixed(1);
}

/**
 * Возвращает объект с полной статистикой рейтинга
 * @param {Object} rose - объект сорта из data.js
 * @returns {{ total: number, avg: number, distribution: Object }}
 */
function getRatingSummary(rose) {
  const reviews = getReviews(rose); // Берем объединенные отзывы (пользовательские + встроенные)
  const total = reviews.length;
  
  // Инициализируем счетчики для 5, 4, 3, 2, 1 звезды
  const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  let sum = 0;

  reviews.forEach(r => {
    // Округляем оценку до целого и проверяем, что она в диапазоне 1-5
    const score = Math.round(Number(r.score) || 0);
    if (score >= 1 && score <= 5) {
      distribution[score]++;
      sum += score;
    }
  });

  // Считаем средний балл (если отзывов нет, возвращаем 0)
  const avg = total > 0 ? (sum / total).toFixed(1) : 0;

  return { total, avg, distribution };
}

/**
 * Обновляет блок рейтинга на странице отдельного сорта (rose.html).
 * Использует getReviews(rose) — то есть встроенные отзывы из data.js
 * ПЛЮС пользовательские отзывы из localStorage. Расчёт полностью
 * совпадает с тем, что использует каталог.
 *
 * @param {Object} rose - объект сорта из data.js
 */
function updateRoseRatingUI(rose) {
  if (!rose) return;

  const reviews = getReviews(rose);       // ← единый источник правды
  const total = reviews.length;

  // 1. Средний балл
  const sum = reviews.reduce((s, r) => s + (Number(r.score) || 0), 0);
  const avg = total > 0 ? (sum / total) : 0;

  // 2. Распределение по звёздам
  const dist = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  reviews.forEach(r => {
    const score = Math.round(Number(r.score) || 0);
    if (dist[score] !== undefined) dist[score]++;
  });

  // 3. Текст "X / 5"
  const avgTextEl = document.getElementById('reviewsAvgText');
  if (avgTextEl) {
    avgTextEl.textContent = total > 0 ? `${avg.toFixed(1)} / 5` : '0 / 5';
  }

  // 4. Визуальные звёзды (CSS-переменная --rating)
  const starsEl = document.getElementById('reviewsAvgStars');
  if (starsEl) {
    starsEl.style.setProperty('--rating', avg.toFixed(1));
  }

  // 5. Полоски
  const rows = document.querySelectorAll('.rating-bar-row');
  rows.forEach((row, index) => {
    // Порядок строк в HTML: 5, 4, 3, 2, 1
    const starValue = 5 - index;
    const count = dist[starValue] || 0;
    const percent = total > 0 ? (count / total) * 100 : 0;

    const fillEl = row.querySelector('.bar-fill');
    const countEl = row.querySelector('.bar-count');

    if (fillEl) fillEl.style.width = `${percent}%`;
    if (countEl) countEl.textContent = count;
  });

  console.log(`⭐ Рейтинг сорта "${rose.name}": ${avg.toFixed(1)} / 5 (${total} отзывов)`);
}