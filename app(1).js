// ─── CONFIG ───────────────────────────────────────────────────────────────────
const REPO_BASE   = '/noorquran-/';
const AUDIO_BASE  = 'https://raw.githubusercontent.com/semarketir/quranjson/master/source/audio/';

// All Quran data bundled as 3 single files in the repo — VPN-proof
let QURAN_AR = null; // { "1": {name, count, ayahs:[]}, ... }
let QURAN_EN = null; // { "1": [...], ... }
let QURAN_UR = null; // { "1": [...], ... }

async function loadQuranData() {
  if (QURAN_AR) return; // already loaded
  const [arRes, enRes, urRes] = await Promise.all([
    fetchWithRetry(REPO_BASE + 'quran-ar.json'),
    fetchWithRetry(REPO_BASE + 'quran-en.json'),
    fetchWithRetry(REPO_BASE + 'quran-ur.json'),
  ]);
  [QURAN_AR, QURAN_EN, QURAN_UR] = await Promise.all([arRes.json(), enRes.json(), urRes.json()]);
  console.log('Quran data loaded:', Object.keys(QURAN_AR).length, 'surahs');
}

const RECITERS = {
  alafasy:  { name:'Sheikh Mishary Al-Afasy',       folder:'Alafasy_128kbps' },
  sudais:   { name:'Sheikh Abdul Rahman Al-Sudais', folder:'Abdurrahmaan_As-Sudais_192kbps' },
  husary:   { name:'Sheikh Mahmoud Al-Husary',      folder:'Husary_128kbps' },
  minshawi: { name:'Sheikh Mohamed Al-Minshawi',    folder:'Minshawy_Murattal_128kbps' },
};

const URDU_EDITIONS = {
  jalandhry: { name:'Fateh Muhammad Jalandhry (جالندھری)', id:'ur.jalandhry' },
  junagarhi: { name:'Muhammad Junagarhi (جوناگڑھی)',        id:'ur.junagarhi' },
  ahmedali:  { name:'Ahmed Ali (احمد علی)',                  id:'ur.ahmedali'  },
};

// ─── STATIC DATA ──────────────────────────────────────────────────────────────
const TODAY_AYAHS = [
  { ar:'لَا يُكَلِّفُ اللَّهُ نَفْسًا إِلَّا وُسْعَهَا', ur:'اللہ کسی جان کو اس کی طاقت سے زیادہ تکلیف نہیں دیتا', ref:'Al-Baqarah 2:286', s:2,  a:286 },
  { ar:'وَمَن يَتَّقِ اللَّهَ يَجْعَل لَّهُ مَخْرَجًا',  ur:'جو اللہ سے ڈرے اللہ اس کے لیے راہ نکالتا ہے',        ref:'At-Talaq 65:2',   s:65, a:2   },
  { ar:'إِنَّ مَعَ الْعُسْرِ يُسْرًا',                    ur:'بے شک تکلیف کے ساتھ آسانی ہے',                        ref:'Ash-Sharh 94:6',  s:94, a:6   },
  { ar:'وَإِذَا سَأَلَكَ عِبَادِي عَنِّي فَإِنِّي قَرِيبٌ', ur:'جب میرے بندے تم سے میرے بارے میں پوچھیں تو میں قریب ہوں', ref:'Al-Baqarah 2:186', s:2, a:186 },
  { ar:'حَسْبُنَا اللَّهُ وَنِعْمَ الْوَكِيلُ',           ur:'ہمارے لیے اللہ کافی ہے اور وہ بہترین کارساز ہے',      ref:'Al-Imran 3:173',  s:3,  a:173 },
  { ar:'إِنَّ اللَّهَ مَعَ الصَّابِرِينَ',                ur:'بے شک اللہ صبر کرنے والوں کے ساتھ ہے',                ref:'Al-Baqarah 2:153', s:2, a:153 },
  { ar:'اللَّهُ نُورُ السَّمَاوَاتِ وَالْأَرْضِ',         ur:'اللہ آسمانوں اور زمین کا نور ہے',                      ref:'An-Nur 24:35',    s:24, a:35  },
  { ar:'وَنَحْنُ أَقْرَبُ إِلَيْهِ مِنْ حَبْلِ الْوَرِيدِ', ur:'اور ہم اس کی شہ رگ سے بھی زیادہ قریب ہیں',         ref:'Qaf 50:16',       s:50, a:16  },
  { ar:'فَبِأَيِّ آلَاءِ رَبِّكُمَا تُكَذِّبَانِ',       ur:'تم اپنے رب کی کن کن نعمتوں کو جھٹلاؤ گے',            ref:'Ar-Rahman 55:13', s:55, a:13  },
  { ar:'وَلَذِكْرُ اللَّهِ أَكْبَرُ',                    ur:'اللہ کا ذکر سب سے بڑا ہے',                             ref:'Al-Ankabut 29:45', s:29, a:45 },
];

