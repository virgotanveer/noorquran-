// ─── APIS ─────────────────────────────────────────────────────────────────────
const RECITERS = {
  alafasy:  { name:'Sheikh Mishary Al-Afasy',        folder:'Alafasy_128kbps' },
  sudais:   { name:'Sheikh Abdul Rahman Al-Sudais',  folder:'Abdurrahmaan_As-Sudais_192kbps' },
  husary:   { name:'Sheikh Mahmoud Al-Husary',       folder:'Husary_128kbps' },
  minshawi: { name:'Sheikh Mohamed Al-Minshawi',     folder:'Minshawy_Murattal_128kbps' },
};
const URDU_EDITIONS = {
  jalandhry: { name:'Fateh Muhammad Jalandhry (جالندھری)', id:'ur.jalandhry' },
  junagarhi: { name:'Muhammad Junagarhi (جوناگڑھی)',       id:'ur.junagarhi' },
  ahmedali:  { name:'Ahmed Ali (احمد علی)',                 id:'ur.ahmedali'  },
};

// ─── STATIC DATA ──────────────────────────────────────────────────────────────
const TODAY_AYAHS = [
  { ar:'لَا يُكَلِّفُ اللَّهُ نَفْسًا إِلَّا وُسْعَهَا', ur:'اللہ کسی جان کو اس کی طاقت سے زیادہ تکلیف نہیں دیتا', ref:'Al-Baqarah 2:286', s:2, a:286 },
  { ar:'وَمَن يَتَّقِ اللَّهَ يَجْعَل لَّهُ مَخْرَجًا',  ur:'جو اللہ سے ڈرے اللہ اس کے لیے راہ نکالتا ہے',       ref:'At-Talaq 65:2',   s:65,a:2 },
  { ar:'إِنَّ مَعَ الْعُسْرِ يُسْرًا',                    ur:'بے شک تکلیف کے ساتھ آسانی ہے',                        ref:'Ash-Sharh 94:6',  s:94,a:6 },
  { ar:'وَإِذَا سَأَلَكَ عِبَادِي عَنِّي فَإِنِّي قَرِيبٌ', ur:'اور جب میرے بندے تم سے میرے بارے میں پوچھیں تو میں قریب ہوں', ref:'Al-Baqarah 2:186', s:2,a:186 },
  { ar:'حَسْبُنَا اللَّهُ وَنِعْمَ الْوَكِيلُ',           ur:'ہمارے لیے اللہ کافی ہے اور وہ بہترین کارساز ہے',     ref:'Al-Imran 3:173',  s:3,a:173 },
  { ar:'إِنَّ اللَّهَ مَعَ الصَّابِرِينَ',                ur:'بے شک اللہ صبر کرنے والوں کے ساتھ ہے',               ref:'Al-Baqarah 2:153',s:2,a:153 },
  { ar:'اللَّهُ نُورُ السَّمَاوَاتِ وَالْأَرْضِ',         ur:'اللہ آسمانوں اور زمین کا نور ہے',                     ref:'An-Nur 24:35',    s:24,a:35 },
  { ar:'وَنَحْنُ أَقْرَبُ إِلَيْهِ مِنْ حَبْلِ الْوَرِيدِ', ur:'اور ہم اس کی شہ رگ سے بھی زیادہ قریب ہیں',        ref:'Qaf 50:16',       s:50,a:16 },
  { ar:'فَبِأَيِّ آلَاءِ رَبِّكُمَا تُكَذِّبَانِ',       ur:'تو تم اپنے رب کی کن کن نعمتوں کو جھٹلاؤ گے',       ref:'Ar-Rahman 55:13', s:55,a:13 },
  { ar:'وَلَذِكْرُ اللَّهِ أَكْبَرُ',                    ur:'اور اللہ کا ذکر سب سے بڑا ہے',                        ref:'Al-Ankabut 29:45',s:29,a:45 },
];

const VOCAB_DATA = [
  { a:'اللَّهُ',   u:'اللہ',              count:2699, cat:'core',        fact:'The proper name of God — appears 2699 times' },
  { a:'رَبِّ',    u:'رب / پالنہار',      count:972,  cat:'core',        fact:'Rabb — Lord, Sustainer, Nurturer' },
  { a:'رَحْمَن',  u:'بڑا مہربان',        count:57,   cat:'attributes',  fact:'Rahman — unconditional mercy for all creation' },
  { a:'رَحِيم',   u:'نہایت رحم والا',    count:115,  cat:'attributes',  fact:'Raheem — special ongoing mercy for believers' },
  { a:'يَوْم',    u:'دن',                count:405,  cat:'time',        fact:'Often refers to Yaum al-Qiyamah (Day of Judgment)' },
  { a:'عَالَم',   u:'جہان',              count:75,   cat:'core',        fact:"Al-'Aalameen — all worlds and all creation" },
  { a:'قُلْ',     u:'کہو',               count:332,  cat:'commands',    fact:'Allah directly commands the Prophet ﷺ' },
  { a:'نَاس',     u:'لوگ / انسان',       count:241,  cat:'core',        fact:'An-Nas — the last surah is named after this word' },
  { a:'حَمْد',    u:'تعریف / شکر',       count:38,   cat:'worship',     fact:'Al-Hamd means perfect, complete praise' },
  { a:'صِرَاط',   u:'راستہ',             count:45,   cat:'guidance',    fact:'We ask for the straight path 17 times daily in salah' },
  { a:'عِلْم',    u:'علم / جاننا',       count:854,  cat:'core',        fact:'Knowledge is the most emphasized concept in the Quran' },
  { a:'صَبْر',    u:'صبر',               count:90,   cat:'character',   fact:'Patience mentioned with reward more than 90 times' },
  { a:'شُكْر',    u:'شکر / احسان',       count:75,   cat:'worship',     fact:'Gratitude is tied to increase in blessings' },
  { a:'نِعْمَة',  u:'نعمت / رحمت',       count:136,  cat:'blessings',   fact:"Allah's blessings cannot be counted — Quran 14:34" },
  { a:'جَنَّة',   u:'جنت',               count:147,  cat:'afterlife',   fact:'The most mentioned reward in the Quran' },
  { a:'نَار',     u:'آگ / جہنم',         count:126,  cat:'afterlife',   fact:'Mentioned as a warning more than 100 times' },
  { a:'إِيمَان',  u:'ایمان',             count:45,   cat:'faith',       fact:'Belief in the heart — root of all worship' },
  { a:'تَقْوَى',  u:'تقوی / پرہیزگاری', count:87,   cat:'character',   fact:'God-consciousness — the highest virtue in Islam' },
  { a:'دُعَاء',   u:'دعا',               count:65,   cat:'worship',     fact:'Supplication — Allah says Call on Me and I answer' },
  { a:'صَلَاة',   u:'نماز',              count:99,   cat:'worship',     fact:'Prayer — the pillar of Islam, mentioned 99 times' },
  { a:'زَكَاة',   u:'زکوٰۃ',             count:32,   cat:'worship',     fact:'Charity — often paired with salah in commands' },
  { a:'كِتَاب',   u:'کتاب',              count:261,  cat:'core',        fact:'The Book — refers to divine revelation and the Quran' },
  { a:'آيَة',     u:'آیت / نشانی',       count:382,  cat:'core',        fact:'Ayah means both a Quranic verse and a sign from Allah' },
  { a:'حَقّ',     u:'حق / سچ',           count:247,  cat:'core',        fact:"Truth and right — Allah is Al-Haqq (The Truth)" },
  { a:'نَفْس',    u:'نفس / جان',         count:295,  cat:'core',        fact:'Soul and self — the Quran warns against its desires' },
  { a:'قَلْب',    u:'دل',                count:132,  cat:'core',        fact:'Heart — the spiritual center of a person in Islam' },
  { a:'رَسُول',   u:'رسول / پیغمبر',     count:236,  cat:'prophethood', fact:'Messenger — Muhammad ﷺ is the final Rasool' },
  { a:'مَلَك',    u:'فرشتہ',             count:88,   cat:'unseen',      fact:"Angels carry out Allah's commands in the universe" },
  { a:'جِنّ',     u:'جن',                count:22,   cat:'unseen',      fact:'Unseen beings created from smokeless fire' },
  { a:'ذِكْر',    u:'ذکر / یاد',         count:256,  cat:'worship',     fact:'Remembrance of Allah — hearts find peace in it (13:28)' },
];

