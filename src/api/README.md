# PSM_Project — API (DS2) + Experiments backend (DS4/DS5)

Questa cartella contiene la REST API del progetto:
- **DS2**: valutazione e validazione password usando il **PSM Engine** (single source of truth)
- **DS4/DS5 (supporto backend)**: endpoint per consultare run esperimenti salvati in `src/experiments/outputs/` ed esportarli (CSV/TSV/ExcelCSV/JSON)

Aggiornato al **31/12/2025**.

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
- senza header → 401
- header errata → 403
- header corretta → 200 OK

---

## Endpoint DS2 — Valutazione / Validazione

### POST /api/evaluate
Valuta una password e ritorna `score`, `level`, `patterns`.  
Su richiesta può includere `suggestions` (feedback per l’utente).

Request minima:
~~~json
{ "password": "ExamplePassword!2026" }
~~~

Request completa (con contesto utente + feedback):
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
  "score": 59,
  "level": "Discreta",
  "patterns": [
    { "type": "YEAR_OR_DATE" },
    { "type": "REPEAT_2" },
    { "type": "PERSONAL_INFO", "hits": 2, "matched": ["mario", "rossi"] }
  ],
  "suggestions": [
    "Evita caratteri uguali consecutivi (es. AA, 11).",
    "Evita anni o date (es. 1998, 2024, 12/05): sono tra i primi tentativi.",
    "Evita di includere nome/cognome o parti dell’email nella password."
  ]
}
~~~

Note:
- `patterns` è un array di oggetti (almeno `{ type }`), con campi aggiuntivi opzionali per alcuni pattern.
- `suggestions` è presente **solo** se `options.includeFeedback=true`.

Alias compatibile:
- `POST /evaluatePassword` (stesso comportamento)

---

### POST /api/validate
Applica la policy finale: serve per decidere se la password è **accettata** per la registrazione.

Request:
~~~json
{
  "password": "ExamplePassword!2026",
  "user": { "firstName": "Mario", "lastName": "Rossi", "email": "mario.rossi@example.com" }
}
~~~

Response:
~~~json
{ "ok": false, "msg": "Evita nome/cognome o parti dell’email (anche con sostituzioni tipo 0→o, 1→i)." }
~~~

---

## Endpoint DS4/DS5 — Experiments (consultazione ed export)

Per default l’API legge i run da:
- `src/experiments/outputs/`

Puoi cambiare directory con:
- `PSM_EXPERIMENTS_DIR=/path/assoluto/agli/outputs`

### GET /experiments
Lista run disponibili.
~~~bash
curl.exe -s http://localhost:3000/experiments
~~~

### GET /experiments/:runId?limit=N
Dettaglio run con meta + aggregati + preview.
~~~bash
curl.exe -s "http://localhost:3000/experiments/run_smoke_ci?limit=10"
~~~

### GET /experiments/:runId/export?format=...
Export supportati:
- `format=json`
- `format=csv`
- `format=tsv`
- `format=excelcsv` (separatore `;`, utile in Excel locale IT)

Esempio (CSV):
~~~bash
curl.exe -s "http://localhost:3000/experiments/run_smoke_ci/export?format=csv" -o results.csv
~~~

---

## Test automatici (Jest) + CI
I test sono in:
- `src/api/__tests__/`

Esecuzione locale:
~~~bash
cd src/api
npm install
npm test
~~~

In GitHub Actions:
- workflow “CI - Tests” esegue `npm test`
- workflow “API Smoketest” verifica gli endpoint experiments/export su una run smoke

---

## Nota architetturale: single source of truth
- L’engine in `src/engine/psmEngine.js` definisce scoring, pattern, feedback e policy finale.
- L’API valida input, compone `personalTokens` dal profilo utente (se presente) e delega all’engine.
- Ogni modifica alle policy va fatta nell’engine, poi verificata con test e regressioni.