const VOCAB_DATA = [
  { a:'اللَّهُ',   u:'اللہ',              count:2699, cat:'core',        fact:'The proper name of God — appears 2699 times' },
  { a:'رَبِّ',    u:'رب / پالنہار',      count:972,  cat:'core',        fact:'Rabb — Lord, Sustainer, Nurturer' },
  { a:'رَحْمَن',  u:'بڑا مہربان',        count:57,   cat:'attributes',  fact:'Rahman — unconditional mercy for all creation' },
  { a:'رَحِيم',   u:'نہایت رحم والا',    count:115,  cat:'attributes',  fact:'Raheem — special ongoing mercy for believers' },
  { a:'يَوْم',    u:'دن',                count:405,  cat:'time',        fact:'Often refers to Yaum al-Qiyamah' },
  { a:'عَالَم',   u:'جہان',              count:75,   cat:'core',        fact:"Al-'Aalameen — all worlds and all creation" },
  { a:'قُلْ',     u:'کہو',               count:332,  cat:'commands',    fact:'Allah directly commands the Prophet ﷺ' },
  { a:'نَاس',     u:'لوگ / انسان',       count:241,  cat:'core',        fact:'An-Nas — the last surah is named after this' },
  { a:'حَمْد',    u:'تعریف / شکر',       count:38,   cat:'worship',     fact:'Al-Hamd means perfect, complete praise' },
  { a:'صِرَاط',   u:'راستہ',             count:45,   cat:'guidance',    fact:'We ask for the straight path 17 times daily' },
  { a:'عِلْم',    u:'علم / جاننا',       count:854,  cat:'core',        fact:'Knowledge is the most emphasized concept' },
  { a:'صَبْر',    u:'صبر',               count:90,   cat:'character',   fact:'Patience mentioned with reward 90+ times' },
  { a:'شُكْر',    u:'شکر / احسان',       count:75,   cat:'worship',     fact:'Gratitude is tied to increase in blessings' },
  { a:'نِعْمَة',  u:'نعمت / رحمت',       count:136,  cat:'blessings',   fact:"Allah's blessings cannot be counted (14:34)" },
  { a:'جَنَّة',   u:'جنت',               count:147,  cat:'afterlife',   fact:'The most mentioned reward in the Quran' },
  { a:'نَار',     u:'آگ / جہنم',         count:126,  cat:'afterlife',   fact:'Mentioned as a warning more than 100 times' },
  { a:'إِيمَان',  u:'ایمان',             count:45,   cat:'faith',       fact:'Belief in the heart — root of all worship' },
  { a:'تَقْوَى',  u:'تقوی / پرہیزگاری', count:87,   cat:'character',   fact:'God-consciousness — the highest virtue' },
  { a:'دُعَاء',   u:'دعا',               count:65,   cat:'worship',     fact:'Supplication — Allah says Call on Me and I answer' },
  { a:'صَلَاة',   u:'نماز',              count:99,   cat:'worship',     fact:'Prayer — the pillar of Islam, mentioned 99 times' },
  { a:'زَكَاة',   u:'زکوٰۃ',             count:32,   cat:'worship',     fact:'Charity — often paired with salah in commands' },
  { a:'كِتَاب',   u:'کتاب',              count:261,  cat:'core',        fact:'The Book — refers to divine revelation' },
  { a:'آيَة',     u:'آیت / نشانی',       count:382,  cat:'core',        fact:'Ayah = a Quranic verse and a sign from Allah' },
  { a:'حَقّ',     u:'حق / سچ',           count:247,  cat:'core',        fact:"Truth — Allah is Al-Haqq (The Truth)" },
  { a:'نَفْس',    u:'نفس / جان',         count:295,  cat:'core',        fact:'Soul, self — Quran warns against its desires' },
  { a:'قَلْب',    u:'دل',                count:132,  cat:'core',        fact:'Heart — the spiritual center of a person' },
  { a:'رَسُول',   u:'رسول / پیغمبر',     count:236,  cat:'prophethood', fact:'Messenger — Muhammad ﷺ is the final Rasool' },
  { a:'مَلَك',    u:'فرشتہ',             count:88,   cat:'unseen',      fact:"Angels carry out Allah's commands" },
  { a:'جِنّ',     u:'جن',                count:22,   cat:'unseen',      fact:'Unseen beings created from smokeless fire' },
  { a:'ذِكْر',    u:'ذکر / یاد',         count:256,  cat:'worship',     fact:'Remembrance of Allah — hearts find peace in it' },
];

const PLAN_STEPS = [
  { done:true,  text:'Learn Al-Fatiha with full Urdu meaning', sub:'7 ayaat — said 17 times daily in salah', num:1   },
  { done:true,  text:'Understand Al-Ikhlas (Tawheed)',         sub:'4 ayaat — equals 1/3 of Quran in reward', num:112 },
  { done:false, text:'Read Al-Falaq & An-Nas',                 sub:'The two protection surahs', num:113 },
  { done:false, text:'Complete Juz Amma (last 37 surahs)',     sub:'Short surahs you recite in prayers', num:78  },
  { done:false, text:'Start Al-Mulk (Surah 67)',               sub:'30 ayaat — intercedes on Qiyamah', num:67  },
  { done:false, text:'Read Surah Yasin (Surah 36)',            sub:'Called the heart of the Quran', num:36  },
];

// ─── STATE ────────────────────────────────────────────────────────────────────
const S = {
  surahs: [],
  currentSurahNum: null,
  currentAyaat: [],
  currentUrdu: [],
  currentEnglish: [],
  currentSurahInfo: null,
  currentWordByWord: [],
  expandedAyah: null,
  mode: 'both',
  tajweedOn: JSON.parse(localStorage.getItem('nq_tajweed') || 'false'),
  reciter: localStorage.getItem('nq_reciter') || 'alafasy',
  urduEdition: localStorage.getItem('nq_urdu') || 'jalandhry',
  currentAudio: null,
  playingAyah: null,
  bookmarks: JSON.parse(localStorage.getItem('nq_bookmarks') || '{}'),
  badges: JSON.parse(localStorage.getItem('nq_badges') || '{}'),
  journal: JSON.parse(localStorage.getItem('nq_journal') || '[]'),
  userWords: JSON.parse(localStorage.getItem('nq_words') || '{}'),
  vocabFilter: 'all',
  streak: 0,
  memState: { num:null, ayaat:[], urdu:[], idx:0, score:0, revealed:false },
  searchResults: [],
  readCount: parseInt(localStorage.getItem('nq_read') || '0'),
  memCount:  parseInt(localStorage.getItem('nq_memc') || '0'),
};

// ─── FETCH HELPER — retry with timeout ───────────────────────────────────────
async function fetchWithRetry(url, retries = 3, timeoutMs = 10000) {
  for (let i = 0; i < retries; i++) {
    try {
      const ctrl  = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), timeoutMs);
      const res   = await fetch(url, { signal: ctrl.signal });
      clearTimeout(timer);
      if (res.ok) return res;
      throw new Error(`HTTP ${res.status}`);
    } catch (e) {
      if (i === retries - 1) throw e;
      await new Promise(r => setTimeout(r, 700 * (i + 1)));
    }
  }
}

// ─── AUDIO — GitHub raw (VPN-proof) + everyayah fallback ─────────────────────
function ayahAudioUrl(surahNum, ayahNum) {
  // Primary: semarketir GitHub raw (works with VPN)
  const s = String(surahNum).padStart(3, '0');
  const a = String(ayahNum).padStart(3, '0');
  return `${AUDIO_BASE}${s}/${a}.mp3`;
}

function ayahAudioUrlFallback(surahNum, ayahNum) {
  // Fallback: everyayah.com (works without VPN)
  const folder = RECITERS[S.reciter].folder;
  const s = String(surahNum).padStart(3, '0');
  const a = String(ayahNum).padStart(3, '0');
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
  const audio   = new Audio(ayahAudioUrl(surahNum, ayahNum));
  S.currentAudio = audio;
  if (btn) { btn.textContent = '⏸ Playing…'; btn.classList.add('playing'); }

  audio.onerror = () => {
    // Try fallback URL
    const fallback = new Audio(ayahAudioUrlFallback(surahNum, ayahNum));
    S.currentAudio = fallback;
    fallback.play().catch(() => { if (btn) { btn.textContent='▶ Play'; btn.classList.remove('playing'); } });
    fallback.onended = () => { S.currentAudio=null; S.playingAyah=null; if(btn){btn.textContent='▶ Play';btn.classList.remove('playing');} };
  };

  audio.play().catch(() => { if (btn) { btn.textContent='▶ Play'; btn.classList.remove('playing'); } });
  audio.onended = () => { S.currentAudio=null; S.playingAyah=null; if(btn){btn.textContent='▶ Play';btn.classList.remove('playing');} };
}