const PLAN_STEPS = [
  { done:true,  text:'Learn Al-Fatiha with full Urdu meaning', sub:'7 ayaat — said 17 times daily in salah', num:1 },
  { done:true,  text:'Understand Al-Ikhlas (Tawheed)',         sub:'4 ayaat — equals 1/3 of Quran in reward', num:112 },
  { done:false, text:'Read Al-Falaq & An-Nas',                 sub:'The two protection surahs', num:113 },
  { done:false, text:'Complete Juz Amma (last 37 surahs)',     sub:'Short surahs you recite in prayers', num:78 },
  { done:false, text:'Start Al-Mulk (Surah 67)',               sub:'30 ayaat — intercedes on Qiyamah', num:67 },
  { done:false, text:'Read Surah Yasin (Surah 36)',            sub:'Called the heart of the Quran', num:36 },
];

// ─── STATE ────────────────────────────────────────────────────────────────────
const S = {
  surahs: [],
  currentSurahNum: null,
  currentAyaat: [],
  currentUrdu: [],
  currentEnglish: [],
  currentIndoPak: [],
  currentSurahInfo: null,
  currentWordByWord: [],
  expandedAyah: null,
  mode: 'both',
  tajweedOn: JSON.parse(localStorage.getItem('nq_tajweed') || 'false'),
  reciter: localStorage.getItem('nq_reciter') || 'alafasy',
  urduEdition: localStorage.getItem('nq_urdu') || 'jalandhry',
  currentAudio: null,
  playingAyah: null,
  // Bookmarks: { "surahNum:ayahNum": { ar, ur, ref, surahName } }
  bookmarks: JSON.parse(localStorage.getItem('nq_bookmarks') || '{}'),
  // Surah badges: { surahNum: 'studied' | 'memorized' }
  badges: JSON.parse(localStorage.getItem('nq_badges') || '{}'),
  // Journal
  journal: JSON.parse(localStorage.getItem('nq_journal') || '[]'),
  // Vocab
  userWords: JSON.parse(localStorage.getItem('nq_words') || '{}'),
  vocabFilter: 'all',
  // Streak
  streak: 0,
  // Memorize
  memState: { num:null, ayaat:[], urdu:[], idx:0, score:0, revealed:false },
  // Search
  searchResults: [],
  searchLoading: false,
  readCount: parseInt(localStorage.getItem('nq_read') || '0'),
  memCount:  parseInt(localStorage.getItem('nq_memc') || '0'),
};

// ─── STREAK LOGIC ─────────────────────────────────────────────────────────────
function initStreak() {
  const today     = new Date().toDateString();
  const lastVisit = localStorage.getItem('nq_last_visit');
  let streak      = parseInt(localStorage.getItem('nq_streak') || '0');

  if (lastVisit === today) {
    // Same day — keep streak
  } else if (lastVisit === new Date(Date.now() - 86400000).toDateString()) {
    // Yesterday — increment
    streak++;
    localStorage.setItem('nq_streak', streak);
  } else if (!lastVisit) {
    streak = 1;
    localStorage.setItem('nq_streak', streak);
  } else {
    // Gap — reset
    streak = 1;
    localStorage.setItem('nq_streak', streak);
  }
  localStorage.setItem('nq_last_visit', today);
  S.streak = streak;
  document.getElementById('streak-num').textContent = streak;
}

// ─── NOTIFICATIONS / FAJR REMINDER ───────────────────────────────────────────
async function requestNotificationPermission() {
  if (!('Notification' in window)) {
    alert('Your browser does not support notifications.');
    return;
  }
  const perm = await Notification.requestPermission();
  if (perm === 'granted') {
    localStorage.setItem('nq_notif', '1');
    scheduleFajrReminder();
    showToast('✅ Fajr reminder enabled! You will be reminded daily.');
  } else {
    showToast('⚠️ Notification permission denied.');
  }
  renderNotifBtn();
}

function scheduleFajrReminder() {
  if (Notification.permission !== 'granted') return;
  // Calculate ms until next Fajr (5:00 AM local time as default)
  const fajrHour = parseInt(localStorage.getItem('nq_fajr_hour') || '5');
  const fajrMin  = parseInt(localStorage.getItem('nq_fajr_min')  || '0');
  const now  = new Date();
  const next = new Date();
  next.setHours(fajrHour, fajrMin, 0, 0);
  if (next <= now) next.setDate(next.getDate() + 1);
  const delay = next - now;
  clearTimeout(window._fajrTimer);
  window._fajrTimer = setTimeout(() => {
    new Notification('NoorQuran — وقتِ فجر 🌅', {
      body: 'اللہ کے نام سے شروع کریں — آج کی آیت پڑھیں۔\nStart your day with the Quran.',
      icon: './icons/icon-192.png',
      badge: './icons/icon-192.png',
      tag: 'fajr-reminder',
      renotify: true,
    });
    // Reschedule for tomorrow
    scheduleFajrReminder();
  }, delay);
}

