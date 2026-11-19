/**
 * Wadbook Smart Gujarati Typing Engine v2 (Case-Insensitive Mobile Gboard Support + Exact Gujarati Phonetics)
 */
(function () {
  if (window.__wbGujaratiTypingLoaded) return;
  window.__wbGujaratiTypingLoaded = true;

  let gujaratiEnabled = true;

  // Common Gujarati name suffixes & community words
  const wordDictionary = {
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
    'vinay': 'વિનય',
    'vinaybhai': 'વિનયભાઈ',
    'karshanbhai': 'કર્ષણભાઈ',
    'karshan': 'કર્ષણ',
    'kishanbhai': 'કિશનભાઈ',
    'rameshbhai': 'રમેશભાઈ',
    'maheshbhai': 'મહેશભાઈ',
    'sureshbhai': 'સુરેશભાઈ',
    'nareshbhai': 'નરેશભાઈ',
    'dineshbhai': 'દિનેશભાઈ',
    'bharatbhai': 'ભરતભાઈ',
    'jayeshbhai': 'જયેશભાઈ',
    'shaileshbhai': 'શૈલેષભાઈ',
    'babubhai': 'બાબુભાઈ',
    'mohanbhai': 'મોહનભાઈ',
    'shradhanjali': 'શ્રદ્ધાંજલિ',
    'besanu': 'બેસણું',
    'antimyatra': 'અંતિમયાત્રા',
    'panidhol': 'પાણીઢોળ',
    'punyatithi': 'પુણ્યતિથિ',
    'om': 'ૐ',
    'shanti': 'શાંતિ',
    'sw': 'સ્વ.',
    'shri': 'શ્રી',
    'shrimati': 'શ્રીમતી'
  };

  // Multi-letter patterns checked first (case-insensitive except retroflex T/D/N/S/L when mid-word)
  const vowelsInd = [
    ['au', 'ઔ'], ['ou', 'ઔ'], ['ai', 'ઐ'], ['ei', 'ઐ'],
    ['aa', 'આ'], ['ee', 'ઈ'], ['ii', 'ઈ'],
    ['oo', 'ઊ'], ['uu', 'ઊ'], ['ri', 'ઋ'], ['ru', 'ઋ'],
    ['e', 'એ'], ['o', 'ઓ'],
    ['a', 'અ'], ['i', 'ઇ'], ['u', 'ઉ']
  ];

  const matras = [
    ['au', 'ૌ'], ['ou', 'ૌ'], ['ai', 'ૈ'], ['ei', 'ૈ'],
    ['aa', 'ા'], ['ee', 'ી'], ['ii', 'ી'],
    ['oo', 'ૂ'], ['uu', 'ૂ'], ['ri', 'ૃ'], ['ru', 'ૃ'],
    ['e', 'ે'], ['o', 'ો'],
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

  function normalizeForMobileCaps(word) {
    // Mobile keyboards auto-capitalize the 1st letter (e.g., "Vinaybhai" -> "vinaybhai", "Tadava" -> "tadava")
    // Lowercase the first character if the rest of the word is lowercase!
    if (word.length > 1 && word[0] >= 'A' && word[0] <= 'Z' && word.slice(1) === word.slice(1).toLowerCase()) {
      return word[0].toLowerCase() + word.slice(1);
    }
    if (word.length === 1 && word >= 'A' && word <= 'Z') {
      return word.toLowerCase();
    }
    return word;
  }

  function transliterateWord(rawWord) {
    if (!rawWord) return rawWord;
    if (/^[0-9@._:/-]+$/.test(rawWord)) return rawWord;

    const lower = rawWord.toLowerCase();
    if (wordDictionary[lower]) return wordDictionary[lower];

    // Handle Gujarati name suffixes naturally: -bhai -> -ભાઈ, -ben -> -બેન, -kumar -> -કુમાર, -lal -> -લાલ
    let suffix = '';
    let stem = normalizeForMobileCaps(rawWord);

    if (lower.endsWith('bhai') && lower.length > 4) {
      stem = normalizeForMobileCaps(rawWord.slice(0, -4));
      suffix = 'ભાઈ';
    } else if (lower.endsWith('ben') && lower.length > 3) {
      stem = normalizeForMobileCaps(rawWord.slice(0, -3));
      suffix = 'બેન';
    } else if (lower.endsWith('kumar') && lower.length > 5) {
      stem = normalizeForMobileCaps(rawWord.slice(0, -5));
      suffix = 'કુમાર';
    } else if (lower.endsWith('lal') && lower.length > 3) {
      stem = normalizeForMobileCaps(rawWord.slice(0, -3));
      suffix = 'લાલ';
    }

    if (wordDictionary[stem.toLowerCase()]) {
      return wordDictionary[stem.toLowerCase()] + suffix;
    }

    let out = '';
    let i = 0;
    const len = stem.length;

    while (i < len) {
      const rest = stem.slice(i);

      // Nasal 'n' or 'm' before a consonant -> anusvara 'ં'
      if ((rest[0] === 'n' || rest[0] === 'm') && i > 0 && i + 1 < len) {
        const nextChar = rest[1];
        if (!'aeiouAEIOUyYhHnNmM'.includes(nextChar) && /[a-zA-Z]/.test(nextChar)) {
          out += 'ં';
          i += 1;
          continue;
        }
      }

      // Match consonant
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
        const afterC = stem.slice(i);

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
          if (i < len && /[a-zA-Z]/.test(stem[i])) {
            out += cGu + '્';
          } else {
            out += cGu;
          }
        }
        continue;
      }

      // Match independent vowel
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

      out += stem[i];
      i += 1;
    }

    return out + suffix;
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

  function convertTrailingWord(el, extraChar) {
    const pos = el.selectionStart;
    if (pos === null) return;
    const val = el.value;
    const before = val.slice(0, pos);
    const after = val.slice(pos);

    const m = before.match(/([a-zA-Z]+)$/);
    if (!m) return;

    const engWord = m[1];
    const guWord = transliterateWord(engWord);
    const newBefore = before.slice(0, before.length - engWord.length) + guWord + extraChar;
    el.value = newBefore + after;
    el.setSelectionRange(newBefore.length, newBefore.length);
    el.dispatchEvent(new Event('input', { bubbles: true }));
  }

  // Handle both keydown (desktop/some Android) AND input event (Gboard mobile space/punctuation)
  document.addEventListener('keydown', function (e) {
    if (!gujaratiEnabled) return;
    const el = e.target;
    if (!isEligibleInput(el)) return;

    if (e.key === ' ' || e.key === ',' || e.key === '.') {
      const pos = el.selectionStart;
      const before = el.value.slice(0, pos);
      if (/[a-zA-Z]+$/.test(before)) {
        e.preventDefault();
        convertTrailingWord(el, e.key);
      }
    }
  }, true);

  document.addEventListener('input', function (e) {
    if (!gujaratiEnabled) return;
    const el = e.target;
    if (!isEligibleInput(el)) return;

    const pos = el.selectionStart;
    if (!pos || pos < 2) return;
    const before = el.value.slice(0, pos);
    const lastCh = before.slice(-1);
    if (lastCh === ' ' || lastCh === ',' || lastCh === '.') {
      const wordPart = before.slice(0, -1);
      const m = wordPart.match(/([a-zA-Z]+)$/);
      if (m) {
        const eng = m[1];
        const gu = transliterateWord(eng);
        const updatedBefore = wordPart.slice(0, wordPart.length - eng.length) + gu + lastCh;
        el.value = updatedBefore + el.value.slice(pos);
        el.setSelectionRange(updatedBefore.length, updatedBefore.length);
      }
    }
  }, true);

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

  function createFloatingUI() {
    const style = document.createElement('style');
    style.textContent = `
      /* Clean Compact Toggle Button docked cleanly at bottom-right above keyboard/bar */
      #wbGuBar {
        position: fixed;
        bottom: 66px;
        right: 12px;
        z-index: 9999;
        display: flex;
        align-items: center;
        gap: 5px;
        background: #2b1d14;
        color: #fff;
        padding: 6px 12px;
        border-radius: 22px;
        border: 1.5px solid #d4a347;
        box-shadow: 0 4px 12px rgba(0,0,0,0.28);
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
        left: 6px;
        right: 6px;
        bottom: 104px;
        z-index: 9998;
        background: #fffaf0;
        border: 1.5px solid #c9963b;
        border-radius: 12px;
        padding: 5px 8px;
        display: none;
        gap: 6px;
        overflow-x: auto;
        box-shadow: 0 4px 14px rgba(0,0,0,0.22);
        scrollbar-width: none;
      }
      #wbGuQuickStrip::-webkit-scrollbar { display: none; }
      .wb-q-key {
        background: #fff;
        border: 1px solid #d4b98a;
        color: #5c190d;
        border-radius: 8px;
        padding: 5px 10px;
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

    const strip = document.createElement('div');
    strip.id = 'wbGuQuickStrip';
    const quickItems = ['શ્રી', 'શ્રીમતી', 'ભાઈ', 'બેન', 'પ્રજાપતિ', 'બનાસકાંઠા', 'ટડાવા', 'ભાવનગર', 'ા', 'િ', 'ી', 'ુ', 'ૂ', 'ે', 'ૈ', 'ો', 'ૌ', 'ં', '્'];
    strip.innerHTML = quickItems.map(k => `<button type="button" class="wb-q-key" data-k="${k}">${k}</button>`).join('');
    document.body.appendChild(strip);

    let activeField = null;

    // Keep floating pill & quick bar right above the mobile keyboard using visualViewport
    function syncViewportPosition() {
      if (!window.visualViewport) return;
      const vv = window.visualViewport;
      const keyboardHeight = Math.max(0, window.innerHeight - vv.height - vv.offsetTop);
      if (keyboardHeight > 80) {
        pill.style.bottom = (keyboardHeight + 8) + 'px';
        strip.style.bottom = (keyboardHeight + 44) + 'px';
      } else {
        pill.style.bottom = '66px';
        strip.style.bottom = '104px';
      }
    }
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', syncViewportPosition);
      window.visualViewport.addEventListener('scroll', syncViewportPosition);
    }

    strip.addEventListener('touchstart', function (e) {
      const btn = e.target.closest('.wb-q-key');
      if (!btn || !activeField) return;
      e.preventDefault();
      const ch = btn.dataset.k;
      const start = activeField.selectionStart || activeField.value.length;
      const end = activeField.selectionEnd || activeField.value.length;
      activeField.value = activeField.value.slice(0, start) + ch + activeField.value.slice(end);
      activeField.setSelectionRange(start + ch.length, start + ch.length);
      activeField.dispatchEvent(new Event('input', { bubbles: true }));
    }, { passive: false });

    strip.addEventListener('mousedown', function (e) {
      const btn = e.target.closest('.wb-q-key');
      if (!btn || !activeField) return;
      e.preventDefault();
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
        syncViewportPosition();
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
