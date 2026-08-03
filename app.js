// ══ CONFIG ════════════════════════════════════════════════════════════════════
const REPO   = '/noorquran-/';
const AUDIO  = 'https://raw.githubusercontent.com/semarketir/quranjson/master/source/audio/';
const LEVELS = [0,500,1200,2500,4500,7500,12000,20000,30000,50000];
const LEVEL_NAMES = ['Beginner','Student','Seeker','Reader','Devotee','Scholar','Hafiz','Imam','Sheikh','Mufti'];

// ══ QURAN DATA ════════════════════════════════════════════════════════════════
let QAR=null, QEN=null, QUR=null;
async function loadQ(){
  if(QAR) return;
  try {
    const [a,e,u] = await Promise.all([
      fetch(REPO+'quran-ar.json').then(r=>r.json()),
      fetch(REPO+'quran-en.json').then(r=>r.json()),
      fetch(REPO+'quran-ur.json').then(r=>r.json()),
    ]);
    QAR=a; QEN=e; QUR=u;
    console.log('Quran data loaded:',Object.keys(QAR).length,'surahs');
  } catch(e){ console.error('loadQ failed:',e); throw e; }
}

// ══ STATE ═════════════════════════════════════════════════════════════════════
const S = {
  xp:        parseInt(localStorage.getItem('nq_xp')||'0'),
  totalXp:   parseInt(localStorage.getItem('nq_total_xp')||'0'),
  streak:    0,
  ayaatRead: parseInt(localStorage.getItem('nq_ayaat')||'0'),
  challenges:parseInt(localStorage.getItem('nq_chal')||'0'),
  bookmarks: JSON.parse(localStorage.getItem('nq_bm')||'{}'),
  journal:   JSON.parse(localStorage.getItem('nq_jrn')||'[]'),
  lastSurah: parseInt(localStorage.getItem('nq_last_surah')||'1'),
  lastAyah:  parseInt(localStorage.getItem('nq_last_ayah')||'0'),
  words:     JSON.parse(localStorage.getItem('nq_words')||'{}'),
  done:      JSON.parse(localStorage.getItem('nq_done')||'{}'),  // completed challenges today
  tajweed:   JSON.parse(localStorage.getItem('nq_tajweed')||'false'),
  reciter:   localStorage.getItem('nq_reciter')||'Alafasy_128kbps',
  transPref: localStorage.getItem('nq_trans')||'ur',
  readMode:  'both',
  surahs:    [],
  // Reader state
  rd: { surahNum:1, ayahs:[], urdu:[], english:[], idx:0, audio:null, timer:null, elapsed:0, target:300, active:false, challengeKey:null },
};

// ══ SURAH META ════════════════════════════════════════════════════════════════
const EN_NAMES={1:'Al-Fatihah',2:'Al-Baqarah',3:'Aal-i-Imraan',4:'An-Nisa',5:'Al-Maidah',6:'Al-Anam',7:'Al-Araf',8:'Al-Anfal',9:'At-Tawbah',10:'Yunus',11:'Hud',12:'Yusuf',13:'Ar-Rad',14:'Ibrahim',15:'Al-Hijr',16:'An-Nahl',17:'Al-Isra',18:'Al-Kahf',19:'Maryam',20:'Ta-Ha',21:'Al-Anbiya',22:'Al-Hajj',23:'Al-Muminun',24:'An-Nur',25:'Al-Furqan',26:'Ash-Shuara',27:'An-Naml',28:'Al-Qasas',29:'Al-Ankabut',30:'Ar-Rum',31:'Luqman',32:'As-Sajdah',33:'Al-Ahzab',34:'Saba',35:'Fatir',36:'Ya-Sin',37:'As-Saffat',38:'Sad',39:'Az-Zumar',40:'Ghafir',41:'Fussilat',42:'Ash-Shura',43:'Az-Zukhruf',44:'Ad-Dukhan',45:'Al-Jathiyah',46:'Al-Ahqaf',47:'Muhammad',48:'Al-Fath',49:'Al-Hujurat',50:'Qaf',51:'Adh-Dhariyat',52:'At-Tur',53:'An-Najm',54:'Al-Qamar',55:'Ar-Rahman',56:'Al-Waqiah',57:'Al-Hadid',58:'Al-Mujadila',59:'Al-Hashr',60:'Al-Mumtahanah',61:'As-Saf',62:'Al-Jumuah',63:'Al-Munafiqun',64:'At-Taghabun',65:'At-Talaq',66:'At-Tahrim',67:'Al-Mulk',68:'Al-Qalam',69:'Al-Haqqah',70:'Al-Maarij',71:'Nuh',72:'Al-Jinn',73:'Al-Muzzammil',74:'Al-Muddaththir',75:'Al-Qiyamah',76:'Al-Insan',77:'Al-Mursalat',78:'An-Naba',79:'An-Naziat',80:'Abasa',81:'At-Takwir',82:'Al-Infitar',83:'Al-Mutaffifin',84:'Al-Inshiqaq',85:'Al-Buruj',86:'At-Tariq',87:'Al-Ala',88:'Al-Ghashiyah',89:'Al-Fajr',90:'Al-Balad',91:'Ash-Shams',92:'Al-Layl',93:'Ad-Duha',94:'Ash-Sharh',95:'At-Tin',96:'Al-Alaq',97:'Al-Qadr',98:'Al-Bayyinah',99:'Az-Zalzalah',100:'Al-Adiyat',101:"Al-Qari'ah",102:'At-Takathur',103:'Al-Asr',104:'Al-Humazah',105:'Al-Fil',106:'Quraysh',107:"Al-Ma'un",108:'Al-Kawthar',109:'Al-Kafirun',110:'An-Nasr',111:'Al-Masad',112:'Al-Ikhlas',113:'Al-Falaq',114:'An-Nas'};
const AR_NAMES={1:'الفاتحة',2:'البقرة',3:'آل عمران',4:'النساء',5:'المائدة',6:'الأنعام',7:'الأعراف',8:'الأنفال',9:'التوبة',10:'يونس',11:'هود',12:'يوسف',13:'الرعد',14:'إبراهيم',15:'الحجر',16:'النحل',17:'الإسراء',18:'الكهف',19:'مريم',20:'طه',21:'الأنبياء',22:'الحج',23:'المؤمنون',24:'النور',25:'الفرقان',26:'الشعراء',27:'النمل',28:'القصص',29:'العنكبوت',30:'الروم',31:'لقمان',32:'السجدة',33:'الأحزاب',34:'سبأ',35:'فاطر',36:'يس',37:'الصافات',38:'ص',39:'الزمر',40:'غافر',41:'فصلت',42:'الشورى',43:'الزخرف',44:'الدخان',45:'الجاثية',46:'الأحقاف',47:'محمد',48:'الفتح',49:'الحجرات',50:'ق',51:'الذاريات',52:'الطور',53:'النجم',54:'القمر',55:'الرحمن',56:'الواقعة',57:'الحديد',58:'المجادلة',59:'الحشر',60:'الممتحنة',61:'الصف',62:'الجمعة',63:'المنافقون',64:'التغابن',65:'الطلاق',66:'التحريم',67:'الملك',68:'القلم',69:'الحاقة',70:'المعارج',71:'نوح',72:'الجن',73:'المزمل',74:'المدثر',75:'القيامة',76:'الإنسان',77:'المرسلات',78:'النبأ',79:'النازعات',80:'عبس',81:'التكوير',82:'الانفطار',83:'المطففين',84:'الانشقاق',85:'البروج',86:'الطارق',87:'الأعلى',88:'الغاشية',89:'الفجر',90:'البلد',91:'الشمس',92:'الليل',93:'الضحى',94:'الشرح',95:'التين',96:'العلق',97:'القدر',98:'البينة',99:'الزلزلة',100:'العاديات',101:'القارعة',102:'التكاثر',103:'العصر',104:'الهمزة',105:'الفيل',106:'قريش',107:'الماعون',108:'الكوثر',109:'الكافرون',110:'النصر',111:'المسد',112:'الإخلاص',113:'الفلق',114:'الناس'};
const COUNTS={1:7,2:286,3:200,4:176,5:120,6:165,7:206,8:75,9:129,10:109,11:123,12:111,13:43,14:52,15:99,16:128,17:111,18:110,19:98,20:135,21:112,22:78,23:118,24:64,25:77,26:227,27:93,28:88,29:69,30:60,31:34,32:30,33:73,34:54,35:45,36:83,37:182,38:88,39:75,40:85,41:54,42:53,43:89,44:59,45:37,46:35,47:38,48:29,49:18,50:45,51:60,52:49,53:62,54:55,55:78,56:96,57:29,58:22,59:24,60:13,61:14,62:11,63:11,64:18,65:12,66:12,67:30,68:52,69:52,70:44,71:28,72:28,73:20,74:56,75:40,76:31,77:50,78:40,79:46,80:42,81:29,82:19,83:36,84:25,85:22,86:17,87:19,88:26,89:30,90:20,91:15,92:21,93:11,94:8,95:8,96:19,97:5,98:8,99:8,100:11,101:11,102:8,103:3,104:9,105:5,106:4,107:7,108:3,109:6,110:3,111:5,112:4,113:5,114:6};
const REV={1:'M',2:'Med',3:'Med',4:'Med',5:'Med',6:'M',7:'M',8:'Med',9:'Med',10:'M',11:'M',12:'M',13:'Med',14:'M',15:'M',16:'M',17:'M',18:'M',19:'M',20:'M',21:'M',22:'Med',23:'M',24:'Med',25:'M',26:'M',27:'M',28:'M',29:'M',30:'M',31:'M',32:'M',33:'Med',34:'M',35:'M',36:'M',37:'M',38:'M',39:'M',40:'M',41:'M',42:'M',43:'M',44:'M',45:'M',46:'M',47:'Med',48:'Med',49:'Med',50:'M',51:'M',52:'M',53:'M',54:'M',55:'Med',56:'M',57:'Med',58:'Med',59:'Med',60:'Med',61:'Med',62:'Med',63:'Med',64:'Med',65:'Med',66:'Med',67:'M',68:'M',69:'M',70:'M',71:'M',72:'M',73:'M',74:'M',75:'M',76:'Med',77:'M',78:'M',79:'M',80:'M',81:'M',82:'M',83:'M',84:'M',85:'M',86:'M',87:'M',88:'M',89:'M',90:'M',91:'M',92:'M',93:'M',94:'M',95:'M',96:'M',97:'M',98:'Med',99:'Med',100:'M',101:'M',102:'M',103:'M',104:'M',105:'M',106:'M',107:'M',108:'M',109:'M',110:'Med',111:'M',112:'M',113:'M',114:'M'};