function renderNotifBtn() {
  const btn = document.getElementById('notif-btn');
  if (!btn) return;
  const granted = Notification.permission === 'granted';
  btn.textContent = granted ? '🔔 Reminder ON' : '🔕 Enable Fajr Reminder';
  btn.style.background = granted ? 'var(--green-lt)' : '';
  btn.style.color = granted ? 'var(--green2)' : '';
}

// ─── AUDIO ────────────────────────────────────────────────────────────────────
function ayahAudioUrl(surahNum, ayahNum) {
  const folder = RECITERS[S.reciter].folder;
  const s = String(surahNum).padStart(3,'0');
  const a = String(ayahNum).padStart(3,'0');
  return `https://everyayah.com/data/${folder}/${s}${a}.mp3`;
}

function playAyah(surahNum, ayahNum, btn) {
  if (S.currentAudio) {
    S.currentAudio.pause();
    S.currentAudio = null;
    document.querySelectorAll('.play-btn').forEach(b => { b.textContent='▶ Play'; b.classList.remove('playing'); });
    if (S.playingAyah === `${surahNum}:${ayahNum}`) { S.playingAyah = null; return; }
  }
  S.playingAyah = `${surahNum}:${ayahNum}`;
  const audio = new Audio(ayahAudioUrl(surahNum, ayahNum));
  S.currentAudio = audio;
  if (btn) { btn.textContent='⏸ Playing…'; btn.classList.add('playing'); }
  audio.play().catch(() => { if (btn) { btn.textContent='▶ Play'; btn.classList.remove('playing'); } });
  audio.onended = () => {
    S.currentAudio = null; S.playingAyah = null;
    if (btn) { btn.textContent='▶ Play'; btn.classList.remove('playing'); }
  };
}

function playSurah(surahNum, ayahs) {
  stopAudio();
  let idx = 0;
  function next() {
    if (idx >= ayahs.length) return;
    const a = ayahs[idx++];
    const audio = new Audio(ayahAudioUrl(surahNum, a.numberInSurah));
    S.currentAudio = audio;
    audio.play().catch(()=>{});
    audio.onended = next;
  }
  next();
}

function stopAudio() {
  if (S.currentAudio) { S.currentAudio.pause(); S.currentAudio = null; }
  S.playingAyah = null;
  document.querySelectorAll('.play-btn').forEach(b => { b.textContent='▶ Play'; b.classList.remove('playing'); });
}

// ─── SURAH LIST ───────────────────────────────────────────────────────────────
async function loadSurahList() {
  try {
    const res  = await fetch('https://api.alquran.cloud/v1/surah');
    const data = await res.json();
    S.surahs   = data.data;
    renderSurahBrowser(S.surahs);
  } catch {
    document.getElementById('surah-browser').innerHTML =
      '<div class="empty-state">⚠️ Could not load surah list. Check your internet connection.</div>';
  }
}

function populateSelects() {
  const opts = S.surahs.map(s =>
    `<option value="${s.number}">${s.number}. ${s.englishName} · ${s.name}</option>`).join('');
  ['read-surah-select','mem-surah-select'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.innerHTML = `<option value="">Select a surah...</option>${opts}`;
  });
}

// ─── HOME ─────────────────────────────────────────────────────────────────────
function renderHome() {
  const knownCount = VOCAB_DATA.filter(v => S.userWords[v.a] === true).length;
  document.getElementById('h-read').textContent   = S.readCount;
  document.getElementById('h-words').textContent  = knownCount;
  document.getElementById('h-mem').textContent    = S.memCount;
  document.getElementById('h-streak').textContent = S.streak;

  const ta = TODAY_AYAHS[new Date().getDate() % TODAY_AYAHS.length];
  document.getElementById('today-card').innerHTML = `
    <div class="today-lbl">${ta.ref}</div>
    <div class="today-ar">${ta.ar}</div>
    <div class="today-ur">${ta.ur}</div>
    <div style="display:flex;justify-content:flex-end;margin-top:.6rem;gap:6px;flex-wrap:wrap">
      <button class="audio-btn play-btn" onclick="playTodayAyah(${ta.s},${ta.a},this)">▶ Play</button>
      <button class="btn btn-outline" style="font-size:11px" onclick="addToJournal('${ta.ar.replace(/'/g,"\\'")}','${ta.ref}')">📓 Save</button>
      <button class="btn btn-outline" style="font-size:11px" onclick="openSurah(${ta.s})">Open surah →</button>
    </div>`;

  document.getElementById('plan-list').innerHTML = PLAN_STEPS.map((s,i) => `
    <div class="plan-item" onclick="openSurah(${s.num})">
      <div class="plan-dot ${s.done?'done':'todo'}">${s.done?'✓':i+1}</div>
      <div style="flex:1">
        <div class="plan-text" style="color:${s.done?'var(--green2)':'var(--ink)'}">${s.text}</div>
        <div class="plan-sub">${s.sub}</div>
      </div>
      <div class="plan-arrow">→</div>
    </div>`).join('');

  renderNotifBtn();
}

function playTodayAyah(s, a, btn) {
  stopAudio();
  const audio = new Audio(ayahAudioUrl(s, a));
  S.currentAudio = audio;
  btn.textContent = '⏸ Playing…'; btn.classList.add('playing');
  audio.play().catch(() => { btn.textContent='▶ Play'; btn.classList.remove('playing'); });
  audio.onended = () => { btn.textContent='▶ Play'; btn.classList.remove('playing'); S.currentAudio=null; };
}

