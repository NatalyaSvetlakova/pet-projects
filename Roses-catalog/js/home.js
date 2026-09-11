/* =========================================================
   home.js — логика главной страницы
   Использует API из favorites.js: isInFavorites / toggleFavorite
   ========================================================= */

// === Средний рейтинг (как в catalog.js) ===
function getRatingValue(rose) {
  if (rose.rating !== undefined && rose.rating !== null) {
    return parseFloat(rose.rating);
  }
  if (rose.reviews && rose.reviews.length > 0) {
    const sum = rose.reviews.reduce((acc, curr) => acc + (curr.score || 0), 0);
    return (sum / rose.reviews.length).toFixed(1);
  }
  return 0;
}

// === Корректный путь к картинке ===
function getImageSrc(rose) {
  if (Array.isArray(rose.images) && rose.images.length > 0) {
    const fileName = rose.images[0];
    if (!fileName) return '';
    return fileName.includes('/') ? fileName : `img/${fileName}`;
  }
  return '';
}

document.addEventListener('DOMContentLoaded', () => {
  if (typeof roses === 'undefined' || !Array.isArray(roses)) {
    console.error('❌ home.js: массив roses не найден. Подключён ли data.js?');
    return;
  }

  // --- Слайдер ---
  const sliderData = roses
    .slice()
    .sort((a, b) => getRatingValue(b) - getRatingValue(a))
    .slice(0, 50)
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
    .sort((a, b) => getRatingValue(b) - getRatingValue(a))
    .slice(0, 4);

  featured.forEach(rose => {
    featuredContainer.appendChild(createFeaturedCard(rose));
  });
});

// === Карточка (единый вид с catalog.js) ===
function createFeaturedCard(rose) {
  const card = document.createElement('div');
  card.className = 'card';
  card.dataset.id = rose.id;

  // ✅ API из favorites.js
  const isFav = typeof isInFavorites === 'function' && isInFavorites(rose.id);

  const ratingNum    = getRatingValue(rose);
  const ratingText   = ratingNum > 0 ? `${ratingNum} ★` : '—';
  const reviewsCount = rose.reviews ? rose.reviews.length : 0;
  const category     = rose.categoryLabel || rose.category || 'Сорт';
  const imageSrc     = getImageSrc(rose);

  card.innerHTML = `
    <a href="rose.html?id=${rose.id}" class="card__link">
      <div class="card__image-wrap">
        <img src="${imageSrc}" alt="${rose.name || 'Роза'}"
             class="card__image" loading="lazy"
             onerror="this.style.display='none'">
        <span class="card__badge">${ratingText}</span>
      </div>
      <div class="card__body">
        <span class="card__category">${category}</span>
        <h3 class="card__title">${rose.name || 'Без названия'}</h3>
        ${rose.latinName ? `<p class="card__latin">${rose.latinName}</p>` : ''}
        <p class="card__desc">${rose.color || 'Красивый сорт розы'}</p>
        <div class="card__footer">
          <div class="stars-wrapper">
            <span class="stars-visual" style="--rating: ${ratingNum}"></span>
            ${reviewsCount > 0 ? `<span class="rating-count">(${reviewsCount})</span>` : ''}
          </div>
          <button class="card__fav-btn ${isFav ? 'active' : ''}" data-id="${rose.id}">
            ${isFav ? '❤️' : '♡'} В избранное
          </button>
        </div>
      </div>
    </a>
  `;

  const favBtn = card.querySelector('.card__fav-btn');
  favBtn.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (typeof toggleFavorite === 'function') {
      toggleFavorite(favBtn.dataset.id, favBtn);  // ✅ API из favorites.js
    }
  });

  return card;
}