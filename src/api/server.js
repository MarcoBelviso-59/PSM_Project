"use strict";

const express = require("express");
const cors = require("cors");

// Import diretto dell'engine dual-mode (single source of truth)
const engine = require("../engine/psmEngine.js");

const app = express();
app.use(cors());
app.use(express.json({ limit: "50kb" }));

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
    for (const t of body.personalTokens) {
      const norm = engine.normalize(String(t));
      if (norm) tokens.push(norm);
    }
  } else if (body.user && typeof body.user === "object") {
    // 2) Altrimenti: derivazione da user
    const { firstName, lastName, email } = body.user;

    if (isNonEmptyString(firstName)) tokens.push(engine.normalize(firstName));
    if (isNonEmptyString(lastName)) tokens.push(engine.normalize(lastName));

    if (isNonEmptyString(email) && emailLooksValid(email)) {
      const parts = engine.emailParts(email);
      for (const p of parts) tokens.push(p);
    }
  }

  // Filtri minimi e deduplica (stile "robusto", senza cambiare logica engine)
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

app.post("/api/evaluate", (req, res) => {
  const body = req.body || {};
  const password = body.password;

  if (typeof password !== "string") {
    return res.status(400).json({ error: "BadRequest", message: "`password` deve essere una stringa." });
  }

  const personalTokens = buildPersonalTokens(body);

  try {
    const evaluation = engine.evaluate(password, personalTokens);
    const suggestions = engine.generateFeedback(evaluation);

    return res.json({
      score: evaluation.score,
      level: evaluation.level,
      patterns: evaluation.patterns,
      suggestions
    });
  } catch (e) {
    return res.status(500).json({ error: "InternalError", message: "Errore interno durante la valutazione." });
  }
});

app.post("/api/validate", (req, res) => {
  const body = req.body || {};
  const password = body.password;

  if (typeof password !== "string") {
    return res.status(400).json({ error: "BadRequest", message: "`password` deve essere una stringa." });
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
app.listen(PORT, () => {
  console.log(`PSM API listening on http://localhost:${PORT}`);
});
