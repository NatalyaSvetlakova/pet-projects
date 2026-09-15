/* =========================================================
   qna.js — вопросы и ответы, привязанные к конкретному сорту
   ========================================================= */

/* =========================================================
   qna.js — вопросы и ответы в localStorage
   API:
     getAllQna()                    — все данные
     saveAllQna(data)               — сохранить всё
     getQuestions(roseId)           — вопросы для сорта
     addQuestion(roseId, text, author)
     addReply(roseId, questionId, text, author)
     updateQuestionLikes(roseId, questionId, count)
   ========================================================= */

const QNA_KEY = 'roses-catalog-qna';

/**
 * Получить все вопросы и ответы (объект: { roseId: [question, …] })
 */
function getAllQna() {
  const stored = localStorage.getItem(QNA_KEY);
  if (!stored) return {};
  try {
    const parsed = JSON.parse(stored);
    return (parsed && typeof parsed === 'object') ? parsed : {};
  } catch (e) {
    console.warn('qna.js: повреждённые данные, сброс.');
    localStorage.removeItem(QNA_KEY);
    return {};
  }
}

/**
 * Сохранить всё обратно в localStorage
 */
function saveAllQna(data) {
  localStorage.setItem(QNA_KEY, JSON.stringify(data));
}

/**
 * Получить вопросы для конкретного сорта
 * @param {string} roseId
 * @returns {Array}
 */
function getQuestions(roseId) {
  const all = getAllQna();
  return Array.isArray(all[roseId]) ? all[roseId] : [];
}

/**
 * Добавить новый вопрос
 * @param {string} roseId
 * @param {string} text
 * @param {string} author
 */
function addQuestion(roseId, text, author) {
  const all = getAllQna();
  if (!Array.isArray(all[roseId])) all[roseId] = [];

  all[roseId].unshift({
    id: Date.now(),                        // уникальный ID для каждого вопроса
    author: (author || 'Гость').trim(),
    text: text.trim(),
    date: new Date().toLocaleDateString('ru-RU', {
      day: 'numeric', month: 'long', year: 'numeric'
    }),
    likes: 0,
    replies: []                            // массив ответов внутри вопроса
  });

  saveAllQna(all);
}

/**
 * Добавить ответ на конкретный вопрос
 * @param {string} roseId
 * @param {number} questionId
 * @param {string} text
 * @param {string} author
 */
function addReply(roseId, questionId, text, author) {
  const all = getAllQna();
  if (!Array.isArray(all[roseId])) return;

  const question = all[roseId].find(q => q.id === questionId);
  if (!question) return;

  // Уникальный id ответа — устойчив к удалению соседей
  const replyId = 'r_' + Date.now().toString(36) + '_' +
                  Math.random().toString(36).slice(2, 8);

  question.replies.push({
    id: replyId,
    author: (author || 'Гость').trim(),
    text: text.trim(),
    date: new Date().toLocaleDateString('ru-RU', {
      day: 'numeric', month: 'long', year: 'numeric'
    })
  });

  saveAllQna(all);
}

/**
 * Обновить счётчик "полезно" для вопроса
 */
function updateQuestionLikes(roseId, questionId, newCount) {
  const all = getAllQna();
  if (!Array.isArray(all[roseId])) return;
  const q = all[roseId].find(item => item.id === questionId);
  if (q) {
    q.likes = newCount;
    saveAllQna(all);
  }
}
/* =========================================================
   Одноразовая миграция: проставляем id всем старым ответам.
   Идемпотентно — если id уже есть, ничего не делает.
   ========================================================= */
(function ensureReplyIds() {
  try {
    const all = getAllQna();
    let changed = false;

    Object.values(all).forEach(list => {
      (list || []).forEach(q => {
        (q.replies || []).forEach(r => {
          if (!r.id) {
            r.id = 'r_' + Date.now().toString(36) + '_' +
                   Math.random().toString(36).slice(2, 8);
            changed = true;
          }
        });
      });
    });

    if (changed) {
      saveAllQna(all);
      console.log('qna.js: проставлены id для старых ответов');
    }
  } catch (e) {
    console.warn('qna.js: не удалось выполнить миграцию id ответов', e);
  }
})();