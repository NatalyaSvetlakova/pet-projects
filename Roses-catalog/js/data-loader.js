// js/data-loader.js — Promise-версия
window.rosesReady = fetch('data.json')
  .then(response => {
    if (!response.ok) throw new Error('HTTP ' + response.status);
    return response.json();
  })
  .then(data => {
    window.categories = data.categories || [];
    window.roses      = data.roses      || [];
    console.log('🌹 Азбука Роз: загружено', window.roses.length, 'сортов');
    return window.roses;
  })
  .catch(err => {
    console.error('Не удалось загрузить data.json:', err);
    window.roses = [];
    window.categories = [];
    return [];
  });