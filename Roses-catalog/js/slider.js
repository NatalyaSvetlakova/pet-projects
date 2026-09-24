/**
 * RoseSlider — универсальный, красивый, современный слайдер
 * Поддерживает: вертикальные фото 3/4, автопрокрутку, свайп, клавиатуру
 * Бесшовное зацикливание через клонирование крайних слайдов.
 */
class RoseSlider {                                                              // Объявление ES6-класса RoseSlider — основной сущности слайдера.
  constructor(options) {                                                        // Конструктор, принимающий объект настроек options (контейнер, слайды, тайминги и т.д.).
    // === ПРОВЕРКА КОНТЕЙНЕРА ===
    this.container = document.querySelector(options.container);                 // Находит DOM-элемент по селектору из options.container и сохраняет ссылку в this.container.
    if (!this.container) {                                                      // Если элемент не найден — переходим к обработке ошибки.
      console.warn(`❌ RoseSlider: контейнер "${options.container}" не найден`); // Выводит предупреждение в консоль с указанием проблемного селектора.
      return;                                                                   // Прекращает работу конструктора — без контейнера слайдер построить нельзя.
    }

    // === НАСТРОЙКИ ===
    this.slides = options.slides || [];                                         // Массив слайдов; если не передан — пустой массив (защита от undefined).
    this.autoplay = options.autoplay !== false;                                 // Автопрокрутка включена по умолчанию; отключается только явной передачей false.
    this.interval = options.interval || 5000;                                   // Интервал автопрокрутки в миллисекундах; по умолчанию 5 секунд.
    this.showDots = options.showDots !== false;                                 // Показ точек-индикаторов; по умолчанию включён.
    this.showArrows = options.showArrows !== false;                             // Показ стрелок навигации; по умолчанию включён.
    this.keyboard = options.keyboard !== false;                                 // Управление с клавиатуры; включено по умолчанию.
    this.pauseOnHover = options.pauseOnHover !== false;                         // Пауза автопрокрутки при наведении курсора; включена по умолчанию.
    this.loop = options.loop !== false;                                         // Зацикливание слайдов (после последнего — снова первый); включено по умолчанию.

    // === СОСТОЯНИЕ ===
    this.currentIndex = 0;                                                      // Индекс текущего активного слайда (стартует с нуля).
    this.timerId = null;                                                        // Идентификатор setInterval для автопрокрутки (пока отсутствует).
    this.isPaused = false;                                                      // Флаг паузы автопрокрутки (например, при наведении).
    this.isDragging = false;                                                    // Флаг активного свайпа (используется в touch-событиях).
    this.startX = 0;                                                            // Начальная координата X касания при свайпе.
    this.currentX = 0;                                                          // Текущая координата X касания при свайпе.
    this.isAnimating = false;                                                   // Флаг активной анимации — защищает от наложения переходов и «дребезга».

    // === ПРОВЕРКА: ЕСТЬ ЛИ СЛАЙДЫ ===
    if (this.slides.length === 0) {                                             // Если слайдов нет — показываем заглушку. Вставляет в контейнер HTML-заглушку с розой и текстом «Нет изображений».
      this.container.innerHTML = `                                              
        <div style="display:flex;align-items:center;justify-content:center;height:100%;background:#f5f0eb;color:#999;font-family:Georgia,serif;">
          <p style="text-align:center;">🌹<br>Нет изображений</p>
        </div>
      `;
      return;                                                                   // Прекращает дальнейшую инициализацию — нечего рендерить.
    }

    this.init();                                                                // Запускает основной метод инициализации слайдера.
  }