function playSurah(surahNum, ayahs) {
  stopAudio();
  let idx = 0;
  function next() {
    if (idx >= ayahs.length) return;
    const a = ayahs[idx++];
    const audio = new Audio(ayahAudioUrl(surahNum, a.numberInSurah));
    S.currentAudio = audio;
    audio.onerror = () => {
      const fb = new Audio(ayahAudioUrlFallback(surahNum, a.numberInSurah));
      S.currentAudio = fb; fb.play().catch(()=>{}); fb.onended = next;
    };
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

// ─── STREAK ───────────────────────────────────────────────────────────────────
function initStreak() {
  const today     = new Date().toDateString();
  const lastVisit = localStorage.getItem('nq_last_visit');
  let streak      = parseInt(localStorage.getItem('nq_streak') || '0');
  if      (lastVisit === today)  { /* same day */ }
  else if (lastVisit === new Date(Date.now()-86400000).toDateString()) { streak++; localStorage.setItem('nq_streak', streak); }
  else    { streak = 1; localStorage.setItem('nq_streak', streak); }
  localStorage.setItem('nq_last_visit', today);
  S.streak = streak;
  document.getElementById('streak-num').textContent = streak;
}

// ─── NOTIFICATIONS ────────────────────────────────────────────────────────────
async function requestNotificationPermission() {
  if (!('Notification' in window)) { showToast('Notifications not supported'); return; }
  const perm = await Notification.requestPermission();
  if (perm === 'granted') { localStorage.setItem('nq_notif','1'); scheduleFajrReminder(); showToast('✅ Fajr reminder enabled!'); }
  else { showToast('⚠️ Permission denied'); }
  renderNotifBtn();
}

function scheduleFajrReminder() {
  if (Notification.permission !== 'granted') return;
  const h = parseInt(localStorage.getItem('nq_fajr_hour')||'5');
  const m = parseInt(localStorage.getItem('nq_fajr_min') ||'0');
  const now  = new Date();
  const next = new Date(); next.setHours(h,m,0,0);
  if (next <= now) next.setDate(next.getDate()+1);
  clearTimeout(window._fajrTimer);
  window._fajrTimer = setTimeout(() => {
    new Notification('NoorQuran — وقتِ فجر 🌅', { body:'اللہ کے نام سے شروع کریں — آج کی آیت پڑھیں', icon: REPO_BASE+'icons/icon-192.png', tag:'fajr' });
    scheduleFajrReminder();
  }, next - now);
}

function renderNotifBtn() {
  const btn = document.getElementById('notif-btn');
  if (!btn) return;
  const on = Notification.permission === 'granted';
  btn.textContent = on ? '🔔 Reminder ON' : '🔕 Enable Fajr Reminder';
  btn.classList.toggle('active', on);
}

// ─── SURAH LIST — self-hosted meta ────────────────────────────────────────────
async function loadSurahList() {
  try {
    await loadQuranData();
    const data = Object.entries(QURAN_AR).map(([k,s]) => ({ number: parseInt(k), name: s.name, count: s.count }));
    // Enrich with additional info
    const revelationTypes = ['Meccan','Meccan','Medinan','Medinan','Medinan','Meccan','Meccan','Medinan','Medinan','Meccan','Meccan','Meccan','Meccan','Meccan','Meccan','Meccan','Meccan','Meccan','Meccan','Meccan','Meccan','Meccan','Meccan','Medinan','Medinan','Meccan','Meccan','Medinan','Meccan','Meccan','Meccan','Meccan','Meccan','Meccan','Meccan','Meccan','Meccan','Meccan','Meccan','Meccan','Medinan','Medinan','Meccan','Medinan','Meccan','Meccan','Meccan','Medinan','Medinan','Meccan','Meccan','Meccan','Meccan','Meccan','Medinan','Medinan','Medinan','Meccan','Meccan','Meccan','Meccan','Medinan','Meccan','Medinan','Medinan','Medinan','Medinan','Meccan','Meccan','Meccan','Meccan','Medinan','Meccan','Medinan','Meccan','Meccan','Meccan','Meccan','Meccan','Medinan','Meccan','Meccan','Meccan','Meccan','Meccan','Meccan','Meccan','Meccan','Meccan','Meccan','Meccan','Medinan','Meccan','Medinan','Meccan','Meccan','Meccan','Meccan','Medinan','Meccan','Meccan','Meccan','Meccan','Meccan','Meccan','Meccan','Meccan','Meccan','Meccan','Meccan','Meccan','Meccan','Meccan','Meccan'];
    S.surahs = data.map((s,i) => ({
      number: s.number,
      name: arabicSurahNames[s.number] || s.name,
      englishName: englishSurahNames[s.number] || s.name,
      englishNameTranslation: surahMeanings[s.number] || '',
      numberOfAyahs: s.count,
      revelationType: revelationTypes[i] || 'Meccan',
    }));
    renderSurahBrowser(S.surahs);
    populateSelects();
  } catch(e) {
    console.error('loadSurahList failed:', e);
    document.getElementById('surah-browser').innerHTML =
      `<div class="empty-state"><div style="font-size:1.5rem;margin-bottom:.5rem">⚠️</div>Could not load surah list.<br><button class="btn" style="margin-top:.8rem" onclick="loadSurahList()">↻ Retry</button></div>`;
  }
}

// Arabic & English surah names
const arabicSurahNames = {1:'الفاتحة',2:'البقرة',3:'آل عمران',4:'النساء',5:'المائدة',6:'الأنعام',7:'الأعراف',8:'الأنفال',9:'التوبة',10:'يونس',11:'هود',12:'يوسف',13:'الرعد',14:'إبراهيم',15:'الحجر',16:'النحل',17:'الإسراء',18:'الكهف',19:'مريم',20:'طه',21:'الأنبياء',22:'الحج',23:'المؤمنون',24:'النور',25:'الفرقان',26:'الشعراء',27:'النمل',28:'القصص',29:'العنكبوت',30:'الروم',31:'لقمان',32:'السجدة',33:'الأحزاب',34:'سبأ',35:'فاطر',36:'يس',37:'الصافات',38:'ص',39:'الزمر',40:'غافر',41:'فصلت',42:'الشورى',43:'الزخرف',44:'الدخان',45:'الجاثية',46:'الأحقاف',47:'محمد',48:'الفتح',49:'الحجرات',50:'ق',51:'الذاريات',52:'الطور',53:'النجم',54:'القمر',55:'الرحمن',56:'الواقعة',57:'الحديد',58:'المجادلة',59:'الحشر',60:'الممتحنة',61:'الصف',62:'الجمعة',63:'المنافقون',64:'التغابن',65:'الطلاق',66:'التحريم',67:'الملك',68:'القلم',69:'الحاقة',70:'المعارج',71:'نوح',72:'الجن',73:'المزمل',74:'المدثر',75:'القيامة',76:'الإنسان',77:'المرسلات',78:'النبأ',79:'النازعات',80:'عبس',81:'التكوير',82:'الانفطار',83:'المطففين',84:'الانشقاق',85:'البروج',86:'الطارق',87:'الأعلى',88:'الغاشية',89:'الفجر',90:'البلد',91:'الشمس',92:'الليل',93:'الضحى',94:'الشرح',95:'التين',96:'العلق',97:'القدر',98:'البينة',99:'الزلزلة',100:'العاديات',101:'القارعة',102:'التكاثر',103:'العصر',104:'الهمزة',105:'الفيل',106:'قريش',107:'الماعون',108:'الكوثر',109:'الكافرون',110:'النصر',111:'المسد',112:'الإخلاص',113:'الفلق',114:'الناس'};

const englishSurahNames = {1:'Al-Fatihah',2:'Al-Baqarah',3:"Aal-i-Imraan",4:'An-Nisa',5:'Al-Maidah',6:'Al-Anam',7:'Al-Araf',8:'Al-Anfal',9:'At-Tawbah',10:'Yunus',11:'Hud',12:'Yusuf',13:'Ar-Rad',14:'Ibrahim',15:'Al-Hijr',16:'An-Nahl',17:'Al-Isra',18:'Al-Kahf',19:'Maryam',20:'Ta-Ha',21:'Al-Anbiya',22:'Al-Hajj',23:'Al-Muminun',24:'An-Nur',25:'Al-Furqan',26:'Ash-Shuara',27:'An-Naml',28:'Al-Qasas',29:'Al-Ankabut',30:'Ar-Rum',31:'Luqman',32:'As-Sajdah',33:'Al-Ahzab',34:'Saba',35:'Fatir',36:'Ya-Sin',37:'As-Saffat',38:'Sad',39:'Az-Zumar',40:'Ghafir',41:'Fussilat',42:'Ash-Shura',43:'Az-Zukhruf',44:'Ad-Dukhan',45:'Al-Jathiyah',46:'Al-Ahqaf',47:'Muhammad',48:'Al-Fath',49:'Al-Hujurat',50:'Qaf',51:'Adh-Dhariyat',52:'At-Tur',53:'An-Najm',54:'Al-Qamar',55:'Ar-Rahman',56:'Al-Waqiah',57:'Al-Hadid',58:'Al-Mujadila',59:'Al-Hashr',60:'Al-Mumtahanah',61:'As-Saf',62:'Al-Jumuah',63:'Al-Munafiqun',64:'At-Taghabun',65:'At-Talaq',66:'At-Tahrim',67:'Al-Mulk',68:'Al-Qalam',69:'Al-Haqqah',70:'Al-Maarij',71:'Nuh',72:'Al-Jinn',73:'Al-Muzzammil',74:'Al-Muddaththir',75:'Al-Qiyamah',76:'Al-Insan',77:'Al-Mursalat',78:"An-Naba",79:'An-Naziat',80:'Abasa',81:'At-Takwir',82:'Al-Infitar',83:'Al-Mutaffifin',84:'Al-Inshiqaq',85:'Al-Buruj',86:'At-Tariq',87:'Al-Ala',88:'Al-Ghashiyah',89:'Al-Fajr',90:'Al-Balad',91:'Ash-Shams',92:'Al-Layl',93:'Ad-Duha',94:'Ash-Sharh',95:'At-Tin',96:'Al-Alaq',97:'Al-Qadr',98:'Al-Bayyinah',99:'Az-Zalzalah',100:'Al-Adiyat',101:"Al-Qari'ah",102:'At-Takathur',103:'Al-Asr',104:'Al-Humazah',105:'Al-Fil',106:'Quraysh',107:"Al-Ma'un",108:'Al-Kawthar',109:'Al-Kafirun',110:'An-Nasr',111:'Al-Masad',112:'Al-Ikhlas',113:'Al-Falaq',114:'An-Nas'};

const surahMeanings = {1:'The Opening',2:'The Cow',3:'Family of Imran',4:'The Women',5:'The Table Spread',6:'The Cattle',7:'The Heights',8:'The Spoils of War',9:'The Repentance',10:'Jonah',11:'Hud',12:'Joseph',13:'The Thunder',14:'Abraham',15:'The Rocky Tract',16:'The Bee',17:'The Night Journey',18:'The Cave',19:'Mary',20:'Ta-Ha',21:'The Prophets',22:'The Pilgrimage',23:'The Believers',24:'The Light',25:'The Criterion',26:'The Poets',27:'The Ant',28:'The Stories',29:'The Spider',30:'The Romans',31:'Luqman',32:'The Prostration',33:'The Combined Forces',34:'Sheba',35:'The Originator',36:'Ya-Sin',37:'Those Who Set The Ranks',38:'The Letter Sad',39:'The Troops',40:'The Forgiver',41:'Explained in Detail',42:'The Consultation',43:'The Gold Adornments',44:'The Smoke',45:'The Crouching',46:'The Wind-Curved Sandhills',47:'Muhammad',48:'The Victory',49:'The Private Apartments',50:'The Letter Qaf',51:'The Winnowing Winds',52:'The Mount',53:'The Star',54:'The Moon',55:'The Beneficent',56:'The Inevitable',57:'The Iron',58:'She That Disputeth',59:'The Exile',60:'She That is to be Examined',61:'The Ranks',62:'The Congregation',63:'The Hypocrites',64:'Mutual Disillusion',65:'Divorce',66:'The Prohibition',67:'The Sovereignty',68:'The Pen',69:'The Reality',70:"The Ascending Stairways",71:'Noah',72:'The Jinn',73:'The Enshrouded One',74:'The Cloaked One',75:'The Resurrection',76:'The Man',77:'The Emissaries',78:'The Tidings',79:'Those Who Drag Forth',80:'He Frowned',81:'The Overthrowing',82:'The Cleaving',83:'The Defrauding',84:'The Sundering',85:'The Mansions of the Stars',86:'The Nightcommer',87:'The Most High',88:'The Overwhelming',89:'The Dawn',90:'The City',91:'The Sun',92:'The Night',93:'The Morning Hours',94:'The Relief',95:'The Fig',96:'The Clot',97:'The Power',98:'The Clear Proof',99:'The Earthquake',100:'The Courser',101:"The Calamity",102:'The Rivalry in World Increase',103:'The Declining Day',104:'The Traducer',105:'The Elephant',106:'Quraysh',107:'The Small Kindnesses',108:'The Abundance',109:'The Disbelievers',110:'The Divine Support',111:'The Palm Fiber',112:'Sincerity',113:'The Daybreak',114:'Mankind'};

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
  const knownCount = VOCAB_DATA.filter(v => S.userWords[v.a]===true).length;
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

function playTodayAyah(s,a,btn) {
  stopAudio();
  const audio = new Audio(ayahAudioUrl(s,a));
  S.currentAudio = audio;
  btn.textContent='⏸ Playing…'; btn.classList.add('playing');
  audio.onerror = () => {
    const fb = new Audio(ayahAudioUrlFallback(s,a));
    S.currentAudio=fb; fb.play().catch(()=>{});
    fb.onended=()=>{btn.textContent='▶ Play';btn.classList.remove('playing');S.currentAudio=null;};
  };
  audio.play().catch(()=>{btn.textContent='▶ Play';btn.classList.remove('playing');});
  audio.onended=()=>{btn.textContent='▶ Play';btn.classList.remove('playing');S.currentAudio=null;};
}

// ─── BROWSE ───────────────────────────────────────────────────────────────────
function renderSurahBrowser(list) {
  const el = document.getElementById('surah-browser');
  if (!list.length) { el.innerHTML='<div class="empty-state">No surahs found.</div>'; return; }
  el.innerHTML = list.map(s => {
    const badge = S.badges[s.number];
    const badgeHTML = badge ? `<span class="surah-badge ${badge==='memorized'?'badge-mem':'badge-studied'}">${badge==='memorized'?'حفظ':'مطالعہ'}</span>` : '';
    return `<div class="surah-item">
      <div class="surah-num" onclick="openSurah(${s.number})">${s.number}</div>
      <div style="flex:1;cursor:pointer" onclick="openSurah(${s.number})">
        <div class="surah-name-en">${s.englishName} <span style="font-size:11px;color:var(--ink3)">· ${s.englishNameTranslation}</span>${badgeHTML}</div>
        <div class="surah-meta">${s.numberOfAyahs} ayaat · ${s.revelationType}</div>
      </div>
      <div class="surah-ar" onclick="openSurah(${s.number})" style="cursor:pointer">${s.name}</div>
      <button class="open-reader-btn" onclick="openReader(${s.number})">📖 Read</button>
    </div>`;
  }).join('');
}

function filterSurahs() {
  const q = document.getElementById('surah-search').value.toLowerCase();
  renderSurahBrowser(S.surahs.filter(s =>
    s.englishName.toLowerCase().includes(q) || (s.name||'').includes(q) ||
    (s.englishNameTranslation||'').toLowerCase().includes(q) || String(s.number).includes(q)
  ));
}

// ─── READ — uses self-hosted data + alquran.cloud Urdu with fallback ──────────
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
    // Load from bundled JSON files — no external API, works with VPN
    await loadQuranData();
    const key = String(num);
    const arD = QURAN_AR[key];
    const enD = QURAN_EN[key];
    const urD = QURAN_UR[key];
    if (!arD) throw new Error('Surah ' + num + ' not found in bundled data');

    const surahInfo = S.surahs.find(s => s.number === parseInt(num)) || {};

    S.currentAyaat = arD.ayahs.map((text, i) => ({
      text, numberInSurah: i + 1, number: num * 1000 + i + 1,
    }));
    S.currentEnglish = (enD || []).map((text, i) => ({ text, numberInSurah: i+1 }));
    S.currentUrdu    = (urD || enD || []).map((text, i) => ({ text, numberInSurah: i+1 }));
    S.currentSurahInfo = {
      number: parseInt(num),
      name: surahInfo.name || arD.name || '',
      englishName: surahInfo.englishName || '',
      englishNameTranslation: surahInfo.englishNameTranslation || '',
      numberOfAyahs: S.currentAyaat.length,
      revelationType: surahInfo.revelationType || '',
    };
    S.currentIndoPak = S.currentAyaat;
    fetchWordByWord(num);
    S.readCount += S.currentAyaat.length;
    localStorage.setItem('nq_read', S.readCount);
    renderAyahs();

  } catch(e) {
    console.error('openSurah failed:', e);
    wrap.innerHTML = `<div class="empty-state">
      <div style="font-size:2rem;margin-bottom:.5rem">⚠️</div>
      <strong>Could not load surah.</strong><br><br>
      <span style="font-size:12px;color:var(--ink3)">Check your internet connection.</span><br><br>
      <button class="btn" onclick="openSurah(${num})">↻ Retry</button>
    </div>`;
  }
}