// ─── BROWSE ───────────────────────────────────────────────────────────────────
function renderSurahBrowser(list) {
  const el = document.getElementById('surah-browser');
  if (!list.length) { el.innerHTML='<div class="empty-state">No surahs found.</div>'; return; }
  el.innerHTML = list.map(s => {
    const badge = S.badges[s.number];
    const badgeHTML = badge
      ? `<span class="surah-badge ${badge==='memorized'?'badge-mem':'badge-studied'}">${badge==='memorized'?'حفظ':'مطالعہ'}</span>`
      : '';
    return `<div class="surah-item" onclick="openSurah(${s.number})">
      <div class="surah-num">${s.number}</div>
      <div style="flex:1">
        <div class="surah-name-en">${s.englishName} <span style="font-size:11px;color:var(--ink3)">· ${s.englishNameTranslation}</span>${badgeHTML}</div>
        <div class="surah-meta">${s.numberOfAyahs} ayaat · ${s.revelationType}</div>
      </div>
      <div class="surah-ar">${s.name}</div>
    </div>`;
  }).join('');
}

function filterSurahs() {
  const q = document.getElementById('surah-search').value.toLowerCase();
  renderSurahBrowser(S.surahs.filter(s =>
    s.englishName.toLowerCase().includes(q) || s.name.includes(q) ||
    s.englishNameTranslation.toLowerCase().includes(q) || String(s.number).includes(q)
  ));
}

// ─── READ ─────────────────────────────────────────────────────────────────────
async function openSurah(num) {
  if (!num) return;
  showPage('read');
  stopAudio();
  document.getElementById('read-surah-select').value = num;
  S.currentSurahNum = parseInt(num);
  S.expandedAyah    = null;
  S.currentWordByWord = [];

  const wrap = document.getElementById('ayah-list-wrap');
  wrap.innerHTML = '<div class="loading"><div class="spinner"></div><span>Loading surah...</span></div>';

  try {
    const urduId = URDU_EDITIONS[S.urduEdition].id;
    const [arRes, urRes, enRes, ipRes] = await Promise.all([
      fetch(`https://api.alquran.cloud/v1/surah/${num}`),
      fetch(`https://api.alquran.cloud/v1/surah/${num}/${urduId}`),
      fetch(`https://api.alquran.cloud/v1/surah/${num}/en.sahih`),
      fetch(`https://api.alquran.cloud/v1/surah/${num}/quran-simple`),
    ]);
    const [arD, urD, enD, ipD] = await Promise.all([arRes.json(), urRes.json(), enRes.json(), ipRes.json()]);
    S.currentAyaat     = arD.data.ayahs;
    S.currentUrdu      = urD.data.ayahs;
    S.currentEnglish   = enD.data.ayahs;
    S.currentIndoPak   = ipD.data.ayahs;
    S.currentSurahInfo = arD.data;
    fetchWordByWord(num);
    S.readCount += S.currentAyaat.length;
    localStorage.setItem('nq_read', S.readCount);
    renderAyahs();
  } catch {
    wrap.innerHTML = '<div class="empty-state">⚠️ Could not load surah. Check your internet connection.</div>';
  }
}

async function fetchWordByWord(surahNum) {
  try {
    const res  = await fetch(`https://api.qurancdn.com/api/qdc/verses/by_chapter/${surahNum}?words=true&word_fields=text_uthmani,text_indopak,transliteration_en&per_page=300&translations=234`);
    const data = await res.json();
    S.currentWordByWord = data.verses || [];
  } catch { S.currentWordByWord = []; }
}

function arabicText(a, i) {
  const isIndoPak = S.mode === 'indopak';
  const rawText   = isIndoPak ? (S.currentIndoPak[i]?.text || a.text) : a.text;
  return S.tajweedOn ? applyTajweed(rawText) : escHtml(rawText);
}

function renderAyahs() {
  const wrap = document.getElementById('ayah-list-wrap');
  const info = S.currentSurahInfo;
  if (!info) return;

  const badge = S.badges[info.number];
  const badgeHTML = badge
    ? `<span class="surah-badge ${badge==='memorized'?'badge-mem':'badge-studied'}" style="margin-left:6px">${badge==='memorized'?'✓ Memorized':'✓ Studied'}</span>`
    : '';

  let html = `
    <div class="surah-header">
      <div class="surah-header-ar">${info.name}</div>
      <div class="surah-header-en">${info.englishName} · ${info.englishNameTranslation} · ${info.numberOfAyahs} ayaat${badgeHTML}</div>
      ${info.number!==9?'<div class="surah-bismillah">بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ</div>':''}
      <div style="margin-top:.7rem;display:flex;justify-content:center;gap:6px;flex-wrap:wrap">
        <button class="btn btn-gold" style="font-size:11px" onclick="playSurah(${info.number},S.currentAyaat)">▶ Play surah</button>
        <button class="btn btn-outline" style="font-size:11px" onclick="stopAudio()">⏹ Stop</button>
        <button class="btn btn-outline" style="font-size:11px" onclick="markSurah(${info.number},'studied')">📗 Mark studied</button>
        <button class="btn btn-outline" style="font-size:11px" onclick="markSurah(${info.number},'memorized')">🏅 Mark memorized</button>
      </div>
      ${S.tajweedOn ? tajweedLegendHTML() : ''}
    </div>`;

  html += S.currentAyaat.map((a, i) => {
    const isExp = S.expandedAyah === i;
    const ur    = S.currentUrdu[i]?.text    || '';
    const en    = S.currentEnglish[i]?.text || '';
    const key   = `${info.number}:${a.numberInSurah}`;
    const isBookmarked = !!S.bookmarks[key];
    const ref   = `${info.englishName} ${info.number}:${a.numberInSurah}`;
    const arRaw = a.text;

    let wbwHTML = '';
    if (isExp && S.mode === 'wordbyword') {
      const verse = S.currentWordByWord.find(v => parseInt(v.verse_key.split(':')[1]) === a.numberInSurah);
      if (verse?.words) {
        const chips = verse.words.filter(w => w.char_type_name !== 'end').map(w => {
          const arab     = w.text_indopak || w.text_uthmani || '';
          const translit = w.transliteration?.text || '';
          const meaning  = w.translation?.text || '';
          return `<div class="word-chip">
            <span class="wc-arab">${arab}</span>
            <span class="wc-translit">${translit}</span>
            ${meaning?`<span class="wc-meaning">${meaning}</span>`:''}
          </div>`;
        }).join('');
        wbwHTML = `<div class="word-chips-wrap">${chips}</div>`;
      } else {
        wbwHTML = `<div style="font-size:12px;color:var(--ink3);margin-top:.5rem;text-align:center">⏳ Loading word data… tap again in a moment.</div>`;
      }
    }

    return `<div class="ayah-card${isExp?' selected':''}" id="ayah-${i}" onclick="toggleAyah(${i})">
      <div style="display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:2px">
        <div class="ayah-num">${a.numberInSurah}</div>
        <button class="bookmark-btn${isBookmarked?' active':''}" onclick="event.stopPropagation();toggleBookmark(${info.number},${a.numberInSurah},'${arRaw.replace(/'/g,"\\'")}','${ur.replace(/'/g,"\\'")}','${ref}')"
          title="${isBookmarked?'Remove bookmark':'Bookmark this ayah'}">${isBookmarked?'🔖':'🏷'}</button>
      </div>
      <div class="ayah-ar" style="font-size:${S.mode==='indopak'?'1.55rem':'1.5rem'}">${arabicText(a,i)}</div>
      ${S.mode==='both'    &&ur?`<div class="ayah-ur">${ur}</div>`:''}
      ${S.mode==='ar_en'   &&en?`<div class="ayah-en">${en}</div>`:''}
      ${S.mode==='indopak' &&ur?`<div class="ayah-ur">${ur}</div>`:''}
      ${wbwHTML}
      ${isExp?`<div class="ayah-actions">
        <button class="btn play-btn" onclick="event.stopPropagation();playAyah(${info.number},${a.numberInSurah},this)">▶ Play</button>
        <button class="btn btn-outline" onclick="event.stopPropagation();addToJournal('${arRaw.replace(/'/g,"\\'")}','${ref}')">📓 Journal</button>
        ${S.mode!=='wordbyword'?`<button class="btn btn-outline" onclick="event.stopPropagation();setModeExpand('wordbyword',${i})">📚 Word×Word</button>`:''}
        ${S.mode!=='both'&&ur?`<button class="btn btn-outline" onclick="event.stopPropagation();showModal('${arRaw.replace(/'/g,"\\'")}','${ur.replace(/'/g,"\\'")}','')">اردو</button>`:''}
        ${S.mode!=='ar_en'&&en?`<button class="btn btn-outline" onclick="event.stopPropagation();showModal('${arRaw.replace(/'/g,"\\'")}','','${en.replace(/'/g,"\\'")}')">English</button>`:''}
      </div>`:''}
    </div>`;
  }).join('');

  wrap.innerHTML = html;
}

