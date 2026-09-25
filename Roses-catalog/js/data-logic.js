// ============================================
// СИСТЕМА ИЗБРАННОГО (localStorage)
// ============================================

// const favorites = {
//   get: function() {
//     try {
//       const data = localStorage.getItem('roseFavorites');
//       return data ? JSON.parse(data) : [];
//     } catch {
//       return [];
//     }
//   },

//   set: function(list) {
//     localStorage.setItem('roseFavorites', JSON.stringify(list));
//   },

//   add: function(id) {
//     const list = this.get();
//     if (!list.includes(id)) {
//       list.push(id);
//       this.set(list);
//     }
//   },

//   remove: function(id) {
//     const list = this.get();
//     const index = list.indexOf(id);
//     if (index !== -1) {
//       list.splice(index, 1);
//       this.set(list);
//     }
//   },

//   isFavorite: function(id) {
//     return this.get().includes(id);
//   },

//   toggle: function(id) {
//     if (this.isFavorite(id)) {
//       this.remove(id);
//       return false;
//     } else {
//       this.add(id);
//       return true;
//     }
//   },

//   getAll: function() {
//     const favIds = this.get();
//     return roses.filter(rose => favIds.includes(rose.id));
//   },

//   count: function() {
//     return this.get().length;
//   }
// };

// ============================================
// ПОМОЩНИКИ ДЛЯ РЕНДЕРИНГА
// ============================================

// function renderCard(rose) {
//   const isFav = favorites.isFavorite(rose.id);
  
//   return `
//     <a class="card" href="rose.html?id=${rose.id}" data-id="${rose.id}">     
//       <div class="card__image-wrap">
//         <img src="${rose.images[0] || ''}" alt="${rose.name}" class="card__image" loading="lazy">
//         <span class="card__badge">★ ${rose.rating}</span>
//       </div>
//       <div class="card__body">
//         <h3 class="card__title">${rose.name}</h3>
//         <p class="card__desc">${rose.description || rose.color}</p>
//         <div class="card__footer">
//           <span class="card__rating">★ ${rose.rating}</span>
//           <button class="card__fav-btn ${isFav ? 'active' : ''}" data-id="${rose.id}">
//             ${isFav ? '❤️' : '♡'} В избранное
//           </button>
//         </div>
//       </div>    
//     </a>
//   `;
// }
// 
// function renderCards(containerId, rosesList) {
//   const container = document.getElementById(containerId);
//   if (!container) return;
  
//   if (!rosesList || rosesList.length === 0) {
//     container.innerHTML = `
//       <div style="text-align:center;padding:60px 20px;color:#999;grid-column:1/-1;">
//         <p style="font-size:2rem;">🌹</p>
//         <p style="font-family:Georgia,serif;font-size:1.2rem;">Нет сортов для отображения</p>
//       </div>
//     `;
//     return;
//   }
  
//   container.innerHTML = rosesList.map(rose => renderCard(rose)).join('');
  
//   // Вешаем обработчики на кнопки "В избранное"
//   container.querySelectorAll('.card__fav-btn').forEach(btn => {
//     btn.addEventListener('click', function(e) {
//       e.stopPropagation();
//       const id = parseInt(this.dataset.id);
//       const isNowFavorite = favorites.toggle(id);
//       this.textContent = isNowFavorite ? '❤️ В избранное' : '♡ В избранное';
//       this.classList.toggle('active', isNowFavorite);
      
//       // Обновляем счетчик избранного, если он есть
//       const countEl = document.getElementById('favCount');
//       if (countEl) {
//         countEl.textContent = favorites.count() + ' сортов';
//       }
//     });
//   });
// }

// ============================================
// ЗАГРУЗКА ПРИ ЗАПУСКЕ
// ============================================

// console.log('❤️ В избранном:', favorites.count(), 'сортов');

// ============================================
// ЕДИНЫЙ РЕЙТИНГ: отзывы из data.js + отзывы пользователя
// API: RoseRatings.getMergedRating(roseId) → { avg, count }
//      RoseRatings.getUserReviews(roseId)  → Array
//      RoseRatings.addUserReview(roseId, review)
// ============================================
(function () {
  const USER_KEY = 'roses-user-reviews'; // { roseId: [ {rating, text, author, date}, … ] }

  function readAll() {
    try {
      const raw = localStorage.getItem(USER_KEY);
      const obj = raw ? JSON.parse(raw) : {};
      return (obj && typeof obj === 'object') ? obj : {};
    } catch (e) {
      console.warn('RoseRatings: повреждённые данные, сброс.');
      localStorage.removeItem(USER_KEY);
      return {};
    }
  }
  function writeAll(obj) {
    localStorage.setItem(USER_KEY, JSON.stringify(obj));
  }

  // База — отзывы из data.js (rose.reviews[].score)
  function getBaseStats(roseId) {
    if (typeof roses === 'undefined' || !Array.isArray(roses)) return { sum: 0, count: 0 };
    const rose = roses.find(r => r.id === roseId);
    if (!rose) return { sum: 0, count: 0 };
    const arr = Array.isArray(rose.reviews) ? rose.reviews : [];
    let sum = 0, count = 0;
    arr.forEach(r => {
      const s = Number(r.score != null ? r.score : r.rating);
      if (s >= 1 && s <= 5) { sum += s; count++; }
    });
    return { sum, count };
  }

  function getUserReviews(roseId) {
    const all = readAll();
    return Array.isArray(all[roseId]) ? all[roseId] : [];
  }

  function addUserReview(roseId, review) {
    const all = readAll();
    if (!Array.isArray(all[roseId])) all[roseId] = [];
    all[roseId].unshift({
      rating: Math.max(1, Math.min(5, Number(review.rating) || 5)),
      text: String(review.text || '').trim(),
      author: String(review.author || 'Гость').trim(),
      date: review.date || new Date().toLocaleDateString('ru-RU', {
        day: 'numeric', month: 'long', year: 'numeric'
      })
    });
    writeAll(all);
  }

  function getMergedRating(roseId) {
    const base = getBaseStats(roseId);
    const user = getUserReviews(roseId);
    const userSum = user.reduce((s, r) => s + (Number(r.rating) || 0), 0);
    const count = base.count + user.length;
    const avg = count ? (base.sum + userSum) / count : 0;
    return { avg: Math.round(avg * 10) / 10, count };
  }

  window.RoseRatings = { getMergedRating, getUserReviews, addUserReview };
})();