async function fetchWordByWord(surahNum) {
  try {
    const res  = await fetchWithRetry(`https://api.qurancdn.com/api/qdc/verses/by_chapter/${surahNum}?words=true&word_fields=text_uthmani,text_indopak,transliteration_en&per_page=300&translations=234`, 2, 8000);
    const data = await res.json();
    S.currentWordByWord = data.verses || [];
  } catch { S.currentWordByWord = []; }
}

function arabicText(a, i) {
  const raw = a.text;
  return S.tajweedOn ? applyTajweed(raw) : escHtml(raw);
}

function renderAyahs() {
  const wrap = document.getElementById('ayah-list-wrap');
  const info = S.currentSurahInfo;
  if (!info) return;

  const badge = S.badges[info.number];
  const badgeHTML = badge ? `<span class="surah-badge ${badge==='memorized'?'badge-mem':'badge-studied'}" style="margin-left:6px">${badge==='memorized'?'✓ Memorized':'✓ Studied'}</span>` : '';

  let html = `<div class="surah-header">
    <div class="surah-header-ar">${info.name}</div>
    <div class="surah-header-en">${info.englishName} · ${info.englishNameTranslation} · ${info.numberOfAyahs} ayaat${badgeHTML}</div>
    ${info.number!==9?'<div class="surah-bismillah">بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ</div>':''}
    <div style="margin-top:.7rem;display:flex;justify-content:center;gap:6px;flex-wrap:wrap">
      <button class="btn btn-gold" style="font-size:11px" onclick="playSurah(${info.number},S.currentAyaat)">▶ Play surah</button>
      <button class="btn btn-outline" style="font-size:11px" onclick="stopAudio()">⏹ Stop</button>
      <button class="btn btn-outline" style="font-size:11px" onclick="markSurah(${info.number},'studied')">📗 Studied</button>
      <button class="btn btn-outline" style="font-size:11px" onclick="markSurah(${info.number},'memorized')">🏅 Memorized</button>
    </div>
    ${S.tajweedOn ? tajweedLegendHTML() : ''}
  </div>`;

  html += S.currentAyaat.map((a, i) => {
    const isExp = S.expandedAyah === i;
    const ur    = S.currentUrdu[i]?.text   || '';
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
          const arab    = w.text_indopak || w.text_uthmani || '';
          const translit = w.transliteration?.text || '';
          const meaning  = w.translation?.text || '';
          return `<div class="word-chip"><span class="wc-arab">${arab}</span><span class="wc-translit">${translit}</span>${meaning?`<span class="wc-meaning">${meaning}</span>`:''}</div>`;
        }).join('');
        wbwHTML = `<div class="word-chips-wrap">${chips}</div>`;
      } else {
        wbwHTML = `<div style="font-size:12px;color:var(--ink3);margin-top:.5rem;text-align:center">⏳ Loading word data…</div>`;
      }
    }

    return `<div class="ayah-card${isExp?' selected':''}" id="ayah-${i}" onclick="toggleAyah(${i})">
      <div style="display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:2px">
        <div class="ayah-num">${a.numberInSurah}</div>
        <button class="bookmark-btn${isBookmarked?' active':''}" onclick="event.stopPropagation();toggleBookmark(${info.number},${a.numberInSurah},'${arRaw.replace(/'/g,"\\'")}','${ur.replace(/'/g,"\\'")}','${ref}')">${isBookmarked?'🔖':'🏷'}</button>
      </div>
      <div class="ayah-ar">${arabicText(a,i)}</div>
      ${S.mode==='both'    &&ur?`<div class="ayah-ur">${ur}</div>`:''}
      ${S.mode==='ar_en'   &&en?`<div class="ayah-en">${en}</div>`:''}
      ${S.mode==='indopak' &&ur?`<div class="ayah-ur">${ur}</div>`:''}
      ${wbwHTML}
      ${isExp?`<div class="ayah-actions">
        <button class="btn play-btn" onclick="event.stopPropagation();playAyah(${info.number},${a.numberInSurah},this)">▶ Play</button>
        <button class="btn btn-outline" onclick="event.stopPropagation();addToJournal('${arRaw.replace(/'/g,"\\'")}','${ref}')">📓 Journal</button>
        ${S.mode!=='wordbyword'?`<button class="btn btn-outline" onclick="event.stopPropagation();setModeExpand('wordbyword',${i})">📚 Word×Word</button>`:''}
      </div>`:''}
    </div>`;
  }).join('');

  wrap.innerHTML = html;

  // Add fullscreen reader button
  const header = document.querySelector('.surah-header');
  if (header && S.currentSurahNum) {
    const btn = document.createElement('button');
    btn.className = 'open-reader-btn';
    btn.style.cssText = 'margin:.6rem auto 0;display:block';
    btn.innerHTML = '📖 Open Fullscreen Reader';
    btn.onclick = () => openReader(S.currentSurahNum, S.expandedAyah || 0);
    header.appendChild(btn);
  }
}