function escHtml(s) { return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

function setModeExpand(mode, idx) {
  S.mode = mode;
  document.querySelectorAll('.mode-btn').forEach(b => b.classList.toggle('active', b.dataset.mode===mode));
  S.expandedAyah = idx;
  renderAyahs();
}

function toggleAyah(i) { S.expandedAyah = S.expandedAyah===i ? null : i; renderAyahs(); }

function setMode(m, btn) {
  S.mode = m;
  document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  if (S.currentAyaat.length) renderAyahs();
}

function toggleTajweed() {
  S.tajweedOn = !S.tajweedOn;
  localStorage.setItem('nq_tajweed', JSON.stringify(S.tajweedOn));
  const btn = document.getElementById('tajweed-btn');
  if (btn) { btn.textContent = S.tajweedOn ? '🎨 Tajweed ON' : '🎨 Tajweed OFF'; btn.classList.toggle('active', S.tajweedOn); }
  if (S.currentAyaat.length) renderAyahs();
}

// ─── BOOKMARKS ────────────────────────────────────────────────────────────────
function toggleBookmark(surahNum, ayahNum, ar, ur, ref) {
  const key = `${surahNum}:${ayahNum}`;
  if (S.bookmarks[key]) {
    delete S.bookmarks[key];
    showToast('Bookmark removed');
  } else {
    S.bookmarks[key] = { ar, ur, ref, surahNum, ayahNum };
    showToast('🔖 Ayah bookmarked!');
  }
  localStorage.setItem('nq_bookmarks', JSON.stringify(S.bookmarks));
  renderAyahs();
  if (document.getElementById('page-bookmarks')?.classList.contains('active')) renderBookmarks();
}

function renderBookmarks() {
  const el  = document.getElementById('bookmarks-list');
  const keys = Object.keys(S.bookmarks);
  if (!keys.length) {
    el.innerHTML = `<div class="empty-state"><div style="font-size:2rem;margin-bottom:.5rem">🔖</div>No bookmarks yet.<br>Tap 🏷 on any ayah while reading to save it here.</div>`;
    return;
  }
  el.innerHTML = keys.map(k => {
    const b = S.bookmarks[k];
    return `<div class="journal-entry">
      <div class="je-header">
        <div class="je-date">${b.ref}</div>
        <div style="display:flex;gap:6px">
          <button class="btn btn-outline" style="font-size:10px;padding:3px 7px" onclick="openSurah(${b.surahNum});setTimeout(()=>scrollToAyah(${b.ayahNum-1}),1500)">Open →</button>
          <button class="je-delete" onclick="toggleBookmark(${b.surahNum},${b.ayahNum},'','','${b.ref}')">✕</button>
        </div>
      </div>
      <div class="je-ar">${b.ar}</div>
      ${b.ur?`<div class="je-note" style="font-family:'Noto Nastaliq Urdu',serif;font-size:.85rem;direction:rtl;text-align:right">${b.ur}</div>`:''}
      <button class="audio-btn play-btn" style="margin-top:.4rem" onclick="playAyah(${b.surahNum},${b.ayahNum},this)">▶ Play</button>
    </div>`;
  }).join('');
}

function scrollToAyah(idx) {
  const el = document.getElementById(`ayah-${idx}`);
  if (el) el.scrollIntoView({ behavior:'smooth', block:'center' });
}

// ─── SURAH BADGES ────────────────────────────────────────────────────────────
function markSurah(num, status) {
  if (S.badges[num] === status) {
    delete S.badges[num];
    showToast('Badge removed');
  } else {
    S.badges[num] = status;
    showToast(status==='memorized' ? '🏅 Marked as memorized! Mashallah!' : '📗 Marked as studied!');
  }
  localStorage.setItem('nq_badges', JSON.stringify(S.badges));
  renderAyahs();
  renderProgress();
}

function renderProgress() {
  const el = document.getElementById('progress-content');
  if (!el) return;
  const studied   = Object.values(S.badges).filter(v=>v==='studied').length;
  const memorized = Object.values(S.badges).filter(v=>v==='memorized').length;
  const total     = 114;
  const pct       = Math.round((studied + memorized) / total * 100);

  el.innerHTML = `
    <div class="mem-card" style="margin-bottom:10px">
      <div style="font-size:14px;font-weight:600;color:var(--ink);margin-bottom:.8rem">Overall Quran Progress</div>
      <div style="display:flex;gap:1rem;margin-bottom:.8rem;flex-wrap:wrap">
        <div class="stat-pill" style="background:var(--green-lt)"><div class="stat-num" style="color:var(--green2)">${memorized}</div><div class="stat-lbl" style="color:var(--green2)">Memorized</div></div>
        <div class="stat-pill" style="background:#e8f5e9"><div class="stat-num" style="color:#2e7d32">${studied}</div><div class="stat-lbl" style="color:#2e7d32">Studied</div></div>
        <div class="stat-pill" style="background:var(--cream2)"><div class="stat-num">${total-studied-memorized}</div><div class="stat-lbl">Remaining</div></div>
      </div>
      <div style="font-size:12px;color:var(--ink3);margin-bottom:.4rem">${pct}% of Quran covered</div>
      <div class="prog-bar-wrap" style="border-radius:8px;height:10px"><div class="prog-bar" style="width:${pct}%"></div></div>
    </div>
    <div style="font-size:11px;font-weight:600;letter-spacing:.06em;text-transform:uppercase;color:var(--ink3);margin-bottom:.5rem">Completed Surahs</div>
    ${Object.keys(S.badges).length===0 ? '<div class="empty-state" style="padding:1rem">No surahs marked yet.<br>Open a surah and tap "Mark studied" or "Mark memorized".</div>' :
      Object.entries(S.badges).sort((a,b)=>a[0]-b[0]).map(([num, status]) => {
        const surah = S.surahs.find(s=>s.number==num);
        const name  = surah ? surah.englishName : `Surah ${num}`;
        return `<div class="surah-item" onclick="openSurah(${num})" style="margin-bottom:6px">
          <div class="surah-num">${num}</div>
          <div style="flex:1"><div class="surah-name-en">${name}</div></div>
          <span class="surah-badge ${status==='memorized'?'badge-mem':'badge-studied'}">${status==='memorized'?'🏅 Memorized':'📗 Studied'}</span>
        </div>`;
      }).join('')
    }`;
}

// ─── SEARCH ───────────────────────────────────────────────────────────────────
async function doSearch() {
  const q = document.getElementById('search-input').value.trim();
  if (!q) return;
  const el = document.getElementById('search-results');
  el.innerHTML = '<div class="loading"><div class="spinner"></div><span>Searching the Quran...</span></div>';

  try {
    // Search Arabic and Urdu via AlQuran.cloud search endpoint
    const urduId = URDU_EDITIONS[S.urduEdition].id;
    const [arRes, urRes] = await Promise.all([
      fetch(`https://api.alquran.cloud/v1/search/${encodeURIComponent(q)}/all/ar`),
      fetch(`https://api.alquran.cloud/v1/search/${encodeURIComponent(q)}/all/${urduId}`),
    ]);
    const [arD, urD] = await Promise.all([arRes.json(), urRes.json()]);

    // Merge results by ayah key
    const map = {};
    (arD.data?.matches || []).forEach(m => {
      const k = `${m.surah.number}:${m.numberInSurah}`;
      map[k] = { ar:m.text, ur:'', ref:`${m.surah.englishName} ${m.surah.number}:${m.numberInSurah}`, surahNum:m.surah.number, ayahNum:m.numberInSurah };
    });
    (urD.data?.matches || []).forEach(m => {
      const k = `${m.surah.number}:${m.numberInSurah}`;
      if (map[k]) map[k].ur = m.text;
      else map[k] = { ar:'', ur:m.text, ref:`${m.surah.englishName} ${m.surah.number}:${m.numberInSurah}`, surahNum:m.surah.number, ayahNum:m.numberInSurah };
    });

    const results = Object.values(map);
    const countEl = document.getElementById('search-count');
    if (countEl) countEl.textContent = results.length ? `${results.length} results` : '';

    if (!results.length) {
      el.innerHTML = `<div class="empty-state">No results found for "<strong>${q}</strong>".<br>Try searching in Arabic or Urdu.</div>`;
      return;
    }

    el.innerHTML = results.slice(0,50).map(r => `
      <div class="journal-entry" style="cursor:pointer" onclick="openSurah(${r.surahNum})">
        <div class="je-header">
          <div class="je-date">${r.ref}</div>
          <button class="bookmark-btn${S.bookmarks[r.surahNum+':'+r.ayahNum]?' active':''}"
            onclick="event.stopPropagation();toggleBookmark(${r.surahNum},${r.ayahNum},'${(r.ar||'').replace(/'/g,"\\'")}','${(r.ur||'').replace(/'/g,"\\'")}','${r.ref}')">🏷</button>
        </div>
        ${r.ar?`<div class="je-ar">${highlight(r.ar,q)}</div>`:''}
        ${r.ur?`<div class="je-note" style="font-family:'Noto Nastaliq Urdu',serif;font-size:.85rem;direction:rtl;text-align:right">${highlight(r.ur,q)}</div>`:''}
        <div style="display:flex;gap:6px;margin-top:.4rem">
          <button class="audio-btn play-btn" onclick="event.stopPropagation();playAyah(${r.surahNum},${r.ayahNum},this)">▶ Play</button>
          <button class="btn btn-outline" style="font-size:10px;padding:3px 7px" onclick="event.stopPropagation();openSurah(${r.surahNum})">Open surah →</button>
        </div>
      </div>`).join('');
    if (results.length > 50) {
      el.innerHTML += `<div style="text-align:center;padding:1rem;font-size:12px;color:var(--ink3)">Showing first 50 of ${results.length} results</div>`;
    }
  } catch {
    el.innerHTML = '<div class="empty-state">⚠️ Search failed. Check your connection.</div>';
  }
}

function highlight(text, q) {
  if (!q || !text) return escHtml(text||'');
  const safe = escHtml(text);
  const safeQ = escHtml(q).replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
  return safe.replace(new RegExp(safeQ,'gi'), m => `<mark style="background:#fff3cd;border-radius:2px">${m}</mark>`);
}

// ─── MEMORIZE ────────────────────────────────────────────────────────────────
async function loadMemorizeSurah() {
  const num = document.getElementById('mem-surah-select').value;
  if (!num) return;
  const el = document.getElementById('mem-content');
  el.innerHTML = '<div class="loading"><div class="spinner"></div><span>Loading...</span></div>';
  try {
    const urduId = URDU_EDITIONS[S.urduEdition].id;
    const [arRes, urRes] = await Promise.all([
      fetch(`https://api.alquran.cloud/v1/surah/${num}`),
      fetch(`https://api.alquran.cloud/v1/surah/${num}/${urduId}`),
    ]);
    const [arD, urD] = await Promise.all([arRes.json(), urRes.json()]);
    S.memState = { num, ayaat:arD.data.ayahs, urdu:urD.data.ayahs, idx:0, score:0, revealed:false };
    renderMemCard();
  } catch { el.innerHTML = '<div class="empty-state">⚠️ Could not load. Check connection.</div>'; }
}

function renderMemCard() {
  const ms = S.memState, total = ms.ayaat.length;
  const prog = total ? (ms.idx/total)*100 : 0;
  document.getElementById('mem-bar').style.width = prog+'%';
  document.getElementById('mem-prog-label').textContent = total ? `${ms.idx} / ${total} ayaat` : '';
  const el = document.getElementById('mem-content');
  if (!total) { el.innerHTML='<div class="empty-state">Select a surah above.</div>'; return; }
  if (ms.idx >= total) {
    S.memCount += total;
    localStorage.setItem('nq_memc', S.memCount);
    el.innerHTML = `<div class="mem-card"><div class="mem-complete">
      <div class="mem-complete-icon">🌟</div>
      <div class="mem-complete-title">Mashallah! Surah complete!</div>
      <div class="mem-complete-score">Score: ${ms.score} / ${total} — ${Math.round(ms.score/total*100)}%</div>
      <button class="btn btn-gold" onclick="S.memState.idx=0;S.memState.score=0;renderMemCard()">Restart</button>
    </div></div>`;
    return;
  }
  const a  = ms.ayaat[ms.idx];
  const ur = ms.urdu[ms.idx]?.text || '';
  const words = a.text.split(' ');
  const bi = [Math.floor(Math.random()*words.length)];
  if (words.length>4) bi.push((bi[0]+Math.ceil(words.length/2))%words.length);
  const blanked = words.map((w,i)=>bi.includes(i)
    ?`<span style="background:var(--cream3);color:transparent;border-radius:3px;padding:0 8px">____</span>`:escHtml(w)).join(' ');
  const answer = bi.map(i=>words[i]).join(' ، ');
  const sNum = parseInt(ms.num);

  el.innerHTML = `
    <div class="mem-card">
      <div style="font-size:12px;font-weight:500;color:var(--ink2);margin-bottom:.8rem">Ayah ${ms.idx+1} of ${total} — fill in the missing word(s)</div>
      <div class="mem-ayah-ar">${blanked}</div>
      ${ur?`<div class="mem-ur">${ur}</div>`:''}
      ${!ms.revealed?`
        <input class="fill-input" id="mem-inp" placeholder="Type the missing Arabic word(s)..."
          onkeydown="if(event.key==='Enter')checkMem('${answer.replace(/'/g,"\\'")}')">
        <div style="display:flex;gap:6px;flex-wrap:wrap">
          <button class="btn" onclick="checkMem('${answer.replace(/'/g,"\\'")}')">Check ✓</button>
          <button class="btn btn-outline" onclick="revealMem()">Show answer</button>
          <button class="btn btn-outline" onclick="nextMem()">Skip →</button>
        </div>` : `
        <div class="mem-answer-box"><div class="mem-answer-label">Answer:</div>
          <div class="mem-answer-text">${answer}</div></div>
        <button class="btn btn-gold" onclick="nextMem()">Next ayah →</button>`}
    </div>
    <div class="mem-card mem-card-alt">
      <div style="font-size:11px;color:var(--ink3);font-weight:500;margin-bottom:.5rem">📖 Full ayah</div>
      <div class="mem-ayah-full">${S.tajweedOn?applyTajweed(a.text):escHtml(a.text)}</div>
      <button class="audio-btn play-btn" style="margin-top:.6rem" onclick="playAyah(${sNum},${a.numberInSurah},this)">▶ Play</button>
    </div>`;
}
function checkMem(a){ S.memState.score++; S.memState.revealed=true; renderMemCard(); }
function revealMem(){ S.memState.revealed=true; renderMemCard(); }
function nextMem(){   S.memState.idx++; S.memState.revealed=false; renderMemCard(); }

