/* Phone hero animation */
(function () {
  const stage = document.getElementById('phoneStage');
  if (!stage) return;

  const messagesEl = stage.querySelector('#messages, .messages, .chat-messages');
  const cards = Array.from(stage.querySelectorAll('[data-card]'));
  const input = stage.querySelector('#chatInput, .chat-input-field, .chat-input input');
  const sendButton = stage.querySelector('#sendButton, .chat-send-btn, .send-button');
  const titleEl = stage.querySelector('.header-title, .chat-header-title');
  const statusEl = stage.querySelector('.header-status, .chat-header-status');
  const dayLabelEl = stage.querySelector('.day-label, .chat-day-label');

  if (!messagesEl || !input || !sendButton) return;

  const cardCopy = [
    'Отвечает пациентам без ожидания.',
    'Подсказывает по лечению и стоимости.',
  ];

  stage.querySelectorAll('.card-text').forEach((cardText, index) => {
    if (cardCopy[index]) {
      cardText.textContent = cardCopy[index];
    }
  });

  if (titleEl) {
    titleEl.textContent = 'Ассистент клиники';
  }

  if (statusEl) {
    statusEl.innerHTML = '<span class="status-dot"></span>online · отвечает сразу';
  }

  if (dayLabelEl) {
    dayLabelEl.textContent = 'Сегодня';
  }

  input.placeholder = 'Напишите вопрос...';
  input.setAttribute('aria-label', 'Вопрос');
  sendButton.setAttribute('aria-label', 'Отправить');

  const dialogues = [
    [
      { role: 'bot', text: 'Здравствуйте! Я ассистент клиники. Подскажу по имплантации и помогу с записью.' },
      { role: 'user', text: 'Здравствуйте. Имплантация — это больно?' },
      { role: 'bot', text: 'Процедура проходит под анестезией. Во время установки пациент обычно чувствует давление, но не боль.' },
      { role: 'user', text: 'А сколько времени занимает установка одного импланта?' },
      { role: 'bot', text: 'В среднем 20–40 минут. Точное время зависит от состояния кости и плана лечения.' },
      { role: 'bot', text: 'Лучше начать с консультации и 3D-снимка — врач оценит ситуацию и предложит безопасный план.' },
      { role: 'user', text: 'Можно узнать стоимость?' },
      { role: 'bot', text: 'Да. Стоимость зависит от системы имплантов и объёма лечения. Могу помочь подобрать удобное время для консультации.' },
    ],
    [
      { role: 'bot', text: 'Здравствуйте! Я помогу разобраться с лечением и записью в клинику.' },
      { role: 'user', text: 'Мне нужно восстановить зуб. Не понимаю, коронка или имплант.' },
      { role: 'bot', text: 'Если корень зуба сохранён, врач может рассмотреть коронку. Если зуб утрачен полностью, чаще обсуждают имплантацию.' },
      { role: 'user', text: 'А можно поставить имплант сразу после удаления?' },
      { role: 'bot', text: 'Иногда можно, но решение принимает врач после осмотра и 3D-диагностики.' },
      { role: 'bot', text: 'Я могу записать вас на консультацию, чтобы врач оценил снимок и предложил план лечения.' },
    ],
  ];

  const quickReplies = [
    'Понял вопрос. Лучше начать с консультации и 3D-диагностики, чтобы врач оценил ситуацию точно.',
    'Да, подскажу. Окончательный вариант лечения врач определит после осмотра и снимка.',
    'Обычно план зависит от состояния зуба, кости и количества единиц, которые нужно восстановить.',
  ];

  const selectedDialogue = dialogues[Math.floor(Math.random() * dialogues.length)];

  function wait(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  function getTime() {
    return `12:${String(Math.floor(10 + Math.random() * 49)).padStart(2, '0')}`;
  }

  function scrollMessagesToBottom() {
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  function createMessageShell(role) {
    const message = document.createElement('div');
    message.className = `message ${role}`;

    const bubble = document.createElement('div');
    bubble.className = 'bubble';

    const textSpan = document.createElement('span');
    textSpan.className = 'message-text';

    const timeSpan = document.createElement('span');
    timeSpan.className = 'message-time';
    timeSpan.textContent = getTime();

    bubble.appendChild(textSpan);
    bubble.appendChild(timeSpan);
    message.appendChild(bubble);
    messagesEl.appendChild(message);
    scrollMessagesToBottom();

    return textSpan;
  }

  function addMessageInstant(message) {
    const textSpan = createMessageShell(message.role);
    textSpan.textContent = message.text;
    scrollMessagesToBottom();
  }

  async function addMessageStream(message) {
    const textSpan = createMessageShell(message.role);

    for (let index = 0; index < message.text.length; index += 1) {
      const char = message.text[index];
      textSpan.textContent += char;
      scrollMessagesToBottom();

      let delay = 22;
      if (char === '.' || char === '!' || char === '?') delay = 170;
      else if (char === ',' || char === '—' || char === ':') delay = 80;
      else if (char === ' ') delay = 10;

      await wait(delay);
    }
  }

  function showTyping() {
    hideTyping();
    const typing = document.createElement('div');
    typing.className = 'typing';
    typing.id = 'typing';
    typing.innerHTML = '<span></span><span></span><span></span>';
    messagesEl.appendChild(typing);
    scrollMessagesToBottom();
  }

  function hideTyping() {
    const typing = stage.querySelector('#typing');
    if (typing) typing.remove();
  }

  function revealCard(index) {
    if (cards[index]) {
      cards[index].classList.add('is-visible');
    }
  }

  async function runDialogue() {
    await wait(700);

    for (let index = 0; index < selectedDialogue.length; index += 1) {
      const message = selectedDialogue[index];

      if (message.role === 'bot') {
        showTyping();
        await wait(600 + Math.random() * 300);
        hideTyping();
        await addMessageStream(message);
      } else {
        await wait(520);
        addMessageInstant(message);
      }

      if (index === 1) revealCard(0);
      if (index === 4) revealCard(1);

      await wait(650);
    }
  }

  async function sendManualMessage() {
    const text = input.value.trim();
    if (!text) return;

    addMessageInstant({ role: 'user', text });
    input.value = '';

    await wait(450);
    showTyping();
    await wait(700);
    hideTyping();
    await addMessageStream({
      role: 'bot',
      text: quickReplies[Math.floor(Math.random() * quickReplies.length)],
    });
  }

  sendButton.addEventListener('click', sendManualMessage);
  input.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      sendManualMessage();
    }
  });

  runDialogue();
}());
