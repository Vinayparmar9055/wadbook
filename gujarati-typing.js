/**
 * Wadbook Smart Gujarati Typing Engine (Phonetic Transliteration + Floating Toggle & Bar)
 * Works automatically on all text inputs and textareas across index.html, shradhanjali.html, and directory.html.
 */
(function () {
  if (window.__wbGujaratiTypingLoaded) return;
  window.__wbGujaratiTypingLoaded = true;

  let gujaratiEnabled = true;

  // Phonetic English-to-Gujarati Transliteration Engine
  const vowelsInd = [
    ['au', 'ઔ'], ['ou', 'ઔ'], ['ai', 'ઐ'], ['ei', 'ઐ'],
    ['aa', 'આ'], ['A', 'આ'], ['ee', 'ઈ'], ['ii', 'ઈ'], ['I', 'ઈ'],
    ['oo', 'ઊ'], ['uu', 'ઊ'], ['U', 'ઊ'], ['ri', 'ઋ'], ['ru', 'ઋ'],
    ['e', 'એ'], ['E', 'એ'], ['o', 'ઓ'], ['O', 'ઓ'],
    ['a', 'અ'], ['i', 'ઇ'], ['u', 'ઉ']
  ];

  const matras = [
    ['au', 'ૌ'], ['ou', 'ૌ'], ['ai', 'ૈ'], ['ei', 'ૈ'],
    ['aa', 'ા'], ['A', 'ા'], ['ee', 'ી'], ['ii', 'ી'], ['I', 'ી'],
    ['oo', 'ૂ'], ['uu', 'ૂ'], ['U', 'ૂ'], ['ri', 'ૃ'], ['ru', 'ૃ'],
    ['e', 'ે'], ['E', 'ે'], ['o', 'ો'], ['O', 'ો'],
    ['i', 'િ'], ['u', 'ુ'], ['a', '']
  ];

  const consonants = [
    ['ksh', 'ક્ષ'], ['x', 'ક્ષ'], ['gny', 'જ્ઞ'], ['jny', 'જ્ઞ'], ['gy', 'જ્ઞ'],
    ['shr', 'શ્ર'], ['tr', 'ત્ર'],
    ['kh', 'ખ'], ['gh', 'ઘ'], ['ng', 'ઙ'],
    ['chh', 'છ'], ['ch', 'ચ'], ['jh', 'ઝ'], ['nj', 'ઞ'],
    ['Th', 'ઠ'], ['Dh', 'ઢ'], ['N', 'ણ'],
    ['th', 'થ'], ['dh', 'ધ'], ['T', 'ટ'], ['D', 'ડ'],
    ['ph', 'ફ'], ['f', 'ફ'], ['bh', 'ભ'],
    ['sh', 'શ'], ['Sh', 'ષ'], ['S', 'ષ'], ['L', 'ળ'],
    ['k', 'ક'], ['q', 'ક'], ['g', 'ગ'],
    ['c', 'ચ'], ['j', 'જ'], ['z', 'ઝ'],
    ['t', 'ત'], ['d', 'દ'], ['n', 'ન'],
    ['p', 'પ'], ['b', 'બ'], ['m', 'મ'],
    ['y', 'ય'], ['r', 'ર'], ['l', 'લ'], ['v', 'વ'], ['w', 'વ'],
    ['s', 'સ'], ['h', 'હ']
  ];

  const digits = {
    '0': '૦', '1': '૧', '2': '૨', '3': '૩', '4': '૪',
    '5': '૫', '6': '૬', '7': '૭', '8': '૮', '9': '૯'
  };

  // Common Gujarati community & name shortcuts
  const dictionary = {
    'wadbook': 'Wadbook',
    'prajapati': 'પ્રજાપતિ',
    'gurjar': 'ગુર્જર',
    'banaskantha': 'બનાસકાંઠા',
    'tadava': 'ટડાવા',
    'tadav': 'ટડાવ',
    'taday': 'ટડાય',
    'bhavnagar': 'ભાવનગર',
    'ahmedabad': 'અમદાવાદ',
    'tharad': 'થરાદ',
    'vav': 'વાવ',
    'deesa': 'ડીસા',
    'palanpur': 'પાલનપુર',
    'mehsana': 'મહેસાણા',
    'parmar': 'પરમાર',
    'makwana': 'મકવાણા',
    'chauhan': 'ચૌહાણ',
    'janadiya': 'જાણદિયા',
    'shradhanjali': 'શ્રદ્ધાંજલિ',
    'besanu': 'બેસણું',
    'om': 'ૐ',
    'shanti': 'શાંતિ',
    'sw': 'સ્વ.',
    'shri': 'શ્રી',
    'shrimati': 'શ્રીમતી'
  };

  function transliterateWord(word) {
    if (!word) return word;
    const lower = word.toLowerCase();
    if (dictionary[lower]) return dictionary[lower];

    // Keep pure numbers or emails/urls untouched
    if (/^[0-9@._:/-]+$/.test(word)) return word;

    let out = '';
    let i = 0;
    const len = word.length;

    while (i < len) {
      const rest = word.slice(i);

      // Handle nasal 'n' or 'm' before consonant (anusvara ં)
      if ((rest[0] === 'n' || rest[0] === 'm') && i > 0 && i + 1 < len) {
        const nextChar = rest[1];
        if (!'aeiouAEIOUyYhHnNmM'.includes(nextChar) && /[a-zA-Z]/.test(nextChar)) {
          out += 'ં';
          i += 1;
          continue;
        }
      }

      // Check consonant match
      let matchedC = null;
      for (const [en, gu] of consonants) {
        if (rest.startsWith(en)) {
          matchedC = [en, gu];
          break;
        }
      }

      if (matchedC) {
        const [cEn, cGu] = matchedC;
        i += cEn.length;
        const afterC = word.slice(i);

        // Check if followed by vowel/matra
        let matchedM = null;
        for (const [vEn, mGu] of matras) {
          if (afterC.startsWith(vEn)) {
            matchedM = [vEn, mGu];
            break;
          }
        }

        if (matchedM) {
          out += cGu + matchedM[1];
          i += matchedM[0].length;
        } else {
          // If followed by another consonant (conjunct), add halant '્' unless at word end
          if (i < len && /[a-zA-Z]/.test(word[i])) {
            out += cGu + '્';
          } else {
            out += cGu;
          }
        }
        continue;
      }

      // Check independent vowel match
      let matchedV = null;
      for (const [vEn, vGu] of vowelsInd) {
        if (rest.startsWith(vEn)) {
          matchedV = [vEn, vGu];
          break;
        }
      }
      if (matchedV) {
        out += matchedV[1];
        i += matchedV[0].length;
        continue;
      }

      // Copy character as-is
      out += word[i];
      i += 1;
    }

    return out;
  }

  function isEligibleInput(el) {
    if (!el) return false;
    if (el.tagName === 'TEXTAREA') return true;
    if (el.tagName === 'INPUT') {
      const t = (el.type || 'text').toLowerCase();
      return ['text', 'search'].includes(t) && !el.readOnly && !el.disabled;
    }
    return false;
  }

  function convertLastWord(el, triggerChar) {
    const pos = el.selectionStart;
    if (pos === null) return;
    const val = el.value;
    const before = val.slice(0, pos);
    const after = val.slice(pos);

    // Match trailing English word right before the space/punctuation
    const m = before.match(/([a-zA-Z]+)$/);
    if (!m) return;

    const engWord = m[1];
    const guWord = transliterateWord(engWord);
    const newBefore = before.slice(0, before.length - engWord.length) + guWord + triggerChar;
    el.value = newBefore + after;
    el.setSelectionRange(newBefore.length, newBefore.length);
    el.dispatchEvent(new Event('input', { bubbles: true }));
  }

  // Listen for Space or Punctuation to convert word immediately
  document.addEventListener('keydown', function (e) {
    if (!gujaratiEnabled) return;
    const el = e.target;
    if (!isEligibleInput(el)) return;

    if (e.key === ' ' || e.key === ',' || e.key === '.') {
      const pos = el.selectionStart;
      const before = el.value.slice(0, pos);
      if (/[a-zA-Z]+$/.test(before)) {
        e.preventDefault();
        convertLastWord(el, e.key);
      }
    }
  }, true);

  // Also convert on blur (when user taps next input field)
  document.addEventListener('focusout', function (e) {
    if (!gujaratiEnabled) return;
    const el = e.target;
    if (!isEligibleInput(el)) return;
    const val = el.value;
    const m = val.match(/([a-zA-Z]+)$/);
    if (m) {
      el.value = val.slice(0, val.length - m[1].length) + transliterateWord(m[1]);
      el.dispatchEvent(new Event('input', { bubbles: true }));
    }
  }, true);

  // Inject Floating Gujarati Language Toggle + Quick Akshar Bar
  function createFloatingUI() {
    const style = document.createElement('style');
    style.textContent = `
      #wbGuBar {
        position: fixed;
        top: 62px;
        right: 12px;
        z-index: 9999;
        display: flex;
        align-items: center;
        gap: 6px;
        background: #2b1d14;
        color: #fff;
        padding: 5px 11px;
        border-radius: 22px;
        border: 1.5px solid #d4a347;
        box-shadow: 0 4px 12px rgba(0,0,0,0.25);
        font-family: 'Noto Sans Gujarati', sans-serif;
        font-size: 12px;
        font-weight: 700;
        cursor: pointer;
        user-select: none;
      }
      #wbGuBar.off {
        background: #4a4a4a;
        border-color: #bbb;
      }
      #wbGuQuickStrip {
        position: fixed;
        bottom: 62px;
        left: 8px;
        right: 8px;
        z-index: 9998;
        background: #fffaf0;
        border: 1.5px solid #c9963b;
        border-radius: 12px;
        padding: 5px 8px;
        display: none;
        gap: 6px;
        overflow-x: auto;
        box-shadow: 0 4px 14px rgba(0,0,0,0.2);
        scrollbar-width: none;
      }
      #wbGuQuickStrip::-webkit-scrollbar { display: none; }
      .wb-q-key {
        background: #fff;
        border: 1px solid #d4b98a;
        color: #5c190d;
        border-radius: 8px;
        padding: 4px 9px;
        font-size: 13px;
        font-weight: 700;
        white-space: nowrap;
        cursor: pointer;
      }
      .wb-q-key:active {
        background: #5c190d;
        color: #fff;
      }
    `;
    document.head.appendChild(style);

    // Floating Language Switch Pill
    const pill = document.createElement('div');
    pill.id = 'wbGuBar';
    pill.innerHTML = '<span>🇮🇳 ગુજરાતી: <b>ચાલુ</b></span>';
    pill.onclick = function () {
      gujaratiEnabled = !gujaratiEnabled;
      pill.classList.toggle('off', !gujaratiEnabled);
      pill.innerHTML = gujaratiEnabled
        ? '<span>🇮🇳 ગુજરાતી: <b>ચાલુ</b></span>'
        : '<span>🔤 English: <b>ON</b></span>';
      strip.style.display = (gujaratiEnabled && activeField) ? 'flex' : 'none';
    };
    document.body.appendChild(pill);

    // Quick Gujarati Matra & Common Words Helper Strip when typing
    const strip = document.createElement('div');
    strip.id = 'wbGuQuickStrip';
    const quickItems = ['સ્વ.', 'શ્રી', 'શ્રીમતી', 'પ્રજાપતિ', 'બનાસકાંઠા', 'ટડાવા', 'ભાવનગર', 'ૐ શાંતિ', 'ા', 'િ', 'ી', 'ુ', 'ૂ', 'ે', 'ૈ', 'ો', 'ૌ', 'ં', '્'];
    strip.innerHTML = quickItems.map(k => `<button type="button" class="wb-q-key" data-k="${k}">${k}</button>`).join('');
    document.body.appendChild(strip);

    let activeField = null;

    strip.addEventListener('mousedown', function (e) {
      e.preventDefault(); // Keep focus on input
      const btn = e.target.closest('.wb-q-key');
      if (!btn || !activeField) return;
      const ch = btn.dataset.k;
      const start = activeField.selectionStart || activeField.value.length;
      const end = activeField.selectionEnd || activeField.value.length;
      activeField.value = activeField.value.slice(0, start) + ch + activeField.value.slice(end);
      activeField.setSelectionRange(start + ch.length, start + ch.length);
      activeField.dispatchEvent(new Event('input', { bubbles: true }));
    });

    document.addEventListener('focusin', function (e) {
      if (isEligibleInput(e.target)) {
        activeField = e.target;
        if (gujaratiEnabled) strip.style.display = 'flex';
      } else {
        activeField = null;
        strip.style.display = 'none';
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', createFloatingUI);
  } else {
    createFloatingUI();
  }
})();
