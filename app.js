// ─── DATA ────────────────────────────────────────────────────────────────────

const TODAY_AYAHS = [
  { ar: "لَا يُكَلِّفُ اللَّهُ نَفْسًا إِلَّا وُسْعَهَا", ur: "اللہ کسی جان کو اس کی طاقت سے زیادہ تکلیف نہیں دیتا", ref: "Al-Baqarah 2:286" },
  { ar: "وَمَن يَتَّقِ اللَّهَ يَجْعَل لَّهُ مَخْرَجًا", ur: "جو اللہ سے ڈرے اللہ اس کے لیے راہ نکالتا ہے", ref: "At-Talaq 65:2" },
  { ar: "إِنَّ مَعَ الْعُسْرِ يُسْرًا", ur: "بے شک تکلیف کے ساتھ آسانی ہے", ref: "Ash-Sharh 94:6" },
  { ar: "وَإِذَا سَأَلَكَ عِبَادِي عَنِّي فَإِنِّي قَرِيبٌ", ur: "اور جب میرے بندے تم سے میرے بارے میں پوچھیں تو میں قریب ہوں", ref: "Al-Baqarah 2:186" },
  { ar: "حَسْبُنَا اللَّهُ وَنِعْمَ الْوَكِيلُ", ur: "ہمارے لیے اللہ کافی ہے اور وہ بہترین کارساز ہے", ref: "Al-Imran 3:173" },
  { ar: "رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً", ur: "اے ہمارے رب دنیا میں بھی بھلائی دے اور آخرت میں بھی", ref: "Al-Baqarah 2:201" },
  { ar: "اللَّهُ نُورُ السَّمَاوَاتِ وَالْأَرْضِ", ur: "اللہ آسمانوں اور زمین کا نور ہے", ref: "An-Nur 24:35" },
  { ar: "وَنَحْنُ أَقْرَبُ إِلَيْهِ مِنْ حَبْلِ الْوَرِيدِ", ur: "اور ہم اس کی شہ رگ سے بھی زیادہ قریب ہیں", ref: "Qaf 50:16" },
  { ar: "إِنَّ اللَّهَ مَعَ الصَّابِرِينَ", ur: "بے شک اللہ صبر کرنے والوں کے ساتھ ہے", ref: "Al-Baqarah 2:153" },
  { ar: "فَبِأَيِّ آلَاءِ رَبِّكُمَا تُكَذِّبَانِ", ur: "تو تم اپنے رب کی کن کن نعمتوں کو جھٹلاؤ گے", ref: "Ar-Rahman 55:13" },
];