// ══ DAILY AYAHS ═══════════════════════════════════════════════════════════════
let dailyAyah = {ar:'',ur:'',ref:'',s:1,a:1};
const DAILY_AYAHS=[
  {ar:'لَا يُكَلِّفُ اللَّهُ نَفْسًا إِلَّا وُسْعَهَا',ur:'اللہ کسی جان کو اس کی طاقت سے زیادہ تکلیف نہیں دیتا',ref:'Al-Baqarah 2:286',s:2,a:286},
  {ar:'وَمَن يَتَّقِ اللَّهَ يَجْعَل لَّهُ مَخْرَجًا',ur:'جو اللہ سے ڈرے اللہ اس کے لیے راہ نکالتا ہے',ref:'At-Talaq 65:2',s:65,a:2},
  {ar:'إِنَّ مَعَ الْعُسْرِ يُسْرًا',ur:'بے شک تکلیف کے ساتھ آسانی ہے',ref:'Ash-Sharh 94:6',s:94,a:6},
  {ar:'حَسْبُنَا اللَّهُ وَنِعْمَ الْوَكِيلُ',ur:'ہمارے لیے اللہ کافی ہے اور وہ بہترین کارساز ہے',ref:'Al-Imran 3:173',s:3,a:173},
  {ar:'إِنَّ اللَّهَ مَعَ الصَّابِرِينَ',ur:'بے شک اللہ صبر کرنے والوں کے ساتھ ہے',ref:'Al-Baqarah 2:153',s:2,a:153},
  {ar:'اللَّهُ نُورُ السَّمَاوَاتِ وَالْأَرْضِ',ur:'اللہ آسمانوں اور زمین کا نور ہے',ref:'An-Nur 24:35',s:24,a:35},
  {ar:'وَنَحْنُ أَقْرَبُ إِلَيْهِ مِنْ حَبْلِ الْوَرِيدِ',ur:'اور ہم اس کی شہ رگ سے بھی زیادہ قریب ہیں',ref:'Qaf 50:16',s:50,a:16},
  {ar:'فَبِأَيِّ آلَاءِ رَبِّكُمَا تُكَذِّبَانِ',ur:'تم اپنے رب کی کن کن نعمتوں کو جھٹلاؤ گے',ref:'Ar-Rahman 55:13',s:55,a:13},
  {ar:'وَلَذِكْرُ اللَّهِ أَكْبَرُ',ur:'اللہ کا ذکر سب سے بڑا ہے',ref:'Al-Ankabut 29:45',s:29,a:45},
  {ar:'رَبِّ زِدْنِي عِلْمًا',ur:'اے میرے رب میرے علم میں اضافہ فرما',ref:'Ta-Ha 20:114',s:20,a:114},
];

// ══ CHALLENGES ════════════════════════════════════════════════════════════════
const CHALLENGES = {
  daily: [
    {key:'d_2min',  emoji:'⚡',name:'Quick Recitation',   desc:'Read for 2 minutes',       xp:50,  secs:120,  type:'timer'},
    {key:'d_5min',  emoji:'🌿',name:'5 Minute Focus',     desc:'Read for 5 minutes',       xp:150, secs:300,  type:'timer'},
    {key:'d_10min', emoji:'🔥',name:'Deep Reading',       desc:'Read for 10 minutes',      xp:350, secs:600,  type:'timer'},
    {key:'d_fatiha',emoji:'📖',name:'Al-Fatiha',          desc:'Read Al-Fatiha with meaning',xp:30, surah:1,   type:'surah'},
    {key:'d_ikhlas',emoji:'✨',name:'Al-Ikhlas × 3',      desc:'Read Al-Ikhlas 3 times',   xp:60,  surah:112,  type:'surah'},
  ],
  supplement: [
    {key:'s_morning',emoji:'🌅',name:'Morning Supplement', desc:'أذكار الصباح · Start your day',        xp:80,  type:'dua',  cat:'morning'},
    {key:'s_night',  emoji:'🌙',name:'Night Supplement',   desc:'أذكار المساء · End your day',          xp:80,  type:'dua',  cat:'evening'},
    {key:'s_sleep',  emoji:'🌠',name:'Sleep Surahs',       desc:'Qul surahs before sleep',              xp:100, type:'supp', id:'night_surahs'},
    {key:'s_fajr',   emoji:'🕌',name:'After Fajr',         desc:'Surah Yasin · Every morning',          xp:200, surah:36,   type:'surah'},
  ],
  weekly: [
    {key:'w_kahf',   emoji:'🕌',name:'Jumma Special',      desc:'Read Surah Al-Kahf · Every Friday',    xp:300, surah:18,   type:'surah'},
    {key:'w_mulk',   emoji:'🌙',name:'Night of Mulk',      desc:'Surah Al-Mulk before sleep',           xp:200, surah:67,   type:'surah'},
    {key:'w_rahman', emoji:'💚',name:'Ar-Rahman Full',     desc:'Complete Surah Ar-Rahman',             xp:250, surah:55,   type:'surah'},
  ],
  monthly: [
    {key:'m_juzamma',emoji:'📚',name:'Complete Juz Amma',  desc:'All 37 surahs of Juz 30',             xp:1000,type:'multi', surahs:[78,79,80,81,82,83,84,85,86,87,88,89,90,91,92,93,94,95,96,97,98,99,100,101,102,103,104,105,106,107,108,109,110,111,112,113,114]},
    {key:'m_mulk',   emoji:'👑',name:'Mulk 30 Days',       desc:'Read Al-Mulk every day for a month',  xp:2000,type:'streak30', surah:67},
    {key:'m_kahf',   emoji:'📿',name:'Kahf 4 Fridays',     desc:'Read Al-Kahf all 4 Fridays',           xp:1200,type:'streak4',  surah:18},
  ],
  occasion: [
    {key:'o_ramadan', emoji:'🌙',name:'Ramadan Quran',     desc:'Complete 1 Juz each day of Ramadan',  xp:500, type:'info'},
    {key:'o_laylatul',emoji:'⭐',name:"Laylat ul-Qadr",    desc:'Night of Power — 1000 months of worship', xp:1000, type:'info'},
    {key:'o_ashura',  emoji:'🤲',name:'Day of Ashura',     desc:'Fast & recite Surah Al-Ikhlas 1000×', xp:500, type:'info'},
    {key:'o_arafah',  emoji:'🏔',name:'Day of Arafah',     desc:'Most sins forgiven — recite & make dua',xp:500, type:'info'},
  ],
};

