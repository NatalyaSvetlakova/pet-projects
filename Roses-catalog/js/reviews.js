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