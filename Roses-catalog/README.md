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

JNPSDS
Сценарий 1 — отзывов ещё нет
Пользователь открывает главную, видит:

text
┌──────────────────────────────────────────┐
│              💬                          │
│   Пока никто не оставил отзывов.         │
│   Загляните в каталог, откройте сорт     │
│   и поделитесь впечатлениями первым.     │
└──────────────────────────────────────────┘
Сценарий 2 — отзывы есть
text
┌─────────────────────────┐  ┌─────────────────────────┐
│  (🌹)  Баронесса        │  │  (🌷)  Аспирин Роуз     │
│        ★★★★★            │  │        ★★★★☆            │
│  «Шикарный сорт, цве-   │  │  «Почти нет аромата,    │
│   тёт всё лето…»        │  │   но цветок — сказка»   │
│  — Анна      · сегодня  │  │  — Мария    · 2 дн.назад│
└─────────────────────────┘  └─────────────────────────┘
Клик по карточке → переход на rose.html?id=baronesse, где можно прочитать все отзывы и оставить свой.

КАК СЧИТАЕТСЯ РЕЙТИНГ В ОТЗЫВАХ:
🔄 Полная цепочка: как данные превращаются в цифры
text
┌─────────────────────────────────────────────────────────┐
│ data.js                                                  │
│   rating: 4.8              ← «резервный» рейтинг         │
│   reviews: [ {…}, {…} ]    ← seed-отзывы (объекты)       │
└──────────────┬──────────────────────────────────────────┘
               │
               │  1. getReviews(rose) — объединяет:
               │     • rose.reviews (seed из data.js)
               │     • localStorage[roseId] (пользовательские)
               ▼
┌─────────────────────────────────────────────────────────┐
│ reviews.js                                               │
│   getReviews(rose)      → [ {…userAdded}, {…seed}, … ]   │
│   getAverageRating(rose)→ сумма score / количество       │
└──────────────┬──────────────────────────────────────────┘
               │
               │  2. Используется в:
               ▼
┌─────────────────────────────────────────────────────────┐
│ catalog.js / home.js / rose.js                           │
│   ratingNum  = getAverageRating(rose)   ← рейтинг        │
│   reviewsCount = getReviews(rose).length ← число отзывов │
└─────────────────────────────────────────────────────────┘
🧮 Как именно считается рейтинг
Смотрим на getAverageRating из reviews.js:

js
function getAverageRating(rose) {
  const reviews = getReviews(rose);
  if (reviews.length === 0) return rose.rating ? parseFloat(rose.rating) : 0;
  const sum = reviews.reduce((acc, r) => acc + (Number(r.score) || 0), 0);
  return +(sum / reviews.length).toFixed(1);
}
Алгоритм:

getReviews(rose) собирает все отзывы (seed + пользовательские).

Если отзывов нет вообще → используется rose.rating (то самое 4.8).

Если отзывы есть → считается среднее арифметическое их score. Значение rating игнорируется.

Пример: у Баронессы rating: 4.8 и 5 seed-отзывов со score [5, 5, 4, 5, 5]
text
sum = 24
avg = 24 / 5 = 4.8

🧩 Полная цепочка сохранения и отображения
Вот что происходит, когда пользователь пишет отзыв и нажимает «Отправить»:

text
1. Форма → submit-обработчик в rose.js
   ↓
2. addReview(rose.id, { author, score, text })
   ↓
3. localStorage[REVIEWS_KEY] ← обновлён
   ↓
4. renderReviews() вызывается заново
   ↓
5. getReviews(rose) собирает: [пользовательские + встроенные]
   ↓
6. Новый отзыв отрисован в списке
А когда страница перезагружается:

text
1. initReviews(rose) → renderReviews()
   ↓
2. getReviews(rose) → getUserReviews(rose.id)
   ↓
3. Читаем localStorage[REVIEWS_KEY][rose.id]
   ↓
4. Отзывы восстановлены ✅
✅ Вывод
Всё, что нужно для сохранения пользовательских отзывов, уже есть в вашем reviews.js:

Функция	Роль в сохранении
addReview	Добавляет и записывает в localStorage
deleteReview	Удаляет из localStorage
saveAllUserReviews	Физически пишет в localStorage
getAllUserReviews	Читает из localStorage
getUserReviews	Достаёт отзывы для конкретного сорта
getReviews	Смешивает пользовательские + встроенные

🧩 Как это работает в связке
text
[Страница сорта rose.html]           [Главная index.html]
        │                                     │
        │ пишет отзыв                         │ читает отзывы
        ▼                                     ▼
    ┌──────────────────────────────────────────────┐
    │  localStorage: 'roses-catalog-reviews'       │
    │  {                                           │
    │    "pink-piano": [ {author, score, text} ],  │
    │    "baronesse":  [ ... ]                     │
    │  }                                           │
    └──────────────────────────────────────────────┘
reviews.js — пишет в localStorage и читает для конкретного сорта.

top-reviews.js — читает все записи из того же ключа, фильтрует по оценке ≥ 4, сортирует и отрисовывает на главной.

Никакой синхронизации не нужно — оба файла работают с одним хранилищем.

✅ Что получится в итоге
Пользователь заходит на главную — видит 6 лучших отзывов со ссылками на сорта.

Кликает на отзыв → попадает на страницу сорта.

Оставляет там свой отзыв.

Возвращается на главную — его отзыв тоже появился в блоке (если он на 4-5 звёзд и длиннее 20 символов).

Это создаёт ощущение живого, растущего сайта.