function escHtml(s) { return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

function setModeExpand(mode, idx) {
  S.mode = mode;
  document.querySelectorAll('.mode-btn').forEach(b => b.classList.toggle('active', b.dataset.mode===mode));
  S.expandedAyah = idx;
  renderAyahs();
}
function toggleAyah(i) { S.expandedAyah = S.expandedAyah===i?null:i; renderAyahs(); }
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
  if (btn) { btn.textContent = S.tajweedOn?'🎨 Tajweed ON':'🎨 Tajweed OFF'; btn.classList.toggle('active',S.tajweedOn); }
  if (S.currentAyaat.length) renderAyahs();
}

// ─── BOOKMARKS ────────────────────────────────────────────────────────────────
function toggleBookmark(surahNum, ayahNum, ar, ur, ref) {
  const key = `${surahNum}:${ayahNum}`;
  if (S.bookmarks[key]) { delete S.bookmarks[key]; showToast('Bookmark removed'); }
  else { S.bookmarks[key]={ar,ur,ref,surahNum,ayahNum}; showToast('🔖 Bookmarked!'); }
  localStorage.setItem('nq_bookmarks', JSON.stringify(S.bookmarks));
  renderAyahs();
  if (document.getElementById('page-bookmarks')?.classList.contains('active')) renderBookmarks();
}

