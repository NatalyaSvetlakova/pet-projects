/* ============================================================
   УНИВЕРСАЛЬНАЯ КНОПКА «НАВЕРХ» ДЛЯ ВСЕХ СТРАНИЦ
   Автоматически создаёт кнопку, вешает скролл и клик.
   ============================================================ */
(function () {
  'use strict';

  // Не создаём кнопку дважды, если скрипт случайно подключён два раза
  if (document.getElementById('scrollTopBtn')) return;

  // --- 1. Создаём кнопку и вставляем в body ---
  const btn = document.createElement('button');
  btn.id = 'scrollTopBtn';
  btn.className = 'scroll-top';
  btn.setAttribute('aria-label', 'Наверх');
  btn.setAttribute('hidden', '');
  btn.innerHTML = `
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
         stroke="currentColor" stroke-width="2.5"
         stroke-linecap="round" stroke-linejoin="round">
      <path d="M12 19V5M5 12l7-7 7 7"/>
    </svg>`;
  document.body.appendChild(btn);

  // --- 2. Логика появления при прокрутке ---
  const SHOW_AFTER = 400; // px — после какой прокрутки показывать

  function onScroll() {
    if (window.scrollY > SHOW_AFTER) {
      btn.classList.add('is-visible');
      btn.removeAttribute('hidden');
    } else {
      btn.classList.remove('is-visible');
      // Прячем через 300 мс — чтобы анимация скрытия успела проиграть
      setTimeout(() => {
        if (!btn.classList.contains('is-visible')) {
          btn.setAttribute('hidden', '');
        }
      }, 300);
    }
  }

  // rAF-троттлинг: не дёргаем DOM на каждый пиксель скролла
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        onScroll();
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });

  // --- 3. Плавный скролл наверх ---
  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // Первичная проверка (если страница открыта уже проскролленной)
  onScroll();
})();