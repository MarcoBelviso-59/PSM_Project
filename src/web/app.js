const $ = (id) => document.getElementById(id);

if (!window.PSMEngine) {
  throw new Error(
    "PSMEngine non caricato: assicurati che index.html includa ../engine/psmEngine.js prima di app.js"
  );
}

const { normalize, emailParts, evaluate, generateFeedback, validateFinal } = window.PSMEngine;

const descMap = {
  "Molto debole": "Facilmente indovinabile",
  "Debole": "Poco sicura",
  "Discreta": "Accettabile, ma migliorabile",
  "Buona": "Sicura per l’uso comune",
  "Molto forte": "Elevata resistenza agli attacchi"
};

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
const policyLabel = $("policyLabel");
const tipsEl = $("tips");
const btnBack = $("btnBack");
const btnCrea = $("btnCrea");
const btnRestart = $("btnRestart");

const strengthDesc = $("strengthDesc");
const matchMsg = $("matchMsg");
const finalCheck = $("finalCheck");

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

function updateMeter() {
  const evaluation = evaluate(pw.value, personalTokens);
  const tips = generateFeedback(evaluation);

  // VALIDAZIONE POLICY (pass/fail) separata dalla forza stimata
  const v = validateFinal(pw.value, personalTokens);

  scoreEl.textContent = evaluation.score;
  fill.style.width = evaluation.score + "%";

  // Badge "forza"
  label.textContent = evaluation.level;
  label.dataset.level = evaluation.level;

  // Badge "policy"
  if (policyLabel) {
    policyLabel.textContent = v.ok ? "Valida" : "Non valida";
    policyLabel.dataset.policy = v.ok ? "valid" : "invalid";
  }

  // Descrizione: non deve sembrare “accettata” se la policy fallisce
  const baseDesc = descMap[evaluation.level] || "";
  strengthDesc.textContent = v.ok
    ? baseDesc
    : `${baseDesc} — NON validabile: correggi i vincoli sotto.`;

  tipsEl.innerHTML = "";
  tips.forEach((t) => {
    const li = document.createElement("li");
    li.textContent = t;
    tipsEl.appendChild(li);
  });

  const conf = updateConfirmUI();

  if (!v.ok) {
    finalCheck.style.display = "block";
    finalCheck.textContent = v.msg;
  } else if (!conf.ok) {
    finalCheck.style.display = "block";
    finalCheck.textContent = "Conferma password non valida: devono coincidere.";
  } else {
    finalCheck.style.display = "none";
    finalCheck.textContent = "";
  }

  const canCreate = v.ok && conf.ok;
  btnCrea.disabled = !canCreate;
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

 const rawTokens = [normalize(nome), normalize(cognome), ...emailParts(email)].filter(Boolean);
personalTokens = Array.from(new Set(rawTokens));


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

  