function renderBookmarks() {
  const el   = document.getElementById('bookmarks-list');
  const keys = Object.keys(S.bookmarks);
  if (!keys.length) {
    el.innerHTML=`<div class="empty-state"><div style="font-size:2rem;margin-bottom:.5rem">🔖</div>No bookmarks yet.<br>Tap 🏷 on any ayah while reading.</div>`; return;
  }
  el.innerHTML = keys.map(k => {
    const b = S.bookmarks[k];
    return `<div class="journal-entry">
      <div class="je-header">
        <div class="je-date">${b.ref}</div>
        <div style="display:flex;gap:6px">
          <button class="btn btn-outline" style="font-size:10px;padding:3px 7px" onclick="openSurah(${b.surahNum})">Open →</button>
          <button class="je-delete" onclick="toggleBookmark(${b.surahNum},${b.ayahNum},'','','${b.ref}')">✕</button>
        </div>
      </div>
      <div class="je-ar">${b.ar}</div>
      ${b.ur?`<div class="je-note" style="font-family:'Noto Nastaliq Urdu',serif;font-size:.85rem;direction:rtl;text-align:right">${b.ur}</div>`:''}
      <button class="audio-btn play-btn" style="margin-top:.4rem" onclick="playAyah(${b.surahNum},${b.ayahNum},this)">▶ Play</button>
    </div>`;
  }).join('');
}

// ─── BADGES / PROGRESS ────────────────────────────────────────────────────────
function markSurah(num, status) {
  if (S.badges[num]===status) { delete S.badges[num]; showToast('Badge removed'); }
  else { S.badges[num]=status; showToast(status==='memorized'?'🏅 Marked memorized! Mashallah!':'📗 Marked as studied!'); }
  localStorage.setItem('nq_badges', JSON.stringify(S.badges));
  renderAyahs();
  renderProgress();
}

