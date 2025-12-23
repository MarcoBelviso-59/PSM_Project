"use strict";

const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");


const EXPERIMENTS_DIR = path.join(__dirname, "../experiments/outputs");


// Import diretto dell'engine dual-mode (single source of truth)
const engine = require("../engine/psmEngine.js");

const app = express();
app.use(cors());
app.use(express.json({ limit: "50kb" }));

// --- DS2: validazione e limiti ---
const MAX_PASSWORD_LEN = 256;
const MAX_TOKENS = 50;
const MAX_TOKEN_LEN = 64;

// --- DS2: autorizzazione "se prevista" (abilitata solo se settiamo env PSM_API_KEY) ---
function requireApiKeyIfConfigured(req, res, next) {
  const expected = process.env.PSM_API_KEY;
  if (!expected) return next(); // auth non prevista -> non bloccare

  const provided = req.header("x-api-key");
  if (!provided) {
    return res.status(401).json({ error: "Unauthorized", message: "Missing API key." });
  }
  if (provided !== expected) {
    return res.status(403).json({ error: "Forbidden", message: "Invalid API key." });
  }
  return next();
}

function parseOptions(body) {
  const opt = body && typeof body.options === "object" && body.options !== null ? body.options : {};
  const includeFeedback = opt.includeFeedback === true; // default false
  return { includeFeedback };
}

function validatePasswordField(password) {
  if (typeof password !== "string") {
    return { ok: false, message: "`password` deve essere una stringa." };
  }
  const trimmed = password.trim();
  if (trimmed.length === 0) {
    return { ok: false, message: "`password` non può essere vuota." };
  }
  if (password.length > MAX_PASSWORD_LEN) {
    return { ok: false, message: `\`password\` troppo lunga (max ${MAX_PASSWORD_LEN}).` };
  }
  return { ok: true };
}

function validateOptions(body) {
  if (body.options === undefined) return { ok: true };
  if (typeof body.options !== "object" || body.options === null || Array.isArray(body.options)) {
    return { ok: false, message: "`options` deve essere un oggetto JSON." };
  }
  if ("includeFeedback" in body.options && typeof body.options.includeFeedback !== "boolean") {
    return { ok: false, message: "`options.includeFeedback` deve essere boolean." };
  }
  return { ok: true };
}


function isNonEmptyString(v) {
  return typeof v === "string" && v.trim().length > 0;
}