// ══ DUAS DATA ═════════════════════════════════════════════════════════════════
const DUAS = {
  morning: [
    {title:'Upon Waking',arabic:'أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ وَالْحَمْدُ لِلَّهِ',urdu:'ہم نے صبح کی اور اللہ کی بادشاہت نے صبح کی، اور تمام تعریف اللہ کے لیے ہے',source:'Abu Dawud'},
    {title:'Morning Glory',arabic:'اللَّهُمَّ بِكَ أَصْبَحْنَا وَبِكَ أَمْسَيْنَا وَبِكَ نَحْيَا وَبِكَ نَمُوتُ وَإِلَيْكَ النُّشُورُ',urdu:'اے اللہ! تیرے نام سے ہم نے صبح کی، تیرے نام سے شام کی، تیرے نام سے جیتے ہیں، تیرے نام سے مریں گے اور تیری طرف اٹھائے جائیں گے',source:'Tirmidhi'},
    {title:'Protection Dua',arabic:'اللَّهُمَّ إِنِّي أَسْأَلُكَ الْعَفْوَ وَالْعَافِيَةَ فِي الدُّنْيَا وَالآخِرَةِ',urdu:'اے اللہ! میں دنیا اور آخرت میں معافی اور عافیت مانگتا ہوں',source:'Abu Dawud'},
    {title:'Sayyidul Istighfar',arabic:'اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَهَ إِلَّا أَنْتَ خَلَقْتَنِي وَأَنَا عَبْدُكَ',urdu:'اے اللہ! تو میرا رب ہے، تیرے سوا کوئی معبود نہیں، تو نے مجھے پیدا کیا اور میں تیرا بندہ ہوں',source:'Bukhari'},
  ],
  evening: [
    {title:'Evening Remembrance',arabic:'أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ وَالْحَمْدُ لِلَّهِ',urdu:'ہم نے شام کی اور اللہ کی بادشاہت نے شام کی، اور تمام تعریف اللہ کے لیے ہے',source:'Abu Dawud'},
    {title:'100× Istighfar',arabic:'أَسْتَغْفِرُ اللَّهَ وَأَتُوبُ إِلَيْهِ',urdu:'میں اللہ سے معافی مانگتا ہوں اور اس کی طرف رجوع کرتا ہوں — 100 مرتبہ',source:'Bukhari'},
    {title:'Protection at Night',arabic:'أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ',urdu:'میں اللہ کے تمام کامل کلمات کے ذریعے ہر اس چیز کی برائی سے پناہ مانگتا ہوں جو اس نے پیدا کی',source:'Muslim'},
  ],
  sleep: [
    {title:'Before Sleep',arabic:'بِاسْمِكَ اللَّهُمَّ أَمُوتُ وَأَحْيَا',urdu:'اے اللہ! تیرے نام سے مرتا اور جیتا ہوں',source:'Bukhari'},
    {title:'Ayatul Kursi',arabic:'اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ',urdu:'اللہ — اس کے سوا کوئی معبود نہیں، وہ زندہ ہے، قائم رکھنے والا ہے',source:'Quran 2:255 — reads with Quranly before sleep'},
    {title:'Al-Ikhlas × 3',arabic:'قُلْ هُوَ اللَّهُ أَحَدٌ اللَّهُ الصَّمَدُ',urdu:'کہو: وہ اللہ ایک ہے — اللہ بے نیاز ہے — 3 بار پڑھنا سارے قرآن کے برابر',source:'Bukhari'},
  ],
  salah: [
    {title:'Before Wudu',arabic:'بِسْمِ اللَّهِ',urdu:'اللہ کے نام سے شروع کرتا ہوں',source:'Abu Dawud'},
    {title:'After Wudu',arabic:'أَشْهَدُ أَنْ لَا إِلَهَ إِلَّا اللَّهُ وَأَشْهَدُ أَنَّ مُحَمَّدًا عَبْدُهُ وَرَسُولُهُ',urdu:'میں گواہی دیتا ہوں کہ اللہ کے سوا کوئی معبود نہیں اور محمد ﷺ اس کے بندے اور رسول ہیں',source:'Muslim'},
    {title:'After Salah',arabic:'سُبْحَانَ اللَّهِ وَالْحَمْدُ لِلَّهِ وَاللَّهُ أَكْبَرُ',urdu:'اللہ پاک ہے، تمام تعریف اللہ کے لیے ہے، اللہ سب سے بڑا ہے — 33،33،33 مرتبہ',source:'Muslim'},
  ],
  travel: [
    {title:'Leaving Home',arabic:'بِسْمِ اللَّهِ تَوَكَّلْتُ عَلَى اللَّهِ وَلَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ',urdu:'اللہ کے نام سے، اللہ پر بھروسہ کیا، اور کوئی طاقت و قوت نہیں سوائے اللہ کے',source:'Abu Dawud'},
    {title:'Entering Vehicle',arabic:'سُبْحَانَ الَّذِي سَخَّرَ لَنَا هَذَا وَمَا كُنَّا لَهُ مُقْرِنِينَ',urdu:'پاک ہے وہ ذات جس نے ہمارے لیے یہ مسخر کیا اور ہم اسے قابو کرنے والے نہ تھے',source:'Quran 43:13'},
  ],
};