function renderProgress() {
  const el = document.getElementById('progress-content');
  if (!el) return;
  const studied   = Object.values(S.badges).filter(v=>v==='studied').length;
  const memorized = Object.values(S.badges).filter(v=>v==='memorized').length;
  const pct = Math.round((studied+memorized)/114*100);
  el.innerHTML = `
    <div class="mem-card" style="margin-bottom:10px">
      <div style="font-size:14px;font-weight:600;color:var(--ink);margin-bottom:.8rem">Overall Quran Progress</div>
      <div style="display:flex;gap:1rem;margin-bottom:.8rem;flex-wrap:wrap">
        <div class="stat-pill" style="background:var(--green-lt)"><div class="stat-num" style="color:var(--green2)">${memorized}</div><div class="stat-lbl" style="color:var(--green2)">Memorized</div></div>
        <div class="stat-pill" style="background:#e8f5e9"><div class="stat-num" style="color:#2e7d32">${studied}</div><div class="stat-lbl" style="color:#2e7d32">Studied</div></div>
        <div class="stat-pill" style="background:var(--cream2)"><div class="stat-num">${114-studied-memorized}</div><div class="stat-lbl">Remaining</div></div>
      </div>
      <div style="font-size:12px;color:var(--ink3);margin-bottom:.4rem">${pct}% of Quran covered</div>
      <div class="prog-bar-wrap" style="border-radius:8px;height:10px"><div class="prog-bar" style="width:${pct}%"></div></div>
    </div>
    ${Object.keys(S.badges).length===0?'<div class="empty-state" style="padding:1rem">No surahs marked yet.</div>':
      Object.entries(S.badges).sort((a,b)=>a[0]-b[0]).map(([num,status])=>{
        const s=S.surahs.find(x=>x.number==num);
        const name=s?s.englishName:`Surah ${num}`;
        return `<div class="surah-item" onclick="openSurah(${num})" style="margin-bottom:6px;cursor:pointer">
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
  el.innerHTML = '<div class="loading"><div class="spinner"></div><span>Searching...</span></div>';
  try {
    const urduId = URDU_EDITIONS[S.urduEdition].id;
    const [arRes, urRes] = await Promise.all([
      fetchWithRetry(`https://api.alquran.cloud/v1/search/${encodeURIComponent(q)}/all/ar`, 2, 8000),
      fetchWithRetry(`https://api.alquran.cloud/v1/search/${encodeURIComponent(q)}/all/${urduId}`, 2, 8000),
    ]);
    const [arD, urD] = await Promise.all([arRes.json(), urRes.json()]);
    const map = {};
    (arD.data?.matches||[]).forEach(m => { const k=`${m.surah.number}:${m.numberInSurah}`; map[k]={ar:m.text,ur:'',ref:`${m.surah.englishName} ${m.surah.number}:${m.numberInSurah}`,surahNum:m.surah.number,ayahNum:m.numberInSurah}; });
    (urD.data?.matches||[]).forEach(m => { const k=`${m.surah.number}:${m.numberInSurah}`; if(map[k]) map[k].ur=m.text; else map[k]={ar:'',ur:m.text,ref:`${m.surah.englishName} ${m.surah.number}:${m.numberInSurah}`,surahNum:m.surah.number,ayahNum:m.numberInSurah}; });
    const results = Object.values(map);
    const countEl = document.getElementById('search-count');
    if (countEl) countEl.textContent = results.length ? `${results.length} results` : '';
    if (!results.length) { el.innerHTML=`<div class="empty-state">No results for "<strong>${q}</strong>"</div>`; return; }
    el.innerHTML = results.slice(0,50).map(r=>`
      <div class="journal-entry" style="cursor:pointer" onclick="openSurah(${r.surahNum})">
        <div class="je-header"><div class="je-date">${r.ref}</div>
          <button class="bookmark-btn${S.bookmarks[r.surahNum+':'+r.ayahNum]?' active':''}" onclick="event.stopPropagation();toggleBookmark(${r.surahNum},${r.ayahNum},'${(r.ar||'').replace(/'/g,"\\'")}','${(r.ur||'').replace(/'/g,"\\'")}','${r.ref}')">🏷</button>
        </div>
        ${r.ar?`<div class="je-ar">${highlight(r.ar,q)}</div>`:''}
        ${r.ur?`<div class="je-note" style="font-family:'Noto Nastaliq Urdu',serif;font-size:.85rem;direction:rtl;text-align:right">${highlight(r.ur,q)}</div>`:''}
        <div style="display:flex;gap:6px;margin-top:.4rem">
          <button class="audio-btn play-btn" onclick="event.stopPropagation();playAyah(${r.surahNum},${r.ayahNum},this)">▶ Play</button>
          <button class="btn btn-outline" style="font-size:10px;padding:3px 7px" onclick="event.stopPropagation();openSurah(${r.surahNum})">Open →</button>
        </div>
      </div>`).join('');
  } catch {
    el.innerHTML='<div class="empty-state">⚠️ Search requires internet. Disable VPN and try again.</div>';
  }
}

function highlight(text,q) {
  if(!q||!text) return escHtml(text||'');
  const safe=escHtml(text), safeQ=escHtml(q).replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
  return safe.replace(new RegExp(safeQ,'gi'), m=>`<mark>${m}</mark>`);
}

// ─── MEMORIZE ────────────────────────────────────────────────────────────────
async function loadMemorizeSurah() {
  const num = document.getElementById('mem-surah-select').value;
  if (!num) return;
  const el = document.getElementById('mem-content');
  el.innerHTML='<div class="loading"><div class="spinner"></div><span>Loading...</span></div>';
  try {
    await loadQuranData();
    const key   = String(num);
    const arD   = QURAN_AR[key];
    const urD   = QURAN_UR[key];
    if (!arD) throw new Error('Surah not found');
    const ayahs = arD.ayahs.map((text,i)=>({text,numberInSurah:i+1}));
    const urdu  = (urD||[]).map(text=>({text}));
    S.memState={num,ayaat:ayahs,urdu,idx:0,score:0,revealed:false};
    renderMemCard();
  } catch { el.innerHTML='<div class="empty-state">⚠️ Could not load. Check connection.</div>'; }
}