const VOCAB_DATA = [
  { a: "اللَّهُ", u: "اللہ", count: 2699, cat: "core", fact: "The proper name of God — appears 2699 times" },
  { a: "رَبِّ", u: "رب / پالنہار", count: 972, cat: "core", fact: "Rabb — Lord, Sustainer, Nurturer" },
  { a: "رَحْمَن", u: "بڑا مہربان", count: 57, cat: "attributes", fact: "Rahman — unconditional mercy for all creation" },
  { a: "رَحِيم", u: "نہایت رحم والا", count: 115, cat: "attributes", fact: "Raheem — special ongoing mercy for believers" },
  { a: "يَوْم", u: "دن", count: 405, cat: "time", fact: "Often refers to Yaum al-Qiyamah (Day of Judgment)" },
  { a: "عَالَم", u: "جہان", count: 75, cat: "core", fact: "Al-'Aalameen — all worlds and all creation" },
  { a: "قُلْ", u: "کہو", count: 332, cat: "commands", fact: "Allah directly commands the Prophet ﷺ" },
  { a: "نَاس", u: "لوگ / انسان", count: 241, cat: "core", fact: "An-Nas — the last surah of the Quran is named after it" },
  { a: "حَمْد", u: "تعریف / شکر", count: 38, cat: "worship", fact: "Al-Hamd means perfect, complete praise" },
  { a: "صِرَاط", u: "راستہ", count: 45, cat: "guidance", fact: "We ask for the straight path 17 times every day in salah" },
  { a: "عِلْم", u: "علم / جاننا", count: 854, cat: "core", fact: "Knowledge is the most emphasized concept in the Quran" },
  { a: "صَبْر", u: "صبر", count: 90, cat: "character", fact: "Patience mentioned with reward more than 90 times" },
  { a: "شُكْر", u: "شکر / احسان", count: 75, cat: "worship", fact: "Gratitude is tied to increase in blessings" },
  { a: "نِعْمَة", u: "نعمت / رحمت", count: 136, cat: "blessings", fact: "Allah's blessings cannot be counted — Quran 14:34" },
  { a: "جَنَّة", u: "جنت", count: 147, cat: "afterlife", fact: "The most mentioned reward in the Quran" },
  { a: "نَار", u: "آگ / جہنم", count: 126, cat: "afterlife", fact: "Mentioned as a warning more than 100 times" },
  { a: "إِيمَان", u: "ایمان", count: 45, cat: "faith", fact: "Belief in the heart — root of all worship" },
  { a: "تَقْوَى", u: "تقوی / پرہیزگاری", count: 87, cat: "character", fact: "God-consciousness — the highest virtue in Islam" },
  { a: "دُعَاء", u: "دعا", count: 65, cat: "worship", fact: "Supplication — Allah says Call on Me and I answer" },
  { a: "صَلَاة", u: "نماز", count: 99, cat: "worship", fact: "Prayer — the pillar of Islam, mentioned 99 times" },
  { a: "زَكَاة", u: "زکوٰۃ", count: 32, cat: "worship", fact: "Charity — often paired with salah in Quranic commands" },
  { a: "كِتَاب", u: "کتاب", count: 261, cat: "core", fact: "The Book — refers to divine revelation including the Quran" },
  { a: "آيَة", u: "آیت / نشانی", count: 382, cat: "core", fact: "Ayah means both a Quranic verse and a sign from Allah" },
  { a: "حَقّ", u: "حق / سچ", count: 247, cat: "core", fact: "Truth and right — Allah is Al-Haqq (The Truth)" },
  { a: "نَفْس", u: "نفس / جان", count: 295, cat: "core", fact: "Soul and self — the Quran warns against its desires" },
  { a: "قَلْب", u: "دل", count: 132, cat: "core", fact: "Heart — the spiritual center of a person in Islam" },
  { a: "رَسُول", u: "رسول / پیغمبر", count: 236, cat: "prophethood", fact: "Messenger — Muhammad ﷺ is the final and last Rasool" },
  { a: "مَلَك", u: "فرشتہ", count: 88, cat: "unseen", fact: "Angels carry out Allah's commands in the universe" },
  { a: "جِنّ", u: "جن", count: 22, cat: "unseen", fact: "Unseen beings created from smokeless fire" },
  { a: "ذِكْر", u: "ذکر / یاد", count: 256, cat: "worship", fact: "Remembrance of Allah — hearts find peace in it (13:28)" },
];

const PLAN_STEPS = [
  { done: true,  text: "Learn Al-Fatiha with full Urdu meaning", sub: "7 ayaat — said 17 times daily in salah", num: 1 },
  { done: true,  text: "Understand Al-Ikhlas (Tawheed)", sub: "4 ayaat — equals 1/3 of Quran in reward", num: 112 },
  { done: false, text: "Read Al-Falaq & An-Nas", sub: "The two protection surahs — Al-Mu'awwidhatayn", num: 113 },
  { done: false, text: "Complete Juz Amma (last 37 surahs)", sub: "Short surahs you already recite in prayers", num: 78 },
  { done: false, text: "Start Al-Mulk (Surah 67)", sub: "30 ayaat — intercedes for the reader on Qiyamah", num: 67 },
  { done: false, text: "Read Surah Yasin (Surah 36)", sub: "Called the heart of the Quran", num: 36 },
];

// ─── STATE ────────────────────────────────────────────────────────────────────

const S = {
  surahs: [],
  currentSurahNum: null,
  currentAyaat: [],
  currentUrdu: [],
  currentEnglish: [],
  currentSurahInfo: null,
  expandedAyah: null,
  mode: 'both',
  memState: { num: null, ayaat: [], urdu: [], idx: 0, score: 0, revealed: false },
  vocabFilter: 'all',
  userWords: JSON.parse(localStorage.getItem('nq_words') || '{}'),
  journal: JSON.parse(localStorage.getItem('nq_journal') || '[]'),
  readCount: parseInt(localStorage.getItem('nq_read') || '0'),
  memCount: parseInt(localStorage.getItem('nq_memc') || '0'),
  streak: parseInt(localStorage.getItem('nq_streak') || '1'),
};

// ─── BOOT ─────────────────────────────────────────────────────────────────────

async function init() {
  document.getElementById('streak-num').textContent = S.streak;
  renderHome();
  renderVocab();
  renderJournal();
  await loadSurahList();
  populateSelects();
}

