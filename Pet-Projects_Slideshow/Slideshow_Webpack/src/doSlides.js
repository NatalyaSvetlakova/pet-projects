// Импорт изображений
// Импортируем фотографии роз из папки slides
// Webpack обработает эти файлы и поместит их в папку dist/images/
// Переменные photo1, photo2 и т.д. будут содержать пути к обработанным файлам
import photo1 from './slides/photo_1.jpg'; // Импортируем изображение первой фотографии из указанной директории.
import photo2 from './slides/photo_2.jpg'; // По аналогии с первой импортируем изображения всех фотографий из указанной директории.
import photo3 from './slides/photo_3.jpg';
import photo4 from './slides/photo_4.jpg';
import photo5 from './slides/photo_5.jpg';
import photo6 from './slides/photo_6.jpg';
import photo7 from './slides/photo_7.jpg';
import photo8 from './slides/photo_8.jpg';
import photo9 from './slides/photo_9.jpg';
import photo10 from './slides/photo_10.jpg';
import photo11 from './slides/photo_11.jpg';
import photo12 from './slides/photo_12.jpg';
import photo13 from './slides/photo_13.jpg';
import photo14 from './slides/photo_14.jpg';
import photo15 from './slides/photo_15.jpg';

// Массив данных о фотографиях роз и комментариев к ним
// Экспортируем массив объектов с данными для слайд-шоу
// Каждый объект содержит: id: уникальный номер фотографии (1-14), image: путь к фотографии (импортированная переменная), comment: название роз на фотографии (комментарий, который отображается под фото)

export const roses = [ // Создаем и экспортируем константу roses - массив объектов с данными о розах.
    { id: 1, image: photo1, comment: 'Кабриолет Horch' },
    { id: 2, image: photo2, comment: 'Bugatti Atlantic' },
    { id: 3, image: photo3, comment: 'Chevrolet Corvette' },
    { id: 4, image: photo4, comment: 'Ford Thunderbird' },
    { id: 5, image: photo5, comment: 'Cadillac DeVille' },
    { id: 6, image: photo6, comment: 'Mercedes-Benz' },
    { id: 7, image: photo7, comment: 'Кабриолет Delahaye' },
    { id: 8, image: photo8, comment: 'Ferrari 250 GTO' },
    { id: 9, image: photo9, comment: 'Bugatti Atlantic' },
    { id: 10, image: photo10, comment: 'Aston Martin DBR1 1956' },
    { id: 11, image: photo11, comment: 'Duesenberg SSJ 1935' },
    { id: 12, image: photo12, comment: 'Jaguar D-Type 1956' },
    { id: 13, image: photo13, comment: 'Alfa Romeo 8C 2900B Lungo Spider 1939' },
    { id: 14, image: photo14, comment: 'Chevrolet Corvette 1963' },
    { id: 14, image: photo14, comment: 'Cadillac DeVille' },
];