// ─── SWIPE READER ─────────────────────────────────────────────────────────────
// Single-ayah fullscreen reader with swipe navigation, timed challenge, context popup

const READER = {
  surahNum: null,
  ayahs: [],
  urdu: [],
  english: [],
  indopak: [],
  surahInfo: null,
  idx: 0,
  touchStartX: 0,
  touchStartY: 0,
  timerInterval: null,
  challengeSeconds: 0,
  challengeTarget: 120, // 2 min default
  challengeActive: false,
  sessionStart: null,
  ayahsReadThisSession: 0,
  contextCache: {}, // cache AI context per ayah key
};

// ─── OPEN READER ──────────────────────────────────────────────────────────────
async function openReader(surahNum, startIdx = 0) {
  READER.surahNum  = parseInt(surahNum);
  READER.idx       = startIdx;
  READER.ayahsReadThisSession = 0;
  READER.sessionStart = Date.now();

  const overlay = document.getElementById('reader-overlay');
  overlay.style.display = 'flex';
  overlay.innerHTML = `<div class="reader-loading"><div class="spinner" style="border-top-color:#c49a2a"></div><span style="color:rgba(255,255,255,.6);font-size:13px">Loading surah...</span></div>`;

  try {
    const urduId = URDU_EDITIONS[S.urduEdition].id;
    // Use bundled data — VPN-proof, instant load
    await loadQuranData();
    const key = String(surahNum);
    const arD = QURAN_AR[key];
    const enD = QURAN_EN[key];
    const urD = QURAN_UR[key];
    if (!arD) throw new Error('Surah not found');

    const surahMeta = S.surahs.find(s => s.number === parseInt(surahNum)) || {};
    READER.ayahs   = arD.ayahs.map((text,i) => ({ text, numberInSurah: i+1 }));
    READER.english = (enD||[]).map((text,i) => ({ text, numberInSurah: i+1 }));
    READER.urdu    = (urD||enD||[]).map((text,i) => ({ text, numberInSurah: i+1 }));
    READER.surahInfo = {
      number: parseInt(surahNum),
      name: surahMeta.name || arD.name || '',
      englishName: surahMeta.englishName || '',
      englishNameTranslation: surahMeta.englishNameTranslation || '',
      numberOfAyahs: READER.ayahs.length,
      revelationType: surahMeta.revelationType || '',
    };
    READER.indopak = READER.ayahs;
    renderReader();
    setupReaderSwipe();
    startChallenge();
  } catch {
    overlay.innerHTML = `<div class="reader-loading"><div style="color:rgba(255,255,255,.6)">⚠️ Could not load surah. Check connection.</div><button class="reader-btn-pill" onclick="closeReader()" style="margin-top:1rem">Close</button></div>`;
  }
}

function closeReader() {
  stopReaderAudio();
  stopChallenge();
  document.getElementById('reader-overlay').style.display = 'none';
  // Update stats
  S.readCount += READER.ayahsReadThisSession;
  localStorage.setItem('nq_read', S.readCount);
}