// ─── SURAH LIST ───────────────────────────────────────────────────────────────

async function loadSurahList() {
  try {
    const res = await fetch('https://api.alquran.cloud/v1/surah');
    const data = await res.json();
    S.surahs = data.data;
    renderSurahBrowser(S.surahs);
  } catch (e) {
    document.getElementById('surah-browser').innerHTML =
      '<div class="empty-state">⚠️ Could not load surah list.<br>Please check your internet connection.</div>';
  }
}

function populateSelects() {
  const opts = S.surahs.map(s =>
    `<option value="${s.number}">${s.number}. ${s.englishName} · ${s.name}</option>`
  ).join('');
  document.getElementById('read-surah-select').innerHTML = '<option value="">Select a surah...</option>' + opts;
  document.getElementById('mem-surah-select').innerHTML = '<option value="">Select surah to memorize...</option>' + opts;
}

// ─── HOME ─────────────────────────────────────────────────────────────────────

function renderHome() {
  const knownCount = VOCAB_DATA.filter(v => S.userWords[v.a] === true).length;
  document.getElementById('h-read').textContent = S.readCount;
  document.getElementById('h-words').textContent = knownCount;
  document.getElementById('h-mem').textContent = S.memCount;

  // Today's ayah (rotates by day of month)
  const ta = TODAY_AYAHS[new Date().getDate() % TODAY_AYAHS.length];
  document.getElementById('today-card').innerHTML = `
    <div class="today-lbl">${ta.ref}</div>
    <div class="today-ar">${ta.ar}</div>
    <div class="today-ur">${ta.ur}</div>
    <div style="display:flex;justify-content:flex-end;margin-top:.6rem;gap:6px">
      <button class="audio-btn" onclick="speakAr('${ta.ar.replace(/'/g, "\\'")}')">🔊 Listen</button>
      <button class="btn btn-outline" style="font-size:11px" onclick="addToJournal('${ta.ar.replace(/'/g, "\\'")}','${ta.ref}')">📓 Save</button>
    </div>`;

  // Plan list
  document.getElementById('plan-list').innerHTML = PLAN_STEPS.map((s, i) => `
    <div class="plan-item" onclick="openSurah(${s.num})">
      <div class="plan-dot ${s.done ? 'done' : 'todo'}">${s.done ? '✓' : i + 1}</div>
      <div style="flex:1">
        <div class="plan-text" style="color:${s.done ? 'var(--green2)' : 'var(--ink)'}">${s.text}</div>
        <div class="plan-sub">${s.sub}</div>
      </div>
      <div class="plan-arrow">→</div>
    </div>`).join('');
}

// ─── BROWSE ───────────────────────────────────────────────────────────────────

function renderSurahBrowser(list) {
  const el = document.getElementById('surah-browser');
  if (!list.length) {
    el.innerHTML = '<div class="empty-state">No surahs found matching your search.</div>';
    return;
  }
  el.innerHTML = list.map(s => `
    <div class="surah-item" onclick="openSurah(${s.number})">
      <div class="surah-num">${s.number}</div>
      <div style="flex:1">
        <div class="surah-name-en">${s.englishName} <span style="font-size:11px;color:var(--ink3)">· ${s.englishNameTranslation}</span></div>
        <div class="surah-meta">${s.numberOfAyahs} ayaat · ${s.revelationType}</div>
      </div>
      <div class="surah-ar">${s.name}</div>
    </div>`).join('');
}

function filterSurahs() {
  const q = document.getElementById('surah-search').value.toLowerCase();
  const filtered = S.surahs.filter(s =>
    s.englishName.toLowerCase().includes(q) ||
    s.name.includes(q) ||
    s.englishNameTranslation.toLowerCase().includes(q) ||
    String(s.number).includes(q)
  );
  renderSurahBrowser(filtered);
}

// ─── READ ─────────────────────────────────────────────────────────────────────