function emailLooksValid(email) {
  return typeof email === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

function buildPersonalTokens(body) {
  const tokens = [];

  // 1) Priorità: personalTokens (se forniti dal client)
  if (Array.isArray(body.personalTokens)) {
    // limiti DS2 (non mutiamo body)
    const sliced = body.personalTokens.slice(0, MAX_TOKENS);

    for (const t of sliced) {
      const raw = String(t);
      if (raw.length > MAX_TOKEN_LEN) continue;

      const norm = engine.normalize(raw);
      if (norm) tokens.push(norm);
    }
  }
  // 2) Altrimenti: derivazione da user
  else if (body.user && typeof body.user === "object") {
    const { firstName, lastName, email } = body.user;

    if (isNonEmptyString(firstName)) tokens.push(engine.normalize(firstName));
    if (isNonEmptyString(lastName)) tokens.push(engine.normalize(lastName));

    if (isNonEmptyString(email) && emailLooksValid(email)) {
      const parts = engine.emailParts(email);
      for (const p of parts) tokens.push(p);
    }
  }

  // Filtri minimi e deduplica
  const uniq = [];
  const seen = new Set();

  for (const t of tokens) {
    if (!t) continue;
    if (t.length < 3) continue;
    if (seen.has(t)) continue;
    seen.add(t);
    uniq.push(t);
  }

  return uniq;
}



app.get("/health", (req, res) => {
  res.json({ ok: true, service: "psm-api" });
});

function handleEvaluate(req, res) {
  const body = req.body || {};
  const password = body.password;

  // DS2: validazione input e opzioni
  const vOpt = validateOptions(body);
  if (!vOpt.ok) {
    return res.status(400).json({ error: "BadRequest", message: vOpt.message });
  }

  const vPw = validatePasswordField(password);
  if (!vPw.ok) {
    return res.status(400).json({ error: "BadRequest", message: vPw.message });
  }

  const { includeFeedback } = parseOptions(body);
  const personalTokens = buildPersonalTokens(body);

  try {
    const evaluation = engine.evaluate(password, personalTokens);

    // DS2: risposta standard (sempre questi campi)
    const out = {
      score: evaluation.score,
      level: evaluation.level,
      patterns: evaluation.patterns
    };

    // DS2: feedback solo su richiesta
    if (includeFeedback) {
      out.suggestions = engine.generateFeedback(evaluation);
    }

    return res.json(out);
  } catch (e) {
    return res
      .status(500)
      .json({ error: "InternalError", message: "Errore interno durante la valutazione." });
  }
}


app.post("/api/evaluate", requireApiKeyIfConfigured, handleEvaluate);
app.post("/evaluatePassword", requireApiKeyIfConfigured, handleEvaluate);


  app.post("/api/validate", requireApiKeyIfConfigured, (req, res) => {

  const body = req.body || {};
const password = body.password;

const vPw = validatePasswordField(password);
if (!vPw.ok) {
  return res.status(400).json({ error: "BadRequest", message: vPw.message });
}

  const personalTokens = buildPersonalTokens(body);

  try {
    const result = engine.validateFinal(password, personalTokens);
    return res.json(result);
  } catch (e) {
    return res.status(500).json({ error: "InternalError", message: "Errore interno durante la validazione." });
  }
});

const PORT = process.env.PORT || 3000;

app.get("/experiments", (req, res) => {
  try {
    if (!fs.existsSync(EXPERIMENTS_DIR)) {
      return res.json({ runs: [] });
    }

    const runs = fs.readdirSync(EXPERIMENTS_DIR, { withFileTypes: true })
      .filter(d => d.isDirectory())
      .map(d => d.name);

    return res.json({ runs });
  } catch (e) {
    return res.status(500).json({ error: "Errore lettura runs" });
  }
});


app.get("/experiments/:runId", (req, res) => {
  try {
    const runId = req.params.runId;
    const runDir = path.join(EXPERIMENTS_DIR, runId);

    if (!fs.existsSync(runDir)) {
      return res.status(404).json({ error: "Run non trovato" });
    }

    const metaPath = path.join(runDir, "meta.json");
    const resultsPath = path.join(runDir, "results.json");

    const meta = fs.existsSync(metaPath)
      ? JSON.parse(fs.readFileSync(metaPath, "utf8"))
      : null;

    const limit = Math.max(1, Math.min(200, parseInt(req.query.limit || "20", 10)));

    let resultsPreview = [];
    if (fs.existsSync(resultsPath)) {
      const all = JSON.parse(fs.readFileSync(resultsPath, "utf8"));
      const arr = Array.isArray(all?.results) ? all.results : [];
      resultsPreview = arr.slice(0, limit);
    }

    return res.json({ runId, meta, resultsPreview });
  } catch (e) {
    return res.status(500).json({ error: "Errore lettura run" });
  }
});

app.get("/experiments/:runId/export", (req, res) => {
  try {
    const runId = req.params.runId;
    const format = String(req.query.format || "").toLowerCase();

    if (format !== "csv" && format !== "json" && format !== "tsv" && format !== "excelcsv") {
  return res.status(400).json({
    error: "Formato non supportato. Usa ?format=csv oppure ?format=json oppure ?format=tsv oppure ?format=excelcsv"
  });
}


    const runDir = path.join(EXPERIMENTS_DIR, runId);
    if (!fs.existsSync(runDir)) {
      return res.status(404).json({ error: "Run non trovato" });
    }

    const fileName =
    format === "csv" ? "results.csv" :
    format === "tsv" ? "results.tsv" :
    format === "excelcsv" ? "results_excel.csv" :
    "results.json";

    const filePath = path.join(runDir, fileName);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: "File non trovato" });
    }

   res.setHeader("Content-Disposition", `attachment; filename="${runId}_${fileName}"`);
   res.setHeader(
    "Content-Type",
    (format === "csv" || format === "excelcsv") ? "text/csv" :
    format === "tsv" ? "text/tab-separated-values" :
    "application/json"
);



    fs.createReadStream(filePath).pipe(res);
  } catch (e) {
    return res.status(500).json({ error: "Errore export" });
  }
});


app.listen(PORT, () => {
  console.log(`PSM API listening on http://localhost:${PORT}`);
});