  // === ИНИЦИАЛИЗАЦИЯ ===
  init() {                                                                      // Метод построения DOM-структуры слайдера.
    this.container.className = "rose-slider";                                   // Присваивает контейнеру базовый CSS-класс для стилизации.
    this.container.innerHTML = "";                                              // Очищает контейнер от предыдущего содержимого.

    // Трек
    this.track = document.createElement("div");                                 // Создаёт div, внутри которого будут лежать слайды.
    this.track.className = "rose-slider__track";                                // Назначает CSS-класс треку (для flex/transform-анимации).

    // Генерация слайдов
    this.slides.forEach((slide, index) => {                                     // Перебирает массив слайдов; slide — данные, index — порядковый номер.
      const slideEl = document.createElement("div");                            // Создаёт DOM-элемент слайда.
      slideEl.className = "rose-slider__slide";                                 // Назначает класс слайду.
      slideEl.setAttribute("role", "group");                                    // ARIA-роль для группы (доступность).
      slideEl.setAttribute("aria-label", `Слайд ${index + 1} из ${this.slides.length}`); // Подпись для скринридеров — какой это слайд по счёту.

      // === ФОТО ===
      if (slide.image) {                                                        // Если у слайда указано изображение...
        slideEl.style.backgroundImage = `url("${slide.image}")`;                // ...ставит его как фоновое изображение.
        slideEl.style.backgroundSize = "cover";                                 // Масштабирует фон так, чтобы он полностью покрывал слайд.
        slideEl.style.backgroundPosition = "center";                            // Центрирует фоновое изображение.
        slideEl.style.backgroundRepeat = "no-repeat";                           // Запрещает повторение фонового изображения.
      } else {                                                                  // Если изображения нет — заглушка.
        slideEl.style.background = "#f5f0eb";                                   // Нейтральный бежевый фон вместо картинки.
        slideEl.innerHTML = `                                                   // Вставляет по центру слайда крупную иконку розы как плейсхолдер.
          <div style="display:flex;align-items:center;justify-content:center;height:100%;color:#ccc;font-size:3rem;">
            🌹
          </div>
        `;
      }

      // === ОВЕРЛЕЙ (только если есть текст) ===
      if (slide.title || slide.subtitle) {                                      // Оверлей создаётся только если есть заголовок или подзаголовок.
        const overlay = document.createElement("div");                          // Создаёт контейнер для текста поверх изображения.
        overlay.className = "rose-slider__overlay";                             // Назначает класс оверлею.

        if (slide.title) {                                                      // Если есть заголовок — создаём его.
          const title = document.createElement("h2");                           // Создаёт элемент <h2>.
          title.className = "rose-slider__title";                               // Назначает класс заголовку.
          title.textContent = slide.title;                                      // Записывает текст заголовка.
          overlay.appendChild(title);                                           // Добавляет заголовок в оверлей.
        }

        if (slide.link) {                                                       // Если у слайда задана ссылка — создаём кнопку-ссылку.
          const link = document.createElement("a");                             // Создаёт элемент <a>.
          link.className = "rose-slider__link";                                 // Назначает класс ссылке.
          link.href = slide.link;                                               // Устанавливает URL из данных слайда.
          link.textContent = "Подробнее →";                                     // Текст ссылки по умолчанию.
          overlay.appendChild(link);                                            // Добавляет ссылку в оверлей.
        }

        slideEl.appendChild(overlay);                                           // Добавляет готовый оверлей внутрь слайда.
      }

      this.track.appendChild(slideEl);                                          // Добавляет слайд в трек.
    });

    // === КЛОНЫ ДЛЯ БЕСШОВНОГО ЗАЦИКЛИВАНИЯ ===
    if (this.loop && this.slides.length > 1) {                                  // Клоны нужны только при зацикливании и наличии >1 слайда.
      const lastClone = this.track.lastElementChild.cloneNode(true);           // Копируем последний слайд.
      lastClone.classList.add("rose-slider__slide--clone");                     // Помечаем клон отдельным классом (для CSS/отладки).
      lastClone.setAttribute("aria-hidden", "true");                            // Клон скрыт от скринридеров — это дубликат.
      this.track.insertBefore(lastClone, this.track.firstElementChild);         // Ставим клон последнего в самое начало трека.

      const firstClone = this.track.children[1].cloneNode(true);                // Копируем первый реальный слайд (он теперь на позиции [1], т.к. [0] — lastClone).
      firstClone.classList.add("rose-slider__slide--clone");                    // Помечаем клон отдельным классом.
      firstClone.setAttribute("aria-hidden", "true");                           // Клон скрыт от скринридеров.
      this.track.appendChild(firstClone);                                       // Ставим клон первого в самый конец трека.
    }

    this.container.appendChild(this.track);                                     // Вставляет трек в контейнер.

    // === ЭЛЕМЕНТЫ УПРАВЛЕНИЯ ===
    if (this.showArrows && this.slides.length > 1) {                            // Стрелки создаются, только если включены и слайдов больше одного.
      this.createArrows();                                                      // Вызывает метод создания стрелок.
    }

    if (this.showDots && this.slides.length > 1) {                              // Точки создаются, только если включены и слайдов больше одного.
      this.createDots();                                                        // Вызывает метод создания точек.
    }

    // === СОБЫТИЯ ===
    this.bindEvents();                                                          // Вызывает метод навешивания событий.

    // === АВТОПРОКРУТКА ===
    if (this.autoplay && this.slides.length > 1) {                              // Автопрокрутка включается только если разрешена и слайдов больше одного.
      this.startAutoplay();                                                     // Запускает автопрокрутку.
    }

    // === ПЕРВЫЙ СЛАЙД ===
    const startIndex = (this.loop && this.slides.length > 1) ? 1 : 0;           // С клонами реальный первый слайд — под индексом 1, без клонов — под 0.
    this.goTo(startIndex, true);                                                // Устанавливает стартовый слайд мгновенно, без анимации.
  }

