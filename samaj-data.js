/**
 * શ્રી બનાસકાંઠા ગુર્જર પ્રજાપતિ સમાજ - Wadbook
 * ડાયનેમિક ગામ અને પેટા જાતિ (શાખ) ડેટાબેઝ
 * નોંધ: ભવિષ્યમાં નવું નામ ઉમેરવા માટે ફક્ત યાદીમાં અલ્પવિરામ (,) કરીને નામ લખો.
 *
 * v2: app.js નો અસલી ડેટા ("wadbook-v1" -> D.ps) વાંચે છે,
 *     "ટડાય ( બનાસકાંઠા )" જેવા નામ "ટડાય" સાથે મેચ થાય છે.
 */

const BASE_SHAKH_LIST = [
  "ટડાવા", "જાણદિયા", "ભોરેલા", "ડોડગામા", "ભૈડુસા",
  "ડાડી", "ચૌહાણ", "સાતરીયા", "આબુવા", "સાયડિયા",
  "વાવેસા", "રામેડીયા", "મકવાણા", "ઘોડા", "બગેડીયા",
  "સરવાળિયા", "ભાટવેરા", "સપરેડીયા", "મોરવાડીયા", "ભાટી",
  "થરાદરા", "ડાંગરીયા", "ધુણેલા", "ધોણેસલા", "સેણુવા",
  "ચિબડીયા", "ગોહેલ / ગોહિલ"
];

const BASE_VILLAGE_LIST = [
  "પાલડી", "હરસડ", "ઉચપા", "જમપુર", "પળાદર",
  "ભાટવર", "ખોયડા - ખોરડા", "જમડા", "નેહડા - નેહડી", "કોડ",
  "વડમ", "વાણાસણ", "ગોળીયું - ગોળીયા", "દાંતીયાનીઢાણી - દાંટિયાઢાણી", "સોતાના - સોતાણા",
  "પાલડી મીઠી", "વાઘાસણ", "વાવ", "ખીમાણાવાસ", "મારવાડ",
  "જોડીયા", "રડકા", "તાકવા", "ભાવનગર", "અમદાવાદ",
  "કલોલ", "કડી", "મહેસાણા", "ઉંઝા", "સિદ્ધપુર",
  "પાટણ", "પાલનપુર", "ડીસા", "થરાદ", "અભેપુરા",
  "હારીજ", "દેવપુરા", "ચેમ્બુઆ", "જેટલા", "પારલુ",
  "બાવળીયારી", "સાયડા", "કણભુણ", "મમાણા", "વેડલા",
  "સપ્રેડા", "સાંગા", "મોરવાડા"
];

