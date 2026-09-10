// home.js — логика главной страницы
// Инициализирует слайдер и отрисовывает карточки популярных сортов

document.addEventListener('DOMContentLoaded', () => {

  // --- Слайдер: топ-4 сорта по рейтингу ---
  const sliderData = roses
    .slice()
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 50)
    .map(rose => ({
      image: rose.images[0],
      title: rose.name,
      subtitle: rose.categoryLabel + ' • ' + rose.color,
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

  // --- Карточки: топ-4 сорта по рейтингу ---
  const featuredContainer = document.getElementById('featuredCards');
  if (!featuredContainer) return;

  const featured = roses
    .slice()
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 4);

  featured.forEach(rose => {
    featuredContainer.appendChild(createFeaturedCard(rose));
  });
});

// --- Создание карточки для главной ---
// Отдельная функция, чтобы не зависеть от catalog.js

function createFeaturedCard(rose) {
  const card = document.createElement('a');
  card.href = 'rose.html?id=' + rose.id;
  card.className = 'card';

  const isFav = typeof isInFavorites === 'function' && isInFavorites(rose.id);

  card.innerHTML = `
    <img class="card__image" src="${rose.images[0] || ''}" alt="${rose.name || 'Роза'}" loading="lazy">
    <div class="card__body">
      <span class="card__category">${rose.categoryLabel || ''}</span>
      <h3 class="card__title">${rose.name || 'Без названия'}</h3>
      <p class="card__desc">${rose.description || rose.color || ''}</p>
      <div class="card__footer">
        <span class="card__rating">★ ${rose.rating || '—'}</span>
        <button class="card__fav-btn ${isFav ? 'active' : ''}" data-id="${rose.id}">
          ${isFav ? '♥ В избранном' : '♡ В избранное'}
        </button>
      </div>
    </div>
  `;

  const favBtn = card.querySelector('.card__fav-btn');
  favBtn.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (typeof toggleFavorite === 'function') {
      toggleFavorite(rose.id, favBtn);
    }
  });

  return card;
}