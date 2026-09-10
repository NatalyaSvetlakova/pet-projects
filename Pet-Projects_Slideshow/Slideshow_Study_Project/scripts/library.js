// Функция doSlides - главная функция, которая «оживляет» слайдер, запускает и контролирует его работу.
// Параметры: images - массив объектов с изображениями и подписями; containerSelector - CSS-селектор контейнера (определение местоположения элементов); delay - задержка между слайдами в миллисекундах (использование функций таймера).
function doSlides(images, containerSelector, delay = 3000) {
    // 1. Поиск элементов (определение местоположения элементов).
    const container = document.querySelector(containerSelector);  //Находим контейнер по CSS-селектору. document.querySelector() - метод поиска первого элемента по CSS-селектору. "Строка div#slides совпадает с селектором CSS и означает «элемент div с идентификатором slides».
    if (!container) {   // Проверяем, найден ли контейнер.
        console.error(`Контейнер "${containerSelector}" не найден!`);  // Если контейнер не найден - выводим ошибку в консоль.
        return;  // Прерываем выполнение функции. return - выход из функции, если контейнер не найден.
    }
    
    const img = container.querySelector('img');   // Находим изображение внутри контейнера. "container.querySelector() будет выполнять поиск только внутри элемента container". Это ускоряет поиск и игнорирует другие img на странице.
    if (!img) {  // Проверяем, найдено ли изображение
        console.error('В контейнере не найден элемент <img>!');
        return;
    } 
    // 2. Создаем кнопки навигации.
    const prevBtn = document.createElement('button');  // Создаем HTML-элемент <button> для кнопки «Назад».
    prevBtn.id = 'prev-btn';  // Присваиваем кнопке уникальный идентификатор для стилизации и доступа из JS.
    prevBtn.textContent = '←';  // Устанавливаем видимый текст кнопки (стрелка влево).
    container.insertAdjacentElement('afterbegin', prevBtn);  // Вставляем кнопку в начало контейнера (сразу после открывающего тега <div>).

    const nextBtn = document.createElement('button');  // Создаем HTML-элемент <button> для кнопки «Вперед».
    nextBtn.id = 'next-btn';  // Присваиваем кнопке уникальный идентификатор.
    nextBtn.textContent = '→';  // Устанавливаем видимый текст кнопки (стрелка вправо).
    container.insertAdjacentElement('afterbegin', nextBtn);   // Вставляем кнопку в начало контейнера (перед всеми остальными элементами внутри div).
    // 3. Создаем кнопку старт/стоп.
    const button = document.createElement('button');  // Создаем кнопку (ТЗ: "Вместо того чтобы определять кнопку в HTML, мы создадим ее с помощью JavaScript"). document.createElement() - создает новый HTML-элемент в памяти, не на странице. 
    button.id = 'run-button';  // Устанавливаем ID для CSS-стилизации. ID используется в CSS: #run-button { ... }.
    button.textContent = 'Старт';  // Устанавливаем текст кнопки. textContent - задает текстовое содержимое элемента.
    container.insertAdjacentElement('beforeend', button);  // Добавляем кнопку в конец контейнера. insertAdjacentElement('beforeend') - вставляет элемент в конец родителя.
    // 4. Подпись слайда.
    const caption = document.createElement('p');  // Создаем элемент для подписи слайда.  
    container.insertAdjacentElement('beforeend', caption); // Добавляем подпись в конец контейнера. "Абзац добавляется в конец контейнера, после ранее добавленной кнопки".
    // 5. Переменные состояния слайд-шоу (индекс слайда, таймер и объект предзагрузки). 
    let slideNumber = 0;  // Текущий индекс слайда (работа с массивом). "Мы будем использовать переменную slideNumber". Начинаем с 0 (первый элемент массива). 
    let running;  // Состояние слайд-шоу (запущено/остановлено). running - undefined = остановлено, число = ID таймера. 
    const prefetch = new Image();  // Предзагрузка следующего изображения. new Image() - создает объект изображения в памяти (не отображается). "Чтобы создать новый объект image, мы вызываем специальную функцию Image()". Используется для кэширования следующего слайда, чтобы убрать задержку при смене.
    // 6. Функция обновления слайда.
    function updateSlide() {    //  Циклическое переключение.        
        if (slideNumber >= images.length) slideNumber = 0;   // Проверяем, что индекс в пределах массива.
        if (slideNumber < 0) slideNumber = images.length - 1;  
                
        img.src = `images/slides/${images[slideNumber].src}`;  // Загружаем текущее изображение. Задаем путь к картинке. Обратные кавычки `...` позволяют вставить переменную ${...} прямо в строку. ${images[slideNumber].src} - подставляем значения (использование свойств объекта).
        caption.textContent = images[slideNumber].caption; // Обновляем наддпись слайда. caption.textContent - изменяет текст надписии.
        img.title = `Слайд ${slideNumber + 1}`;  // Обновляем всплывающую подсказку при наведении курсора на слайд (пишем номер слайда - «Слайд 1», «Слайд 2» и т.д.). 
        img.alt = images[slideNumber].caption;  // Обновляем альтернативный текст. alt - альтернативный текст (при ошибке загрузки).
      
        // Предзагрузка следующего слайда
        const nextIndex = (slideNumber + 1) % images.length;
        prefetch.src = `images/slides/${images[nextIndex].src}`;
  }

    function next() {   
        slideNumber++;  // Переходим к следующему слайду (увеличиваем индекс).
        updateSlide();  // Обновляем изображение и подпись по текущему индексу.
    }        
      function prev() {
        slideNumber--;   // Переходим к предыдущему слайду (уменьшаем индекс).
        updateSlide();   // Обновляем изображение и подпись по текущему индексу.
    }

    function toggle() {
        if (!running) {      // Запускаем автопереключение слайдов
            running = setInterval(next, delay);
            updateSlide();   // Сразу показываем актуальный слайд.
            button.textContent = 'Стоп';  // Меняем текст кнопки на «Стоп».
            container.classList.add('running');  // Добавляем класс для визуального состояния «работает».
            document.body.classList.add('slideshow-running');  // Глобальный маркер запущенного слайдера.
        } else {
            clearInterval(running);  // Останавливаем таймер автопереключения.
            running = null;  // Сбрасываем ID таймера.
            button.textContent = 'Старт';  // Возвращаем текст кнопки на «Старт».
            container.classList.remove('running');  // Убираем маркер «работает» у контейнера.
            document.body.classList.remove('slideshow-running');  // Убираем глобальный маркер.
        }
    }  
    // 7. Обработчики событий.
    button.addEventListener('click', toggle);  // Клик по кнопке. addEventListener - современный способ добавления обработчика. При клике на кнопку вызывается функция toggle.
    img.addEventListener('click', toggle);  // Клик по изображению. Изображение работает как большая кнопка.
    
    prevBtn.addEventListener('click', () => {
        prev();         // Если слайдер был остановлен - не запускаем его автоматически
    });

    nextBtn.addEventListener('click', () => {
        next();         // При клике на «Вперёд» вызываем next()
    });
    // Реакция на пробел.
    document.addEventListener('keydown', function(event) {  // Нажатие клавиши на клавиатуре (ТЗ: Реагирование на нажатие клавиши). 'keydown' - событие нажатия клавиши (ТЗ: "Прослушиватель событий предназначен для события keypress").
        if (event.code === 'Space' || event.key === ' ') {  // Проверяем, нажата ли клавиша ПРОБЕЛ. event.code - код клавиши. event.key - символ клавиши.
            event.preventDefault();  // Отменяем стандартное поведение браузера. Предотвращает прокрутку страницы при нажатии пробела.
            toggle();  // Переключаем состояние слайд-шоу. ТЗ: "если проверка пройдена, мы можем вызвать функцию toggl.
        }
        // Добавляем реакцию на стрелки клавиатуры.
        if (event.code === 'ArrowLeft') prev();
        if (event.code === 'ArrowRight') next();
    });    
    // 8. Автозапуск.
    toggle();  // Автоматически запускаем слайд-шоу сразу после загрузки страницы. 
}