// ─── VOCAB ────────────────────────────────────────────────────────────────────
function renderVocab() {
  const cats = ['all',...new Set(VOCAB_DATA.map(v=>v.cat))];
  document.getElementById('vocab-filters').innerHTML = cats.map(c=>
    `<button class="filter-btn${S.vocabFilter===c?' active':''}" onclick="S.vocabFilter='${c}';renderVocab()">${c}</button>`).join('');
  const list = S.vocabFilter==='all'?VOCAB_DATA:VOCAB_DATA.filter(v=>v.cat===S.vocabFilter);
  document.getElementById('vocab-list').innerHTML = list.map(v=>{
    const known = S.userWords[v.a]===true;
    return `<div class="vocab-card" onclick="toggleWord('${v.a}')">
      <div class="vc-ar">${v.a}</div>
      <div class="vc-body"><span class="vc-ur">${v.u}</span><div class="vc-meta">Appears ${v.count.toLocaleString()}× · ${v.fact}</div></div>
      <span class="vc-badge ${known?'badge-known':'badge-learning'}">${known?'✓ Known':'Learning'}</span>
    </div>`;
  }).join('');
}
function toggleWord(ar){
  S.userWords[ar]=!S.userWords[ar];
  localStorage.setItem('nq_words',JSON.stringify(S.userWords));
  renderVocab(); renderHome();
}

