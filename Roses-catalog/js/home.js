/* =========================================================
   home.js — логика главной страницы
   Использует API из favorites.js: isInFavorites / toggleFavorite
   ========================================================= */
// Объединённый рейтинг:
// база из data.js + пользовательские отзывы из RoseRatings
function getMerged(rose) {
  if (window.RoseRatings && RoseRatings.getMergedRating) {
    return RoseRatings.getMergedRating(rose.id);
  }

  const arr = Array.isArray(rose.reviews) ? rose.reviews : [];

  const sum = arr.reduce(
    (s, r) => s + (Number(r.score) || 0),
    0
  );

  const avg = arr.length
    ? sum / arr.length
    : (parseFloat(rose.rating) || 0);

  return {
    avg: Math.round(avg * 10) / 10,
    count: arr.length
  };
}


// Рейтинг для сортировки каталога.
// Используем ТОТ ЖЕ рейтинг, который показываем пользователю.
//
// Это важно:
// раньше карточки показывали getMerged().avg,
// а сортировка использовала Bayesian getRankingScore().score.
// Из-за этого, например, роза с 4.9 могла оказаться ниже розы с 4.8.
//
// Теперь источник один — getMerged().avg.
function getRankingScore(rose) {
  const { avg, count } = getMerged(rose);

  return {
    score: avg,
    avg,
    count
  };
}


function getImageSrc(rose) {
  if (!rose) return '';

  // Если у розы есть image
  if (rose.image) {
    return rose.image;
  }

  // Если используется images
  if (rose.images && Array.isArray(rose.images) && rose.images.length) {
    return rose.images[0];
  }

  // Если используется photo
  if (rose.photo) {
    return rose.photo;
  }

  return '';
}


window.rosesReady.then(() => {

// Объединённый рейтинг (base из data.js + отзывы пользователя)
// function getMerged(rose) {
//   if (window.RoseRatings && RoseRatings.getMergedRating) {
//     return RoseRatings.getMergedRating(rose.id);
//   }
//   const arr = Array.isArray(rose.reviews) ? rose.reviews : [];
//   const sum = arr.reduce((s, r) => s + (Number(r.score) || 0), 0);
//   const avg = arr.length ? sum / arr.length : (parseFloat(rose.rating) || 0);
//   return { avg: Math.round(avg * 10) / 10, count: arr.length };
// }

// // Средний рейтинг по всему каталогу (нужен для байесовского сглаживания)
// function getGlobalAverage() {
//   let sum = 0, count = 0;
//   roses.forEach(rose => {
//     (rose.reviews || []).forEach(r => {
//       const s = Number(r.score);
//       if (s >= 1 && s <= 5) { sum += s; count++; }
//     });
//   });
//   return count ? sum / count : 4.5;
// }

// // «Реалистичный» рейтинг: защищает от 1 отзыва с оценкой 5
// // Формула: (sum + K * globalAvg) / (count + K), K — сила сглаживания
// function getRankingScore(rose, K = 5) {
//   const arr = Array.isArray(rose.reviews) ? rose.reviews : [];
//   const baseSum = arr.reduce((s, r) => s + (Number(r.score) || 0), 0);
//   const baseCount = arr.length;

//   const userReviews = (window.RoseRatings && RoseRatings.getUserReviews)
//     ? RoseRatings.getUserReviews(rose.id) : [];
//   const userSum = userReviews.reduce((s, r) => s + (Number(r.rating) || 0), 0);
//   const userCount = userReviews.length;

//   const sum = baseSum + userSum;
//   const count = baseCount + userCount;
//   const globalAvg = getGlobalAverage();

//   // При count = 0 даёт globalAvg; при count >> K — почти чистый средний
//   const score = (sum + K * globalAvg) / (count + K);
//   return { score, avg: count ? Math.round((sum / count) * 10) / 10 : 0, count };
// }

// // === Корректный путь к картинке ===
// function getImageSrc(rose) {
//   if (Array.isArray(rose.images) && rose.images.length > 0) {
//     const fileName = rose.images[0];
//     if (!fileName) return '';
//     return fileName.includes('/') ? fileName : `img/${fileName}`;
//   }
  
//   return '';
// }

// document.addEventListener('DOMContentLoaded', () => {
//   if (typeof roses === 'undefined' || !Array.isArray(roses)) {
//     console.error('❌ home.js: массив roses не найден. Подключён ли data.js?');
//     return;
//   }

  // --- Слайдер ---
  const sliderData = roses
    .slice()
    .sort((a, b) => getMerged(b).avg - getMerged(a).avg)
    .slice(0, 75)
    .map(rose => ({
      image: getImageSrc(rose),
      title: rose.name,
      subtitle: (rose.categoryLabel || '') + ' • ' + (rose.color || ''),
      link: 'rose.html?id=' + rose.id
    }));

  if (typeof RoseSlider !== 'undefined' && sliderData.length > 0) {
    new RoseSlider({
      container: '#hero-slider',
      slides: sliderData,
      autoplay: true,
      interval: 5000,
      showDots: true,
      showArrows: true,
      keyboard: true,
      pauseOnHover: true
    });
  }

  // --- Карточки «Популярные сорта» ---
  const featuredContainer = document.getElementById('featuredCards');
  if (!featuredContainer) return;

  const featured = roses
    .slice()
    // .sort((a, b) => getRankingScore(b).score - getRankingScore(a).score)
    .sort((a, b) => getMerged(b).avg - getMerged(a).avg)
    .slice(0, 6);

  featured.forEach((rose, i) => {
    featuredContainer.appendChild(createFeaturedCard(rose, i + 1));
  });
  if (window.RoseRatings && RoseRatings.onChange) {
  RoseRatings.onChange(() => {
    const container = document.getElementById('featuredCards');
    if (!container) return;
    container.innerHTML = '';
    roses
      .slice()
      // .sort((a, b) => getRankingScore(b).score - getRankingScore(a).score)      
      .sort((a, b) => getMerged(b).avg - getMerged(a).avg).slice(0, 6)
      .forEach((rose, i) => container.appendChild(createFeaturedCard(rose, i + 1)));

    // и, если есть, слайдер тоже можно перестроить
    // (если он держит своё состояние — лучше перезагрузить страницу,
    //  либо у RoseSlider должен быть метод update())
  });
}
});

