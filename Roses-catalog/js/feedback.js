// /* =========================================================
//    feedback.js — голосование «полезно / не полезно»
//    Ключ в localStorage: roses-feedback
//    Формат: { "<key>": { good, bad, userVote } }
//    ========================================================= */
// (function () {
//   const STORAGE_KEY = 'roses-feedback';
//   const QNA_KEY = 'roses-catalog-qna'; // ← как в qna.js

//   function readAll() {
//     try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}; }
//     catch (e) {
//       console.warn('feedback.js: повреждённые данные, сброс.');
//       localStorage.removeItem(STORAGE_KEY);
//       return {};
//     }
//   }
//   function writeAll(d) { localStorage.setItem(STORAGE_KEY, JSON.stringify(d)); }
//   function get(key) {
//     const all = readAll();
//     return all[key] || { good: 0, bad: 0, userVote: null };
//   }
//   function vote(key, choice) {
//     const all = readAll();
//     const cur = all[key] || { good: 0, bad: 0, userVote: null };

//     if (cur.userVote === choice) {
//       cur[choice] = Math.max(0, cur[choice] - 1);
//       cur.userVote = null;
//     } else {
//       if (cur.userVote) cur[cur.userVote] = Math.max(0, cur[cur.userVote] - 1);
//       cur[choice] = (cur[choice] || 0) + 1;
//       cur.userVote = choice;
//     }
//     all[key] = cur;
//     writeAll(all);
//     return cur;
//   }

//   /* Миграция старых ключей «...:r<index>» → «...:r<replyId>» */
//   function migrateLegacyKeys() {
//     const all = readAll();
//     const legacyRe = /^(.+):q(\d+):r(\d+)$/;
//     const roses = new Set();
//     Object.keys(all).forEach(k => {
//       const m = k.match(legacyRe);
//       if (m) roses.add(m[1]);
//     });
//     if (!roses.size) return;

//     let qna = {};
//     try { qna = JSON.parse(localStorage.getItem(QNA_KEY)) || {}; }
//     catch (_) { return; }

//     let changed = false;
//     roses.forEach(roseId => {
//       (qna[roseId] || []).forEach(q => {
//         (q.replies || []).forEach((reply, idx) => {
//           if (!reply.id) return;
//           const oldKey = `${roseId}:q${q.id}:r${idx}`;
//           const newKey = `${roseId}:q${q.id}:r${reply.id}`;
//           if (oldKey === newKey || !all[oldKey]) return;
//           if (!all[newKey]) all[newKey] = all[oldKey];
//           delete all[oldKey];
//           changed = true;
//         });
//       });
//     });
//     if (changed) writeAll(all);
//   }

//   function html(key, opts = {}) {
//     const { title = 'Был ли этот ответ полезен?', block = false } = opts;
//     const data = get(key);
//     const good = data.good || 0;
//     const bad = data.bad || 0;
//     const cls = `answer-feedback${block ? ' answer-feedback--block' : ''}`;

//     return `
//       <div class="${cls}" data-feedback-key="${key}">
//         <span class="answer-feedback__title">${title}</span>
//         <div class="answer-feedback__buttons">
//           <button type="button"
//                   class="feedback-btn ${data.userVote === 'good' ? 'is-active' : ''}"
//                   data-feedback-btn="good"
//                   aria-pressed="${data.userVote === 'good'}"
//                   aria-label="Хороший ответ">
//             <span class="feedback-btn__icon" aria-hidden="true">👍</span>
//             <span class="feedback-btn__label">Хороший ответ</span>
//             <span class="feedback-btn__count" data-feedback-count>${good}</span>
//           </button>
//           <button type="button"
//                   class="feedback-btn ${data.userVote === 'bad' ? 'is-active' : ''}"
//                   data-feedback-btn="bad"
//                   aria-pressed="${data.userVote === 'bad'}"
//                   aria-label="Плохой ответ">
//             <span class="feedback-btn__icon" aria-hidden="true">👎</span>
//             <span class="feedback-btn__label">Плохой ответ</span>
//             <span class="feedback-btn__count" data-feedback-count>${bad}</span>
//           </button>
//         </div>
//         <span class="feedback-message" data-feedback-message aria-live="polite"></span>
//       </div>
//     `;
//   }

//   function attach(root = document) {
//     root.querySelectorAll('.answer-feedback[data-feedback-key]').forEach(block => {
//       if (block.dataset.feedbackBound === '1') return;
//       block.dataset.feedbackBound = '1';
//       const key = block.dataset.feedbackKey;

//       block.querySelectorAll('[data-feedback-btn]').forEach(btn => {
//         btn.addEventListener('click', () => {
//           const choice = btn.dataset.feedbackBtn;
//           const data = vote(key, choice);

//           block.querySelectorAll('[data-feedback-btn]').forEach(b => {
//             const c = b.dataset.feedbackBtn;
//             const active = data.userVote === c;
//             b.classList.toggle('is-active', active);
//             b.setAttribute('aria-pressed', String(active));
//             const counter = b.querySelector('[data-feedback-count]');
//             if (counter) counter.textContent = data[c] || 0;
//           });

//           const msg = block.querySelector('[data-feedback-message]');
//           if (msg) {
//             if (data.userVote === 'good') {
//               msg.textContent = 'Спасибо! Рады, что ответ оказался полезным 🌹';
//             } else if (data.userVote === 'bad') {
//               msg.textContent = 'Спасибо за обратную связь! Мы постараемся ответить лучше.';
//             } else {
//               msg.textContent = '';
//             }
//           }
//         });
//       });
//     });
//   }

//   document.addEventListener('DOMContentLoaded', migrateLegacyKeys);

//   window.RoseFeedback = { get, vote, html, attach };
// })();