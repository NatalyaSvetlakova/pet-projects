import React from 'react';  // Импортируем React - подключаем библиотеку React.
import Slideshow from './slideShow';  // Импортируем компонент слайд-шоу. Берем готовый компонент Slideshow (это имя, под которым мы будем использовать компонент дальше), который лежит в файле slideShow.js в той же папке (путь ./ означает «в текущей директории»). 
const App = () => {  // Главный компонент приложения - создаем функциональный компонент React с именем App. Это просто функция, которая возвращает интерфейс (JSX).
        return (  // Возвращаем JSX с компонентом слайд-шоу        
        <>            
            <Slideshow />  {/* Используем React Fragment для группировки без лишнего DOM-элемента. React берет описание компонента Slideshow и превращает в реальные элементы интерфейса, которые видит пользователь, то есть рендерит компонент Slideshow - превращает в HTML. Внутри Slideshow уже есть логика: слайды, навигация, анимации, данные из массива roses. */}            
        </>
    );
};

export default App;  // Экспортируем для использования в index.js

(function() {
            const slidesContainer = document.getElementById('slidesContainer');
            const slides = Array.from(slidesContainer.querySelectorAll('.slide'));
            const prevBtn = document.getElementById('prevBtn');
            const nextBtn = document.getElementById('nextBtn');
            const slideTitleEl = document.getElementById('slideTitle');

            let currentIndex = 0;

            function updateSlider() {
                // Убираем класс shown у всех слайдов
                slides.forEach(slide => slide.classList.remove('shown'));
                // Добавляем класс shown текущему слайду
                slides[currentIndex].classList.add('shown');
                // Обновляем название розы
                const caption = slides[currentIndex].getAttribute('data-caption');
                slideTitleEl.textContent = caption || 'Роза';
            }

            function nextSlide() {
                currentIndex = (currentIndex + 1) % slides.length;
                updateSlider();
            }

            function prevSlide() {
                currentIndex = (currentIndex - 1 + slides.length) % slides.length;
                updateSlider();
            }

            // Обработчики для кнопок
            prevBtn.addEventListener('click', prevSlide);
            nextBtn.addEventListener('click', nextSlide);

            // Обработчик для клавиши Пробел (следующий слайд)
            document.addEventListener('keydown', (e) => {
                if (e.code === 'Space') {
                    e.preventDefault(); // Чтобы не скроллило страницу
                    nextSlide();
                }
            });

            // Инициализация
            updateSlider();
        });