// ─── RENDER SINGLE AYAH ───────────────────────────────────────────────────────
function renderReader() {
  const overlay = document.getElementById('reader-overlay');
  const a       = READER.ayahs[READER.idx];
  const ur      = READER.urdu[READER.idx]?.text    || '';
  const en      = READER.english[READER.idx]?.text || '';
  const info    = READER.surahInfo;
  const total   = READER.ayahs.length;
  const pct     = Math.round(((READER.idx + 1) / total) * 100);
  const key     = `${info.number}:${a.numberInSurah}`;
  const isBookmarked = !!S.bookmarks[key];

  // Arabic text
  const arabicDisplay = S.tajweedOn ? applyTajweed(a.text) : escHtml(a.text);

  overlay.innerHTML = `
    <div class="reader-wrap">
      <!-- TOP BAR -->
      <div class="reader-topbar">
        <button class="reader-icon-btn" onclick="closeReader()" title="Close">✕</button>
        <div class="reader-surah-info">
          <span class="reader-surah-name">${info.englishName}</span>
          <span class="reader-ayah-pos">${READER.idx + 1} / ${total}</span>
        </div>
        <div style="display:flex;gap:6px;align-items:center">
          <button class="reader-icon-btn${isBookmarked?' gold':''}" onclick="readerBookmark()" title="Bookmark">🔖</button>
          <button class="reader-icon-btn" onclick="showReaderContext()" title="Context & Tafseer">📚</button>
        </div>
      </div>

      <!-- PROGRESS BAR -->
      <div class="reader-progress-track">
        <div class="reader-progress-fill" style="width:${pct}%"></div>
      </div>

      <!-- CHALLENGE BAR -->
      <div class="reader-challenge-bar" id="reader-challenge-bar">
        <div class="challenge-info">
          <span class="challenge-icon">⏱</span>
          <span id="challenge-label">Daily Challenge</span>
        </div>
        <div class="challenge-timer-wrap">
          <div class="challenge-prog-track"><div class="challenge-prog-fill" id="challenge-prog-fill" style="width:0%"></div></div>
          <span class="challenge-time" id="challenge-time">0:00</span>
        </div>
        <span class="challenge-pts" id="challenge-pts">+0</span>
      </div>

      <!-- AYAH CARD (swipeable) -->
      <div class="reader-card-wrap" id="reader-card-wrap">
        <div class="reader-card" id="reader-card">
          <!-- Ayah number badge -->
          <div class="reader-ayah-badge">
            <span class="reader-ayah-ar-num">${toArabicNum(a.numberInSurah)}</span>
          </div>

          <!-- Arabic text -->
          <div class="reader-arabic">${arabicDisplay}</div>

          <!-- Translation -->
          <div class="reader-translation">
            <div class="reader-urdu">${ur}</div>
            ${en ? `<div class="reader-english">${en}</div>` : ''}
          </div>
        </div>

        <!-- Swipe hints (shown first time) -->
        <div class="swipe-hint" id="swipe-hint">
          <span>← Next ayah</span>
          <span>Previous →</span>
        </div>
      </div>

      <!-- BOTTOM BAR -->
      <div class="reader-bottombar">
        <button class="reader-nav-btn" onclick="readerPrev()" ${READER.idx===0?'disabled':''}>‹ Prev</button>
        <div style="display:flex;gap:8px;align-items:center">
          <button class="reader-play-btn" id="reader-play-btn" onclick="readerPlayAyah()">▶</button>
          <div style="text-align:center">
            <div class="reader-ref">${info.name} · ${a.numberInSurah}</div>
            <div class="reader-ref" style="font-size:10px;opacity:.5">${info.revelationType}</div>
          </div>
        </div>
        <button class="reader-nav-btn" onclick="readerNext()" ${READER.idx===total-1?'disabled':''}>Next ›</button>
      </div>
    </div>

    <!-- CONTEXT MODAL -->
    <div class="context-overlay" id="context-overlay" onclick="if(event.target.id==='context-overlay')hideReaderContext()">
      <div class="context-sheet" id="context-sheet">
        <div class="context-handle"></div>
        <div class="context-content" id="context-content">
          <div class="loading"><div class="spinner"></div><span>Loading context...</span></div>
        </div>
      </div>
    </div>
  `;

  // Hide swipe hint after 3s
  setTimeout(() => {
    const hint = document.getElementById('swipe-hint');
    if (hint) hint.style.opacity = '0';
  }, 2500);

  READER.ayahsReadThisSession++;
}

// ─── NAVIGATION ───────────────────────────────────────────────────────────────
function readerNext() {
  if (READER.idx < READER.ayahs.length - 1) {
    animateSlide('left');
    setTimeout(() => { READER.idx++; renderReader(); }, 220);
  }
}

function readerPrev() {
  if (READER.idx > 0) {
    animateSlide('right');
    setTimeout(() => { READER.idx--; renderReader(); }, 220);
  }
}

function animateSlide(dir) {
  const card = document.getElementById('reader-card');
  if (!card) return;
  card.style.transition = 'transform .22s ease, opacity .22s';
  card.style.transform  = dir === 'left' ? 'translateX(-60px)' : 'translateX(60px)';
  card.style.opacity    = '0';
}

// ─── SWIPE GESTURES ───────────────────────────────────────────────────────────
function setupReaderSwipe() {
  const el = document.getElementById('reader-card-wrap');
  if (!el) return;

  el.addEventListener('touchstart', e => {
    READER.touchStartX = e.touches[0].clientX;
    READER.touchStartY = e.touches[0].clientY;
  }, { passive: true });

  el.addEventListener('touchend', e => {
    const dx = e.changedTouches[0].clientX - READER.touchStartX;
    const dy = e.changedTouches[0].clientY - READER.touchStartY;
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 40) {
      if (dx < 0) readerNext(); else readerPrev();
    }
  }, { passive: true });

  // Also keyboard arrows
  document.onkeydown = e => {
    if (document.getElementById('reader-overlay').style.display === 'flex') {
      if (e.key === 'ArrowLeft')  readerNext();
      if (e.key === 'ArrowRight') readerPrev();
      if (e.key === 'Escape')     closeReader();
    }
  };
}

// ─── AUDIO ────────────────────────────────────────────────────────────────────
let readerAudio = null;