// ══ SUPPLEMENT CONTENT ════════════════════════════════════════════════════════
const SUPPLEMENTS = {
  morning: {
    title:'🌅 Morning Supplement',
    items:[
      {ar:'أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ',ur:'ہم نے صبح کی اور اللہ کی بادشاہت نے صبح کی',ref:'Morning Dua'},
      {ar:'اللَّهُمَّ بِكَ أَصْبَحْنَا',ur:'اے اللہ تیرے نام سے ہم نے صبح کی',ref:'Morning Dua'},
      {ar:'بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ ۝ الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ',ur:'اللہ کے نام سے — تمام تعریف اللہ ہی کے لیے ہے جو تمام جہانوں کا پروردگار ہے',ref:'Al-Fatiha 1:1-2'},
      {ar:'قُلْ هُوَ اللَّهُ أَحَدٌ',ur:'کہو: وہ اللہ ایک ہے',ref:'Al-Ikhlas 112:1'},
      {ar:'اللَّهُ لَا إِلَهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ',ur:'اللہ — اس کے سوا کوئی معبود نہیں',ref:'Ayatul Kursi 2:255'},
    ]
  },
  night: {
    title:'🌙 Night Supplement',
    items:[
      {ar:'أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ',ur:'ہم نے شام کی اور اللہ کی بادشاہت نے شام کی',ref:'Evening Dua'},
      {ar:'أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّاتِ',ur:'میں اللہ کے تمام کامل کلمات کے ذریعے پناہ مانگتا ہوں',ref:'Evening Dua'},
      {ar:'اللَّهُ لَا إِلَهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ',ur:'اللہ — اس کے سوا کوئی معبود نہیں',ref:'Ayatul Kursi'},
      {ar:'قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ',ur:'کہو: میں صبح کے رب کی پناہ مانگتا ہوں',ref:'Al-Falaq 113:1'},
      {ar:'قُلْ أَعُوذُ بِرَبِّ النَّاسِ',ur:'کہو: میں لوگوں کے رب کی پناہ مانگتا ہوں',ref:'An-Nas 114:1'},
    ]
  },
  night_surahs: {
    title:'🌠 Sleep Surahs',
    items:[
      {ar:'قُلْ هُوَ اللَّهُ أَحَدٌ اللَّهُ الصَّمَدُ لَمْ يَلِدْ وَلَمْ يُولَدْ وَلَمْ يَكُن لَّهُ كُفُوًا أَحَدٌ',ur:'کہو وہ اللہ ایک ہے — اللہ بے نیاز ہے — نہ اس نے کسی کو جنا نہ وہ جنا گیا',ref:'Al-Ikhlas (×3)'},
      {ar:'قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ مِن شَرِّ مَا خَلَقَ',ur:'کہو میں صبح کے رب کی پناہ مانگتا ہوں — ہر اس چیز کی برائی سے جو اس نے پیدا کی',ref:'Al-Falaq (×3)'},
      {ar:'قُلْ أَعُوذُ بِرَبِّ النَّاسِ مَلِكِ النَّاسِ إِلَهِ النَّاسِ',ur:'کہو میں لوگوں کے رب کی پناہ مانگتا ہوں — لوگوں کے بادشاہ کی — لوگوں کے معبود کی',ref:'An-Nas (×3)'},
      {ar:'بِاسْمِكَ اللَّهُمَّ أَمُوتُ وَأَحْيَا',ur:'اے اللہ تیرے نام سے مرتا اور جیتا ہوں',ref:'Sleep Dua'},
    ]
  },
  jumma: {
    title:'🕌 Jumma Special — Surah Al-Kahf',
    items:[
      {ar:'بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ الْحَمْدُ لِلَّهِ الَّذِي أَنزَلَ عَلَىٰ عَبْدِهِ الْكِتَابَ',ur:'اللہ کے نام سے — تمام تعریف اللہ کے لیے جس نے اپنے بندے پر کتاب نازل کی',ref:'Al-Kahf 18:1'},
      {ar:'إِنَّا جَعَلْنَا مَا عَلَى الْأَرْضِ زِينَةً لَّهَا لِنَبْلُوَهُمْ أَيُّهُمْ أَحْسَنُ عَمَلًا',ur:'بے شک ہم نے زمین پر جو کچھ ہے اسے اس کی زینت بنایا تاکہ ان کو آزمائیں کہ ان میں سے کون عمل میں بہتر ہے',ref:'Al-Kahf 18:7'},
    ]
  },
};

// ══ BADGES ════════════════════════════════════════════════════════════════════
const BADGES=[
  {icon:'🔥',lbl:'3-Day\nStreak',key:'streak_3',check:()=>S.streak>=3},
  {icon:'💎',lbl:'7-Day\nStreak',key:'streak_7',check:()=>S.streak>=7},
  {icon:'🌟',lbl:'30-Day\nStreak',key:'streak_30',check:()=>S.streak>=30},
  {icon:'📖',lbl:'First\nSurah',key:'first_surah',check:()=>S.ayaatRead>0},
  {icon:'✨',lbl:'100\nAyaat',key:'100_ayaat',check:()=>S.ayaatRead>=100},
  {icon:'🏆',lbl:'500\nAyaat',key:'500_ayaat',check:()=>S.ayaatRead>=500},
  {icon:'⚡',lbl:'Level\n5',key:'level_5',check:()=>calcLevel()>=5},
  {icon:'🕌',lbl:'Jumma\nKahf',key:'jumma_kahf',check:()=>S.done['w_kahf']},
  {icon:'🌙',lbl:'Night\nSupp',key:'night_supp',check:()=>S.done['s_night']},
  {icon:'🌅',lbl:'Morning\nSupp',key:'morning_supp',check:()=>S.done['s_morning']},
  {icon:'🤲',lbl:'First\nDua',key:'first_dua',check:()=>true},  // always earned for opening Duas
  {icon:'💫',lbl:'1000 XP',key:'xp_1000',check:()=>S.totalXp>=1000},
];

// ══ UTILS ═════════════════════════════════════════════════════════════════════
const esc=s=>String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
const fmt=s=>{const m=Math.floor(s/60),sec=s%60;return`${m}:${sec.toString().padStart(2,'0')}`;};
const today=()=>new Date().toDateString();

function calcLevel(){
  let lvl=1;
  for(let i=0;i<LEVELS.length;i++){if(S.totalXp>=LEVELS[i])lvl=i+1;}
  return Math.min(lvl,LEVELS.length);
}

function addXP(amount, label=''){
  S.xp      += amount;
  S.totalXp += amount;
  localStorage.setItem('nq_xp', S.xp);
  localStorage.setItem('nq_total_xp', S.totalXp);
  showToast(`+${amount} XP${label?' · '+label:''}⚡`);
  updateHomeStats();
}

function showToast(msg){
  const t=document.getElementById('toast');
  t.textContent=msg; t.className='toast show';
  clearTimeout(t._t); t._t=setTimeout(()=>t.classList.remove('show'),2500);
}

function showPage(id, btn){
  document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
  document.querySelectorAll('.bn-btn').forEach(b=>b.classList.remove('active'));
  document.getElementById('page-'+id).classList.add('active');
  if(btn) btn.classList.add('active');
  else {
    const map={home:0,read:1,goals:2,duas:3,me:4};
    if(map[id]!==undefined) document.querySelectorAll('.bn-btn')[map[id]]?.classList.add('active');
  }
  if(id==='home')  renderHome();
  if(id==='goals') renderGoals();
  if(id==='duas')  renderDuas();
  if(id==='me')    renderMe();
}

// ══ STREAK ════════════════════════════════════════════════════════════════════
function initStreak(){
  const todayStr = today();
  const last     = localStorage.getItem('nq_last_visit');
  let   streak   = parseInt(localStorage.getItem('nq_streak')||'0');
  if     (last===todayStr) {}
  else if(last===new Date(Date.now()-86400000).toDateString()){ streak++; localStorage.setItem('nq_streak',streak); }
  else  { streak=1; localStorage.setItem('nq_streak',streak); }
  localStorage.setItem('nq_last_visit', todayStr);
  S.streak = streak;
  // Reset daily XP if new day
  if(last !== todayStr){ S.xp=0; localStorage.setItem('nq_xp',0); }
}

// ══ HOME ══════════════════════════════════════════════════════════════════════
function renderHome(){
  updateHomeStats();
  // Greeting
  const h = new Date().getHours();
  const gr = h<12?'صباح الخیر — Good Morning 🌅': h<17?'السلام علیکم 🌿': h<20?'مساء الخیر — Good Evening 🌙':'لیلۃ طیبہ — Good Night ⭐';
  const el = document.getElementById('hero-greeting');
  if(el) el.textContent = gr;
  // Date
  const de = document.getElementById('hero-date');
  if(de){
    const now = new Date();
    de.innerHTML = now.toLocaleDateString('en-PK',{weekday:'long',day:'numeric',month:'long'});
  }
  // Daily ayah
  dailyAyah = DAILY_AYAHS[new Date().getDate()%DAILY_AYAHS.length];
  const dacR  = document.getElementById('dac-ref');
  const dacAr = document.getElementById('dac-arabic');
  const dacUr = document.getElementById('dac-urdu');
  if(dacR)  dacR.textContent  = dailyAyah.ref;
  if(dacAr) dacAr.innerHTML   = S.tajweed?applyTajweed(dailyAyah.ar):esc(dailyAyah.ar);
  if(dacUr) dacUr.textContent = dailyAyah.ur;
  // Play button
  const pp = document.getElementById('dac-play');
  if(pp) pp.onclick = ()=>playDailyAyah(pp);
  // Challenge card
  const dc = CHALLENGES.daily[1]; // 5-min
  const prog = S.done[dc.key]?100:0;
  document.getElementById('chc-title').textContent = dc.name;
  document.getElementById('chc-desc').textContent  = dc.desc;
  document.getElementById('chc-home-prog').style.width = prog+'%';
  // Continue reading
  const cc  = document.getElementById('cc-title');
  const ccs = document.getElementById('cc-sub');
  if(cc)  cc.textContent  = EN_NAMES[S.lastSurah]||'Al-Fatihah';
  if(ccs) ccs.textContent = `${AR_NAMES[S.lastSurah]||''} · Ayah ${S.lastAyah+1}`;
  // Occasion banner
  checkOccasion();
  // Monthly progress
  const juzAmmaSurahs=[78,79,80,81,82,83,84,85,86,87,88,89,90,91,92,93,94,95,96,97,98,99,100,101,102,103,104,105,106,107,108,109,110,111,112,113,114];
  const done=juzAmmaSurahs.filter(n=>S.done['read_'+n]).length;
  const pct=Math.round(done/juzAmmaSurahs.length*100);
  const mp=document.getElementById('mc-prog');
  const mpct=document.getElementById('mc-pct');
  if(mp) mp.style.width=pct+'%';
  if(mpct) mpct.textContent=pct+'% complete ('+done+'/37 surahs)';
}