async function openSurah(num) {
  if (!num) return;
  showPage('read');
  document.getElementById('read-surah-select').value = num;
  S.currentSurahNum = parseInt(num);
  S.expandedAyah = null;

  const wrap = document.getElementById('ayah-list-wrap');
  wrap.innerHTML = '<div class="loading"><div class="spinner"></div><span>Loading surah...</span></div>';

  try {
    const [arRes, urRes, enRes] = await Promise.all([
      fetch(`https://api.alquran.cloud/v1/surah/${num}`),
      fetch(`https://api.alquran.cloud/v1/surah/${num}/ur.ahmedali`),
      fetch(`https://api.alquran.cloud/v1/surah/${num}/en.sahih`)
    ]);
    const [arD, urD, enD] = await Promise.all([arRes.json(), urRes.json(), enRes.json()]);

    S.currentAyaat = arD.data.ayahs;
    S.currentUrdu = urD.data.ayahs;
    S.currentEnglish = enD.data.ayahs;
    S.currentSurahInfo = arD.data;

    // Track reading progress
    S.readCount += S.currentAyaat.length;
    localStorage.setItem('nq_read', S.readCount);

    renderAyahs();
  } catch (e) {
    wrap.innerHTML = '<div class="empty-state">⚠️ Could not load surah.<br>Please check your internet connection.</div>';
  }
}

