/* DS4 Dashboard: consuma l'API experiments e visualizza lista + dettaglio + statistiche + export */

(() => {
  const API_BASE = "http://localhost:3000";

  const $ = (id) => document.getElementById(id);

  const elApiBase = $("apiBasePill");
  const elRunsTbody = $("runsTbody");
  const elRunsCount = $("runsCount");
  const elSearch = $("searchRunId");
  const elSort = $("sortRuns");
  const elBtnRefresh = $("btnRefresh");

  const elDetailArea = $("detailArea");
  const elSelectedRunMeta = $("selectedRunMeta");
  const elPreviewLimit = $("previewLimit");

  elApiBase.textContent = API_BASE;

  let state = {
    runs: [],
    selectedRunId: null,
    selectedRunDetail: null,
  };

  function esc(s) {
    return String(s).replace(/[&<>"']/g, (c) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    }[c]));
  }

  async function apiGet(path) {
    const url = `${API_BASE}${path}`;
    const res = await fetch(url, { headers: { "Accept": "application/json" } });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`HTTP ${res.status} su ${path}${text ? ` — ${text}` : ""}`);
    }
    return res.json();
  }

  function renderRuns() {
    const q = (elSearch.value || "").trim().toLowerCase();
    const sortMode = elSort.value;

    let runs = [...state.runs];

    if (q) runs = runs.filter(r => String(r.runId || "").toLowerCase().includes(q));

    runs.sort((a, b) => {
      // best effort: se c'è createdAt/ts lo usiamo, altrimenti confronto runId
      const ta = a.createdAt || a.timestamp || a.ts || a.date || null;
      const tb = b.createdAt || b.timestamp || b.ts || b.date || null;

      if (ta && tb) {
        const da = new Date(ta).getTime();
        const db = new Date(tb).getTime();
        return sortMode === "asc" ? da - db : db - da;
      }
      const ra = String(a.runId || "");
      const rb = String(b.runId || "");
      return sortMode === "asc" ? ra.localeCompare(rb) : rb.localeCompare(ra);
    });

    elRunsCount.textContent = `${runs.length} run`;

    if (runs.length === 0) {
      elRunsTbody.innerHTML = `<tr><td colspan="2" class="muted">Nessuna run trovata.</td></tr>`;
      return;
    }

    elRunsTbody.innerHTML = runs.map(r => {
      const isSel = r.runId === state.selectedRunId;
      return `
        <tr data-runid="${esc(r.runId)}" style="cursor:pointer; ${isSel ? "background:#f8fafc;" : ""}">
          <td><strong>${esc(r.runId)}</strong></td>
          <td class="muted">${esc(r.totalRecords ?? r.records ?? "—")}</td>
        </tr>
      `;
    }).join("");

    [...elRunsTbody.querySelectorAll("tr[data-runid]")].forEach(tr => {
      tr.addEventListener("click", async () => {
        const runId = tr.getAttribute("data-runid");
        await selectRun(runId);
      });
    });
  }

  function mean(nums) {
    if (!nums.length) return null;
    let s = 0;
    for (const n of nums) s += n;
    return s / nums.length;
  }

  function median(nums) {
    if (!nums.length) return null;
    const a = [...nums].sort((x, y) => x - y);
    const mid = Math.floor(a.length / 2);
    if (a.length % 2 === 0) return (a[mid - 1] + a[mid]) / 2;
    return a[mid];
  }

  function min(nums) {
    if (!nums.length) return null;
    let m = nums[0];
    for (const n of nums) if (n < m) m = n;
    return m;
  }

  function max(nums) {
    if (!nums.length) return null;
    let m = nums[0];
    for (const n of nums) if (n > m) m = n;
    return m;
  }

  function fmt(n) {
    if (n === null || n === undefined || Number.isNaN(n)) return "—";
    if (typeof n === "number") return n.toFixed(2).replace(/\.00$/, "");
    return String(n);
  }

  function computeStats(records) {
    // normalizziamo i campi che sicuramente esistono nei vostri results.json
    const psm = [];
    const z100 = [];

    for (const r of records) {
      if (typeof r.psm_score === "number") psm.push(r.psm_score);
      if (typeof r.zxcvbn_score_0_100 === "number") z100.push(r.zxcvbn_score_0_100);
    }

    const out = {
      count: records.length,
      psm: {
        mean: mean(psm), median: median(psm), min: min(psm), max: max(psm)
      },
      zxcvbn: {
        mean: mean(z100), median: median(z100), min: min(z100), max: max(z100)
      }
    };

    // breakdown per category (utile)
    const byCat = new Map();
    for (const r of records) {
      const cat = r.category || "unknown";
      if (!byCat.has(cat)) byCat.set(cat, []);
      byCat.get(cat).push(r);
    }

    const catStats = [];
    for (const [cat, arr] of byCat.entries()) {
      const p = [];
      const z = [];
      for (const r of arr) {
        if (typeof r.psm_score === "number") p.push(r.psm_score);
        if (typeof r.zxcvbn_score_0_100 === "number") z.push(r.zxcvbn_score_0_100);
      }
      catStats.push({
        category: cat,
        count: arr.length,
        psm_mean: mean(p),
        psm_median: median(p),
        z_mean: mean(z),
        z_median: median(z)
      });
    }

    catStats.sort((a, b) => b.count - a.count);

    return { overall: out, byCategory: catStats };
  }

  function renderDetail(runId, detail) {
    // detail shape: { runId, meta, results } oppure simile
    const meta = detail.meta || {};
    const results =
      detail.resultsPreview ||
      detail.results ||
      detail.records ||
      detail.data ||
      detail.items ||
      [];


    const createdAt = meta.createdAt || meta.timestamp || meta.ts || meta.date || null;
    const ds = meta.dataset || meta.datasetName || null;

    elSelectedRunMeta.innerHTML = `
      <span class="pill">${esc(runId)}</span>
      <span class="muted"> • records: ${esc(results.length)}</span>
      ${createdAt ? `<span class="muted"> • ${esc(createdAt)}</span>` : ""}
      ${ds ? `<span class="muted"> • dataset: ${esc(ds)}</span>` : ""}
    `;

    const stats = computeStats(results);

    // Export links (diretti)
    const exportBase = `${API_BASE}/experiments/${encodeURIComponent(runId)}/export`;
    const exportLinks = `
      <div class="row" style="margin-top:8px;">
        <span class="muted">Export:</span>
        <a class="pill" href="${exportBase}?format=json" target="_blank" rel="noreferrer">JSON</a>
        <a class="pill" href="${exportBase}?format=csv" target="_blank" rel="noreferrer">CSV</a>
        <a class="pill" href="${exportBase}?format=tsv" target="_blank" rel="noreferrer">TSV</a>
        <a class="pill" href="${exportBase}?format=excelcsv" target="_blank" rel="noreferrer">ExcelCSV</a>
      </div>
    `;

    const overallTable = `
      <table style="margin-top:10px;">
        <thead>
          <tr>
            <th>metrica</th>
            <th>PSM</th>
            <th>zxcvbn (0–100)</th>
          </tr>
        </thead>
        <tbody>
          <tr><td class="muted">media</td><td>${fmt(stats.overall.psm.mean)}</td><td>${fmt(stats.overall.zxcvbn.mean)}</td></tr>
          <tr><td class="muted">mediana</td><td>${fmt(stats.overall.psm.median)}</td><td>${fmt(stats.overall.zxcvbn.median)}</td></tr>
          <tr><td class="muted">min</td><td>${fmt(stats.overall.psm.min)}</td><td>${fmt(stats.overall.zxcvbn.min)}</td></tr>
          <tr><td class="muted">max</td><td>${fmt(stats.overall.psm.max)}</td><td>${fmt(stats.overall.zxcvbn.max)}</td></tr>
        </tbody>
      </table>
    `;

    const byCatRows = stats.byCategory.map(cs => `
      <tr>
        <td><span class="pill">${esc(cs.category)}</span></td>
        <td class="muted">${esc(cs.count)}</td>
        <td>${fmt(cs.psm_mean)}</td>
        <td>${fmt(cs.psm_median)}</td>
        <td>${fmt(cs.z_mean)}</td>
        <td>${fmt(cs.z_median)}</td>
      </tr>
    `).join("");

    const byCatTable = `
      <table style="margin-top:10px;">
        <thead>
          <tr>
            <th>category</th>
            <th class="muted">n</th>
            <th>PSM mean</th>
            <th>PSM median</th>
            <th>z mean</th>
            <th>z median</th>
          </tr>
        </thead>
        <tbody>
          ${byCatRows || `<tr><td colspan="6" class="muted">Nessuna categoria.</td></tr>`}
        </tbody>
      </table>
    `;

    const preview = results.slice(0, 10);
    const previewBlock = `
      <div style="margin-top:10px;">
        <div class="row" style="justify-content:space-between;">
          <strong>Preview (prime 10)</strong>
          <span class="muted">Mostro password redatte se abilitate in run</span>
        </div>
        <pre>${esc(JSON.stringify(preview, null, 2))}</pre>
      </div>
    `;

    elDetailArea.innerHTML = `
      <div class="grid2">
        <div class="card" style="border-color:#f1f5f9;">
          <strong>Statistiche globali</strong>
          ${overallTable}
          ${exportLinks}
        </div>
        <div class="card" style="border-color:#f1f5f9;">
          <strong>Breakdown per categoria</strong>
          ${byCatTable}
        </div>
      </div>
      ${previewBlock}
    `;
  }

  function renderError(where, err) {
    elDetailArea.innerHTML = `
      <div class="error"><strong>Errore:</strong> ${esc(where)} — ${esc(err.message || String(err))}</div>
      <div class="muted" style="margin-top:8px;">Controlla che l'API sia avviata su ${esc(API_BASE)} e che esistano run in outputs/.</div>
    `;
  }

  async function selectRun(runId) {
    state.selectedRunId = runId;
    renderRuns();

    const limit = Number(elPreviewLimit.value || "50");
    elDetailArea.innerHTML = `<div class="muted">Caricamento dettaglio…</div>`;

    try {
      const detail = await apiGet(`/experiments/${encodeURIComponent(runId)}?limit=${encodeURIComponent(limit)}`);
      state.selectedRunDetail = detail;
      renderDetail(runId, detail);
    } catch (err) {
      renderError(`caricando /experiments/${runId}`, err);
    }
  }

  async function refreshRuns() {
  elRunsTbody.innerHTML = `<tr><td colspan="2" class="muted">Caricamento…</td></tr>`;
  elRunsCount.textContent = "—";

  try {
    const runsResp = await apiGet("/experiments");
    const rawRuns = Array.isArray(runsResp) ? runsResp : (runsResp.runs || []);

    // Normalizza: supporta array di stringhe/numero e oggetti con campi diversi
    state.runs = rawRuns
      .map((r) => {
        // Caso: ["sample_run", ...] oppure [123, ...]
        if (typeof r === "string" || typeof r === "number") {
          return { runId: String(r), totalRecords: undefined };
        }

        // Caso: oggetto
        if (!r || typeof r !== "object") return null;

        const candidate =
          r.runId ??
          r.run_id ??
          r.runID ??
          r.runid ??
          r.id ??
          r.run ??
          r.name ??
          r.folder ??
          r.dir ??
          r.path ??
          r.slug ??
          (r.meta && (r.meta.runId ?? r.meta.id ?? r.meta.name));

        let runId = candidate;

        // se è un path tipo "outputs/sample_run", prendi l'ultimo segmento
        if (typeof runId === "string" && runId.includes("/")) {
          runId = runId.split("/").filter(Boolean).pop();
        }

        if (typeof runId === "number") runId = String(runId);

        const totalRecords =
          r.totalRecords ??
          r.records ??
          r.count ??
          r.n ??
          (typeof r.total === "number" ? r.total : undefined);

        return { ...r, runId, totalRecords };
      })
      .filter((r) => r && typeof r.runId === "string" && r.runId.trim().length > 0);

    renderRuns();

    // auto-select prima run se nessuna selezionata
    if (!state.selectedRunId && state.runs.length > 0) {
      await selectRun(state.runs[0].runId);
      return;
    }

    // se esiste una selezione, ricarica il dettaglio se la run esiste ancora
    if (state.selectedRunId) {
      const stillThere = state.runs.some((r) => r.runId === state.selectedRunId);
      if (stillThere) {
        await selectRun(state.selectedRunId);
      } else {
        state.selectedRunId = null;
        elSelectedRunMeta.textContent = "Seleziona una run a sinistra.";
        elDetailArea.innerHTML = `<div class="muted">Nessuna run selezionata.</div>`;
      }
    }
  } catch (err) {
    elRunsTbody.innerHTML = `<tr><td colspan="2" class="error">Errore: ${esc(err.message || String(err))}</td></tr>`;
    elRunsCount.textContent = "errore";
    elSelectedRunMeta.textContent = "Impossibile caricare run.";
    renderError("caricando /experiments", err);
  }
}

  // events
  elBtnRefresh.addEventListener("click", refreshRuns);
  elSearch.addEventListener("input", renderRuns);
  elSort.addEventListener("change", renderRuns);
  elPreviewLimit.addEventListener("change", async () => {
    if (state.selectedRunId) await selectRun(state.selectedRunId);
  });

  // boot
  refreshRuns();
})();
