"use strict";

const fs = require("fs");
const path = require("path");

const engine = require("../engine/psmEngine.js");            // come in API
const { baselineZxcvbn } = require("./baselines/zxcvbn");    // baseline pronta

function parseArgs(argv) {
  const args = {};
  

  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (!a.startsWith("--")) continue;
    const k = a.slice(2);
    const n = argv[i + 1];
    if (!n || n.startsWith("--")) args[k] = true;
    else { args[k] = n; i++; }
  }
  return args;
}

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function normalizeTokens(tokens) {
  if (!Array.isArray(tokens)) return [];
  const out = [];
  const seen = new Set();
  for (const t of tokens) {
    const raw = String(t);
    const norm = engine.normalize(raw); // stessa normalizzazione API/engine
    if (!norm || norm.length < 3) continue;
    if (seen.has(norm)) continue;
    seen.add(norm);
    out.push(norm);
  }
  return out;
}

function csvEscape(v) {
  const s = String(v ?? "");
  if (s.includes('"') || s.includes(",") || s.includes("\n")) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

function writeDelimited(filePath, rows, columns, sep) {
  const head = columns.join(sep);
  const lines = rows.map(r => columns.map(c => csvEscape(r[c])).join(sep));
  fs.writeFileSync(filePath, [head, ...lines].join("\n"), "utf8");
}

function mean(nums) {
  return nums.length ? nums.reduce((a,b)=>a+b,0) / nums.length : 0;
}

function median(nums) {
  if (!nums.length) return 0;
  const a = [...nums].sort((x, y) => x - y);
  const mid = Math.floor(a.length / 2);
  return a.length % 2 ? a[mid] : (a[mid - 1] + a[mid]) / 2;
}

function groupByCategory(rows) {
  const map = {};
  for (const r of rows) {
    const cat = r.category || "unknown";
    if (!map[cat]) {
      map[cat] = { n: 0, valid: 0, psm: [], zx: [], delta: [] };
    }
    map[cat].n++;
    if (r.psm_valid_ok) map[cat].valid++;
    map[cat].psm.push(Number(r.psm_score));
    map[cat].zx.push(Number(r.zxcvbn_score_0_100));
    map[cat].delta.push(Number(r.delta));
  }

  return Object.entries(map).map(([category, g]) => ({
    category,
    n: g.n,
    valid_rate: Number((g.valid / g.n).toFixed(3)),
    psm_mean: Number(mean(g.psm).toFixed(2)),
    psm_median: Number(median(g.psm).toFixed(2)),
    zxcvbn_mean: Number(mean(g.zx).toFixed(2)),
    zxcvbn_median: Number(median(g.zx).toFixed(2)),
    delta_mean: Number(mean(g.delta).toFixed(2))
  }));
}


(function main() {
  const args = parseArgs(process.argv);
  const inFile = args.in || "datasets/sample.json";
  const outDir = args.out || "outputs/sample_run";
  const redact = Boolean(args["redact-password"]);
  const datasetSeed = args.seed ? Number(args.seed) : null;

  const inPath = path.resolve(__dirname, inFile);
  const outPath = path.resolve(__dirname, outDir);
  ensureDir(outPath);

  const dataset = JSON.parse(fs.readFileSync(inPath, "utf8"));
  if (!Array.isArray(dataset)) {
    console.error("Dataset JSON deve essere un array");
    process.exit(1);
  }

  const rows = [];
  for (const r of dataset) {
    const id = String(r.id ?? "");
    const category = String(r.category ?? "unknown");
    const password = String(r.password ?? "");
    const tokens = normalizeTokens(r.personalTokens);

    const psm = engine.evaluate(password, tokens);
    const vf = engine.validateFinal(password, tokens);
    const zx = baselineZxcvbn(password, tokens);

    const patterns = Array.isArray(psm.patterns)
      ? psm.patterns.map(p => p.type || String(p)).join("|")
      : "";

    rows.push({
      id,
      category,
      password: redact ? `***len:${password.length}***` : password,
      tokensCount: tokens.length,
      psm_score: psm.score,
      psm_level: psm.level,
      psm_valid_ok: Boolean(vf.ok),
      zxcvbn_score_0_4: zx.score_0_4,
      zxcvbn_score_0_100: zx.score_0_100,
      zxcvbn_guesses_log10: Number(zx.guesses_log10.toFixed(2)),
      delta: Number((psm.score - zx.score_0_100).toFixed(2)),

      patterns
    });
  }

 const byCategory = groupByCategory(rows);

const topAbsDisagree = rows
  .sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta))
  .slice(0, 10)
  .map(r => ({
    id: r.id,
    category: r.category,
    psm_score: r.psm_score,
    zxcvbn_score_0_100: r.zxcvbn_score_0_100,
    delta: r.delta,
    patterns: r.patterns
  }));

const meta = {
  dataset: path.relative(__dirname, inPath),
  datasetSeed,
  out: path.relative(__dirname, outPath),
  records: rows.length,
  aggregates: {
    psm_mean: Number(mean(rows.map(r => r.psm_score)).toFixed(2)),
    zxcvbn_mean: Number(mean(rows.map(r => r.zxcvbn_score_0_100)).toFixed(2)),
    delta_mean: Number(mean(rows.map(r => r.delta)).toFixed(2))
  },
  byCategory,
  topAbsDisagree
};


  fs.writeFileSync(path.join(outPath, "meta.json"), JSON.stringify(meta, null, 2), "utf8");
  fs.writeFileSync(path.join(outPath, "results.json"), JSON.stringify({ results: rows }, null, 2), "utf8");

 const columns = [
  "id","category","password","tokensCount",
  "psm_score","psm_level","psm_valid_ok",
  "zxcvbn_score_0_4","zxcvbn_score_0_100","zxcvbn_guesses_log10",
  "delta","patterns"
];

// CSV standard (virgola)
writeDelimited(path.join(outPath, "results.csv"), rows, columns, ",");

// CSV per Excel IT (punto e virgola)
writeDelimited(path.join(outPath, "results_excel.csv"), rows, columns, ";");


  // TSV (Excel-friendly): colonne separate da TAB
const tsvColumns = [
  "id","category","password","tokensCount",
  "psm_score","psm_level","psm_valid_ok",
  "zxcvbn_score_0_4","zxcvbn_score_0_100","zxcvbn_guesses_log10",
  "delta","patterns"
];

const tsv = [
  tsvColumns.join("\t"),
  rows.map(r => tsvColumns.map(c => String(r[c] ?? "")).join("\t"))
].join("\n");

fs.writeFileSync(path.join(outPath, "results.tsv"), tsv, "utf8");


  console.log("OK - run completato");
  console.log("Output:", outPath);
})();


