(() => {
  'use strict';

  // ---------- Что можно поправить ----------
  // Подпись внизу страницы
  const SENDER = 'Саня';

  // Пожелания. Их ровно 18, по одному на шарик. {name} заменяется на имя.
  const WISHES = [
    'С днём рождения, {name}! Тебе 18, и это официально круто.',
    'Пусть каждое утро начинается с мысли, что день будет хорошим.',
    'Пусть рядом всегда будут люди, с которыми можно и поболтать, и помолчать.',
    'Не бойся пробовать новое. Страшно только первые пять минут.',
    'Пусть деньги регулярно находятся в карманах старых курток.',
    'Пусть всё задуманное получается с первого раза. Или хотя бы со второго.',
    'Желаю смеяться так, чтобы болел живот.',
    'Пусть экзамены, дедлайны и очереди обходят тебя стороной.',
    'Пусть у тебя всегда будет место, где спокойно и можно быть собой.',
    'Желаю много поездок и ещё больше фотографий, которые не стыдно показать.',
    'Пусть сил хватает и на дела, и на мечты.',
    'Сколько бы лет ни прибавлялось, оставайся собой.',
    'Пусть в холодильнике всегда найдётся что-то вкусное.',
    'Пусть тебя ценят ровно так, как ты этого заслуживаешь. То есть очень.',
    'Желаю высыпаться. Хотя бы иногда.',
    'Пусть плохие дни заканчиваются быстро, а хорошие тянутся долго.',
    'Теперь можно официально делать глупости. Но, пожалуйста, с умом.',
    'И главное: ты — подарок для всех, кто рядом. Просто знай это.'
  ];
  // Имя можно подставить через адрес: ...?name=Аня
  const DEFAULT_NAME = 'зайка';
  // -----------------------------------------

  const TOTAL = WISHES.length;
  const COLORS = ['#FF7F72', '#FFD45E', '#6FDCB2', '#B5A0FF', '#FF9CC8'];
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  const params = new URLSearchParams(window.location.search);
  const name = (params.get('name') || '').trim().slice(0, 30) || DEFAULT_NAME;
  const wishes = WISHES.map((w) => w.replaceAll('{name}', name));

  document.title = `С 18-летием, ${name}!`;
  document.querySelectorAll('[data-name]').forEach((el) => { el.textContent = name; });
  document.querySelectorAll('[data-sender]').forEach((el) => { el.textContent = SENDER; });

  const $ = (id) => document.getElementById(id);
  const field = $('field');
  const countEl = $('count');
  const meter = $('meter');
  const meterFill = $('meter-fill');
  const wishEl = $('wish');
  const wishText = $('wish-text');
  const finale = $('finale');
  const cake = $('cake');
  const candleBtn = $('candle');
  const finalMsg = $('final-msg');
  const soundBtn = $('sound');
  const age = $('age');
  const canvas = $('confetti');

  let popped = 0;
  let soundOn = true;

  // ---------- Заячьи уши ----------
  function wiggle() {
    if (reduceMotion.matches) return;
    age.classList.remove('wiggle');
    void age.offsetWidth;
    age.classList.add('wiggle');
  }
  age.addEventListener('click', wiggle);
  age.addEventListener('animationend', () => age.classList.remove('wiggle'));
  window.setTimeout(wiggle, 700);

  // ---------- Звук ----------
  let audio;
  function popSound() {
    if (!soundOn) return;
    try {
      audio = audio || new (window.AudioContext || window.webkitAudioContext)();
      const length = Math.floor(audio.sampleRate * 0.08);
      const buffer = audio.createBuffer(1, length, audio.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < length; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, 3);
      }
      const source = audio.createBufferSource();
      const gain = audio.createGain();
      gain.gain.value = 0.25;
      source.buffer = buffer;
      source.connect(gain).connect(audio.destination);
      source.start();
    } catch (err) {
      /* звук не критичен */
    }
  }

  soundBtn.addEventListener('click', () => {
    soundOn = !soundOn;
    soundBtn.setAttribute('aria-pressed', String(soundOn));
    soundBtn.textContent = soundOn ? 'Звук включён' : 'Звук выключен';
  });

  // ---------- Шарики ----------
  const balloons = [];
  const rand = (min, max) => min + Math.random() * (max - min);

  for (let i = 0; i < TOTAL; i++) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'balloon';
    b.setAttribute('aria-label', `Шарик ${i + 1} из ${TOTAL}. Лопнуть`);
    b.style.setProperty('--c', COLORS[(i * 2 + Math.floor(i / 5)) % COLORS.length]);
    b.style.setProperty('--dx', `${rand(-0.5, 0.5).toFixed(2)}rem`);
    b.style.setProperty('--dy', `${rand(0, 0.9).toFixed(2)}rem`);
    b.style.setProperty('--dur', `${rand(4, 7).toFixed(1)}s`);
    b.style.setProperty('--delay', `-${rand(0, 5).toFixed(1)}s`);
    b.addEventListener('click', (e) => pop(b, e.detail === 0));
    field.appendChild(b);
    balloons.push(b);
  }

  function burst(x, y, color) {
    if (reduceMotion.matches) return;
    for (let i = 0; i < 14; i++) {
      const s = document.createElement('span');
      const size = rand(5, 11);
      s.className = 'shard';
      s.style.cssText = `left:${x}px;top:${y}px;width:${size}px;height:${size}px;background:${color}`;
      document.body.appendChild(s);
      const angle = rand(0, Math.PI * 2);
      const dist = rand(40, 95);
      const dx = Math.cos(angle) * dist;
      const dy = Math.sin(angle) * dist;
      s.animate(
        [
          { transform: 'translate(-50%, -50%) scale(1)', opacity: 1 },
          { transform: `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px)) scale(.3)`, opacity: 0 }
        ],
        { duration: rand(450, 700), easing: 'cubic-bezier(.2,.7,.3,1)' }
      ).onfinish = () => s.remove();
    }
  }

  function showWish(text, color) {
    wishEl.style.setProperty('--wish-bg', color);
    wishText.textContent = text;
    if (!reduceMotion.matches) {
      wishEl.classList.remove('swap');
      void wishEl.offsetWidth;
      wishEl.classList.add('swap');
    }
  }

  function pop(b, viaKeyboard) {
    if (b.classList.contains('is-popped')) return;

    const rect = b.getBoundingClientRect();
    const color = b.style.getPropertyValue('--c');
    burst(rect.left + rect.width / 2, rect.top + rect.height / 2, color);
    popSound();
    b.classList.add('is-popped');

    if (viaKeyboard) {
      const start = balloons.indexOf(b);
      const next = balloons.slice(start + 1).concat(balloons.slice(0, start))
        .find((x) => !x.classList.contains('is-popped'));
      if (next) next.focus();
    }

    showWish(wishes[popped], color);
    popped += 1;
    countEl.textContent = popped;
    meter.setAttribute('aria-valuenow', popped);
    meterFill.style.width = `${(popped / TOTAL) * 100}%`;

    if (popped === TOTAL) {
      window.setTimeout(showFinale, reduceMotion.matches ? 0 : 700);
    }
  }

  // ---------- Финал ----------
  const list = $('all-wishes');
  wishes.forEach((w) => {
    const li = document.createElement('li');
    li.textContent = w;
    list.appendChild(li);
  });

  function showFinale() {
    field.hidden = true;
    finale.hidden = false;
    finale.scrollIntoView({ behavior: reduceMotion.matches ? 'auto' : 'smooth', block: 'center' });
    confetti();
    candleBtn.focus({ preventScroll: true });
  }

  let lit = true;
  candleBtn.addEventListener('click', () => {
    lit = !lit;
    cake.classList.toggle('is-out', !lit);
    candleBtn.textContent = lit ? 'Задуть свечу' : 'Зажечь снова';
    if (lit) {
      finalMsg.hidden = true;
      return;
    }
    finalMsg.textContent = `Свеча задута. Пусть желание сбудется! С 18-летием, ${name}!`;
    finalMsg.hidden = false;
    popSound();
    confetti();
  });

  // ---------- Конфетти ----------
  let rafId = 0;
  function confetti() {
    if (reduceMotion.matches) return;
    cancelAnimationFrame(rafId);

    const ctx = canvas.getContext('2d');
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = window.innerWidth;
    const h = window.innerHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const pieces = Array.from({ length: 160 }, () => ({
      x: w * rand(0.2, 0.8),
      y: h * 0.4,
      vx: rand(-7, 7),
      vy: rand(-16, -6),
      w: rand(6, 12),
      h: rand(8, 16),
      r: rand(0, 6),
      vr: rand(-0.15, 0.15),
      c: COLORS[Math.floor(Math.random() * COLORS.length)]
    }));

    const t0 = performance.now();
    function frame(t) {
      ctx.clearRect(0, 0, w, h);
      let alive = 0;
      for (const p of pieces) {
        p.vy += 0.35;
        p.vx *= 0.99;
        p.x += p.vx;
        p.y += p.vy;
        p.r += p.vr;
        if (p.y < h + 30) alive += 1;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.r);
        ctx.fillStyle = p.c;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
      }
      if (alive && t - t0 < 5000) {
        rafId = requestAnimationFrame(frame);
      } else {
        ctx.clearRect(0, 0, w, h);
      }
    }
    rafId = requestAnimationFrame(frame);
  }
})();
