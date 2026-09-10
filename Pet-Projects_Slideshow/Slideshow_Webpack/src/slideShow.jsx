import React, { useState } from 'react'; // Импортируем библиотеку React и хук useState для управления состоянием компонента.
import { roses } from './doSlides'; // Импортируем массив данных roses (фотографии и комментарии к розам) из файла doSlides.
import './styles/style.css'; // Подключаем основной CSS-файл со стилями для слайд-шоу.

const Slideshow = () => {  // Объявляем функциональный компонент Slideshow, который будет отображать слайд-шоу с розами.    
     if (!roses || roses.length === 0) {  // Проверка на наличие данных, чтобы избежать ошибок рендера<div className=""></div>
        return <div className="error-message">Нет данных для слайд-шоу</div>;
    }
    
    const [currentIndex, setCurrentIndex] = useState(0); // Инициализируем состояние currentIndex (текущий индекс слайда) значением 0; setCurrentIndex - функция для его обновления.
    const currentRose = roses[currentIndex]; // Получаем данные текущей розы из массива roses по текущему индексу.
    
    const nextSlide = () => { // Объявляем функцию nextSlide для перехода к следующему слайду.
        setCurrentIndex((prevIndex) => 
            prevIndex === roses.length - 1 ? 0 : prevIndex + 1 // Обновляем индекс: если текущий индекс - последний в массиве, переходим к первому (0), иначе увеличиваем на 1.
        );
    };
    
    const prevSlide = () => { // Объявляем функцию prevSlide для перехода к предыдущему слайду.
       
        setCurrentIndex((prevIndex) => 
            prevIndex === 0 ? roses.length - 1 : prevIndex - 1 // Обновляем индекс: если текущий индекс - первый (0), переходим к последнему, иначе уменьшаем на 1.
        );
    };
    
    const handleKeyDown = (event) => {
  // Сначала предотвращаем стандартное поведение (скролл страницы на пробеле)
        event.preventDefault();

        console.log('Нажата клавиша:', event.key);

        if (event.key === 'ArrowLeft' || event.key === 'a') {
            prevSlide();
        } else if (event.key === 'ArrowRight' || event.key === 'd' || event.key === ' ' || event.key === 'Enter') {
            nextSlide();
            }
    };
    
    return ( // Возвращаем JSX-разметку компонента (интерфейс слайд-шоу).
        // Используем React Fragment для группировки элементов без добавления лишнего DOM-узла.
        <>             
            <div className="logo-page"> 
                    <span className="logo-ns">Natalya Svetlakova Project</span> 
            </div>
            <div className="slideshow-container" tabIndex="0" onKeyDown={handleKeyDown}>                         
            <h1 className="project-title">Самые красивые ретро-автомобили</h1>             
            <div className="divider"></div>                             
                <div className="slide-frame">                
                    <img 
                        src={currentRose.image} 
                        alt={`Роза ${currentRose.id}`} 
                        className="slide-image" 
                        loading="lazy"  
                    />                
                    <div className="slide-counter"> 
                        {currentIndex + 1} / {roses.length} 
                    </div> 
                </div> 
                
                <div className="comment-container"> 
                    <p className="comment-text"> 
                        {currentRose.comment} 
                    </p>
                </div>                
                <div className="navigation-container">                     
                    <button 
                        className="nav-button prev" 
                        onClick={prevSlide}  
                        aria-label="Предыдущий слайд"  
                    >
                        ◀ 
                    </button>                    
                    <button 
                        className="nav-button next"  
                        onClick={nextSlide}          
                        aria-label="Следующий слайд" 
                    >
                        ▶ 
                    </button>
                </div>
            </div>
        </>
    );
};
export default Slideshow; // Экспортируем компонент Slideshow как основной (default) - чтобы его можно было импортировать в других файлах.

// Используем React Fragment (<>) для группировки элементов без создания лишнего DOM‑узла:
// <>
//     <div className="logo-page"> // Создаем блок с логотипом проекта.     
//         <span className="logo-ns">Natalya Svetlakova Project</span>  // Добавляем текстовую подпись с названием проекта.    //         
//     </div>
//     <div className="slideshow-container" tabIndex="0" onKeyDown={handleKeyDown}> // Создаем контейнер слайд‑шоу: tabIndex="0" делает элемент фокусируемым, onKeyDown={handleKeyDown} обрабатывает нажатия стрелок клавиатуры.
//         <h1 className="project-title">Rose Story</h1>  // Добавляем заголовок проекта - он виден сразу после загрузки страницы.
//         <div className="divider"></div> // Вставляем разделительную линию между заголовком и областью слайда.         
//         <div className="slide-frame"> // Создаем фрейм слайда - контейнер для изображения и счетчика.
//             <img   // Выводим изображение текущей розы: src берет путь из currentRose.image, alt содержит описание для доступности, loading="lazy" включает ленивую загрузку.
//                 src={currentRose.image} 
//                 alt={`Роза ${currentRose.id}`} 
//                 className="slide-image" 
//                 loading="lazy"  
//             />                
//             <div className="slide-counter">  // Добавляем счетчик слайдов: показывает текущий номер и общее количество элементов в массиве roses.
//                 {currentIndex + 1} / {roses.length} 
//             </div> 
//         </div> 
//         <div className="comment-container"> // Создаем контейнер для комментария к слайду.
//             <p className="comment-text"> // Отображаем текстовое описание текущей розы из currentRose.comment.
//                 {currentRose.comment} 
//             </p>
//         </div>
//         <div className="navigation-container">   // Создаем контейнер для кнопок навигации.
//             <button   // Кнопка «Назад»: className добавляет стили и модификатор prev, onClick={prevSlide} запускает переход к предыдущему слайду, aria‑label улучшает доступность.
//                 className="nav-button prev" 
//                 onClick={prevSlide}  
//                 aria-label="Предыдущий слайд"  
//             >
//                 ◀ 
//             </button>
//             <button   // Кнопка «Вперед»: className добавляет стили и модификатор next, onClick={nextSlide} запускает переход к следующему слайду, aria‑label улучшает доступность.
//                 className="nav-button next"  
//                 onClick={nextSlide}          
//                 aria-label="Следующий слайд" 
//             >
//                 ▶ 
//             </button>
//         </div>
//     </div>
// </>