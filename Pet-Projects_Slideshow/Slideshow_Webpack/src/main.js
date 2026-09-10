// Импортируем React для JSX
import React from 'react';
// Импортируем ReactDOM для рендеринга в DOM
import { createRoot } from 'react-dom/client';
// Импортируем главный компонент
import App from './App';
// Импортируем глобальные стили
import './styles/main.css';

// Находим корневой элемент в HTML
const container = document.getElementById('root');

// Создаем корень React
const root = createRoot(container);

// Рендерим приложение
// React.StrictMode - инструмент для обнаружения проблем в коде
root.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);

// Для горячей перезагрузки (Hot Module Replacement)
if (module.hot) {
    module.hot.accept();
}