function readerPlayAyah() {
  const btn = document.getElementById('reader-play-btn');
  const a   = READER.ayahs[READER.idx];
  if (readerAudio && !readerAudio.paused) {
    readerAudio.pause(); readerAudio = null;
    if (btn) { btn.textContent = '▶'; btn.classList.remove('playing'); }
    return;
  }
  const url = ayahAudioUrl(READER.surahNum, a.numberInSurah);
  readerAudio = new Audio(url);
  if (btn) { btn.textContent = '⏸'; btn.classList.add('playing'); }
  readerAudio.play().catch(() => { if (btn) { btn.textContent='▶'; btn.classList.remove('playing'); } });
  readerAudio.onended = () => {
    if (btn) { btn.textContent='▶'; btn.classList.remove('playing'); }
    readerAudio = null;
    // Auto-advance after audio finishes
    setTimeout(readerNext, 600);
  };
}

function stopReaderAudio() {
  if (readerAudio) { readerAudio.pause(); readerAudio = null; }
}

// ─── BOOKMARK ─────────────────────────────────────────────────────────────────
function readerBookmark() {
  const a    = READER.ayahs[READER.idx];
  const info = READER.surahInfo;
  const ur   = READER.urdu[READER.idx]?.text || '';
  const key  = `${info.number}:${a.numberInSurah}`;
  const ref  = `${info.englishName} ${info.number}:${a.numberInSurah}`;
  toggleBookmark(info.number, a.numberInSurah, a.text, ur, ref);
  // Re-render to update icon
  renderReader();
  setupReaderSwipe();
}

// ─── TIMED CHALLENGE ──────────────────────────────────────────────────────────
const CHALLENGE_TARGETS = [
  { label:'Quick Read', seconds:120,  pts:50  },
  { label:'5-Min Focus', seconds:300, pts:150 },
  { label:'10-Min Deep', seconds:600, pts:350 },
];

function startChallenge() {
  READER.challengeSeconds = 0;
  READER.challengeActive  = true;
  // Pick today's challenge based on day
  const t = CHALLENGE_TARGETS[new Date().getDay() % CHALLENGE_TARGETS.length];
  READER.challengeTarget = t.seconds;
  READER.challengeLabel  = t.label;

  const labelEl = document.getElementById('challenge-label');
  if (labelEl) labelEl.textContent = t.label + ' · ' + formatTime(t.seconds);

  clearInterval(READER.timerInterval);
  READER.timerInterval = setInterval(() => {
    if (!READER.challengeActive) return;
    READER.challengeSeconds++;
    updateChallengeUI();
    if (READER.challengeSeconds >= READER.challengeTarget) {
      completChallenge();
    }
  }, 1000);
}

function stopChallenge() {
  clearInterval(READER.timerInterval);
  READER.challengeActive = false;
}

function updateChallengeUI() {
  const pct    = Math.min(100, (READER.challengeSeconds / READER.challengeTarget) * 100);
  const pts    = Math.floor(READER.challengeSeconds * (440 / READER.challengeTarget));
  const fill   = document.getElementById('challenge-prog-fill');
  const timeEl = document.getElementById('challenge-time');
  const ptsEl  = document.getElementById('challenge-pts');
  if (fill)   fill.style.width = pct + '%';
  if (timeEl) timeEl.textContent = formatTime(READER.challengeSeconds);
  if (ptsEl)  ptsEl.textContent  = '+' + pts;
}

function completChallenge() {
  stopChallenge();
  const bar = document.getElementById('reader-challenge-bar');
  if (bar) {
    bar.style.background = 'linear-gradient(90deg,#1b4332,#2d6a4f)';
    bar.innerHTML = `<div style="display:flex;align-items:center;gap:8px;width:100%;justify-content:center">
      <span style="font-size:1.2rem">🌟</span>
      <span style="font-weight:600;font-size:13px">Challenge complete! Mashallah!</span>
      <span style="background:#c49a2a;color:#1b4332;border-radius:20px;padding:2px 10px;font-size:12px;font-weight:700">+440</span>
    </div>`;
  }
  showToast('🌟 Challenge complete! Mashallah!');
  // Save streak bonus
  const prev = parseInt(localStorage.getItem('nq_challenge_pts') || '0');
  localStorage.setItem('nq_challenge_pts', prev + 440);
}

