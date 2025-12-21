const $ = (id) => document.getElementById(id);

function normalize(s){
  return (s || "")
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g,"");
}

function emailParts(email){
  const e = normalize(email);
  const [local, domain] = e.split("@");
  const localTokens = (local || "").split(/[\.\_\-\+]+/).filter(Boolean);
  const domainTokens = (domain || "").split(/[\.]+/).filter(Boolean);
  return [...new Set([...localTokens, ...domainTokens].filter(t => t.length >= 3))];
}

/* 5 livelli */
function strengthLabel(score) {
  if (score <= 19) return "Molto debole";
  if (score <= 39) return "Debole";
  if (score <= 59) return "Discreta";
  if (score <= 79) return "Buona";
  return "Molto forte";
}

const descMap = {
  "Molto debole": "Facilmente indovinabile",
  "Debole": "Poco sicura",
  "Discreta": "Accettabile, ma migliorabile",
  "Buona": "Sicura per l’uso comune",
  "Molto forte": "Elevata resistenza agli attacchi"
};

/* Utility: pattern consecutivi noti */
function hasConsecutivePattern(p) {
  const seq = /0123|1234|2345|3456|4567|5678|6789|abcd|bcde|cdef|defg|efgh|fghi|ghij|hijk|ijkl|jklm|klmn|lmno|mnop|nopq|opqr|pqrs|qrst|rstu|stuv|tuvw|uvwx|vwxy|wxyz/i;
  const keyboard = /qwer|wert|erty|rtyu|tyui|yuio|uiop|asdf|sdfg|dfgh|fghj|ghjk|hjkl|zxcv|xcvb|cvbn|vbnm/i;
  return seq.test(p) || keyboard.test(p);
}

/* "Dizionario" di password/parole molto comuni (penalità, NON blocco) */
const COMMON_WORDS = [
  "password","passw0rd","admin","administrator","welcome","letmein","qwerty","qwertyuiop",
  "asdf","asdfgh","zxcv","zxcvbnm","iloveyou","love","dragon","monkey","football",
  "baseball","login","user","test","demo","root","toor","master","superuser",
  "123456","1234567","12345678","123456789","1234567890","111111","000000","987654321",
  "abc123","iloveyou","sunshine","princess","password1","admin123","qazwsx"
];

function dictionaryHits(pw) {
  const s = normalize(pw);
  if (!s) return { hits: 0, matched: [] };

  // match "esatto" e "contenuto"
  const matched = [];
  for (const w of COMMON_WORDS) {
    if (!w) continue;
    if (s === w || (w.length >= 4 && s.includes(w))) matched.push(w);
  }
  return { hits: matched.length, matched };
}