  // === СТРЕЛКИ ===
  createArrows() {                                                              // Создаёт кнопки «назад» и «вперёд».
    const prevBtn = document.createElement("button");                           // Создаёт кнопку «предыдущий слайд».
    prevBtn.className = "rose-slider__arrow rose-slider__arrow--prev";          // Назначает базовый и модифицирующий классы.
    prevBtn.setAttribute("aria-label", "Предыдущий слайд");                     // ARIA-подпись для доступности.
    prevBtn.innerHTML = "❮";                                                    // Символ стрелки влево внутри кнопки.
    prevBtn.addEventListener("click", (e) => {                                  // Обработчик клика по кнопке «назад».
      e.stopPropagation();                                                      // Останавливает всплытие события (чтобы клик не улетел в контейнер).
      this.prev();                                                              // Переход к предыдущему слайду.
    });

    const nextBtn = document.createElement("button");                           // Создаёт кнопку «следующий слайд».
    nextBtn.className = "rose-slider__arrow rose-slider__arrow--next";          // Назначает классы кнопке «вперёд».
    nextBtn.setAttribute("aria-label", "Следующий слайд");                      // ARIA-подпись для доступности.
    nextBtn.innerHTML = "❯";                                                    // Символ стрелки вправо.
    nextBtn.addEventListener("click", (e) => {                                  // Обработчик клика по кнопке «вперёд».
      e.stopPropagation();                                                      // Останавливает всплытие события.
      this.next();                                                              // Переход к следующему слайду.
    });

    this.container.appendChild(prevBtn);                                        // Добавляет кнопку «назад» в контейнер.
    this.container.appendChild(nextBtn);                                        // Добавляет кнопку «вперёд» в контейнер.
  }

  // === ТОЧКИ ===
  createDots() {                                                                // Создаёт контейнер с точками-индикаторами.
    this.dotsContainer = document.createElement("div");                         // Создаёт div для точек и сохраняет ссылку в поле класса.
    this.dotsContainer.className = "rose-slider__dots";                         // Назначает класс контейнеру точек.

    this.slides.forEach((_, index) => {                                         // Перебирает слайды; сам слайд не нужен — только индекс.
      const dot = document.createElement("button");                             // Создаёт точку как кнопку (для доступности).
      dot.className = "rose-slider__dot";                                       // Назначает класс точке.
      dot.setAttribute("aria-label", `Перейти к слайду ${index + 1}`);          // ARIA-подпись для точки.
      dot.addEventListener("click", () => {                                     // Клик по точке переводит слайдер на соответствующий слайд.
        const target = (this.loop && this.slides.length > 1) ? index + 1 : index; // При клонах реальные слайды сдвинуты на +1 (из-за клона в начале).
        this.goTo(target);                                                      // Переход к выбранному слайду.
      });
      this.dotsContainer.appendChild(dot);                                      // Добавляет точку в контейнер точек.
    });

    this.container.appendChild(this.dotsContainer);                             // Вставляет контейнер точек в основной контейнер.
    this.updateDots();                                                          // Обновляет активную точку согласно текущему индексу.
  }

  // === СОБЫТИЯ ===
  bindEvents() {                                                                // Навешивает все обработчики (hover, клавиатура, свайп, transitionend).
    // Пауза при наведении
    if (this.pauseOnHover && this.slides.length > 1) {                          // Включается только если разрешено и слайдов больше одного.
      this.container.addEventListener("mouseenter", () => {                     // Обработчик входа курсора в область слайдера.
        this.isPaused = true;                                                   // Ставит флаг паузы.
      });
      this.container.addEventListener("mouseleave", () => {                     // Обработчик выхода курсора из области слайдера.
        this.isPaused = false;                                                  // Снимает флаг паузы.
      });
    }

    // Клавиатура
    if (this.keyboard && this.slides.length > 1) {                              // Включается, если разрешено и слайдов больше одного.
      this.container.setAttribute("tabindex", "0");                             // Делает контейнер фокусируемым (иначе клавиатура не сработает).
      this.container.addEventListener("keydown", (e) => {                       // Обработчик нажатия клавиш.
        if (e.key === "ArrowLeft") {                                            // Если нажата стрелка влево...
          e.preventDefault();                                                   // ...отменяем прокрутку страницы.
          this.prev();                                                          // Переход к предыдущему слайду.
        }
        if (e.key === "ArrowRight") {                                           // Если нажата стрелка вправо...
          e.preventDefault();                                                   // ...отменяем прокрутку страницы.
          this.next();                                                          // Переход к следующему слайду.
        }
      });
    }

    // Свайп для мобильных
    if (this.slides.length > 1) {                                               // Свайпы нужны только при нескольких слайдах.
      this.container.addEventListener("touchstart", (e) => {                    // Начало касания.
        this.isDragging = true;                                                 // Включает режим «перетаскивания».
        this.startX = e.touches[0].clientX;                                     // Запоминает начальную X-координату пальца.
      }, { passive: true });                                                    // passive: true — не блокирует прокрутку, повышает отзывчивость.

      this.container.addEventListener("touchmove", (e) => {                     // Обработчик движения пальца.
        if (!this.isDragging) return;                                           // Игнорирует движение, если свайп не начат.
        this.currentX = e.touches[0].clientX;                                   // Обновляет текущую X-координату.
      }, { passive: true });                                                    // Снова пассивный слушатель.

      this.container.addEventListener("touchend", () => {                       // Обработчик окончания касания.
        if (!this.isDragging) return;                                           // Игнорирует, если свайпа не было.
        this.isDragging = false;                                                // Завершает режим перетаскивания.
        const diff = this.startX - this.currentX;                               // Вычисляет смещение пальца по X.
        if (Math.abs(diff) > 50) {                                              // Свайп засчитывается только если смещение больше 50px.
          if (diff > 0) {                                                       // Если палец двигался влево (свайп влево)...
            this.next();                                                        // ...переходим к следующему слайду.
          } else {                                                              // Иначе (свайп вправо)...
            this.prev();                                                        // ...переходим к предыдущему слайду.
          }
        }
      }, { passive: true });                                                    // Пассивный слушатель для touchend.
    }

    // === БЕСШОВНОЕ ЗАЦИКЛИВАНИЕ: «телепорт» с клона на реальный слайд ===
    if (this.loop && this.slides.length > 1) {                                  // Слушатель transitionend нужен только при зацикливании.
      this.track.addEventListener("transitionend", () => {                      // Ловим момент окончания CSS-анимации сдвига трека.
        const total = this.slides.length;                                       // Количество реальных слайдов.
        this.isAnimating = false;                                               // Анимация завершена — снимаем флаг.

        if (this.currentIndex === total + 1) {                                  // Доехали до клона первого слайда (он в конце)...
          this.goTo(1, true);                                                   // ...мгновенно телепортируемся на реальный первый (индекс 1).
        } else if (this.currentIndex === 0) {                                   // Доехали до клона последнего слайда (он в начале)...
          this.goTo(total, true);                                               // ...мгновенно телепортируемся на реальный последний.
        }
      });
    }
  }

