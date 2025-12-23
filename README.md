# PSM_Project — Password Strength Meter (UI + Engine + API)

Progetto di Ingegneria del Software (A.A. 2025/2026): realizzazione di un **Password Strength Meter** con:
- **Web UI (DS1)**: registrazione a 2 step + feedback in tempo reale
- **Engine**: scoring 0–100, pattern detection, suggerimenti, policy di validazione finale
- **API REST (DS2)**: valutazione/validazione usando lo stesso engine (“single source of truth”)
- **Esperimenti (DS3–DS5)**: confronto con baseline (zxcvbn), output persistiti ed export via API

Questo README è aggiornato al **23/12/2025**.

## Team
- Belviso M.
- Vegliante G.
- Didonna A.

## Stato del progetto (sintesi)
### Coperto e verificato
- ✅ **DS1 (Web UI)**: UI a 2 step (dati utente → password) con valutazione live e validazione finale.
- ✅ **Engine separato**: modulo condiviso (`src/engine/psmEngine.js`) usato da UI/API/esperimenti.
- ✅ **DS2 (API REST)**: endpoint di valutazione e validazione con JSON standard + feedback opzionale.
- ✅ **DS3 (runner esperimenti + baseline)**: esecuzione su dataset + confronto con zxcvbn + output su file.
- ✅ **DS5 (export)**: export risultati via API (CSV/TSV/ExcelCSV/JSON).

### Da completare
- ⏳ **DS4 (dashboard risultati)**: UI per lista run, filtri e dettaglio con statistiche (oggi c’è solo API JSON).
- ⏳ **Test automatizzati** (unit/integration) + integrazione stabile in CI.
- ⏳ Documentazione finale (relazione + presentazione + diagramma delle classi se richiesto dal corso).

## Struttura repository
- `src/`
  - `src/web/` — Web UI (DS1): `index.html`, `styles.css`, `app.js`
  - `src/engine/` — Engine condiviso: `psmEngine.js`
  - `src/api/` — API REST (DS2): `server.js`
  - `src/experiments/` — Esperimenti (DS3–DS5): generator + runner + baseline + dataset
- `docs/` — documentazione (specifiche, UML, architettura, valutazione, relazione, presentazione)
- `tests/` — piano di test (minimo ripetibile)
- `.github/workflows/` — pipeline (smoketest API, experiments)

## Quick start — Demo UI (DS1)
La UI usa l’engine **in-browser**. È importante servire la cartella `src/` come root, perché `src/web/index.html` include l’engine con path relativo `../engine/psmEngine.js`.

### Opzione A (Python)
~~~bash
cd src
python -m http.server 8080
~~~
Apri: `http://localhost:8080/web/`

### Opzione B (Node)
~~~bash
cd src
npx http-server -p 8080
~~~
Apri: `http://localhost:8080/web/`

## Avvio API (DS2)
~~~bash
cd src/api
npm install
npm start
~~~
API su: `http://localhost:3000`

### (Opzionale) API key
Se imposti `PSM_API_KEY`, l’API richiede l’header `x-api-key`.

~~~bash
PSM_API_KEY=changeme npm start
~~~

## Esempi chiamate API
### Valutazione password
Endpoint:
- `POST /api/evaluate`
- alias: `POST /evaluatePassword`

Body minimo:
~~~json
{ "password": "ExamplePassword!2026" }
~~~

Body con dati utente (token personali):
~~~json
{
  "password": "MarioRossi2026!",
  "user": { "firstName": "Mario", "lastName": "Rossi", "email": "mario.rossi@example.com" },
  "options": { "includeFeedback": true }
}
~~~

### Validazione finale (policy di accettazione)
Endpoint: `POST /api/validate`

~~~json
{ "password": "ExamplePassword!2026" }
~~~

## Esperimenti (DS3–DS5)
### 1) Esegui un run (Node)
~~~bash
cd src/experiments
npm install

# (opzionale) genera un dataset ripetibile
node tools/generate_dataset.js datasets/dataset_v1.json 20 --seed 12345

# esegui esperimento (flag corretto: --redact-password)
node run.js --in datasets/dataset_v1.json --out outputs/run_dataset_v1_local --redact-password --seed 12345
~~~

Output generato in:
- `src/experiments/outputs/<runId>/meta.json`
- `src/experiments/outputs/<runId>/results.json`
- `src/experiments/outputs/<runId>/results.csv`
- `src/experiments/outputs/<runId>/results.tsv`
- `src/experiments/outputs/<runId>/results_excel.csv`

### 2) Consuma risultati via API (supporto DS4/DS5 via backend)
Con API avviata:
- Lista run: `GET /experiments`
- Dettaglio run (preview): `GET /experiments/<runId>?limit=20`
- Export: `GET /experiments/<runId>/export?format=csv|tsv|excelcsv|json`

Esempio export CSV:
~~~bash
curl -sSf "http://localhost:3000/experiments/<runId>/export?format=csv" -o results.csv
~~~

## Documenti principali
- Specifiche: `docs/00_specs/Specifiche_Progetto_Richieste.pdf`
- Linee guida: `docs/00_specs/Linee_Guida_PSM_Project.pdf`
- Use Case (CU): `docs/02_uml/use-case/PSM_Diagramma_CU.pdf`
- Sequence (DS1–DS5): `docs/02_uml/sequence/FileA_ImmaginiDS.pdf`
- Spiegazione DS: `docs/02_uml/sequence/FileB_DS Spiegazione.pdf`
- Bozza: `docs/01_analisi/Bozza_Progetto_PSM.pdf`

## Coerenza e “single source of truth”
- L’engine in `src/engine/psmEngine.js` definisce scoring, pattern, feedback e policy finale.
- UI (DS1), API (DS2) ed esperimenti (DS3) devono solo orchestrare l’engine, senza duplicare soglie/policy.
- Ogni modifica alle policy va fatta nell’engine e poi verificata con test/regressioni per mantenere coerenza.

## Licenza
Vedi `LICENSE`.