function renderAyahs() {
  const wrap = document.getElementById('ayah-list-wrap');
  const info = S.currentSurahInfo;
  if (!info) return;

  let html = `<div class="surah-header">
    <div class="surah-header-ar">${info.name}</div>
    <div class="surah-header-en">${info.englishName} · ${info.englishNameTranslation} · ${info.numberOfAyahs} ayaat · ${info.revelationType}</div>
    ${info.number !== 9 ? '<div class="surah-bismillah">بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ</div>' : ''}
  </div>`;

  html += S.currentAyaat.map((a, i) => {
    const isExp = S.expandedAyah === i;
    const ur = S.currentUrdu[i] ? S.currentUrdu[i].text : '';
    const en = S.currentEnglish[i] ? S.currentEnglish[i].text : '';
    const arSafe = a.text.replace(/'/g, "\\'");
    const refStr = `${info.englishName} ${info.number}:${a.numberInSurah}`;

    return `<div class="ayah-card${isExp ? ' selected' : ''}" onclick="toggleAyah(${i})">
      <div class="ayah-num">${a.numberInSurah}</div>
      <div class="ayah-ar">${a.text}</div>
      ${S.mode === 'both' && ur ? `<div class="ayah-ur">${ur}</div>` : ''}
      ${S.mode === 'ar_en' && en ? `<div class="ayah-en">${en}</div>` : ''}
      ${isExp ? `<div class="ayah-actions">
        <button class="btn" onclick="event.stopPropagation();speakAr('${arSafe}')">🔊 Listen</button>
        <button class="btn btn-outline" onclick="event.stopPropagation();addToJournal('${arSafe}','${refStr}')">📓 Save</button>
        ${S.mode !== 'both' && ur ? `<button class="btn btn-outline" onclick="event.stopPropagation();showUrduModal('${arSafe}','${ur.replace(/'/g, "\\'")}')">اردو معنی</button>` : ''}
        ${S.mode !== 'ar_en' && en ? `<button class="btn btn-outline" onclick="event.stopPropagation();showEnModal('${arSafe}','${en.replace(/'/g, "\\'")}')">English</button>` : ''}
      </div>` : ''}
    </div>`;
  }).join('');

  wrap.innerHTML = html;
}

function toggleAyah(i) {
  S.expandedAyah = S.expandedAyah === i ? null : i;
  renderAyahs();
}

function setMode(m, btn) {
  S.mode = m;
  document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  if (S.currentAyaat.length) renderAyahs();
}

function reciteAll() {
  if (!S.currentAyaat.length) return;
  window.speechSynthesis.cancel();
  const texts = S.currentAyaat.map(a => a.text);
  let idx = 0;
  function next() {
    if (idx >= texts.length) return;
    const u = new SpeechSynthesisUtterance(texts[idx++]);
    u.lang = 'ar-SA';
    u.rate = 0.65;
    u.onend = next;
    window.speechSynthesis.speak(u);
  }
  next();
}

// ─── MEMORIZE ────────────────────────────────────────────────────────────────

async function loadMemorizeSurah() {
  const num = document.getElementById('mem-surah-select').value;
  if (!num) return;

  const el = document.getElementById('mem-content');
  el.innerHTML = '<div class="loading"><div class="spinner"></div><span>Loading surah for hifz practice...</span></div>';

  try {
    const [arRes, urRes] = await Promise.all([
      fetch(`https://api.alquran.cloud/v1/surah/${num}`),
      fetch(`https://api.alquran.cloud/v1/surah/${num}/ur.ahmedali`)
    ]);
    const [arD, urD] = await Promise.all([arRes.json(), urRes.json()]);
    S.memState = {
      num,
      ayaat: arD.data.ayahs,
      urdu: urD.data.ayahs,
      idx: 0,
      score: 0,
      revealed: false
    };
    renderMemCard();
  } catch (e) {
    el.innerHTML = '<div class="empty-state">⚠️ Could not load surah. Check your connection.</div>';
  }
}

function renderMemCard() {
  const ms = S.memState;
  const total = ms.ayaat.length;
  const prog = total ? (ms.idx / total) * 100 : 0;
  document.getElementById('mem-bar').style.width = prog + '%';
  document.getElementById('mem-prog-label').textContent = total ? `${ms.idx} / ${total} ayaat` : '';

  const el = document.getElementById('mem-content');
  if (!total) {
    el.innerHTML = '<div class="empty-state">Select a surah above to begin.</div>';
    return;
  }

  if (ms.idx >= total) {
    S.memCount += total;
    localStorage.setItem('nq_memc', S.memCount);
    el.innerHTML = `<div class="mem-card">
      <div class="mem-complete">
        <div class="mem-complete-icon">🌟</div>
        <div class="mem-complete-title">Mashallah! Surah complete!</div>
        <div class="mem-complete-score">Score: ${ms.score} / ${total} — ${Math.round(ms.score/total*100)}%</div>
        <button class="btn btn-gold" onclick="S.memState.idx=0;S.memState.score=0;renderMemCard()">Restart surah</button>
      </div>
    </div>`;
    return;
  }

  const a = ms.ayaat[ms.idx];
  const ur = ms.urdu[ms.idx] ? ms.urdu[ms.idx].text : '';
  const words = a.text.split(' ');

  // Choose 1–2 words to blank out
  const bi = [Math.floor(Math.random() * words.length)];
  if (words.length > 4) {
    bi.push((bi[0] + Math.ceil(words.length / 2)) % words.length);
  }

  const blanked = words.map((w, i) =>
    bi.includes(i)
      ? `<span style="background:var(--cream3);color:transparent;border-radius:3px;padding:0 6px;cursor:default">____</span>`
      : w
  ).join(' ');

  const answer = bi.map(i => words[i]).join(' ، ');

  el.innerHTML = `
    <div class="mem-card">
      <div style="font-size:12px;font-weight:500;color:var(--ink2);margin-bottom:.8rem">Ayah ${ms.idx + 1} of ${total} — fill in the missing word(s)</div>
      <div class="mem-ayah-ar">${blanked}</div>
      ${ur ? `<div class="mem-ur">${ur}</div>` : ''}
      ${!ms.revealed ? `
        <input class="fill-input" id="mem-inp" placeholder="Type the missing word(s) in Arabic..." onkeydown="if(event.key==='Enter')checkMem('${answer.replace(/'/g, "\\'")}')">
        <div style="display:flex;gap:6px;flex-wrap:wrap">
          <button class="btn" onclick="checkMem('${answer.replace(/'/g, "\\'")}')">Check ✓</button>
          <button class="btn btn-outline" onclick="revealMem()">Show answer</button>
          <button class="btn btn-outline" onclick="nextMem()">Skip →</button>
        </div>
      ` : `
        <div class="mem-answer-box">
          <div class="mem-answer-label">Answer:</div>
          <div class="mem-answer-text">${answer}</div>
        </div>
        <button class="btn btn-gold" onclick="nextMem()">Next ayah →</button>
      `}
    </div>
    <div class="mem-card mem-card-alt">
      <div style="font-size:11px;color:var(--ink3);font-weight:500;margin-bottom:.5rem">📖 Full ayah</div>
      <div class="mem-ayah-full">${a.text}</div>
      <div style="margin-top:.5rem">
        <button class="audio-btn" onclick="speakAr('${a.text.replace(/'/g, "\\'")}')">🔊 Listen</button>
      </div>
    </div>`;
}

function checkMem(answer) {
  S.memState.score++;
  S.memState.revealed = true;
  renderMemCard();
}
function revealMem() {
  S.memState.revealed = true;
  renderMemCard();
}
function nextMem() {
  S.memState.idx++;
  S.memState.revealed = false;
  renderMemCard();
}

// ─── VOCAB ────────────────────────────────────────────────────────────────────