// === Карточка (единый вид с catalog.js) ===
function createFeaturedCard(rose, rank) {
  const card = document.createElement('div');
  card.className = 'card';
  card.dataset.id = rose.id;

  const isFav = typeof isInFavorites === 'function' && isInFavorites(rose.id);
  const { avg: ratingNum, count: reviewsCount } = getMerged(rose);
  const category = rose.categoryLabel || rose.category || 'Сорт';
  const imageSrc = getImageSrc(rose);
  const medal = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : '';

  card.innerHTML = `
    <a href="rose.html?id=${rose.id}" class="card__link">
      <div class="card__image-wrap">
        <img src="${imageSrc}" alt="${rose.name || 'Роза'}"
             class="card__image" loading="lazy"
             onerror="this.style.display='none'">
        ${ratingNum > 0 ? `
          <span class="card__badge" data-rating="${ratingNum}">
            <span class="card__badge-star" aria-hidden="true">★</span>
            <span class="card__badge-value">0.0</span>
          </span>
        ` : ''}
      </div>
      <div class="card__body">
        <span class="card__category">${category}</span>
        <h3 class="card__title">
          ${medal ? `<span class="card__medal">${medal}</span> ` : ''}${rose.name || 'Без названия'}
        </h3>
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
  `;

  // --- Анимация: цифра счётчиком, звёзды — заливкой ---
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

  // --- Избранное ---
  const favBtn = card.querySelector('.card__fav-btn');
  favBtn.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    const id = favBtn.dataset.id;
    if (typeof toggleFavorite === 'function') {
      toggleFavorite(id, favBtn);
      const nowFav = typeof isInFavorites === 'function' && isInFavorites(id);
      favBtn.textContent = nowFav ? '❤️ В избранное' : '♡ В избранное';
      favBtn.classList.toggle('active', nowFav);
    }
  });

  return card;
}

// Плавный счётчик
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