function formatTime(s) {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${sec.toString().padStart(2,'0')}`;
}

// ─── CONTEXT / TAFSEER POPUP ──────────────────────────────────────────────────
async function showReaderContext() {
  const overlay = document.getElementById('context-overlay');
  const content = document.getElementById('context-content');
  if (!overlay || !content) return;
  overlay.style.display = 'flex';

  const a    = READER.ayahs[READER.idx];
  const info = READER.surahInfo;
  const ur   = READER.urdu[READER.idx]?.text    || '';
  const en   = READER.english[READER.idx]?.text || '';
  const key  = `${info.number}:${a.numberInSurah}`;
  const ref  = `${info.englishName} ${info.number}:${a.numberInSurah}`;

  // Use cached response if available
  if (READER.contextCache[key]) {
    content.innerHTML = READER.contextCache[key];
    return;
  }

  content.innerHTML = '<div class="loading"><div class="spinner"></div><span>Loading context & tafseer...</span></div>';

  try {
    const prompt = `You are a knowledgeable Islamic scholar providing brief, respectful, and authentic tafseer for Quran readers learning with Urdu translation.

For this ayah, provide a structured response in this EXACT JSON format (no markdown, no extra text):
{
  "importance": "1-2 sentences on why this ayah is significant",
  "context": "1-2 sentences on the historical or Quranic context (when/why it was revealed, Surah background)",
  "explanation": "2-3 sentences explaining the meaning and lesson of this ayah clearly for a learner",
  "conditions": "1 sentence on any specific conditions, rulings, or occasions related to this ayah (or 'General guidance for all times and situations' if universal)",
  "keyLesson": "One short powerful takeaway in 10 words or less",
  "arabicTheme": "One Arabic word that captures the theme of this ayah with its meaning"
}

Ayah: ${a.text}
Reference: ${ref}
English meaning: ${en}`;

    const res  = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 1000,
        messages: [{ role: 'user', content: prompt }]
      })
    });
    const data = await res.json();
    const text = data.content?.[0]?.text || '';

    let ctx;
    try {
      const clean = text.replace(/```json|```/g,'').trim();
      ctx = JSON.parse(clean);
    } catch {
      // Fallback if JSON parse fails
      ctx = { importance:'Context available offline.', context:'', explanation: en || ur, conditions:'', keyLesson:'', arabicTheme:'' };
    }

    const html = `
      <div class="context-ayah-ar">${a.text}</div>
      <div class="context-ayah-ur">${ur}</div>
      <div class="context-ref">${ref}</div>
      <hr class="context-divider">

      ${ctx.keyLesson ? `<div class="context-key-lesson">✨ ${ctx.keyLesson}</div>` : ''}

      <div class="context-section">
        <div class="context-section-title">📌 Importance</div>
        <div class="context-section-body">${ctx.importance || '—'}</div>
      </div>
      <div class="context-section">
        <div class="context-section-title">📖 Context — شانِ نزول</div>
        <div class="context-section-body">${ctx.context || '—'}</div>
      </div>
      <div class="context-section">
        <div class="context-section-title">💡 Explanation — تفسیر</div>
        <div class="context-section-body">${ctx.explanation || '—'}</div>
      </div>
      <div class="context-section">
        <div class="context-section-title">📋 Conditions & Occasions</div>
        <div class="context-section-body">${ctx.conditions || '—'}</div>
      </div>
      ${ctx.arabicTheme ? `
      <div class="context-theme-word">
        <span class="context-theme-ar">${ctx.arabicTheme.split(' ')[0]}</span>
        <span class="context-theme-label">${ctx.arabicTheme}</span>
      </div>` : ''}

      <div style="display:flex;gap:8px;margin-top:1rem;flex-wrap:wrap">
        <button class="btn" onclick="readerPlayAyah();hideReaderContext()">▶ Listen to this ayah</button>
        <button class="btn btn-outline" onclick="addToJournal('${a.text.replace(/'/g,"\\'")}','${ref}');hideReaderContext()">📓 Save to journal</button>
      </div>`;

    READER.contextCache[key] = html;
    content.innerHTML = html;

  } catch (e) {
    content.innerHTML = `
      <div class="context-ayah-ar">${a.text}</div>
      <div class="context-ayah-ur">${ur}</div>
      <div class="context-ref">${ref}</div>
      <hr class="context-divider">
      <div class="context-section">
        <div class="context-section-title">📖 English Meaning</div>
        <div class="context-section-body">${en || '—'}</div>
      </div>
      <div style="font-size:12px;color:var(--ink3);margin-top:.8rem">Full tafseer requires internet connection.</div>`;
  }
}

function hideReaderContext() {
  const o = document.getElementById('context-overlay');
  if (o) o.style.display = 'none';
}

// ─── UTILS ────────────────────────────────────────────────────────────────────
function toArabicNum(n) {
  return String(n).split('').map(d => '٠١٢٣٤٥٦٧٨٩'[d] || d).join('');
}
