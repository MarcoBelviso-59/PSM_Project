# PSM_Project — API (DS2) + Experiments backend (DS4/DS5)

Questa cartella contiene la REST API del progetto:
- **DS2**: valutazione e validazione password usando il **PSM Engine** (single source of truth)
- **DS4/DS5 (supporto backend)**: endpoint per consultare run esperimenti salvati in `src/experiments/outputs/` ed esportarli (CSV/TSV/ExcelCSV/JSON)

Aggiornato al **27/12/2025**.

---

## Requisiti
- Node.js **>= 18**
- npm

---

## Install & Run
~~~bash
cd src/api
npm install
npm start
~~~

API su:
- `http://localhost:3000`

Health check:
~~~bash
curl.exe -s http://localhost:3000/health
~~~

> Nota PowerShell (Windows): usare `curl.exe` (non l’alias `Invoke-WebRequest`), altrimenti opzioni come `-s`/`-S`/`-f` possono fallire.

---

## Sicurezza (opzionale): API key
Se imposti la variabile d’ambiente `PSM_API_KEY`, la API richiede l’header `x-api-key`.

Esempio (Windows PowerShell):
~~~bash
$env:PSM_API_KEY="changeme"
npm start
~~~

Chiamata con header:
~~~bash
curl.exe -s http://localhost:3000/api/evaluate ^
  -H "Content-Type: application/json" ^
  -H "x-api-key: changeme" ^
  -d "{\"password\":\"ExamplePassword!2026\"}"
~~~

Comportamento:
- senza header → 401/403
- header errata → 403
- header corretta → OK

---

## Endpoint DS2 — Valutazione / Validazione

### POST /api/evaluate
Valuta una password e ritorna score/level/pattern. Può includere feedback e supporta token personali.

Request minima:
~~~json
{ "password": "ExamplePassword!2026" }
~~~

Request completa (con contesto utente):
~~~json
{
  "password": "MarioRossi2026!",
  "user": { "firstName": "Mario", "lastName": "Rossi", "email": "mario.rossi@example.com" },
  "options": { "includeFeedback": true }
}
~~~

Response tipica:
~~~json
{
  "ok": true,
  "score": 69,
  "level": "Buona",
  "patterns": ["YEAR_OR_DATE", "PERSONAL_INFO"],
  "feedback": {
    "tips": ["Evita riferimenti personali", "Evita anni o date riconoscibili"]
  }
}
~~~

Alias compatibile:
- `POST /evaluatePassword` (stesso comportamento)

---

### POST /api/validate
Applica la policy finale: serve per decidere se la password è **accettata** per la registrazione.

Request:
~~~json
{ "password": "ExamplePassword!2026" }
~~~

Response:
~~~json
{
  "ok": false,
  "score": 52,
  "level": "Debole",
  "reasons": ["PASSWORD_TOO_SHORT", "MISSING_SYMBOL"]
}
~~~

---

## Endpoint DS4/DS5 — Experiments (consultazione ed export)

Questi endpoint leggono i risultati salvati dagli esperimenti in:
- `src/experiments/outputs/<runId>/`

### GET /experiments
Lista run disponibili.

Esempio:
~~~bash
curl.exe -s http://localhost:3000/experiments
~~~

---

### GET /experiments/:runId?limit=N
Dettaglio run con meta + aggregati + preview (N record).  
Nota: la preview può essere esposta come `resultsPreview` (chiave usata dalla dashboard DS4).

Esempio:
~~~bash
curl.exe -s "http://localhost:3000/experiments/sample_run?limit=10"
~~~

---

### GET /experiments/:runId/export?format=...
Export supportati:
- `format=json`
- `format=csv`
- `format=tsv`
- `format=excelcsv` (separatore `;`, utile in Excel locale IT)

Esempio (CSV):
~~~bash
curl.exe -s "http://localhost:3000/experiments/sample_run/export?format=csv" -o results.csv
~~~

---

## Integrazione con Dashboard (DS4)
La dashboard è in:
- `src/web/experiments.html`
- `src/web/experiments.js`

Requisiti per usarla:
1) API avviata su `http://localhost:3000`
2) almeno 1 run in `src/experiments/outputs/` (es. `npm run run:sample` in `src/experiments`)
3) servire `src/` come root (per aprire `http://localhost:8080/web/experiments.html`)

---

## Troubleshooting
- **/experiments vuoto**:
  - non esistono run in `src/experiments/outputs/`
  - genera una run in `src/experiments` e riprova
- **/experiments/:runId 404**:
  - runId inesistente o cartella output mancante
- **export scarica un file vuoto**:
  - controlla che in `outputs/<runId>/` esista `results.json`
- **PowerShell error su curl**:
  - usare `curl.exe` (non `curl`)

---

## Nota architetturale: single source of truth
- L’engine in `src/engine/psmEngine.js` definisce scoring, pattern, feedback e policy finale.
- L’API non deve duplicare regole/soglie: deve importare e usare l’engine.
- Ogni modifica alle policy va fatta nell’engine, poi verificata con test e regressioni.




