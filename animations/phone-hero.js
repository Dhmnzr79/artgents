/* ── PHONE HERO ANIMATION ───────────────────────────────────
   Self-contained IIFE. Expects #phoneStage in the DOM.
   ─────────────────────────────────────────────────────────── */
(function () {
  const stage = document.getElementById('phoneStage');
  if (!stage) return;

  const messagesEl = stage.querySelector('.chat-messages');
  const cards      = stage.querySelectorAll('[data-card]');
  const input      = stage.querySelector('.chat-input-field');
  const sendBtn    = stage.querySelector('.chat-send-btn');

  /* ── Dialogues ────────────────────────────────────────── */
  const dialogues = [
    [
      { role: 'bot',  text: 'Здравствуйте! Я ассистент клиники. Подскажу по имплантации и помогу с записью.' },
      { role: 'user', text: 'Здравствуйте. Имплантация — это больно?' },
      { role: 'bot',  text: 'Процедура проходит под анестезией. Во время установки пациент обычно чувствует давление, но не боль.' },
      { role: 'user', text: 'А сколько времени занимает установка одного импланта?' },
      { role: 'bot',  text: 'В среднем 20–40 минут. Точное время зависит от состояния кости и плана лечения.' },
      { role: 'bot',  text: 'Лучше начать с консультации и 3D-снимка — врач оценит ситуацию и предложит безопасный план.' },
      { role: 'user', text: 'Можно узнать стоимость?' },
      { role: 'bot',  text: 'Да. Стоимость зависит от системы имплантов и объёма лечения. Могу помочь подобрать удобное время для консультации.' }
    ],
    [
      { role: 'bot',  text: 'Здравствуйте! Я помогу разобраться с лечением и записью в клинику.' },
      { role: 'user', text: 'Мне нужно восстановить зуб. Не понимаю, коронка или имплант.' },
      { role: 'bot',  text: 'Если корень зуба сохранён, врач может рассмотреть коронку. Если зуб утрачен полностью, чаще обсуждают имплантацию.' },
      { role: 'user', text: 'А можно поставить имплант сразу после удаления?' },
      { role: 'bot',  text: 'Иногда можно, но решение принимает врач после осмотра и 3D-диагностики.' },
      { role: 'bot',  text: 'Я могу записать вас на консультацию, чтобы врач оценил снимок и предложил план лечения.' }
    ]
  ];

  const quickReplies = [
    'Понял вопрос. В такой ситуации лучше начать с консультации и диагностики.',
    'Да, подскажу. Точный вариант лечения врач сможет определить после осмотра.',
    'Обычно план лечения зависит от снимка, состояния кости и количества зубов, которые нужно восстановить.'
  ];

  const dialogue = dialogues[Math.floor(Math.random() * dialogues.length)];

  /* ── Helpers ──────────────────────────────────────────── */
  function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  function getTime() {
    return '12:' + String(Math.floor(10 + Math.random() * 49)).padStart(2, '0');
  }

  function scrollToBottom() {
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  /* ── Message builders ─────────────────────────────────── */
  function createMessageShell(role) {
    const msg = document.createElement('div');
    msg.className = 'chat-message ' + role;

    const bubble = document.createElement('div');
    bubble.className = 'chat-bubble';

    const textSpan = document.createElement('span');
    textSpan.className = 'chat-message-text';

    const timeSpan = document.createElement('span');
    timeSpan.className = 'chat-message-time';
    timeSpan.textContent = getTime();

    bubble.appendChild(textSpan);
    bubble.appendChild(timeSpan);
    msg.appendChild(bubble);
    messagesEl.appendChild(msg);
    scrollToBottom();

    return textSpan;
  }

  function addInstant({ role, text }) {
    const span = createMessageShell(role);
    span.textContent = text;
    scrollToBottom();
  }

  async function addStream({ role, text }) {
    const span = createMessageShell(role);

    for (let i = 0; i < text.length; i++) {
      span.textContent += text[i];
      scrollToBottom();

      const ch = text[i];
      let delay = 22;
      if (ch === '.' || ch === '!' || ch === '?') delay = 170;
      else if (ch === ',' || ch === '—' || ch === ':') delay = 80;
      else if (ch === ' ') delay = 10;

      await wait(delay);
    }
  }

  /* ── Typing indicator ─────────────────────────────────── */
  function showTyping() {
    hideTyping();
    const el = document.createElement('div');
    el.className = 'chat-typing';
    el.id = 'chatTyping';
    el.innerHTML = '<span></span><span></span><span></span>';
    messagesEl.appendChild(el);
    scrollToBottom();
  }

  function hideTyping() {
    const el = stage.querySelector('#chatTyping');
    if (el) el.remove();
  }

  /* ── Card reveal ──────────────────────────────────────── */
  function revealCard(index) {
    if (cards[index]) cards[index].classList.add('is-visible');
  }

  /* ── Auto dialogue ────────────────────────────────────── */
  async function runDialogue() {
    await wait(700);

    for (let i = 0; i < dialogue.length; i++) {
      const msg = dialogue[i];

      if (msg.role === 'bot') {
        showTyping();
        await wait(600 + Math.random() * 300);
        hideTyping();
        await addStream(msg);
      } else {
        await wait(520);
        addInstant(msg);
      }

      if (i === 1) revealCard(0);
      if (i === 3) revealCard(1);
      if (i === 5) revealCard(2);

      await wait(650);
    }
  }

  /* ── Manual send ──────────────────────────────────────── */
  async function sendManualMessage() {
    const text = input.value.trim();
    if (!text) return;

    addInstant({ role: 'user', text });
    input.value = '';

    await wait(450);
    showTyping();
    await wait(700);
    hideTyping();
    await addStream({
      role: 'bot',
      text: quickReplies[Math.floor(Math.random() * quickReplies.length)]
    });
  }

  sendBtn.addEventListener('click', sendManualMessage);
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') sendManualMessage();
  });

  runDialogue();
}());
