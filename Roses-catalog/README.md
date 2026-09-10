Структура проекта

```
roses-catalog/
├── index.html          # Главная страница
├── catalog.html        # Каталог роз
├── rose.html           # Карточка розы
├── favorites.html      # Избранное
├── about.html          # О нас
├── css/
│   └── style.css       # Все стили
├── js/
│   ├── data.js         # Данные
│   ├── slider.js       # Слайдер
│   ├── home.js         # логика главной: слайдер + карточки
│   ├── catalog.js      # createRoseCard + фильтр/поиск/сортировка
│   ├── rose.js         # страница сорта + мини-галерея
│   └── favorites.js    # страница избранного
├── img/                # Изображения
└── README.md           # Описание проекта

Что где живёт:
data.js	Массив roses и categories
slider.js	Класс RoseSlider
favorites.js	getFavorites, toggleFavorite, isInFavorites
catalog.js	createRoseCard + фильтр, поиск, сортировка
rose.js	Динамическая страница сорта
favorites-page.js	Страница избранного

Кто какие скрипты подключает

index.html	data.js, favorites.js, slider.js, home.js
catalog.html	data.js, favorites.js, catalog.js
rose.html	data.js, favorites.js, slider.js, rose.js
favorites.html	data.js, favorites.js, favorites-page.js
about.html	— (без скриптов, статичная страница)

Команда для быстрого создания в powershell не применялась:
New-Item -Path "roses-catalog" -ItemType Directory -Force; Set-Location roses-catalog; New-Item -Path "css","js","img" -ItemType Directory -Force; New-Item -Path "index.html","catalog.html","rose.html","favorites.html","about.html","css/style.css","js/data.js","js/slider.js","js/catalog.js","js/favorites.js","README.md" -ItemType File -Force
Папки и файлы созданы последовательно в ручном режиме в powershell: 
mkdir roses-catalog
cd roses-catalog
mkdir css js img
type nul > index.html
type nul > catalog.html
type nul > rose.html
type nul > favorites.html
type nul > about.html
type nul > css\style.css
type nul > js\data.js
type nul > js\slider.js
type nul > js\catalog.js
type nul > js\favorites.js
type nul > README.md

Делаю слайдер переиспользуемым модулем — класс RoseSlider, который можно инициализировать на любой странице с разными данными и настройками.
Как это работает
Параметр	Главная (index.html)	Страница сорта (rose.html)
container	#hero-slider	#rose-gallery-slider
Данные	Топ-4 сорта из data.js	Все фото конкретного сорта
autoplay	true	false
showDots	true	true
Высота	500px	400px
Ключевое: один и тот же класс RoseSlider используется на обеих страницах — просто с разными настройками и данными. На главной он крутит топ-сорта с автопрокруткой, а на странице сорта работает как мини-галерея без автопрокрутки.

Логика для каталога: фильтрация по категориям, поиск по названию/латинскому названию, сортировка, счётчик результатов. Всё на чистом JS, без библиотек.
Модульность: логика каталога вынесена в отдельный файл catalog.js, это удобно для Git — можно коммитить изменения каталога отдельно от слайдера или главной.
Переиспользование: createRoseCard используется в main.js (топ-карточки) и catalog.js (каталог), поэтому стиль карточек всегда одинаковый.
Производительность: фильтрация и сортировка происходят на массиве roses в памяти, без запросов к серверу — идеально для учебного проекта и GitHub Pages.
UX: счётчик «Найдено: X сортов» и сообщение «Ничего не найдено» сразу дают обратную связь пользователю.