  // === НАВИГАЦИЯ ===
  goTo(index, instant = false) {                                                // Переход к слайду по индексу; instant=true — без анимации.
    if (this.slides.length === 0) return;                                       // Защита от вызова при отсутствии слайдов.

    const total = this.slides.length;                                           // Количество реальных слайдов.
    const hasClones = this.loop && total > 1;                                   // Работаем ли мы с клонами.

    // Границы с учётом клонов: [0 ... total+1]
    const maxIndex = hasClones ? total + 1 : total - 1;                         // Верхняя граница индекса (с клонами — total+1).
    index = Math.max(0, Math.min(index, maxIndex));                             // Ограничиваем индекс допустимым диапазоном.

    this.currentIndex = index;                                                  // Сохраняет текущий индекс.

    // Мгновенный переход без анимации — для «телепорта» с клона на реальный слайд
    if (instant) {                                                              // Если запрошен мгновенный переход...
      this.track.style.transition = "none";                                     // ...отключаем CSS-переход.
    }

    this.track.style.transform = `translateX(-${index * 100}%)`;                // Сдвигает трек на нужный слайд (по 100% на каждый).

    if (instant) {                                                              // Если был мгновенный переход...
      void this.track.offsetWidth;                                              // ...форсируем reflow, чтобы браузер применил transform.
      this.track.style.transition = "";                                         // ...возвращаем CSS-переход обратно.
    } else {                                                                    // Если переход анимированный...
      this.isAnimating = true;                                                  // ...поднимаем флаг анимации.
    }

    this.updateDots();                                                          // Обновляет подсветку активной точки.
  }

  next() {                                                                      // Переход к следующему слайду.
    if (this.slides.length <= 1) return;                                        // Нечего листать, если слайд один.
    if (this.isAnimating) return;                                               // Не запускаем новую анимацию, пока идёт текущая.
    this.goTo(this.currentIndex + 1);                                           // Переход на индекс +1 (с клонами уедет на клон первого, потом телепорт).
  }

  prev() {                                                                      // Переход к предыдущему слайду.
    if (this.slides.length <= 1) return;                                        // Нечего листать, если слайд один.
    if (this.isAnimating) return;                                               // Не запускаем новую анимацию, пока идёт текущая.
    this.goTo(this.currentIndex - 1);                                           // Переход на индекс −1 (с клонами уедет на клон последнего, потом телепорт).
  }

  // === ОБНОВЛЕНИЕ ТОЧЕК ===
  updateDots() {                                                                // Подсвечивает активную точку.
    if (!this.dotsContainer) return;                                            // Если точек нет — выходим.
    const total = this.slides.length;                                           // Количество реальных слайдов.
    const hasClones = this.loop && total > 1;                                   // Работаем ли мы с клонами.

    let realIndex = this.currentIndex;                                          // По умолчанию реальный индекс = текущему.
    if (hasClones) {                                                            // Если есть клоны — приводим индекс к «реальному».
      if (realIndex === 0) realIndex = total - 1;                               // Индекс 0 — это клон последнего слайда → реальный последний.
      else if (realIndex === total + 1) realIndex = 0;                          // Индекс total+1 — клон первого → реальный первый.
      else realIndex = realIndex - 1;                                           // Иначе просто сдвигаем на −1 (из-за клона в начале).
    }

    const dots = this.dotsContainer.querySelectorAll(".rose-slider__dot");      // Получает все точки.
    dots.forEach((dot, index) => {                                              // Перебирает точки с их индексами.
      dot.classList.toggle("rose-slider__dot--active", index === realIndex);    // Включает/выключает класс активной точки.
    });
  }

  // === АВТОПРОКРУТКА ===
  startAutoplay() {                                                             // Запускает автопрокрутку.
    if (this.slides.length <= 1) return;                                        // Нечего листать, если слайд один.
    this.stopAutoplay();                                                        // Сначала останавливает предыдущий таймер (защита от дублей).
    this.timerId = setInterval(() => {                                          // Заводит интервал.
      if (!this.isPaused && !this.isAnimating) {                                // Срабатывает только если нет паузы и не идёт анимация.
        this.next();                                                            // Переход к следующему слайду.
      }
    }, this.interval);                                                          // Интервал из настроек (по умолчанию 5000 мс).
  }