/*
  Scoring basato su:
  - Basic16 (>=16 char, primi 8 a 4pt, successivi a 8pt, 16 char = 100)
  - Comprehensive8 (>=8 char, 4pt per char + bonus per classi e varietà, penalità se niente minuscole)
  Baseline meter: score = max(Basic16, Comprehensive8)

  + Penalità:
    - pattern consecutivi
    - mancanza simboli
    - mancanza maiuscole
    - caratteri uguali di fila
    - dizionario di parole comuni (facilmente indovinabili)
    - info personali (nome/cognome/email)
*/
function evaluatePassword(pw, personalTokens){
  const tips = [];
  const p = pw || "";
  const len = p.length;

  if (!p) return { score: 0, level: "Molto debole", tips: ["Inizia a digitare una password."] };

  /* ========== BASIC16 ========== */
  const first8 = Math.min(len, 8);
  const rest = Math.max(len - 8, 0);
  let scoreBasic16 = first8 * 4 + rest * 8;
  scoreBasic16 = Math.min(100, scoreBasic16);

  /* ========== COMPREHENSIVE8 ========== */
  const hasLower = /[a-z]/.test(p);
  const hasUpper = /[A-Z]/.test(p);
  const hasDigit = /\d/.test(p);
  const hasSym   = /[^A-Za-z0-9]/.test(p);

  let scoreComp8 = 0;

  if (len >= 8) {
    scoreComp8 = len * 4;

    // bonus 17 (come nel testo) per la presenza di: maiuscole, cifre, simboli
    if (hasUpper) scoreComp8 += 17;
    if (hasDigit) scoreComp8 += 17;
    if (hasSym)   scoreComp8 += 17;

    // bonus per varietà (tutte le classi)
    const variety = [hasLower, hasUpper, hasDigit, hasSym].filter(Boolean).length;
    if (variety === 4) scoreComp8 += 10;

    // penalità se mancano completamente minuscole
    if (!hasLower) {
      scoreComp8 -= 15;
      tips.push("Aggiungi lettere minuscole.");
    }
  } else {
    tips.push("Usa almeno 8 caratteri per soddisfare Comprehensive8.");
  }

  /* ========== PENALITÀ PATTERN / STRUTTURA ========== */

  // Pattern consecutivi (1234, qwerty, asdf...)
  if (hasConsecutivePattern(p)) {
    scoreBasic16 -= 14;
    scoreComp8   -= 14;
    tips.push("Evita sequenze/pattern consecutivi (es. 1234, qwerty, asdf).");
  }

  // Caratteri uguali di fila (AA, 11, bb...)
  if (/(.)\1\1/.test(p)) {
    scoreBasic16 -= 12;
    scoreComp8   -= 12;
    tips.push("Evita ripetizioni lunghe (es. AAA, 111).");
  } else if (/(.)\1/.test(p)) {
    scoreBasic16 -= 6;
    scoreComp8   -= 6;
    tips.push("Evita caratteri uguali consecutivi (es. AA, 11).");
  }

  // Mancanza simboli (penalità esplicita)
  if (!hasSym) {
    scoreBasic16 -= 8;
    scoreComp8   -= 8;
    tips.push("Aggiungi almeno un simbolo (es. ! ? @ #).");
  }

  // Mancanza maiuscole (penalità esplicita)
  if (!hasUpper) {
    scoreBasic16 -= 8;
    scoreComp8   -= 8;
    tips.push("Aggiungi almeno una lettera maiuscola.");
  }

  /* ========== PENALITÀ DIZIONARIO (NUOVA) ========== */
  const dict = dictionaryHits(p);
  if (dict.hits > 0) {
    // Penalità: più forte se la password è (quasi) "parola comune"
    // - se contiene parole comuni: -12
    // - se è esattamente una parola comune o molto simile: aggiungiamo extra
    const s = normalize(p);
    const exact = COMMON_WORDS.includes(s);
    const pen = Math.min(30, 12 + (exact ? 10 : 0) + (dict.hits - 1) * 4);

    scoreBasic16 -= pen;
    scoreComp8   -= pen;

    tips.push("Evita parole/password comuni e facilmente indovinabili (dizionario).");
  }

  /* ========== PENALITÀ INFO PERSONALI ========== */
  const np = normalize(p);
  let hits = 0;
  for (const t of personalTokens) {
    if (t && t.length >= 3 && np.includes(t)) hits++;
  }
  if (hits) {
    const pen = Math.min(20, hits * 6);
    scoreBasic16 -= pen;
    scoreComp8   -= pen;
    tips.push("Evita di includere nome, cognome o email nella password.");
  }

  /* ========== SCORE FINALE (baseline) ========== */
  let score = Math.max(scoreBasic16, scoreComp8);
  score = Math.max(0, Math.min(100, Math.round(score)));

  /* ========== SUGGERIMENTI GENERALI ========== */
  if (len < 16) tips.push("Una password di 16+ caratteri raggiunge facilmente un punteggio alto (Basic16).");
  if (!hasDigit) tips.push("Aggiungi un numero.");

  const level = strengthLabel(score);
  return { score, level, tips: [...new Set(tips)] };
}

function validateFinal(pw){
  if ((pw || "").length < 8) return { ok:false, msg:"Minimo 8 caratteri." };
  return { ok:true, msg:"OK" };
}

/* UI */
const step1 = $("step1");
const step2 = $("step2");
const step3 = $("step3");

const btnContinua = $("btnContinua");
const errStep1 = $("errStep1");