function renderVocab() {
  const cats = ['all', ...new Set(VOCAB_DATA.map(v => v.cat))];
  document.getElementById('vocab-filters').innerHTML = cats.map(c =>
    `<button class="filter-btn${S.vocabFilter === c ? ' active' : ''}" onclick="S.vocabFilter='${c}';renderVocab()">${c}</button>`
  ).join('');

  const list = S.vocabFilter === 'all' ? VOCAB_DATA : VOCAB_DATA.filter(v => v.cat === S.vocabFilter);
  document.getElementById('vocab-list').innerHTML = list.map(v => {
    const known = S.userWords[v.a] === true;
    return `<div class="vocab-card" onclick="toggleWord('${v.a}')">
      <div class="vc-ar">${v.a}</div>
      <div class="vc-body">
        <span class="vc-ur">${v.u}</span>
        <div class="vc-meta">Appears ${v.count.toLocaleString()}× · ${v.fact}</div>
      </div>
      <span class="vc-badge ${known ? 'badge-known' : 'badge-learning'}">${known ? '✓ Known' : 'Learning'}</span>
    </div>`;
  }).join('');
}

function toggleWord(ar) {
  const v = VOCAB_DATA.find(x => x.a === ar);
  if (!v) return;
  S.userWords[ar] = !S.userWords[ar];
  localStorage.setItem('nq_words', JSON.stringify(S.userWords));
  renderVocab();
  renderHome();
}

// ─── JOURNAL ──────────────────────────────────────────────────────────────────

function saveJournal() {
  const ref = document.getElementById('j-ref').value.trim();
  const ar = document.getElementById('j-arabic').value.trim();
  const note = document.getElementById('j-note').value.trim();
  if (!note && !ar) return;

  S.journal.unshift({
    ref, ar, note,
    date: new Date().toLocaleDateString('en-PK', { day: 'numeric', month: 'long', year: 'numeric' })
  });
  localStorage.setItem('nq_journal', JSON.stringify(S.journal));

  document.getElementById('j-ref').value = '';
  document.getElementById('j-arabic').value = '';
  document.getElementById('j-note').value = '';
  renderJournal();
}

function addToJournal(ar, ref) {
  showPage('journal');
  setTimeout(() => {
    document.getElementById('j-arabic').value = ar;
    document.getElementById('j-ref').value = ref;
    document.getElementById('j-note').focus();
  }, 100);
}

function deleteJournalEntry(i) {
  S.journal.splice(i, 1);
  localStorage.setItem('nq_journal', JSON.stringify(S.journal));
  renderJournal();
}

function renderJournal() {
  const el = document.getElementById('journal-list');
  if (!S.journal.length) {
    el.innerHTML = `<div class="empty-state">
      <div style="font-size:2rem;margin-bottom:.5rem">📓</div>
      Your reflections will appear here.<br>Save an ayah that touches your heart.
    </div>`;
    return;
  }
  el.innerHTML = S.journal.map((e, i) => `
    <div class="journal-entry">
      <div class="je-header">
        <div class="je-date">${e.date}${e.ref ? ' · ' + e.ref : ''}</div>
        <button class="je-delete" onclick="deleteJournalEntry(${i})">✕</button>
      </div>
      ${e.ar ? `<div class="je-ar">${e.ar}</div>` : ''}
      ${e.note ? `<div class="je-note">${e.note}</div>` : ''}
    </div>`).join('');
}

// ─── MODAL ────────────────────────────────────────────────────────────────────

function showUrduModal(ar, ur) {
  document.getElementById('modal-ar').textContent = ar;
  document.getElementById('modal-ur').textContent = ur;
  document.getElementById('modal-fact').textContent = '';
  document.getElementById('word-modal').classList.add('open');
}

function showEnModal(ar, en) {
  document.getElementById('modal-ar').textContent = ar;
  document.getElementById('modal-ur').textContent = '';
  document.getElementById('modal-fact').textContent = en;
  document.getElementById('word-modal').classList.add('open');
}

function closeWordModal() {
  document.getElementById('word-modal').classList.remove('open');
}

// ─── SPEECH ───────────────────────────────────────────────────────────────────

function speakAr(text) {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'ar-SA';
    u.rate = 0.65;
    window.speechSynthesis.speak(u);
  }
}

// ─── PAGE NAV ─────────────────────────────────────────────────────────────────

function showPage(id) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
  document.getElementById('page-' + id).classList.add('active');
  const map = { home: 0, browse: 1, read: 2, memorize: 3, vocab: 4, journal: 5 };
  if (map[id] !== undefined) document.querySelectorAll('.nav-tab')[map[id]].classList.add('active');
  if (id === 'home') renderHome();
}

// ─── START ────────────────────────────────────────────────────────────────────
init();