  stopAutoplay() {                                                              // Останавливает автопрокрутку.
    if (this.timerId) {                                                         // Только если таймер был запущен.
      clearInterval(this.timerId);                                              // Очищает интервал.
      this.timerId = null;                                                      // Обнуляет идентификатор.
    }
  }

  // === ПУБЛИЧНЫЙ API ===
  updateSlides(newSlides) {                                                     // Полностью заменяет набор слайдов.
    this.slides = newSlides || [];                                              // Устанавливает новый массив (или пустой).
    this.currentIndex = 0;                                                      // Сбрасывает индекс на первый слайд.
    this.isAnimating = false;                                                   // Сбрасывает флаг анимации.
    this.stopAutoplay();                                                        // Останавливает старую автопрокрутку.
    this.init();                                                                // Пересобирает слайдер с нуля (включая клоны).
  }

  destroy() {                                                                   // Полностью удаляет слайдер.
    this.stopAutoplay();                                                        // Останавливает таймер.
    this.container.innerHTML = "";                                              // Очищает DOM контейнера.
    this.container.className = "";                                              // Снимает все CSS-классы.
  }
}

// Экспорт модуля.
if (typeof module !== "undefined" && module.exports) {                          // Проверка среды CommonJS (Node.js).
  module.exports = RoseSlider;                                                  // Экспорт класса для подключения через require.
}



// /**
//  * RoseSlider — универсальный, красивый, современный слайдер
//  * Поддерживает: вертикальные фото 3/4, автопрокрутку, свайп, клавиатуру
//  */
// class RoseSlider {   // Объявление ES6-класса RoseSlider — основной сущности слайдера.
//   constructor(options) {    // Конструктор, принимающий объект настроек options (контейнер, слайды, тайминги и т.д.).
//     // === ПРОВЕРКА КОНТЕЙНЕРА ===
//     this.container = document.querySelector(options.container);   // Находит DOM-элемент по селектору из options.container и сохраняет ссылку в this.container.
//     if (!this.container) {      // Если элемент не найден — переходим к обработке ошибки.
//       console.warn(`❌ RoseSlider: контейнер "${options.container}" не найден`);  //Выводит предупреждение в консоль с указанием проблемного селектора.
//       return;     // Прекращает работу конструктора — без контейнера слайдер построить нельзя.
//     }

//     // === НАСТРОЙКИ ===
//     this.slides = options.slides || [];    // Массив слайдов; если не передан — пустой массив (защита от undefined). 
//     this.autoplay = options.autoplay !== false;    // Автопрокрутка включена по умолчанию; отключается только явной передачей false.
//     this.interval = options.interval || 5000;    // Интервал автопрокрутки в миллисекундах; по умолчанию 5 секунд.
//     this.showDots = options.showDots !== false;    //  Показ точек-индикаторов; по умолчанию включён. 
//     this.showArrows = options.showArrows !== false;    // Показ стрелок навигации; по умолчанию включён.
//     this.keyboard = options.keyboard !== false;    // Управление с клавиатуры; включено по умолчанию.
//     this.pauseOnHover = options.pauseOnHover !== false;    // Пауза автопрокрутки при наведении курсора; включена по умолчанию.
//     this.loop = options.loop !== false;   // Зацикливание слайдов (после последнего — снова первый); включено по умолчанию.

//     // === СОСТОЯНИЕ ===
    
//     this.currentIndex = 0;    // Индекс текущего активного слайда (стартует с нуля).
//     this.timerId = null;    // Идентификатор setInterval для автопрокрутки (пока отсутствует).
//     this.isPaused = false;    // Флаг паузы автопрокрутки (например, при наведении).
//     this.isDragging = false;    // Флаг активного свайпа (используется в touch-событиях).
//     this.startX = 0;    // Начальная координата X касания при свайпе.
//     this.currentX = 0;    // Текущая координата X касания при свайпе.

//     // === ПРОВЕРКА: ЕСТЬ ЛИ СЛАЙДЫ ===
//     if (this.slides.length === 0) {    // Если слайдов нет — показываем заглушку.
//       // Вставляет в контейнер HTML-заглушку с розой и текстом «Нет изображений».
//       this.container.innerHTML = `    
//         <div style="display:flex;align-items:center;justify-content:center;height:100%;background:#f5f0eb;color:#999;font-family:Georgia,serif;">
//           <p style="text-align:center;">🌹<br>Нет изображений</p>
//         </div>
//       `;
//       return;    // Прекращает дальнейшую инициализацию — нечего рендерить.
//     }    // Конец проверки слайдов.

//     this.init();    // Запускает основной метод инициализации слайдера.
//   }

//   // === ИНИЦИАЛИЗАЦИЯ ===
//   init() {     // Метод построения DOM-структуры слайдера.
//     this.container.className = "rose-slider";    // Присваивает контейнеру базовый CSS-класс для стилизации.
//     this.container.innerHTML = "";    // Очищает контейнер от предыдущего содержимого.

