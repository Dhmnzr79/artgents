const heroChat = document.getElementById('heroChat');

const heroCards = [
  document.getElementById('heroCard1'),
  document.getElementById('heroCard2'),
  document.getElementById('heroCard3')
];

const heroScenario = [
  {
    role: 'bot',
    label: 'ИИ-консультант',
    text: 'Добрый день! Помогу разобраться с услугами, ценами и записью. Спрашивайте — отвечу по материалам клиники.',
    after: 450
  },
  {
    role: 'client',
    label: 'Пациент',
    text: 'Сколько стоит имплант? И больно ли это?',
    after: 420
  },
  {
    role: 'bot',
    label: 'ИИ-консультант',
    text: 'Имплантация — от 45 000 ₽ за имплант. Итоговая стоимость зависит от выбранной системы — врач уточнит на бесплатной консультации.',
    after: 520,
    card: 0
  },
  {
    role: 'bot',
    label: 'ИИ-консультант',
    text: 'По ощущениям: процедура под местной анестезией. Большинство пациентов описывают её как менее неприятную, чем удаление зуба.',
    after: 650,
    card: 1
  },
  {
    role: 'client',
    label: 'Пациент',
    text: 'А что если имплант не приживётся?',
    after: 430
  },
  {
    role: 'bot',
    label: 'ИИ-консультант',
    text: 'Такой вопрос лучше обсудить на консультации: врач оценит риски и объяснит гарантийные условия клиники. Я могу передать администратору ваш вопрос с историей диалога.',
    after: 760,
    card: 2
  }
];

const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

function createHeroMessage({ role, label }) {
  const message = document.createElement('div');
  message.className = `message ${role}`;

  const labelEl = document.createElement('div');
  labelEl.className = 'msg-label';
  labelEl.textContent = label;

  const bubble = document.createElement('div');
  bubble.className = 'bubble';

  message.appendChild(labelEl);
  message.appendChild(bubble);
  heroChat.appendChild(message);
  heroChat.scrollTop = heroChat.scrollHeight;

  return bubble;
}

async function showTyping() {
  const bubble = createHeroMessage({
    role: 'bot',
    label: 'ИИ-консультант'
  });

  bubble.innerHTML = '<span class="typing"><i></i><i></i><i></i></span>';

  await wait(560);

  bubble.parentElement.remove();
}

async function streamText(bubble, text, role) {
  bubble.innerHTML = '';

  const textNode = document.createElement('span');
  const cursor = document.createElement('span');

  cursor.className = 'cursor';

  bubble.appendChild(textNode);
  bubble.appendChild(cursor);

  let current = '';

  for (let i = 0; i < text.length; i++) {
    current += text[i];
    textNode.textContent = current;
    heroChat.scrollTop = heroChat.scrollHeight;

    const char = text[i];

    const delay =
      char === '.' || char === '?' || char === '!'
        ? 115
        : char === ',' || char === '—'
          ? 58
          : role === 'bot'
            ? 18
            : 13;

    await wait(delay);
  }

  cursor.remove();
}

let heroToken = 0;

async function playHero() {
  heroToken++;

  const token = heroToken;

  heroChat.innerHTML = '';
  heroCards.forEach(card => card.classList.remove('show'));

  await wait(350);

  for (const item of heroScenario) {
    if (token !== heroToken) return;

    if (item.role === 'bot') {
      await showTyping();
    }

    if (token !== heroToken) return;

    const bubble = createHeroMessage(item);

    await streamText(bubble, item.text, item.role);

    if (typeof item.card === 'number') {
      heroCards[item.card].classList.add('show');
    }

    await wait(item.after);
  }

  if (token === heroToken) {
    await wait(2200);
    playHero();
  }
}

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, {
  threshold: 0.14
});

document.querySelectorAll('.fade-up').forEach(el => {
  revealObserver.observe(el);
});

const compareBlock = document.getElementById('compareBlock');

const compareObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      setTimeout(() => {
        document.querySelectorAll('.pin').forEach((pin, index) => {
          setTimeout(() => {
            pin.classList.add('show');
          }, index * 260);
        });
      }, 300);

      compareObserver.unobserve(entry.target);
    }
  });
}, {
  threshold: 0.35
});

if (compareBlock) {
  compareObserver.observe(compareBlock);
}

playHero();