function renderMemCard() {
  const ms=S.memState, total=ms.ayaat.length;
  const prog=total?(ms.idx/total)*100:0;
  document.getElementById('mem-bar').style.width=prog+'%';
  document.getElementById('mem-prog-label').textContent=total?`${ms.idx} / ${total} ayaat`:'';
  const el=document.getElementById('mem-content');
  if(!total){el.innerHTML='<div class="empty-state">Select a surah above.</div>';return;}
  if(ms.idx>=total){
    S.memCount+=total; localStorage.setItem('nq_memc',S.memCount);
    el.innerHTML=`<div class="mem-card"><div class="mem-complete"><div class="mem-complete-icon">🌟</div><div class="mem-complete-title">Mashallah! Surah complete!</div><div class="mem-complete-score">Score: ${ms.score} / ${total} — ${Math.round(ms.score/total*100)}%</div><button class="btn btn-gold" onclick="S.memState.idx=0;S.memState.score=0;renderMemCard()">Restart</button></div></div>`;
    return;
  }
  const a=ms.ayaat[ms.idx], ur=ms.urdu[ms.idx]?.text||'';
  const words=a.text.split(' ');
  const bi=[Math.floor(Math.random()*words.length)];
  if(words.length>4) bi.push((bi[0]+Math.ceil(words.length/2))%words.length);
  const blanked=words.map((w,i)=>bi.includes(i)?`<span style="background:var(--cream3);color:transparent;border-radius:3px;padding:0 8px">____</span>`:escHtml(w)).join(' ');
  const answer=bi.map(i=>words[i]).join(' ، ');
  el.innerHTML=`
    <div class="mem-card">
      <div style="font-size:12px;font-weight:500;color:var(--ink2);margin-bottom:.8rem">Ayah ${ms.idx+1} of ${total} — fill in the missing word(s)</div>
      <div class="mem-ayah-ar">${blanked}</div>
      ${ur?`<div class="mem-ur">${ur}</div>`:''}
      ${!ms.revealed?`<input class="fill-input" id="mem-inp" placeholder="Type the missing Arabic word(s)..." onkeydown="if(event.key==='Enter')checkMem('${answer.replace(/'/g,"\\'")}')">
      <div style="display:flex;gap:6px;flex-wrap:wrap"><button class="btn" onclick="checkMem('${answer.replace(/'/g,"\\'")}')">Check ✓</button><button class="btn btn-outline" onclick="revealMem()">Show</button><button class="btn btn-outline" onclick="nextMem()">Skip →</button></div>`
      :`<div class="mem-answer-box"><div class="mem-answer-label">Answer:</div><div class="mem-answer-text">${answer}</div></div><button class="btn btn-gold" onclick="nextMem()">Next →</button>`}
    </div>
    <div class="mem-card mem-card-alt">
      <div style="font-size:11px;color:var(--ink3);font-weight:500;margin-bottom:.5rem">📖 Full ayah</div>
      <div class="mem-ayah-full">${S.tajweedOn?applyTajweed(a.text):escHtml(a.text)}</div>
      <button class="audio-btn play-btn" style="margin-top:.6rem" onclick="playAyah(${parseInt(ms.num)},${a.numberInSurah},this)">▶ Play</button>
    </div>`;
}
function checkMem(a){S.memState.score++;S.memState.revealed=true;renderMemCard();}
function revealMem(){S.memState.revealed=true;renderMemCard();}
function nextMem(){S.memState.idx++;S.memState.revealed=false;renderMemCard();}

// ─── VOCAB ────────────────────────────────────────────────────────────────────
function renderVocab() {
  const cats=['all',...new Set(VOCAB_DATA.map(v=>v.cat))];
  document.getElementById('vocab-filters').innerHTML=cats.map(c=>`<button class="filter-btn${S.vocabFilter===c?' active':''}" onclick="S.vocabFilter='${c}';renderVocab()">${c}</button>`).join('');
  const list=S.vocabFilter==='all'?VOCAB_DATA:VOCAB_DATA.filter(v=>v.cat===S.vocabFilter);
  document.getElementById('vocab-list').innerHTML=list.map(v=>{
    const known=S.userWords[v.a]===true;
    return `<div class="vocab-card" onclick="toggleWord('${v.a}')"><div class="vc-ar">${v.a}</div><div class="vc-body"><span class="vc-ur">${v.u}</span><div class="vc-meta">Appears ${v.count.toLocaleString()}× · ${v.fact}</div></div><span class="vc-badge ${known?'badge-known':'badge-learning'}">${known?'✓ Known':'Learning'}</span></div>`;
  }).join('');
}
function toggleWord(ar){S.userWords[ar]=!S.userWords[ar];localStorage.setItem('nq_words',JSON.stringify(S.userWords));renderVocab();renderHome();}

// ─── JOURNAL ──────────────────────────────────────────────────────────────────
function saveJournal(){
  const ref=document.getElementById('j-ref').value.trim(), ar=document.getElementById('j-arabic').value.trim(), note=document.getElementById('j-note').value.trim();
  if(!note&&!ar)return;
  S.journal.unshift({ref,ar,note,date:new Date().toLocaleDateString('en-PK',{day:'numeric',month:'long',year:'numeric'})});
  localStorage.setItem('nq_journal',JSON.stringify(S.journal));
  document.getElementById('j-ref').value=''; document.getElementById('j-arabic').value=''; document.getElementById('j-note').value='';
  renderJournal();
}
function addToJournal(ar,ref){showPage('journal');setTimeout(()=>{document.getElementById('j-arabic').value=ar;document.getElementById('j-ref').value=ref;document.getElementById('j-note').focus();},100);}
function deleteJournalEntry(i){S.journal.splice(i,1);localStorage.setItem('nq_journal',JSON.stringify(S.journal));renderJournal();}
function renderJournal(){
  const el=document.getElementById('journal-list');
  if(!S.journal.length){el.innerHTML=`<div class="empty-state"><div style="font-size:2rem;margin-bottom:.5rem">📓</div>Your reflections will appear here.</div>`;return;}
  el.innerHTML=S.journal.map((e,i)=>`<div class="journal-entry"><div class="je-header"><div class="je-date">${e.date}${e.ref?' · '+e.ref:''}</div><button class="je-delete" onclick="deleteJournalEntry(${i})">✕</button></div>${e.ar?`<div class="je-ar">${e.ar}</div>`:''}${e.note?`<div class="je-note">${e.note}</div>`:''}</div>`).join('');
}

// ─── MODAL ────────────────────────────────────────────────────────────────────
function showModal(ar,ur,en){document.getElementById('modal-ar').textContent=ar;document.getElementById('modal-ur').textContent=ur;document.getElementById('modal-fact').textContent=en;document.getElementById('word-modal').classList.add('open');}
function closeWordModal(){document.getElementById('word-modal').classList.remove('open');}

// ─── SETTINGS ─────────────────────────────────────────────────────────────────
function buildSettingsUI(){
  const rd=document.getElementById('reciter-select');
  if(rd){rd.innerHTML=Object.entries(RECITERS).map(([k,v])=>`<option value="${k}">${v.name}</option>`).join('');rd.value=S.reciter;rd.onchange=()=>{S.reciter=rd.value;localStorage.setItem('nq_reciter',rd.value);stopAudio();};}
  const ud=document.getElementById('urdu-select');
  if(ud){ud.innerHTML=Object.entries(URDU_EDITIONS).map(([k,v])=>`<option value="${k}">${v.name}</option>`).join('');ud.value=S.urduEdition;ud.onchange=()=>{S.urduEdition=ud.value;localStorage.setItem('nq_urdu',ud.value);if(S.currentSurahNum)openSurah(S.currentSurahNum);};}
  const fh=document.getElementById('fajr-hour');if(fh){fh.value=localStorage.getItem('nq_fajr_hour')||'5';fh.onchange=()=>{localStorage.setItem('nq_fajr_hour',fh.value);scheduleFajrReminder();};}
  const fm=document.getElementById('fajr-min');if(fm){fm.value=localStorage.getItem('nq_fajr_min')||'0';fm.onchange=()=>{localStorage.setItem('nq_fajr_min',fm.value);scheduleFajrReminder();};}
  const tb=document.getElementById('tajweed-btn');if(tb){tb.textContent=S.tajweedOn?'🎨 Tajweed ON':'🎨 Tajweed OFF';tb.classList.toggle('active',S.tajweedOn);}
  renderNotifBtn();
  if(Notification.permission==='granted')scheduleFajrReminder();
}

// ─── TOAST ────────────────────────────────────────────────────────────────────
function showToast(msg){
  let t=document.getElementById('toast');
  if(!t){t=document.createElement('div');t.id='toast';document.body.appendChild(t);}
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
  const page=new URLSearchParams(window.location.search).get('page');
  if(page) showPage(page);
}
init();