//     // Трек
//     this.track = document.createElement("div");    // Создаёт div, внутри которого будут лежать слайды.
//     this.track.className = "rose-slider__track";    // Назначает CSS-класс треку (для flex/transform-анимации).

//     // Генерация слайдов
//     this.slides.forEach((slide, index) => {    // Начало цикла генерации слайдов. Перебирает массив слайдов; slide — данные, index — порядковый номер.
//       const slideEl = document.createElement("div");    // Создаёт DOM-элемент слайда.
//       slideEl.className = "rose-slider__slide";    // Назначает класс слайду.
//       slideEl.setAttribute("role", "group");    // ARIA-роль для группы (доступность).
//       slideEl.setAttribute("aria-label", `Слайд ${index + 1} из ${this.slides.length}`);    // Подпись для скринридеров — какой это слайд по счёту.

//       // === ФОТО ===
//       if (slide.image) {    // Если у слайда указано изображение...
//         slideEl.style.backgroundImage = `url("${slide.image}")`;     // ...ставит его как фоновое изображение.
//         slideEl.style.backgroundSize = "cover";    // Масштабирует фон так, чтобы он полностью покрывал слайд.
//         slideEl.style.backgroundPosition = "center";    // Центрирует фоновое изображение.
//         slideEl.style.backgroundRepeat = "no-repeat";    // Запрещает повторение фонового изображения.
//       } else {     // Если изображения нет — заглушка.
//         slideEl.style.background = "#f5f0eb";    // Нейтральный бежевый фон вместо картинки.
//         // Вставляет по центру слайда крупную иконку розы как плейсхолдер.
//         slideEl.innerHTML = `
//           <div style="display:flex;align-items:center;justify-content:center;height:100%;color:#ccc;font-size:3rem;">
//             🌹
//           </div>      
//           `;
//       }    // Конец условия с изображением.

  

//       // === ОВЕРЛЕЙ (только если есть текст) ===
//       if (slide.title || slide.subtitle) {    // Оверлей создаётся только если есть заголовок или подзаголовок.
//         const overlay = document.createElement("div");    // Создаёт контейнер для текста поверх изображения.
//         overlay.className = "rose-slider__overlay";    // Назначает класс оверлею.

//         if (slide.title) {    // Если есть заголовок — создаём его.
//           const title = document.createElement("h2");    // Создаёт элемент <h2>.
//           title.className = "rose-slider__title";    // Назначает класс заголовку.
//           title.textContent = slide.title;    // Записывает текст заголовка.
//           overlay.appendChild(title);    // Добавляет заголовок в оверлей.
//         }
      
//         if (slide.link) {    // Если у слайда задана ссылка — создаём кнопку-ссылку.
//           const link = document.createElement("a");  // Создаёт элемент <a>.
//           link.className = "rose-slider__link";    // Назначает класс ссылке.
//           link.href = slide.link;    // Устанавливает URL из данных слайда.
//           link.textContent = "Подробнее →";    // Текст ссылки по умолчанию.
//           overlay.appendChild(link);  //  Добавляет ссылку в оверлей.
//         }     // Конец условия ссылки.

//         slideEl.appendChild(overlay);    // Добавляет готовый оверлей внутрь слайда.
//       }    // Конец условия оверлея.

//       this.track.appendChild(slideEl);    // Добавляет слайд в трек.
//     });     // Конец цикла forEach.

//     this.container.appendChild(this.track);    // Вставляет трек в контейнер.

//     // === ЭЛЕМЕНТЫ УПРАВЛЕНИЯ ===
//     if (this.showArrows && this.slides.length > 1) {    // Создание стрелок и точек. Стрелки создаются, только если включены и слайдов больше одного.
//       this.createArrows();    // Вызывает метод создания стрелок. 
//     }

//     if (this.showDots && this.slides.length > 1) {    // Точки создаются, только если включены и слайдов больше одного.
//       this.createDots();    // Вызывает метод создания точек.
//     }

//     // === СОБЫТИЯ ===
//     this.bindEvents();    // Навешивание обработчиков. Вызывает метод навешивания событий.

//     // === АВТОПРОКРУТКА ===
//     if (this.autoplay && this.slides.length > 1) {    // Автопрокрутка включается только если разрешена и слайдов больше одного.
//       this.startAutoplay();    // Запускает автопрокрутку.
//     }    // Конец условия автопрокрутки.

//     // === ПЕРВЫЙ СЛАЙД ===
//     this.goTo(0);    // Устанавливает стартовый слайд (индекс 0).
//   }    //  Конец метода init.

//   // === СТРЕЛКИ ===
//   createArrows() {    // Начало метода createArrows. Создаёт кнопки «назад» и «вперёд».
//     const prevBtn = document.createElement("button");    // Создаёт кнопку «предыдущий слайд».
//     prevBtn.className = "rose-slider__arrow rose-slider__arrow--prev";    // Назначает базовый и модифицирующий классы.
//     prevBtn.setAttribute("aria-label", "Предыдущий слайд");    // ARIA-подпись для доступности.
//     prevBtn.innerHTML = "❮";    // Символ стрелки влево внутри кнопки.
//     prevBtn.addEventListener("click", (e) => {    // Обработчик клика по кнопке «назад».
//       e.stopPropagation();    // Останавливает всплытие события (чтобы клик не улетел в контейнер).
//       this.prev();    // Переход к предыдущему слайду.
//     });    // Конец обработчика.

