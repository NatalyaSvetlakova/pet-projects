function doSlides(images, containerSelector, delay=3000) {
        'photo_1.jpg','photo_2.jpg','photo_3.jpg','photo_4.jpg','photo_5.jpg','photo_6.jpg','photo_7.jpg','photo_8.jpg',
        'photo_9.jpg','photo_10.jpg','photo_11.jpg','photo_12.jpg','photo_13.jpg','photo_14.jpg','photo_15.jpg','photo_16.jpg',
        'photo_17.jpg','photo_18.jpg','photo_19.jpg','photo_20.jpg','photo_21.jpg','photo_22.jpg', 'photo_23.jpg', 'photo_24.jpg',
        'photo_25.jpg', 'photo_26.jpg', 'photo_27.jpg', 'photo_28.jpg', 'photo_29.jpg', 'photo_30.jpg', 'photo_31.jpg', 'photo_32.jpg',
        'photo_33.jpg', 'photo_34.jpg', 'photo_35.jpg', 'photo_36.jpg', 'photo_37.jpg', 'photo_38.jpg', 'photo_39.jpg', 'photo_40.jpg', 
        'photo_41.jpg', 'photo_42.jpg', 'photo_43.jpg', 'photo_44.jpg', 'photo_45.jpg', 'photo_46.jpg',
        'photo_47.jpg', 'photo_48.jpg', 'photo_49.jpg', 'photo_50.jpg';
        //элементы
        let container = document.querySelector(containerSelector);
        let img = container.querySelector('img');
        let prefetch = new Image; // ф-ция конструктор для предварительной загрузки изображений в памяти компа
        //добавляем подпись
        let caption = document.createElement('p');
        container.insertAdjacentElement('beforeend', caption);
        //добавить кнопку предыдущий
        let prevButton = document.createElement('button');
        prevButton.id = 'предыдущая кнопка';
        prevButton.textContent = 'Предыдущий';
        container.insertAdjacentElement('beforeend', prevButton);
        //Добавить кнопку старт
        let button = document.createElement('button');
        button.id = 'run-button';
        button.textContent = 'Старт';
        container.insertAdjacentElement('beforeend', button);
        //добавить кнопку следующий
        let nextButton = document.createElement('button');
        nextButton.id = 'следующая кнопка';
        nextButton.textContent = 'Следующий';
        container.insertAdjacentElement('beforeend', nextButton);          
        //перемнные
        let slideNumber = 0;
        setTimeout(next, 3000);
        setInterval(next, delay);
        let running; // undefined
        running = setInterval(next, delay());
        next();
        //нажатие клавиши через прослушиватель событий
        document.onkeypress = function(event){
            //document.onkeypress = event => { -альтернативный способ написания выражения ,
            if(event.key == ' '){
            toggle();
            event.preventDefault();   
            };

        };
        //для запуска или остановки слайдшоу используем toggle
        function toggle(){
            if(!running) {
            running = setInterval(next, delay());
            //img.addEventListener('click', toggle);
            next();
            //toggle();
            button.textContent = 'stop';
            container.classList.add('running'); 
        }else {
            running = clearInterval(running);
            button.textContent = 'Start';
            //running = undefined;
        
        //button.textContent = 'play';
        slideNumber--;
        container.classList.remove('running');
        };
    };
        //img.addEventListener('click', toggle); //Более гибкий метод использования .onclick через функцию;
        button.addEventListener('click', toggle);
        //next();
        toggle(); //ждет пока пользователь начнет
        //
        function next() {
        //заполнение изображения
            //img.src = `slides/${images[slideNumber++]}`; //обьединенные ниже команды.
            img.src = `slides/${images[slideNumber].src}`;
            caption.textContent = images[slideNumber].caption;
            //img.title = images[slideNumber].caption;
            //img.alt = images[slideNumber].caption;
            slideNumber++;
        //циклический переход
        if(slideNumber >= images.length) slideNumber = 0;
        //Предварительная загрузка
        //prefetch.src = `slides/${images[slideNumber]}`;
        prefetch.src = `slides/${images[slideNumber].src}`;
        };
        function updateSlider(index) {
            if (index < 0) {
            index = images.length - 1;
            } else if (index >= images.length) {
            index = 0; // Если нажали «Вперёд» на последнем слайде, переходим на первый
        }
            slideNumber = index;
            img.src = `slides/${images[slideNumber].src}`;
		    caption.textContent = images[slideNumber].caption;
};
// обработчики событий для кнопок
prevButton.addEventListener('click', () => {
		updateSlider(slideNumber - 1);
	});
	nextButton.addEventListener('click', () => {
		updateSlider(slideNumber + 1);
	});
	updateSlider(0);
};
export {doSlides};