// સામાન્ય જોડણી અને અંગ્રેજી સર્ચ માટે સ્માર્ટ કીવર્ડ મેપિંગ (વૈકલ્પિક)
const SEARCH_ALIASES = {
  "ટડાવા": "tadava tadawa ટડાવ",
  "જાણદિયા": "janadiya jandiya જાણદીયા",
  "ભોરેલા": "bhorela",
  "ડોડગામા": "dodgama",
  "ભૈડુસા": "bhaidusa bhendsa ભેંડસા",
  "ડાડી": "dadi",
  "ચૌહાણ": "chauhan chouhan",
  "સાતરીયા": "satariya satriya સાતરિયા",
  "આબુવા": "abuva abuwa",
  "સાયડિયા": "saydiya sayadiya સાયડીયા",
  "વાવેસા": "vavesa wavesa",
  "રામેડીયા": "ramediya રામેડિયા",
  "મકવાણા": "makwana makvana",
  "ઘોડા": "ghoda",
  "બગેડીયા": "bagediya bagadiya બગેડિયા બગડીયા",
  "સરવાળિયા": "sarvaliya sarwaliya સરવાળીયા",
  "ભાટવેરા": "bhatvera bhatwera",
  "સપરેડીયા": "saprediya સપરેડિયા",
  "મોરવાડીયા": "morvadiya morwadiya મોરવાડિયા",
  "ભાટી": "bhati",
  "થરાદરા": "tharadra",
  "ડાંગરીયા": "dangariya ડાંગરિયા",
  "ધુણેલા": "dhunela",
  "ધોણેસલા": "dhonesla",
  "સેણુવા": "senuva senuwa",
  "ચિબડીયા": "chibdiya chibadiya ચિબડિયા",
  "ગોહેલ / ગોહિલ": "gohel gohil ગોહેલ ગોહિલ",
  "પાલડી": "paldi paladi",
  "હરસડ": "harsad",
  "ઉચપા": "uchpa uchapa",
  "જમપુર": "jampur",
  "પળાદર": "paladar pladar",
  "ભાટવર": "bhatvar bhatwar",
  "ખોયડા - ખોરડા": "khoyda khorda ખોયડા ખોરડા",
  "જમડા": "jamda",
  "નેહડા - નેહડી": "nehda nehdi નેહડા નેહડી",
  "કોડ": "kod",
  "વડમ": "vadam wadam",
  "વાણાસણ": "vanasan wanasan",
  "ગોળીયું - ગોળીયા": "goliyu goliya ગોળીયું ગોળીયા",
  "દાંતીયાનીઢાણી - દાંટિયાઢાણી": "dantiyanidhani dantiyadhani dhani ઢાણી દાંતીયા",
  "સોતાના - સોતાણા": "sotana sontana સોતાના સોતાણા સોંતાણા",
  "પાલડી મીઠી": "paldi mithi mithi paldi મીઠી",
  "વાઘાસણ": "vaghasan waghasan",
  "વાવ": "vav wav",
  "ખીમાણાવાસ": "khimanavas khimanawas ખીમાણા",
  "મારવાડ": "marvad marwad",
  "જોડીયા": "jodiya જોડિયા",
  "રડકા": "radka",
  "તાકવા": "takva takwa ટાકવા",
  "ભાવનગર": "bhavnagar",
  "અમદાવાદ": "ahmedabad amdavad",
  "કલોલ": "kalol",
  "કડી": "kadi",
  "મહેસાણા": "mehsana mahesana",
  "ઉંઝા": "unjha unja ઊંઝા",
  "સિદ્ધપુર": "sidhpur siddhpur",
  "પાટણ": "patan",
  "પાલનપુર": "palanpur",
  "ડીસા": "deesa disa",
  "થરાદ": "tharad",
  "અભેપુરા": "abhepura abepura અબેપુરા",
  "હારીજ": "harij",
  "દેવપુરા": "devpura dewpura",
  "ચેમ્બુઆ": "chembua shembua શેમ્બુઆ",
  "જેટલા": "jetla jetala",
  "પારલુ": "parlu paralu",
  "બાવળીયારી": "bavaliyari bawaliyari બાવળિયારી",
  "સાયડા": "sayda sayada",
  "કણભુણ": "kanbhun કણભુણા",
  "મમાણા": "mamana",
  "વેડલા": "vedla wedla",
  "સપ્રેડા": "sapreda",
  "સાંગા": "sanga",
  "મોરવાડા": "morvada morwada"
};

/**
 * નામ સાફ કરે: "ટડાય ( બનાસકાંઠા )" -> "ટડાય", વધારાની જગ્યા કાઢે, નાના અક્ષર
 */
function cleanSamajName(s) {
  return String(s || "")
    .replace(/[\(\[（][^\)\]）]*[\)\]）]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

/**
 * યાદીના નામના બધા રૂપ: "ખોયડા - ખોરડા" -> ["ખોયડા - ખોરડા", "ખોયડા", "ખોરડા"]
 */
function samajNameVariants(name) {
  const full = cleanSamajName(name);
  const parts = full.split(/\s*[-\/]\s*/).map(x => x.trim()).filter(Boolean);
  return Array.from(new Set([full, ...parts]));
}

/**
 * સભ્યની શાખ / ગામ (સાફ કરેલ)
 */
function getMemberValue(type, m) {
  return type === "shakh"
    ? cleanSamajName(m.shakh || m.subcaste || m.gotra || "")
    : cleanSamajName(m.village || m.gam || m.nativePlace || m.city || "");
}

/**
 * સભ્ય યાદીના નામ સાથે મેચ થાય છે કે નહીં
 */
function samajMatch(type, m, listName) {
  return samajPlaceRoles(type, m, listName).length > 0;
}

/**
 * કયા કારણે મેચ થયું: ["વતન"], ["હાલ રહેઠાણ"], બંને, અથવા ["શાખ"]
 */
function samajPlaceRoles(type, m, listName) {
  const variants = samajNameVariants(listName);
  const roles = [];
  if (type === "shakh") {
    if (variants.includes(getMemberValue("shakh", m))) roles.push("શાખ");
    return roles;
  }
  if (variants.includes(cleanSamajName(m.village || m.gam || m.nativePlace || m.city || ""))) roles.push("વતન");
  if (variants.includes(cleanSamajName(m.res || ""))) roles.push("હાલ રહેઠાણ");
  return roles;
}