//     const nextBtn = document.createElement("button");    // Создаёт кнопку «следующий слайд».
//     nextBtn.className = "rose-slider__arrow rose-slider__arrow--next";    // Назначает классы кнопке «вперёд».
//     nextBtn.setAttribute("aria-label", "Следующий слайд");    // ARIA-подпись для доступности.
//     nextBtn.innerHTML = "❯";    // Символ стрелки вправо.
//     nextBtn.addEventListener("click", (e) => {    // Обработчик клика по кнопке «вперёд».
//       e.stopPropagation();    // Останавливает всплытие события.
//       this.next();    // Переход к следующему слайду.
//     });    // Конец обработчика.

//     this.container.appendChild(prevBtn);    // Добавляет кнопку «назад» в контейнер.
//     this.container.appendChild(nextBtn);    // Добавляет кнопку «вперёд» в контейнер.
//   }    // Конец метода createArrows.

//   // === ТОЧКИ ===
//   createDots() {    // Начало метода createDots. Создаёт контейнер с точками-индикаторами.
//     this.dotsContainer = document.createElement("div");    // Создаёт div для точек и сохраняет ссылку в поле класса.
//     this.dotsContainer.className = "rose-slider__dots";    // Назначает класс контейнеру точек.

//     this.slides.forEach((_, index) => {    // Перебирает слайды; сам слайд не нужен — только индекс.
//       const dot = document.createElement("button");    // Создаёт точку как кнопку (для доступности).
//       dot.className = "rose-slider__dot";    // Назначает класс точке.
//       dot.setAttribute("aria-label", `Перейти к слайду ${index + 1}`);    // ARIA-подпись для точки.
//       dot.addEventListener("click", () => this.goTo(index));    // Клик по точке переводит слайдер на соответствующий слайд.
//       this.dotsContainer.appendChild(dot);    // Добавляет точку в контейнер точек.
//     });    // Конец цикла по слайдам.

//     this.container.appendChild(this.dotsContainer);    // Вставляет контейнер точек в основной контейнер.
//     this.updateDots();    // Обновляет активную точку согласно текущему индексу.
//   }    // Конец метода createDots.

//   // === СОБЫТИЯ ===
//   bindEvents() {    //  Начало метода bindEvents. Навешивает все обработчики (hover, клавиатура, свайп).
//     // Пауза при наведении
//     if (this.pauseOnHover && this.slides.length > 1) {    // Включается только если разрешено и слайдов больше одного.
//       this.container.addEventListener("mouseenter", () => {    // Обработчик входа курсора в область слайдера.
//         this.isPaused = true;    // Ставит флаг паузы.
//       });   // Конец обработчика mouseenter. 
//       this.container.addEventListener("mouseleave", () => {    // Обработчик выхода курсора из области слайдера.
//         this.isPaused = false;    // Снимает флаг паузы.
//       });    // Конец обработчика mouseleave.
//     }    // Конец блока pauseOnHover.

//     // Клавиатура
//     if (this.keyboard && this.slides.length > 1) {    // Управление клавиатурой. Включается, если разрешено и слайдов больше одного.
//       this.container.setAttribute("tabindex", "0");    // Делает контейнер фокусируемым (иначе клавиатура не сработает).
//       this.container.addEventListener("keydown", (e) => {    // Обработчик нажатия клавиш.
//         if (e.key === "ArrowLeft") {     // Если нажата стрелка влево...
//           e.preventDefault();    // ...отменяем прокрутку страницы.
//           this.prev();    // Переход к предыдущему слайду.
//         }    // Конец условия ArrowLeft.
//         if (e.key === "ArrowRight") {    // Если нажата стрелка вправо...
//           e.preventDefault();    // ...отменяем прокрутку страницы.
//           this.next();    // Переход к следующему слайду.
//         }    // Конец условия ArrowRight.
//       });   // Конец обработчика keydown.
//     }    // Конец блока keyboard.

//     // Свайп для мобильных
//     if (this.slides.length > 1) {     // Тouch-свайпы. Свайпы нужны только при нескольких слайдах.
//       this.container.addEventListener("touchstart", (e) => {    // Начало касания.
//         this.isDragging = true;    // Включает режим «перетаскивания».
//         this.startX = e.touches[0].clientX;    // Запоминает начальную X-координату пальца.
//       }, { passive: true });    // passive: true — не блокирует прокрутку, повышает отзывчивость.

//       this.container.addEventListener("touchmove", (e) => {    // Обработчик движения пальца.
//         if (!this.isDragging) return;    // Игнорирует движение, если свайп не начат.
//         this.currentX = e.touches[0].clientX;    // Обновляет текущую X-координату.
//       }, { passive: true });    // Снова пассивный слушатель.

