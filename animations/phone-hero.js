/* Phone hero animation */
(function () {
  const stage = document.getElementById('phoneStage');
  if (!stage) return;

  const messagesEl = stage.querySelector('#messages, .messages, .chat-messages');
  const input = stage.querySelector('#chatInput, .chat-input-field, .chat-input input');
  const sendButton = stage.querySelector('#sendButton, .chat-send-btn, .send-button');
  const titleEl = stage.querySelector('.header-title, .chat-header-title');
  const statusEl = stage.querySelector('.header-status, .chat-header-status');
  const dayLabelEl = stage.querySelector('.day-label, .chat-day-label');

  if (!messagesEl || !input || !sendButton) return;

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
      { role: 'bot', text: 'Здравствуйте! Я ассистент клиники. Подскажу по услугам, стоимости и помогу с записью.' },
      { role: 'user', text: 'Здравствуйте. Хочу понять, как проходит процедура и сколько занимает восстановление.' },
      { role: 'bot', text: 'Это зависит от направления и вашей ситуации. Обычно сначала проводят консультацию, после которой специалист объясняет этапы, сроки и рекомендации.' },
      { role: 'user', text: 'А стоимость можно узнать заранее?' },
      { role: 'bot', text: 'Да. Стоимость зависит от задачи, объёма и выбранного плана. Могу помочь подобрать удобное время для консультации.' },
    ],
    [
      { role: 'bot', text: 'Здравствуйте! Я помогу разобраться с услугами и записью в клинику.' },
      { role: 'user', text: 'Не понимаю, какая процедура мне подойдёт.' },
      { role: 'bot', text: 'Можно начать с консультации профильного специалиста. Он оценит ситуацию и предложит подходящий вариант без лишних процедур.' },
      { role: 'user', text: 'А результаты и сроки можно обсудить заранее?' },
      { role: 'bot', text: 'Да, на консультации обычно обсуждают ожидаемый результат, этапы и рекомендации.' },
      { role: 'bot', text: 'Если хотите, помогу подобрать удобное время для записи.' },
    ],
  ];

  const quickReplies = [
    'Понял вопрос. Лучше начать с консультации, чтобы специалист точно оценил ситуацию и предложил подходящий вариант.',
    'Да, подскажу. Окончательное решение обычно принимают после консультации и осмотра.',
    'Обычно план зависит от вашей задачи, исходной ситуации и рекомендаций специалиста.',
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
