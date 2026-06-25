// ─── TAJWEED ENGINE ──────────────────────────────────────────────────────────
// Color-codes Arabic text by tajweed rules using Unicode pattern matching.
// Rules covered: Ghunna, Madd, Qalqala, Ikhfa, Idgham, Iqlab, Izhar, Shaddah

const TAJWEED_RULES = [
  // Madd — prolonged vowels (green)
  { name:'Madd',    color:'#2d6a4f', bg:'#d8f3dc', pattern:/[\u0627\u0648\u064A](?=[\u0652\u0651]|$|\s)/g },
  // Ghunna — nasalization on ن and م with shaddah (purple)
  { name:'Ghunna',  color:'#6b35a8', bg:'#ede0f7', pattern:/[\u0646\u0645]\u0651/g },
  // Qalqala letters — ق ط ب ج د (orange)
  { name:'Qalqala', color:'#b85c00', bg:'#fff0e0', pattern:/[\u0642\u0637\u0628\u062C\u062F]\u0652/g },
  // Ikhfa — ن\u0652 or tanwin before ikhfa letters (blue)
  { name:'Ikhfa',   color:'#1a5f7a', bg:'#e0f4ff', pattern:/(?:\u0646\u0652|[\u064B\u064C\u064D])(?=\s*[\u062B\u062C\u062F\u0630\u0632\u0633\u0634\u0635\u0636\u0637\u0638\u0641\u0642\u0643])/g },
  // Idgham — merging (red)
  { name:'Idgham',  color:'#a00000', bg:'#ffe0e0', pattern:/(?:\u0646\u0652|[\u064B\u064C\u064D])(?=\s*[\u064A\u0631\u0645\u0644\u0648\u0646])/g },
  // Iqlab — ن\u0652 before ب (pink)
  { name:'Iqlab',   color:'#9c1458', bg:'#fde8f1', pattern:/(?:\u0646\u0652|[\u064B\u064C\u064D])(?=\s*\u0628)/g },
  // Shaddah emphasis (gold)
  { name:'Shaddah', color:'#8a5e00', bg:'#fff8d6', pattern:/[\u0600-\u06FF]\u0651(?!\u0646|\u0645)/g },
];

// Legend data for the UI
const TAJWEED_LEGEND = [
  { name:'Madd',    nameUr:'مد (طویل آواز)',   color:'#2d6a4f', bg:'#d8f3dc' },
  { name:'Ghunna',  nameUr:'غنہ (ناک سے آواز)', color:'#6b35a8', bg:'#ede0f7' },
  { name:'Qalqala', nameUr:'قلقلہ',            color:'#b85c00', bg:'#fff0e0' },
  { name:'Ikhfa',   nameUr:'اخفاء',            color:'#1a5f7a', bg:'#e0f4ff' },
  { name:'Idgham',  nameUr:'ادغام',            color:'#a00000', bg:'#ffe0e0' },
  { name:'Iqlab',   nameUr:'اقلاب',            color:'#9c1458', bg:'#fde8f1' },
  { name:'Shaddah', nameUr:'شدہ',              color:'#8a5e00', bg:'#fff8d6' },
];

/**
 * Apply tajweed highlighting to Arabic text.
 * Returns HTML string with <span> tags colored by rule.
 */
function applyTajweed(text) {
  if (!text) return text;

  // Build an array of {start, end, rule} matches — non-overlapping, first wins
  const matches = [];
  for (const rule of TAJWEED_RULES) {
    rule.pattern.lastIndex = 0;
    let m;
    while ((m = rule.pattern.exec(text)) !== null) {
      const start = m.index;
      const end   = m.index + m[0].length;
      // Check overlap
      const overlaps = matches.some(x => start < x.end && end > x.start);
      if (!overlaps) matches.push({ start, end, rule });
    }
  }

  if (!matches.length) return escHtml(text);

  matches.sort((a, b) => a.start - b.start);

  let result = '';
  let cursor = 0;
  for (const { start, end, rule } of matches) {
    if (cursor < start) result += escHtml(text.slice(cursor, start));
    result += `<span class="tj" style="color:${rule.color};background:${rule.bg};border-radius:3px;padding:0 1px"
      title="${rule.name}">${escHtml(text.slice(start, end))}</span>`;
    cursor = end;
  }
  if (cursor < text.length) result += escHtml(text.slice(cursor));
  return result;
}

function escHtml(str) {
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

function tajweedLegendHTML() {
  return `<div class="tajweed-legend">
    ${TAJWEED_LEGEND.map(r =>
      `<span class="tj-pill" style="color:${r.color};background:${r.bg}">${r.name}<span class="tj-ur">${r.nameUr}</span></span>`
    ).join('')}
  </div>`;
}