//       this.container.addEventListener("touchend", () => {    // Обработчик окончания касания.
//         if (!this.isDragging) return;    // Игнорирует, если свайпа не было.
//         this.isDragging = false;    // Завершает режим перетаскивания.
//         const diff = this.startX - this.currentX;    // Вычисляет смещение пальца по X.
//         if (Math.abs(diff) > 50) {    // Свайп засчитывается только если смещение больше 50px.
//           if (diff > 0) {    // Если палец двигался влево (свайп влево)...
//             this.next();    // ...переходим к следующему слайду.
//           } else {    //  Иначе (свайп вправо)...
//             this.prev();   // ...переходим к предыдущему слайду.
//           }    // Конец ветвления по направлению.
//         }    // Конец проверки дистанции свайпа.
//       }, { passive: true });    // Пассивный слушатель для touchend.
//     }    // Конец блока свайпов.
//   }    // Конец метода bindEvents.

//   // === НАВИГАЦИЯ ===
//   goTo(index) {    // Начало методов навигации. Переход к слайду по индексу.
//     if (this.slides.length === 0) return;   // Защита от вызова при отсутствии слайдов.
    
//     // Зацикливание
//     if (this.loop) {     // Если включено зацикливание...
//       if (index < 0) index = this.slides.length - 1;    // ...переход «назад» с первого слайда уводит на последний.
//       if (index >= this.slides.length) index = 0;    // ..переход «вперёд» с последнего уводит на первый.
//     } else {    // Если зацикливание выключено...
//       index = Math.max(0, Math.min(index, this.slides.length - 1));    //  ...ограничивает индекс диапазоном [0, length-1].
//     }    // Конец логики зацикливания.

//     this.currentIndex = index;    // Сохраняет текущий индекс.
//     this.track.style.transform = `translateX(-${index * 100}%)`;     // Сдвигает трек на нужный слайд (по 100% на каждый).
//     this.updateDots();    // Обновляет подсветку активной точки.
//   }    // Конец метода goTo.

//   next() {    // Переход к следующему слайду.
//     if (this.slides.length <= 1) return;    // Нечего листать, если слайд один.
//     this.goTo(this.currentIndex + 1);    // Переход на индекс +1.
//   }    // Конец метода next.

//   prev() {    //  Переход к предыдущему слайду.
//     if (this.slides.length <= 1) return;    // Нечего листать, если слайд один.
//     this.goTo(this.currentIndex - 1);    // Переход на индекс −1.
//   }    // Конец метода prev.

//   // === ОБНОВЛЕНИЕ ТОЧЕК ===
//   updateDots() {    // Начало метода updateDots. Подсвечивает активную точку.
//     if (!this.dotsContainer) return;    // Если точек нет — выходим.
//     const dots = this.dotsContainer.querySelectorAll(".rose-slider__dot");    // Получает все точки.
//     dots.forEach((dot, index) => {    // Перебирает точки с их индексами.
//       dot.classList.toggle("rose-slider__dot--active", index === this.currentIndex);    // Включает/выключает класс активной точки в зависимости от индекса.
//     });    // Конец перебора.
//   }    // Конец метода updateDots.

//   // === АВТОПРОКРУТКА ===
//   startAutoplay() {     // Начало методов автопрокрутки. Запускает автопрокрутку.
//     if (this.slides.length <= 1) return;    // Нечего листать, если слайд один.
//     this.stopAutoplay();    //  Сначала останавливает предыдущий таймер (защита от дублей).
//     this.timerId = setInterval(() => {    // Заводит интервал.
//       if (!this.isPaused) {   // Срабатывает только если нет паузы.
//         this.next();   // Переход к следующему слайду.
//       }   // Конец проверки паузы.
//     }, this.interval);    // Интервал из настроек (по умолчанию 5000 мс).
//   }    // Конец метода startAutoplay.

//   stopAutoplay() {    // Останавливает автопрокрутку.
//     if (this.timerId) {    // Только если таймер был запущен.
//       clearInterval(this.timerId);    // Очищает интервал.
//       this.timerId = null;    // Обнуляет идентификатор.
//     }    // Конец условия.
//   }    //  Конец метода stopAutoplay.

//   // === ПУБЛИЧНЫЙ API ===
//   updateSlides(newSlides) {    // Начало публичных методов. Полностью заменяет набор слайдов.
//     this.slides = newSlides || [];    //  Устанавливает новый массив (или пустой).
//     this.currentIndex = 0;    // Сбрасывает индекс на первый слайд.
//     this.stopAutoplay();    // Останавливает старую автопрокрутку.
//     this.init();    // Пересобирает слайдер с нуля.
//   }    // Конец метода updateSlides.

//   destroy() {    // Полностью удаляет слайдер.
//     this.stopAutoplay();    //  Останавливает таймер.
//     this.container.innerHTML = "";    // Очищает DOM контейнера.
//     this.container.className = "";    //  Снимает все CSS-классы.
//   }    // Конец метода destroy.
// }    // Конец класса RoseSlider.

// // Экспорт модуля.
// if (typeof module !== "undefined" && module.exports) {    // Проверка среды CommonJS (Node.js).
//   module.exports = RoseSlider;    // Экспорт класса для подключения через require.
// }    // Конец условия экспорта.