function updateHomeStats(){
  const lvl=calcLevel();
  const curLvlXp=LEVELS[lvl-1]||0;
  const nxtLvlXp=LEVELS[lvl]||LEVELS[LEVELS.length-1];
  const pct=Math.min(100,Math.round((S.totalXp-curLvlXp)/(nxtLvlXp-curLvlXp)*100));
  const sb=document.getElementById('hs-streak'); if(sb) sb.textContent=S.streak;
  const xb=document.getElementById('hs-xp');     if(xb) xb.textContent=S.xp;
  const ab=document.getElementById('hs-ayaat');  if(ab) ab.textContent=S.ayaatRead;
  const bar=document.getElementById('xp-bar');   if(bar) bar.style.width=pct+'%';
  const lbl=document.getElementById('xp-label'); if(lbl) lbl.textContent=`Level ${lvl} · ${S.totalXp.toLocaleString()} XP`;
}

function checkOccasion(){
  const banner=document.getElementById('occasion-banner');
  if(!banner) return;
  const now=new Date(); const d=now.getDate(); const m=now.getMonth()+1;
  const dow=now.getDay(); // 0=Sun 5=Fri
  let msg='';
  if(dow===5) msg='🕌 Jumma Mubarak! Read Surah Al-Kahf today for extra blessings';
  else if(m===9) msg='🌙 Ramadan Mubarak! Extra rewards for every letter recited';
  else if(m===12&&d>=1&&d<=10) msg='🏔 First 10 days of Dhul Hijjah — best days of the year!';
  if(msg){ banner.style.display='block'; banner.textContent=msg; }
  else banner.style.display='none';
}

function playDailyAyah(btn){
  const s=String(dailyAyah.s).padStart(3,'0');
  const a=String(dailyAyah.a).padStart(3,'0');
  const url=AUDIO+s+'/'+a+'.mp3';
  if(window._dayAudio){ window._dayAudio.pause(); window._dayAudio=null; btn.textContent='▶ Play'; return; }
  window._dayAudio=new Audio(url);
  btn.textContent='⏸ Stop';
  window._dayAudio.play().catch(()=>{btn.textContent='▶ Play';});
  window._dayAudio.onended=()=>{btn.textContent='▶ Play';window._dayAudio=null;};
}

function continueReading(){ openSurahReader(S.lastSurah, S.lastAyah); }

// ══ GOALS ═════════════════════════════════════════════════════════════════════
function renderGoals(){
  renderChallengeList('daily-challenges-list', CHALLENGES.daily);
  renderChallengeList('supplement-list', CHALLENGES.supplement);
  renderChallengeList('weekly-list', CHALLENGES.weekly);
  renderChallengeList('monthly-list', CHALLENGES.monthly);
  renderChallengeList('occasion-list', CHALLENGES.occasion);
}

function renderChallengeList(id, list){
  const el=document.getElementById(id);
  if(!el) return;
  el.innerHTML=list.map(c=>{
    const done=S.done[c.key];
    return`<div class="chl-item${done?' done':''}" onclick="handleChallenge('${c.key}')">
      <div class="chl-top">
        <span class="chl-emoji">${c.emoji}</span>
        <div class="chl-info">
          <div class="chl-name">${c.name}</div>
          <div class="chl-desc">${c.desc}</div>
        </div>
        <div class="chl-right">
          <div class="chl-xp">+${c.xp} XP</div>
          ${done?'<div><span class="chl-done-badge">✓ Done</span></div>':'<div class="chl-status">Tap to start</div>'}
        </div>
      </div>
      <div class="chl-prog-wrap"><div class="chl-prog-fill" style="width:${done?100:0}%"></div></div>
    </div>`;
  }).join('');
}

function handleChallenge(key){
  const all=[...CHALLENGES.daily,...CHALLENGES.supplement,...CHALLENGES.weekly,...CHALLENGES.monthly,...CHALLENGES.occasion];
  const c=all.find(x=>x.key===key);
  if(!c) return;
  if(c.type==='timer')     startChallenge(key, c);
  else if(c.type==='surah') openSurahReader(c.surah, 0, key);
  else if(c.type==='dua')   openSupplement(c.cat, key);
  else if(c.type==='supp')  openSupplement(c.id, key);
  else if(c.type==='info')  showToast('🌙 '+c.name+' — track manually in your journal');
  else if(c.type==='multi') openSurahReader(c.surahs[0], 0, key);
}

// ══ TIMED CHALLENGE ═══════════════════════════════════════════════════════════
let _chalTimer=null, _chalElapsed=0, _chalTarget=0, _chalXP=0, _chalKey='';
function startChallenge(key, c){
  const all=[...CHALLENGES.daily,...CHALLENGES.supplement,...CHALLENGES.weekly,...CHALLENGES.monthly];
  c=c||all.find(x=>x.key===key)||{name:'Challenge',xp:100,secs:120};
  _chalKey=key||'d_2min'; _chalElapsed=0; _chalTarget=c.secs||120; _chalXP=c.xp||50;
  document.getElementById('co-title').textContent=c.name||'Challenge';
  document.getElementById('co-timer').textContent=fmt(0);
  document.getElementById('co-prog').style.width='0%';
  document.getElementById('co-pts').textContent='+0 XP';
  document.getElementById('co-msg').textContent='Reading time started — open Read tab!';
  document.getElementById('challenge-overlay').style.display='flex';
  clearInterval(_chalTimer);
  _chalTimer=setInterval(()=>{
    _chalElapsed++;
    const pct=Math.min(100,_chalElapsed/_chalTarget*100);
    const pts=Math.floor(_chalElapsed*(_chalXP/_chalTarget));
    document.getElementById('co-timer').textContent=fmt(_chalElapsed);
    document.getElementById('co-prog').style.width=pct+'%';
    document.getElementById('co-pts').textContent='+'+pts+' XP';
    if(_chalElapsed===Math.floor(_chalTarget*0.5)) document.getElementById('co-msg').textContent='Halfway there! Keep going 💪';
    if(_chalElapsed>=_chalTarget){ clearInterval(_chalTimer); finishChallenge(); }
  },1000);
}

function finishChallenge(){
  clearInterval(_chalTimer);
  document.getElementById('co-timer').textContent='Done! 🌟';
  document.getElementById('co-msg').textContent='Mashallah! Challenge complete!';
  document.getElementById('co-prog').style.width='100%';
  addXP(_chalXP, 'Challenge');
  markDone(_chalKey);
  setTimeout(endChallenge, 1500);
}

function completeChallengeManually(){
  const pts=Math.floor(_chalElapsed*(_chalXP/_chalTarget));
  clearInterval(_chalTimer);
  addXP(Math.max(pts, Math.floor(_chalXP*0.3)), 'Partial');
  markDone(_chalKey);
  endChallenge();
}

function endChallenge(){
  clearInterval(_chalTimer);
  document.getElementById('challenge-overlay').style.display='none';
}