/**
 * Wadbook (app.js) નો અસલી ડેટા વાંચે છે: localStorage "wadbook-v1" -> { ps:[...], ja:"..." }
 * ps માં દરેક સભ્ય: n=નામ, sur=અટક, ja=જાતિ/શાખ, gam=મૂળ ગામ, img=ફોટો, f=પિતાનો id
 */
function getWadbookRecords() {
  const out = [];
  try {
    const raw = localStorage.getItem("wadbook-v1");
    if (raw) {
      const D = JSON.parse(raw);
      const ps = (D && Array.isArray(D.ps)) ? D.ps : [];
      const byId = id => ps.find(x => x && x.id == id);
      const fullName = p => {
        if (p.g === "F") {
          const husb = ps.find(x => x && (x.sp == p.id || (p.sp && x.id == p.sp)));
          if (husb) return p.n + " " + husb.n;
          const dad = p.f && byId(p.f);
          if (dad) return p.n + " " + dad.n;
          return p.n || "";
        }
        const dad = p.f && byId(p.f);
        return (p.n || "") + (dad ? " " + dad.n : "");
      };
      ps.forEach(p => {
        if (!p) return;
        out.push({
          id: p.id,
          familyId: p.f || "",
          name: fullName(p).trim(),
          sur: p.sur || "",
          shakh: p.ja || (D && D.ja) || "",
          village: p.gam || "",
          res: p.rah || "",
          photo: p.img || ""
        });
      });
    }
  } catch (e) {
    console.warn("Wadbook data read warning:", e);
  }
  return out;
}

/**
 * બેઝ લિસ્ટ + યુઝરે નવા ઉમેરેલા ગામ/શાખ બંનેને ભેગા કરીને સંપૂર્ણ ડાયનેમિક યાદી આપે છે
 */
function getDynamicSamajLists() {
  const members = getWadbookRecords();
  const shakh = BASE_SHAKH_LIST.slice();
  const villages = BASE_VILLAGE_LIST.slice();

  const addIfNew = (list, type, rawVal) => {
    const val = String(rawVal || "").replace(/[\(\[（][^\)\]）]*[\)\]）]/g, " ").replace(/\s+/g, " ").trim();
    if (!val) return;
    const key = val.toLowerCase();
    const exists = list.some(n => samajNameVariants(n).includes(key));
    if (!exists) list.push(val);
  };

  members.forEach(m => {
    addIfNew(shakh, "shakh", m.shakh);
    addIfNew(villages, "village", m.village);
    addIfNew(villages, "village", m.res);
  });

  return { shakh, villages, members };
}

/**
 * ઓટો-સજેશન સર્ચ ફંક્શન (ગુજરાતી + English બંનેમાં કામ કરે)
 */
function searchSamajAutoComplete(query, filterType = "all") {
  const { shakh, villages, members } = getDynamicSamajLists();
  const q = (query || "").trim().toLowerCase();
  const results = [];

  const countMatches = (type, name) => members.filter(m => samajMatch(type, m, name)).length;

  if (filterType === "all" || filterType === "village") {
    villages.forEach(name => {
      const alias = (SEARCH_ALIASES[name] || "").toLowerCase();
      if (!q || name.toLowerCase().includes(q) || alias.includes(q)) {
        results.push({
          type: "village",
          label: "ગામ / શહેર",
          name,
          count: countMatches("village", name)
        });
      }
    });
  }

  if (filterType === "all" || filterType === "shakh") {
    shakh.forEach(name => {
      const alias = (SEARCH_ALIASES[name] || "").toLowerCase();
      if (!q || name.toLowerCase().includes(q) || alias.includes(q)) {
        results.push({
          type: "shakh",
          label: "શાખ",
          name,
          count: countMatches("shakh", name)
        });
      }
    });
  }

  return results;
}


/**
 * સભ્યના નામથી શોધ (બધા શબ્દો મળવા જોઈએ; નામ + અટક)
 */
function searchMembersByName(query) {
  const words = String(query || "").toLowerCase().split(/\s+/).filter(Boolean);
  if (!words.length) return [];
  return getWadbookRecords().filter(m => {
    const hay = ((m.name || "") + " " + (m.sur || "")).toLowerCase();
    return words.every(w => hay.includes(w));
  });
}