// ─── JOURNAL ──────────────────────────────────────────────────────────────────
function saveJournal(){
  const ref=document.getElementById('j-ref').value.trim();
  const ar=document.getElementById('j-arabic').value.trim();
  const note=document.getElementById('j-note').value.trim();
  if(!note&&!ar) return;
  S.journal.unshift({ref,ar,note,date:new Date().toLocaleDateString('en-PK',{day:'numeric',month:'long',year:'numeric'})});
  localStorage.setItem('nq_journal',JSON.stringify(S.journal));
  document.getElementById('j-ref').value='';
  document.getElementById('j-arabic').value='';
  document.getElementById('j-note').value='';
  renderJournal();
}
function addToJournal(ar,ref){
  showPage('journal');
  setTimeout(()=>{ document.getElementById('j-arabic').value=ar; document.getElementById('j-ref').value=ref; document.getElementById('j-note').focus(); },100);
}
function deleteJournalEntry(i){ S.journal.splice(i,1); localStorage.setItem('nq_journal',JSON.stringify(S.journal)); renderJournal(); }
function renderJournal(){
  const el=document.getElementById('journal-list');
  if(!S.journal.length){ el.innerHTML=`<div class="empty-state"><div style="font-size:2rem;margin-bottom:.5rem">📓</div>Your reflections will appear here.<br>Save an ayah that touches your heart.</div>`; return; }
  el.innerHTML=S.journal.map((e,i)=>`
    <div class="journal-entry">
      <div class="je-header"><div class="je-date">${e.date}${e.ref?' · '+e.ref:''}</div>
        <button class="je-delete" onclick="deleteJournalEntry(${i})">✕</button></div>
      ${e.ar?`<div class="je-ar">${e.ar}</div>`:''}
      ${e.note?`<div class="je-note">${e.note}</div>`:''}
    </div>`).join('');
}