function markDone(key){
  S.done[key]=today();
  localStorage.setItem('nq_done', JSON.stringify(S.done));
  S.challenges++;
  localStorage.setItem('nq_chal', S.challenges);
  renderGoals();
}

// ══ SUPPLEMENTS ═══════════════════════════════════════════════════════════════
let _suppKey='', _suppXP=80;
function openSupplement(id, key){
  const supp=SUPPLEMENTS[id];
  if(!supp) return;
  _suppKey=key||('s_'+id); _suppXP=80;
  document.getElementById('supp-title').textContent=supp.title;
  document.getElementById('supp-content').innerHTML=supp.items.map((item,i)=>`
    <div class="supp-ayah">
      <div class="supp-ar">${esc(item.ar)}</div>
      <div class="supp-ur">${esc(item.ur)}</div>
      <div class="supp-ref">${item.ref}</div>
    </div>`).join('');
  document.getElementById('supp-overlay').style.display='flex';
}
function closeSupp(){ document.getElementById('supp-overlay').style.display='none'; }
function completeSupplement(){ addXP(_suppXP,'Supplement'); markDone(_suppKey); closeSupp(); }

// ══ READ PAGE ═════════════════════════════════════════════════════════════════
async function initReadPage(){
  await loadQ();
  const picker=document.getElementById('surah-picker');
  if(!picker||picker.options.length>1) return;
  for(let n=1;n<=114;n++){
    const o=document.createElement('option');
    o.value=n;
    o.textContent=`${n}. ${EN_NAMES[n]} · ${AR_NAMES[n]}`;
    picker.appendChild(o);
  }
}

function setReadMode(mode, btn){
  S.readMode=mode;
  document.querySelectorAll('.mode-pill').forEach(b=>b.classList.remove('active'));
  btn.classList.add('active');
  if(S.lastSurah) renderAyahList(S.lastSurah);
}

async function loadAndRead(num){
  if(!num) return;
  await loadQ();
  S.lastSurah=parseInt(num);
  localStorage.setItem('nq_last_surah',num);
  renderAyahList(num);
}

function renderAyahList(num){
  const scroll=document.getElementById('ayah-scroll');
  const arD=QAR[String(num)], enD=QEN[String(num)], urD=QUR[String(num)];
  if(!arD){scroll.innerHTML='<div class="loading-spin"><div class="spinner"></div><span>Loading...</span></div>';return;}
  const name=EN_NAMES[num], arName=AR_NAMES[num];
  let html=`<div class="surah-title-card">
    <div class="stc-ar">${arName}</div>
    <div class="stc-en">${name} · ${COUNTS[num]} ayaat · ${REV[num]==='M'?'Meccan':'Medinan'}</div>
    ${num!==9?'<div class="stc-bismillah">بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ</div>':''}
    <div class="stc-actions">
      <button class="gold-btn" onclick="openSurahReader(${num},0)">📖 Immersive Read</button>
      <button class="outline-btn" onclick="playFullSurah(${num})">▶ Play Surah</button>
      <button class="outline-btn" onclick="stopAudio()">⏹</button>
    </div>
  </div>`;

  arD.ayahs.forEach((ar,i)=>{
    const ur=(urD&&urD[i])||'';
    const en=(enD&&enD[i])||'';
    const key=num+':'+(i+1);
    const bm=!!S.bookmarks[key];
    html+=`<div class="ayah-block" id="ab-${i}" onclick="toggleAyahExpand(${i})">
      <div class="ayah-block-top">
        <div class="ab-num">${i+1}</div>
        <button class="ab-bmark${bm?' on':''}" onclick="event.stopPropagation();bmarkAyah(${num},${i+1},'${ar.replace(/'/g,"\\'")}','${ur.replace(/'/g,"\\'")}')">
          ${bm?'🔖':'🏷'}
        </button>
      </div>
      <div class="ab-arabic">${S.tajweed?applyTajweed(ar):esc(ar)}</div>
      ${S.readMode!=='ar'&&S.readMode!=='en'&&ur?`<div class="ab-urdu">${esc(ur)}</div>`:''}
      ${S.readMode==='en'&&en?`<div class="ab-english">${esc(en)}</div>`:''}
    </div>`;
  });
  scroll.innerHTML=html;
  // Track reading
  S.ayaatRead+=arD.ayahs.length;
  localStorage.setItem('nq_ayaat',S.ayaatRead);
}

function toggleAyahExpand(i){
  const el=document.getElementById('ab-'+i);
  if(!el) return;
  const isExp=el.classList.toggle('expanded');
  const num=S.lastSurah;
  const arD=QAR[String(num)], enD=QEN[String(num)], urD=QUR[String(num)];
  if(!arD) return;
  const ar=arD.ayahs[i]||'', ur=(urD&&urD[i])||'', en=(enD&&enD[i])||'';
  if(isExp){
    const actDiv=document.createElement('div');
    actDiv.className='ab-actions';
    actDiv.id='ab-act-'+i;
    actDiv.innerHTML=`
      <button class="gold-btn" onclick="event.stopPropagation();playAyah(${num},${i+1})">▶ Play</button>
      <button class="outline-btn" onclick="event.stopPropagation();openSurahReader(${num},${i})">📖 Read</button>
      <button class="outline-btn" onclick="event.stopPropagation();addToJournal('${ar.replace(/'/g,"\\'")}','${EN_NAMES[num]} ${num}:${i+1}')">📓</button>
    `;
    el.appendChild(actDiv);
    if(S.readMode==='wbw') renderWBW(el, ar, ur);
  } else {
    document.getElementById('ab-act-'+i)?.remove();
    el.querySelector('.wbw-chips')?.remove();
  }
}

function renderWBW(container, ar, ur){
  const words=ar.split(' ');
  const div=document.createElement('div');
  div.className='wbw-chips';
  div.innerHTML=words.map(w=>`<div class="wbw-chip"><span class="wbw-ar">${esc(w)}</span></div>`).join('');
  container.appendChild(div);
}

function bmarkAyah(surahNum, ayahNum, ar, ur){
  const key=surahNum+':'+ayahNum;
  if(S.bookmarks[key]){ delete S.bookmarks[key]; showToast('Bookmark removed'); }
  else { S.bookmarks[key]={ar,ur,ref:EN_NAMES[surahNum]+' '+surahNum+':'+ayahNum,surahNum,ayahNum}; showToast('🔖 Bookmarked!'); addXP(5,'Bookmark'); }
  localStorage.setItem('nq_bm',JSON.stringify(S.bookmarks));
  // Update icon
  const btn=document.querySelector(`#ab-${ayahNum-1} .ab-bmark`);
  if(btn){ btn.classList.toggle('on',!!S.bookmarks[key]); btn.textContent=S.bookmarks[key]?'🔖':'🏷'; }
}

// ══ FULLSCREEN READER ═════════════════════════════════════════════════════════
const RD={surahNum:1,ayahs:[],urdu:[],english:[],idx:0,audio:null,timer:null,elapsed:0,target:300,active:false,challengeKey:null,ctxCache:{}};

async function openSurahReader(surahNum, startIdx=0, challengeKey=null){
  await loadQ();
  const num=parseInt(surahNum)||1;
  RD.surahNum=num;
  RD.ayahs  =(QAR[String(num)]?.ayahs)||[];
  RD.urdu   =QUR[String(num)]||[];
  RD.english=QEN[String(num)]||[];
  RD.idx    =Math.max(0,Math.min(startIdx,RD.ayahs.length-1));
  RD.challengeKey=challengeKey;
  RD.ctxCache={};
  S.lastSurah=num; localStorage.setItem('nq_last_surah',num);
  document.getElementById('reader-overlay').classList.add('open');
  rdRender();
  rdStartTimer();
  rdSetupSwipe();
  document.getElementById('rd-swipe-hint').style.opacity='1';
  setTimeout(()=>{ const h=document.getElementById('rd-swipe-hint'); if(h) h.style.opacity='0'; },3000);
}

