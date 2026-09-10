/**
 * RoseSlider — универсальный, красивый, современный слайдер
 * Поддерживает: вертикальные фото 3/4, автопрокрутку, свайп, клавиатуру
 */
class RoseSlider {   // Объявление ES6-класса RoseSlider — основной сущности слайдера.
  constructor(options) {    // Конструктор, принимающий объект настроек options (контейнер, слайды, тайминги и т.д.).
    // === ПРОВЕРКА КОНТЕЙНЕРА ===
    this.container = document.querySelector(options.container);   // Находит DOM-элемент по селектору из options.container и сохраняет ссылку в this.container.
    if (!this.container) {      // Если элемент не найден — переходим к обработке ошибки.
      console.warn(`❌ RoseSlider: контейнер "${options.container}" не найден`);  //Выводит предупреждение в консоль с указанием проблемного селектора.
      return;     // Прекращает работу конструктора — без контейнера слайдер построить нельзя.
    }

    // === НАСТРОЙКИ ===
    this.slides = options.slides || [];    // Массив слайдов; если не передан — пустой массив (защита от undefined). 
    this.autoplay = options.autoplay !== false;    // Автопрокрутка включена по умолчанию; отключается только явной передачей false.
    this.interval = options.interval || 5000;    // Интервал автопрокрутки в миллисекундах; по умолчанию 5 секунд.
    this.showDots = options.showDots !== false;    //  Показ точек-индикаторов; по умолчанию включён. 
    this.showArrows = options.showArrows !== false;    // Показ стрелок навигации; по умолчанию включён.
    this.keyboard = options.keyboard !== false;    // Управление с клавиатуры; включено по умолчанию.
    this.pauseOnHover = options.pauseOnHover !== false;    // Пауза автопрокрутки при наведении курсора; включена по умолчанию.
    this.loop = options.loop !== false;   // Зацикливание слайдов (после последнего — снова первый); включено по умолчанию.

    // === СОСТОЯНИЕ ===
    this.currentIndex = 0;    // Индекс текущего активного слайда (стартует с нуля).
    this.timerId = null;    // Идентификатор setInterval для автопрокрутки (пока отсутствует).
    this.isPaused = false;    // Флаг паузы автопрокрутки (например, при наведении).
    this.isDragging = false;    // Флаг активного свайпа (используется в touch-событиях).
    this.startX = 0;    // Начальная координата X касания при свайпе.
    this.currentX = 0;    // Текущая координата X касания при свайпе.

    // === ПРОВЕРКА: ЕСТЬ ЛИ СЛАЙДЫ ===
    if (this.slides.length === 0) {    // Если слайдов нет — показываем заглушку.
      // Вставляет в контейнер HTML-заглушку с розой и текстом «Нет изображений».
      this.container.innerHTML = `    
        <div style="display:flex;align-items:center;justify-content:center;height:100%;background:#f5f0eb;color:#999;font-family:Georgia,serif;">
          <p style="text-align:center;">🌹<br>Нет изображений</p>
        </div>
      `;
      return;    // Прекращает дальнейшую инициализацию — нечего рендерить.
    }    // Конец проверки слайдов.

    this.init();    // Запускает основной метод инициализации слайдера.
  }

  // === ИНИЦИАЛИЗАЦИЯ ===
  init() {     // Метод построения DOM-структуры слайдера.
    this.container.className = "rose-slider";    // Присваивает контейнеру базовый CSS-класс для стилизации.
    this.container.innerHTML = "";    // Очищает контейнер от предыдущего содержимого.

    // Трек
    this.track = document.createElement("div");    // Создаёт div, внутри которого будут лежать слайды.
    this.track.className = "rose-slider__track";    // Назначает CSS-класс треку (для flex/transform-анимации).

    // Генерация слайдов
    this.slides.forEach((slide, index) => {    // Начало цикла генерации слайдов. Перебирает массив слайдов; slide — данные, index — порядковый номер.
      const slideEl = document.createElement("div");    // Создаёт DOM-элемент слайда.
      slideEl.className = "rose-slider__slide";    // Назначает класс слайду.
      slideEl.setAttribute("role", "group");    // ARIA-роль для группы (доступность).
      slideEl.setAttribute("aria-label", `Слайд ${index + 1} из ${this.slides.length}`);    // Подпись для скринридеров — какой это слайд по счёту.

      // === ФОТО ===
      if (slide.image) {    // Если у слайда указано изображение...
        slideEl.style.backgroundImage = `url("${slide.image}")`;     // ...ставит его как фоновое изображение.
        slideEl.style.backgroundSize = "cover";    // Масштабирует фон так, чтобы он полностью покрывал слайд.
        slideEl.style.backgroundPosition = "center";    // Центрирует фоновое изображение.
        slideEl.style.backgroundRepeat = "no-repeat";    // Запрещает повторение фонового изображения.
      } else {     // Если изображения нет — заглушка.
        slideEl.style.background = "#f5f0eb";    // Нейтральный бежевый фон вместо картинки.
        // Вставляет по центру слайда крупную иконку розы как плейсхолдер.
        slideEl.innerHTML = `
          <div style="display:flex;align-items:center;justify-content:center;height:100%;color:#ccc;font-size:3rem;">
            🌹
          </div>      
          `;
      }    // Конец условия с изображением.

  

      // === ОВЕРЛЕЙ (только если есть текст) ===
      if (slide.title || slide.subtitle) {    // Оверлей создаётся только если есть заголовок или подзаголовок.
        const overlay = document.createElement("div");    // Создаёт контейнер для текста поверх изображения.
        overlay.className = "rose-slider__overlay";    // Назначает класс оверлею.

        if (slide.title) {    // Если есть заголовок — создаём его.
          const title = document.createElement("h2");    // Создаёт элемент <h2>.
          title.className = "rose-slider__title";    // Назначает класс заголовку.
          title.textContent = slide.title;    // Записывает текст заголовка.
          overlay.appendChild(title);    // Добавляет заголовок в оверлей.
        }
      
        if (slide.link) {    // 
          const link = document.createElement("a");
          link.className = "rose-slider__link";
          link.href = slide.link;
          link.textContent = "Подробнее →";
          overlay.appendChild(link);
        }

        slideEl.appendChild(overlay);
      }

      this.track.appendChild(slideEl);
    });

    this.container.appendChild(this.track);

    // === ЭЛЕМЕНТЫ УПРАВЛЕНИЯ ===
    if (this.showArrows && this.slides.length > 1) {
      this.createArrows();
    }

    if (this.showDots && this.slides.length > 1) {
      this.createDots();
    }

    // === СОБЫТИЯ ===
    this.bindEvents();

    // === АВТОПРОКРУТКА ===
    if (this.autoplay && this.slides.length > 1) {
      this.startAutoplay();
    }

    // === ПЕРВЫЙ СЛАЙД ===
    this.goTo(0);
  }