// ─── MODAL ────────────────────────────────────────────────────────────────────
function showModal(ar,ur,en){
  document.getElementById('modal-ar').textContent=ar;
  document.getElementById('modal-ur').textContent=ur;
  document.getElementById('modal-fact').textContent=en;
  document.getElementById('word-modal').classList.add('open');
}
function closeWordModal(){ document.getElementById('word-modal').classList.remove('open'); }

// ─── SETTINGS ─────────────────────────────────────────────────────────────────
function buildSettingsUI(){
  const rd=document.getElementById('reciter-select');
  if(rd){ rd.innerHTML=Object.entries(RECITERS).map(([k,v])=>`<option value="${k}">${v.name}</option>`).join(''); rd.value=S.reciter; rd.onchange=()=>{ S.reciter=rd.value; localStorage.setItem('nq_reciter',rd.value); stopAudio(); }; }
  const ud=document.getElementById('urdu-select');
  if(ud){ ud.innerHTML=Object.entries(URDU_EDITIONS).map(([k,v])=>`<option value="${k}">${v.name}</option>`).join(''); ud.value=S.urduEdition; ud.onchange=()=>{ S.urduEdition=ud.value; localStorage.setItem('nq_urdu',ud.value); if(S.currentSurahNum) openSurah(S.currentSurahNum); }; }
  const fh=document.getElementById('fajr-hour');
  if(fh){ fh.value=localStorage.getItem('nq_fajr_hour')||'5'; fh.onchange=()=>{ localStorage.setItem('nq_fajr_hour',fh.value); scheduleFajrReminder(); }; }
  const fm=document.getElementById('fajr-min');
  if(fm){ fm.value=localStorage.getItem('nq_fajr_min')||'0'; fm.onchange=()=>{ localStorage.setItem('nq_fajr_min',fm.value); scheduleFajrReminder(); }; }
  const tb=document.getElementById('tajweed-btn');
  if(tb){ tb.textContent=S.tajweedOn?'🎨 Tajweed ON':'🎨 Tajweed OFF'; tb.classList.toggle('active',S.tajweedOn); }
  renderNotifBtn();
  if(Notification.permission==='granted') scheduleFajrReminder();
}

// ─── TOAST ────────────────────────────────────────────────────────────────────
function showToast(msg){
  let t=document.getElementById('toast');
  if(!t){ t=document.createElement('div'); t.id='toast'; document.body.appendChild(t); }
  t.textContent=msg; t.className='toast show';
  clearTimeout(t._timer); t._timer=setTimeout(()=>t.classList.remove('show'),2500);
}

// ─── PAGE NAV ─────────────────────────────────────────────────────────────────
function showPage(id){
  document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
  document.querySelectorAll('.nav-tab').forEach(t=>t.classList.remove('active'));
  document.getElementById('page-'+id).classList.add('active');
  const map={home:0,browse:1,read:2,memorize:3,vocab:4,journal:5,bookmarks:6,search:7,progress:8};
  if(map[id]!==undefined) document.querySelectorAll('.nav-tab')[map[id]]?.classList.add('active');
  if(id==='home')      renderHome();
  if(id==='bookmarks') renderBookmarks();
  if(id==='progress')  renderProgress();
  if(id==='browse'&&!S.surahs.length) loadSurahList();
}

// ─── BOOT ─────────────────────────────────────────────────────────────────────
async function init(){
  initStreak();
  renderHome();
  renderVocab();
  renderJournal();
  buildSettingsUI();
  await loadSurahList();
  populateSelects();
  const page=new URLSearchParams(window.location.search).get('page');
  if(page) showPage(page);
}
init();

// ─── PATCH: add Read button to surah browser items ───────────────────────────
// Override renderSurahBrowser to include the reader button
const _origRenderSurahBrowser = renderSurahBrowser;
function renderSurahBrowser(list) {
  const el = document.getElementById('surah-browser');
  if (!list.length) { el.innerHTML='<div class="empty-state">No surahs found.</div>'; return; }
  el.innerHTML = list.map(s => {
    const badge = S.badges[s.number];
    const badgeHTML = badge
      ? `<span class="surah-badge ${badge==='memorized'?'badge-mem':'badge-studied'}">${badge==='memorized'?'حفظ':'مطالعہ'}</span>`
      : '';
    return `<div class="surah-item" style="cursor:pointer">
      <div class="surah-num" onclick="openSurah(${s.number})">${s.number}</div>
      <div style="flex:1" onclick="openSurah(${s.number})">
        <div class="surah-name-en">${s.englishName} <span style="font-size:11px;color:var(--ink3)">· ${s.englishNameTranslation}</span>${badgeHTML}</div>
        <div class="surah-meta">${s.numberOfAyahs} ayaat · ${s.revelationType}</div>
      </div>
      <div class="surah-ar" onclick="openSurah(${s.number})">${s.name}</div>
      <button class="open-reader-btn" onclick="event.stopPropagation();openReader(${s.number})">📖 Read</button>
    </div>`;
  }).join('');
}

// Also add a "Open Fullscreen Reader" button to the read page surah header
const _origRenderAyahs = renderAyahs;
function renderAyahs() {
  _origRenderAyahs();
  // Append reader launch button to surah header
  const header = document.querySelector('.surah-header');
  if (header && S.currentSurahNum) {
    const btn = document.createElement('button');
    btn.className = 'open-reader-btn';
    btn.style.marginTop = '.6rem';
    btn.style.display = 'block';
    btn.style.margin = '.6rem auto 0';
    btn.innerHTML = '📖 Open Fullscreen Reader';
    btn.onclick = () => openReader(S.currentSurahNum, S.expandedAyah || 0);
    header.appendChild(btn);
  }
}