function closeReader(){
  document.getElementById('reader-overlay').classList.remove('open');
  rdStopAudio(); rdStopTimer();
  S.ayaatRead+=RD.idx+1; localStorage.setItem('nq_ayaat',S.ayaatRead);
  S.lastAyah=RD.idx; localStorage.setItem('nq_last_ayah',RD.idx);
  if(RD.challengeKey) markDone(RD.challengeKey);
  updateHomeStats();
}

function rdRender(){
  const ar=RD.ayahs[RD.idx]||'';
  const ur=RD.urdu[RD.idx]||'';
  const en=RD.english[RD.idx]||'';
  const total=RD.ayahs.length;
  const pct=Math.round(((RD.idx+1)/total)*100);
  const key=RD.surahNum+':'+(RD.idx+1);
  const bm=!!S.bookmarks[key];

  document.getElementById('rd-label').textContent=`${EN_NAMES[RD.surahNum]} · ${RD.idx+1}/${total}`;
  document.getElementById('rd-prog').style.width=pct+'%';
  document.getElementById('rd-num').textContent=RD.idx+1;
  document.getElementById('rd-arabic').innerHTML=S.tajweed?applyTajweed(ar):esc(ar);
  document.getElementById('rd-urdu').textContent=S.transPref==='ur'?ur:en;
  document.getElementById('rd-english').textContent=S.transPref==='ur'&&en?en:'';
  document.getElementById('rd-english').style.display=S.transPref==='ur'&&en?'block':'none';
  document.getElementById('rd-wbw').innerHTML='';
  document.getElementById('rd-bookmark-btn').textContent=bm?'🔖':'🏷';
  document.getElementById('rd-prev').disabled=RD.idx===0;
  document.getElementById('rd-next').disabled=RD.idx===total-1;
}

function readerNav(dir){
  const newIdx=RD.idx+dir;
  if(newIdx<0||newIdx>=RD.ayahs.length) return;
  const card=document.getElementById('rd-card');
  if(card){
    card.style.transition='transform .2s ease,opacity .2s';
    card.style.transform=dir<0?'translateX(40px)':'translateX(-40px)';
    card.style.opacity='0';
    setTimeout(()=>{
      RD.idx=newIdx;
      card.style.transition='none';
      card.style.transform=dir<0?'translateX(-40px)':'translateX(40px)';
      card.style.opacity='0';
      rdRender();
      requestAnimationFrame(()=>{
        card.style.transition='transform .2s ease,opacity .2s';
        card.style.transform='translateX(0)';
        card.style.opacity='1';
      });
    },200);
  } else { RD.idx=newIdx; rdRender(); }
}

function rdSetupSwipe(){
  const area=document.getElementById('rd-card-area');
  if(!area||area._swipe) return;
  area._swipe=true;
  let sx=0,sy=0;
  area.addEventListener('touchstart',e=>{sx=e.touches[0].clientX;sy=e.touches[0].clientY;},{passive:true});
  area.addEventListener('touchend',e=>{
    const dx=e.changedTouches[0].clientX-sx;
    const dy=e.changedTouches[0].clientY-sy;
    if(Math.abs(dx)>Math.abs(dy)&&Math.abs(dx)>40){ dx<0?readerNav(1):readerNav(-1); }
  },{passive:true});
  document.addEventListener('keydown',e=>{
    if(document.getElementById('reader-overlay').classList.contains('open')){
      if(e.key==='ArrowLeft') readerNav(1);
      if(e.key==='ArrowRight') readerNav(-1);
      if(e.key==='Escape') closeReader();
    }
  });
}

function readerPlay(){
  const btn=document.getElementById('rd-play');
  if(RD.audio&&!RD.audio.paused){
    RD.audio.pause(); RD.audio=null;
    btn.textContent='▶'; btn.classList.remove('playing'); return;
  }
  const s=String(RD.surahNum).padStart(3,'0');
  const a=String(RD.idx+1).padStart(3,'0');
  RD.audio=new Audio(AUDIO+s+'/'+a+'.mp3');
  btn.textContent='⏸'; btn.classList.add('playing');
  RD.audio.play().catch(()=>{btn.textContent='▶';btn.classList.remove('playing');});
  RD.audio.onended=()=>{
    btn.textContent='▶'; btn.classList.remove('playing'); RD.audio=null;
    setTimeout(()=>readerNav(1), 500);
  };
}

function rdStopAudio(){ if(RD.audio){RD.audio.pause();RD.audio=null;} }

function rdStartTimer(){
  RD.elapsed=0; RD.active=true;
  clearInterval(RD.timer);
  RD.timer=setInterval(()=>{
    if(!RD.active) return;
    RD.elapsed++;
    const target=300; // 5 min
    const pct=Math.min(100,RD.elapsed/target*100);
    const pts=Math.floor(RD.elapsed*(150/target));
    const fill=document.getElementById('rcs-fill');
    const time=document.getElementById('rcs-time');
    const ptEl=document.getElementById('rcs-pts');
    if(fill) fill.style.width=pct+'%';
    if(time) time.textContent=fmt(RD.elapsed);
    if(ptEl) ptEl.textContent='+'+pts;
    if(RD.elapsed===target){ clearInterval(RD.timer); addXP(150,'Reading Session'); showToast('🌟 5-min challenge complete!'); }
  },1000);
}

function rdStopTimer(){ RD.active=false; clearInterval(RD.timer); }

function readerToggleBookmark(){
  const ar=RD.ayahs[RD.idx]||'';
  const ur=RD.urdu[RD.idx]||'';
  const key=RD.surahNum+':'+(RD.idx+1);
  const ref=EN_NAMES[RD.surahNum]+' '+RD.surahNum+':'+(RD.idx+1);
  bmarkAyah(RD.surahNum,RD.idx+1,ar,ur);
  document.getElementById('rd-bookmark-btn').textContent=S.bookmarks[key]?'🔖':'🏷';
}

async function readerShowContext(){
  const ar=RD.ayahs[RD.idx]||'';
  const ur=RD.urdu[RD.idx]||'';
  const en=RD.english[RD.idx]||'';
  const ref=`${EN_NAMES[RD.surahNum]} ${RD.surahNum}:${RD.idx+1}`;
  const key=`${RD.surahNum}:${RD.idx+1}`;
  const overlay=document.getElementById('ctx-overlay');
  const body=document.getElementById('ctx-body');
  overlay.classList.add('open');
  if(RD.ctxCache[key]){ body.innerHTML=RD.ctxCache[key]; return; }
  body.innerHTML='<div class="loading-spin"><div class="spinner"></div><span>Loading tafseer...</span></div>';
  try {
    const res=await fetch('https://api.anthropic.com/v1/messages',{
      method:'POST',headers:{'Content-Type':'application/json'},
      body:JSON.stringify({model:'claude-sonnet-4-6',max_tokens:800,messages:[{role:'user',content:`Brief tafseer for this Quran ayah in JSON only, no markdown:
{"importance":"1-2 sentences","context":"1-2 sentences on revelation context","explanation":"2-3 sentences on meaning","keyLesson":"max 10 words","arabicTheme":"one Arabic word + meaning"}
Ayah: ${ar}
Reference: ${ref}
English: ${en}`}]})
    });
    const d=await res.json();
    const txt=d.content?.[0]?.text||'';
    let ctx;
    try{ctx=JSON.parse(txt.replace(/```json|```/g,'').trim());}
    catch{ctx={importance:'',context:'',explanation:en||ur,keyLesson:'',arabicTheme:''};}
    const html=`
      <div class="ctx-ar">${esc(ar)}</div>
      <div class="ctx-ur">${esc(ur)}</div>
      <div class="ctx-ref">${ref}</div>
      <hr class="ctx-divider">
      ${ctx.keyLesson?`<div class="ctx-key">✨ ${esc(ctx.keyLesson)}</div>`:''}
      ${ctx.importance?`<div class="ctx-section"><div class="ctx-section-title">📌 Importance</div><div class="ctx-section-body">${esc(ctx.importance)}</div></div>`:''}
      ${ctx.context?`<div class="ctx-section"><div class="ctx-section-title">📖 Context — شانِ نزول</div><div class="ctx-section-body">${esc(ctx.context)}</div></div>`:''}
      ${ctx.explanation?`<div class="ctx-section"><div class="ctx-section-title">💡 Explanation — تفسیر</div><div class="ctx-section-body">${esc(ctx.explanation)}</div></div>`:''}
      ${ctx.arabicTheme?`<div style="text-align:center;padding:.8rem;background:var(--bg3);border-radius:10px;margin-top:.6rem"><div style="font-family:Amiri,serif;font-size:1.8rem;color:var(--gold)">${ctx.arabicTheme.split(' ')[0]}</div><div style="font-size:11px;color:var(--white5);margin-top:4px">${esc(ctx.arabicTheme)}</div></div>`:''}
      <div style="display:flex;gap:8px;margin-top:1rem">
        <button class="gold-btn" onclick="readerPlay();hideContext()">▶ Listen</button>
        <button class="outline-btn" onclick="addToJournal('${ar.replace(/'/g,"\\'")}','${ref}');hideContext()">📓 Save</button>
      </div>`;
    RD.ctxCache[key]=html; body.innerHTML=html;
  } catch {
    body.innerHTML=`<div class="ctx-ar">${esc(ar)}</div><div class="ctx-ur">${esc(ur)}</div><div class="ctx-ref">${ref}</div><hr class="ctx-divider"><div class="ctx-section"><div class="ctx-section-title">English</div><div class="ctx-section-body">${esc(en)}</div></div>`;
  }
}
function hideContext(){ document.getElementById('ctx-overlay').classList.remove('open'); }