  // === СТРЕЛКИ ===
  createArrows() {
    const prevBtn = document.createElement("button");
    prevBtn.className = "rose-slider__arrow rose-slider__arrow--prev";
    prevBtn.setAttribute("aria-label", "Предыдущий слайд");
    prevBtn.innerHTML = "❮";
    prevBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      this.prev();
    });

    const nextBtn = document.createElement("button");
    nextBtn.className = "rose-slider__arrow rose-slider__arrow--next";
    nextBtn.setAttribute("aria-label", "Следующий слайд");
    nextBtn.innerHTML = "❯";
    nextBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      this.next();
    });

    this.container.appendChild(prevBtn);
    this.container.appendChild(nextBtn);
  }

  // === ТОЧКИ ===
  createDots() {
    this.dotsContainer = document.createElement("div");
    this.dotsContainer.className = "rose-slider__dots";

    this.slides.forEach((_, index) => {
      const dot = document.createElement("button");
      dot.className = "rose-slider__dot";
      dot.setAttribute("aria-label", `Перейти к слайду ${index + 1}`);
      dot.addEventListener("click", () => this.goTo(index));
      this.dotsContainer.appendChild(dot);
    });

    this.container.appendChild(this.dotsContainer);
    this.updateDots();
  }

  // === СОБЫТИЯ ===
  bindEvents() {
    // Пауза при наведении
    if (this.pauseOnHover && this.slides.length > 1) {
      this.container.addEventListener("mouseenter", () => {
        this.isPaused = true;
      });
      this.container.addEventListener("mouseleave", () => {
        this.isPaused = false;
      });
    }

    // Клавиатура
    if (this.keyboard && this.slides.length > 1) {
      this.container.setAttribute("tabindex", "0");
      this.container.addEventListener("keydown", (e) => {
        if (e.key === "ArrowLeft") {
          e.preventDefault();
          this.prev();
        }
        if (e.key === "ArrowRight") {
          e.preventDefault();
          this.next();
        }
      });
    }

    // Свайп для мобильных
    if (this.slides.length > 1) {
      this.container.addEventListener("touchstart", (e) => {
        this.isDragging = true;
        this.startX = e.touches[0].clientX;
      }, { passive: true });

      this.container.addEventListener("touchmove", (e) => {
        if (!this.isDragging) return;
        this.currentX = e.touches[0].clientX;
      }, { passive: true });

      this.container.addEventListener("touchend", () => {
        if (!this.isDragging) return;
        this.isDragging = false;
        const diff = this.startX - this.currentX;
        if (Math.abs(diff) > 50) {
          if (diff > 0) {
            this.next();
          } else {
            this.prev();
          }
        }
      }, { passive: true });
    }
  }

  // === НАВИГАЦИЯ ===
  goTo(index) {
    if (this.slides.length === 0) return;
    
    // Зацикливание
    if (this.loop) {
      if (index < 0) index = this.slides.length - 1;
      if (index >= this.slides.length) index = 0;
    } else {
      index = Math.max(0, Math.min(index, this.slides.length - 1));
    }

    this.currentIndex = index;
    this.track.style.transform = `translateX(-${index * 100}%)`;
    this.updateDots();
  }

  next() {
    if (this.slides.length <= 1) return;
    this.goTo(this.currentIndex + 1);
  }

  prev() {
    if (this.slides.length <= 1) return;
    this.goTo(this.currentIndex - 1);
  }

  // === ОБНОВЛЕНИЕ ТОЧЕК ===
  updateDots() {
    if (!this.dotsContainer) return;
    const dots = this.dotsContainer.querySelectorAll(".rose-slider__dot");
    dots.forEach((dot, index) => {
      dot.classList.toggle("rose-slider__dot--active", index === this.currentIndex);
    });
  }

  // === АВТОПРОКРУТКА ===
  startAutoplay() {
    if (this.slides.length <= 1) return;
    this.stopAutoplay();
    this.timerId = setInterval(() => {
      if (!this.isPaused) {
        this.next();
      }
    }, this.interval);
  }

  stopAutoplay() {
    if (this.timerId) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
  }

  // === ПУБЛИЧНЫЙ API ===
  updateSlides(newSlides) {
    this.slides = newSlides || [];
    this.currentIndex = 0;
    this.stopAutoplay();
    this.init();
  }

  destroy() {
    this.stopAutoplay();
    this.container.innerHTML = "";
    this.container.className = "";
  }
}

// Экспорт
if (typeof module !== "undefined" && module.exports) {
  module.exports = RoseSlider;
}