const who = $("who");
const pw = $("pw");
const pw2 = $("pw2");
const togglePw = $("togglePw");
const togglePw2 = $("togglePw2");

const scoreEl = $("score");
const fill = $("fill");
const label = $("label");
const tipsEl = $("tips");
const btnBack = $("btnBack");
const btnCrea = $("btnCrea");
const finalCheck = $("finalCheck");
const strengthDesc = $("strengthDesc");
const matchMsg = $("matchMsg");
const btnRestart = $("btnRestart");

let personalTokens = [];

function setStep1Error(msg) {
  if (!msg) {
    errStep1.style.display = "none";
    errStep1.textContent = "";
    return;
  }
  errStep1.style.display = "block";
  errStep1.textContent = msg;
}

function updateConfirmUI() {
  const a = pw.value || "";
  const b = pw2.value || "";

  if (!b) {
    matchMsg.style.display = "none";
    matchMsg.textContent = "";
    matchMsg.className = "callout";
    return { ok: false, started: false };
  }

  const ok = a === b;
  matchMsg.style.display = "block";
  matchMsg.className = "callout " + (ok ? "callout-ok" : "callout-warn");
  matchMsg.textContent = ok ? "✅ Le password coincidono" : "⚠️ Le password non coincidono";
  return { ok, started: true };
}

function updateMeter(){
  const res = evaluatePassword(pw.value, personalTokens);

  scoreEl.textContent = res.score;
  fill.style.width = res.score + "%";

  label.textContent = res.level;
  label.dataset.level = res.level;

  strengthDesc.textContent = descMap[res.level] || "";

  tipsEl.innerHTML = "";
  res.tips.forEach(t => {
    const li = document.createElement("li");
    li.textContent = t;
    tipsEl.appendChild(li);
  });

  const v = validateFinal(pw.value);
  const conf = updateConfirmUI();

  const okStrength = v.ok && res.score >= 40;
  const okAll = okStrength && conf.ok;

  btnCrea.disabled = !okAll;

  if (!v.ok) {
    finalCheck.style.display = "block";
    finalCheck.textContent = v.msg;
  } else if (res.score < 40) {
    finalCheck.style.display = "block";
    finalCheck.textContent = "Password troppo debole (minimo: Discreta).";
  } else if (!conf.ok) {
    finalCheck.style.display = "block";
    finalCheck.textContent = "Conferma password non valida: devono coincidere.";
  } else {
    finalCheck.style.display = "none";
    finalCheck.textContent = "";
  }
}

btnContinua.addEventListener("click", () => {
  const nome = $("nome").value.trim();
  const cognome = $("cognome").value.trim();
  const email = $("email").value.trim();

  setStep1Error("");

  if (!nome || !cognome || !email) {
    setStep1Error("⚠️ Compila nome, cognome ed email per continuare.");
    return;
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    setStep1Error("⚠️ Email non valida. Inserisci un indirizzo corretto (es. nome@dominio.it).");
    return;
  }

  personalTokens = [normalize(nome), normalize(cognome), ...emailParts(email)].filter(Boolean);

  who.textContent = `${nome} ${cognome} · ${email}`;
  step1.style.display = "none";
  step2.style.display = "block";

  pw.value = "";
  pw2.value = "";
  matchMsg.style.display = "none";
  pw.focus();

  updateMeter();
});

btnBack.addEventListener("click", () => {
  step2.style.display = "none";
  step1.style.display = "block";
});

togglePw.addEventListener("click", () => {
  const isHidden = pw.type === "password";
  pw.type = isHidden ? "text" : "password";
  togglePw.textContent = isHidden ? "🙈" : "👁️";
  pw.focus();
});

togglePw2.addEventListener("click", () => {
  const isHidden = pw2.type === "password";
  pw2.type = isHidden ? "text" : "password";
  togglePw2.textContent = isHidden ? "🙈" : "👁️";
  pw2.focus();
});

pw.addEventListener("input", updateMeter);
pw2.addEventListener("input", updateMeter);

btnCrea.addEventListener("click", () => {
  step2.style.display = "none";
  step3.style.display = "block";
});

btnRestart.addEventListener("click", () => {
  window.location.reload();
});