// ══ AUDIO ═════════════════════════════════════════════════════════════════════
let _audio=null;
function playAyah(surahNum, ayahNum){
  if(_audio){ _audio.pause(); _audio=null; }
  const s=String(surahNum).padStart(3,'0');
  const a=String(ayahNum).padStart(3,'0');
  _audio=new Audio(AUDIO+s+'/'+a+'.mp3');
  _audio.play().catch(()=>{});
}
function playFullSurah(surahNum){
  if(_audio){ _audio.pause(); _audio=null; }
  const arD=QAR[String(surahNum)];
  if(!arD) return;
  let idx=0;
  function next(){
    if(idx>=arD.ayahs.length) return;
    const s=String(surahNum).padStart(3,'0');
    const a=String(idx+1).padStart(3,'0');
    _audio=new Audio(AUDIO+s+'/'+a+'.mp3');
    _audio.play().catch(()=>{});
    _audio.onended=()=>{idx++;next();};
    idx++;
  }
  next();
}
function stopAudio(){ if(_audio){_audio.pause();_audio=null;} rdStopAudio(); }

// ══ DUAS ══════════════════════════════════════════════════════════════════════
let _duaCat='morning';
function renderDuas(){
  const cats=Object.keys(DUAS);
  const labels={morning:'🌅 Morning',evening:'🌙 Evening',sleep:'😴 Sleep',salah:'🕌 Salah',travel:'✈️ Travel'};
  document.getElementById('dua-tabs').innerHTML=cats.map(c=>`<button class="dua-tab${c===_duaCat?' active':''}" onclick="switchDuaCat('${c}')">${labels[c]||c}</button>`).join('');
  const list=DUAS[_duaCat]||[];
  document.getElementById('dua-list').innerHTML=list.map((d,i)=>`
    <div class="dua-card">
      <div class="dua-title">${d.title}</div>
      <div class="dua-arabic">${esc(d.arabic)}</div>
      <div class="dua-urdu">${esc(d.urdu)}</div>
      <div class="dua-source">Source: ${d.source}</div>
    </div>`).join('');
  // Mark first dua badge
  if(!S.done['first_dua']){ markDone('first_dua'); addXP(10,'First Dua'); }
}
function switchDuaCat(cat){ _duaCat=cat; renderDuas(); }

// ══ ME ════════════════════════════════════════════════════════════════════════
function renderMe(){
  const lvl=calcLevel();
  const curLvlXp=LEVELS[lvl-1]||0;
  const nxtLvlXp=LEVELS[lvl]||LEVELS[LEVELS.length-1];
  const pct=Math.min(100,Math.round((S.totalXp-curLvlXp)/(nxtLvlXp-curLvlXp)*100));
  document.getElementById('me-level').textContent=`Level ${lvl} · ${LEVEL_NAMES[lvl-1]||''}`;
  document.getElementById('me-xp-fill').style.width=pct+'%';
  document.getElementById('me-xp-text').textContent=`${S.totalXp.toLocaleString()} / ${nxtLvlXp.toLocaleString()} XP`;
  document.getElementById('ms-streak').textContent=S.streak;
  document.getElementById('ms-total-xp').textContent=S.totalXp.toLocaleString();
  document.getElementById('ms-ayaat').textContent=S.ayaatRead;
  document.getElementById('ms-challenges').textContent=S.challenges;
  // Badges
  document.getElementById('badges-grid').innerHTML=BADGES.map(b=>{
    const earned=b.check();
    return`<div class="badge-item${earned?' earned':''}">
      <div class="badge-icon">${b.icon}</div>
      <div class="badge-lbl">${b.lbl}</div>
    </div>`;
  }).join('');
  // Settings
  const rs=document.getElementById('reciter-sel'); if(rs) rs.value=S.reciter;
  const ts=document.getElementById('trans-sel');   if(ts) ts.value=S.transPref;
  const tj=document.getElementById('tajweed-toggle'); if(tj) tj.checked=S.tajweed;
  if(rs) rs.onchange=()=>{ S.reciter=rs.value; localStorage.setItem('nq_reciter',S.reciter); };
  if(ts) ts.onchange=()=>{ S.transPref=ts.value; localStorage.setItem('nq_trans',S.transPref); };
}

function toggleTajweed(on){ S.tajweed=on; localStorage.setItem('nq_tajweed',JSON.stringify(on)); }
function enableNotif(){
  const t=document.getElementById('fajr-time');
  if(!t) return;
  if(!('Notification' in window)){ showToast('Notifications not supported'); return; }
  Notification.requestPermission().then(p=>{
    if(p==='granted'){
      const [h,m]=t.value.split(':');
      localStorage.setItem('nq_fajr_hour',h);
      localStorage.setItem('nq_fajr_min',m);
      schedFajr(parseInt(h),parseInt(m));
      showToast('✅ Fajr reminder set for '+t.value);
    } else showToast('⚠️ Permission denied');
  });
}
function schedFajr(h,m){
  const now=new Date(), next=new Date();
  next.setHours(h,m,0,0);
  if(next<=now) next.setDate(next.getDate()+1);
  clearTimeout(window._fajrT);
  window._fajrT=setTimeout(()=>{
    new Notification('NoorQuran 🌅',{body:'وقتِ فجر — Start your day with Quran',icon:REPO+'icons/icon-192.png'});
    schedFajr(h,m);
  },next-now);
}

// ══ JOURNAL ═══════════════════════════════════════════════════════════════════
function addToJournal(ar, ref){
  S.journal.unshift({ar,ref,date:new Date().toLocaleDateString('en-PK',{day:'numeric',month:'short',year:'numeric'})});
  localStorage.setItem('nq_jrn',JSON.stringify(S.journal));
  showToast('📓 Saved to journal');
  addXP(10,'Journal');
}

// ══ BOOT ══════════════════════════════════════════════════════════════════════
async function init(){
  initStreak();
  // Reset daily done if new day
  const lastDay=localStorage.getItem('nq_done_day');
  if(lastDay!==today()){
    S.done={}; localStorage.setItem('nq_done','{}');
    localStorage.setItem('nq_done_day',today());
  } else {
    S.done=JSON.parse(localStorage.getItem('nq_done')||'{}');
  }
  renderHome();
  loadQ().then(()=>initReadPage());
  renderGoals();
  renderDuas();
  renderMe();
  // Restore fajr reminder
  const fh=localStorage.getItem('nq_fajr_hour');
  const fm=localStorage.getItem('nq_fajr_min');
  if(fh&&fm&&Notification.permission==='granted') schedFajr(parseInt(fh),parseInt(fm));
}
init();
