# PSM_Project — API (DS2) + Experiments API (DS4/DS5 backend)

Servizio REST che espone:
- **DS2**: valutazione password e validazione finale (policy) usando l’engine condiviso
- **Supporto DS4/DS5 lato backend**: lettura dei risultati degli esperimenti e **export** (CSV/TSV/ExcelCSV/JSON)

Questo README è aggiornato al **23/12/2025**.

---

## Requisiti
- Node.js **>= 18** (consigliato 20)
- npm

> Nota: l’engine è in `src/engine/psmEngine.js` ed è la **single source of truth** per scoring/pattern/policy.

---

## Install & Run
~~~bash
cd src/api
npm install
npm start
~~~

Di default ascolta su:
- `http://localhost:3000`

Variabili utili:
- `PORT` (default `3000`)
- `PSM_API_KEY` (opzionale, vedi sotto)

---

## (Opzionale) Protezione con API Key
Se imposti `PSM_API_KEY`, l’API richiede l’header `x-api-key` sulle rotte principali.

Esempio:
~~~bash
PSM_API_KEY=changeme npm start
~~~

E poi nelle chiamate:
~~~bash
curl -H "x-api-key: changeme" ...
~~~

---

## Endpoints

### Healthcheck
**GET** `/health`

Esempio:
~~~bash
curl -sSf http://localhost:3000/health
~~~

Risposta:
~~~json
{ "ok": true, "service": "psm-api" }
~~~

---

## DS2 — Valutazione password

### Valuta (standard)
**POST** `/api/evaluate`  
Alias legacy: **POST** `/evaluatePassword`

Body minimo:
~~~json
{ "password": "ExamplePassword!2026" }
~~~

Body completo (con dati utente per token personali):
~~~json
{
  "password": "MarioRossi2026!",
  "user": {
    "firstName": "Mario",
    "lastName": "Rossi",
    "email": "mario.rossi@example.com"
  },
  "options": { "includeFeedback": true }
}
~~~

Esempio curl:
~~~bash
curl -sSf http://localhost:3000/api/evaluate \
  -H "Content-Type: application/json" \
  -d '{"password":"ExamplePassword!2026","options":{"includeFeedback":true}}'
~~~

Risposta (schema):
~~~json
{
  "score": 0,
  "level": "Molto debole",
  "patterns": [],
  "suggestions": []
}
~~~

Note:
- `score` è 0..100
- `level` è una stringa umana
- `patterns` è una lista di pattern rilevati (oggetti)
- `suggestions` compare solo se `options.includeFeedback=true`

---

## DS2 — Validazione finale (policy)
Questa rotta serve per il “submit finale” (es. creazione account): applica la policy di accettazione.

**POST** `/api/validate`

Body minimo:
~~~json
{ "password": "ExamplePassword!2026" }
~~~

Body con dati utente:
~~~json
{
  "password": "MarioRossi2026!",
  "user": { "firstName": "Mario", "lastName": "Rossi", "email": "mario.rossi@example.com" }
}
~~~

Esempio curl:
~~~bash
curl -sSf http://localhost:3000/api/validate \
  -H "Content-Type: application/json" \
  -d '{"password":"ExamplePassword!2026"}'
~~~

Risposta:
~~~json
{ "ok": true, "msg": "OK" }
~~~

---

## Experiments API — Supporto DS4/DS5 lato backend

### Dove legge i risultati
Queste rotte leggono i run da:
- `src/experiments/outputs/<runId>/`

Quindi prima devi avere almeno un run generato dal runner in `src/experiments/`.

---

### Lista run (supporto DS4)
**GET** `/experiments`

Esempio:
~~~bash
curl -sSf http://localhost:3000/experiments
~~~

Risposta:
~~~json
{ "runs": ["runA", "runB"] }
~~~

---

### Dettaglio run (preview)
**GET** `/experiments/:runId?limit=20`

- `limit` controlla quanti record di preview ritornano (default ragionevole lato server)

Esempio:
~~~bash
curl -sSf "http://localhost:3000/experiments/runA?limit=10"
~~~

Risposta (schema):
~~~json
{
  "runId": "runA",
  "meta": { },
  "resultsPreview": [ ]
}
~~~

---

### Export risultati (DS5)
**GET** `/experiments/:runId/export?format=csv|tsv|excelcsv|json`

Formati:
- `csv` -> separatore `,`
- `tsv` -> separatore `\t`
- `excelcsv` -> separatore `;` (comodo per Excel in locale IT)
- `json` -> contenuto JSON

Esempi:
~~~bash
curl -sSf "http://localhost:3000/experiments/runA/export?format=csv" -o results.csv
curl -sSf "http://localhost:3000/experiments/runA/export?format=tsv" -o results.tsv
curl -sSf "http://localhost:3000/experiments/runA/export?format=excelcsv" -o results_excel.csv
curl -sSf "http://localhost:3000/experiments/runA/export?format=json" -o results.json
~~~

---

## Generare un run (quick reminder)
Se non hai ancora `outputs/<runId>/`, genera un run così:

~~~bash
cd src/experiments
npm install

node tools/generate_dataset.js datasets/dataset_v1.json 20 --seed 12345
node run.js --in datasets/dataset_v1.json --out outputs/run_dataset_v1_local --redact-password --seed 12345
~~~

Poi torna qui e usa:
- `GET http://localhost:3000/experiments`
- `GET http://localhost:3000/experiments/run_dataset_v1_local?limit=20`
- `GET http://localhost:3000/experiments/run_dataset_v1_local/export?format=csv`

---

## Troubleshooting
- **403 / Unauthorized**: hai impostato `PSM_API_KEY` ma non stai passando `x-api-key`.
- **404 su /experiments/:runId**: la cartella `src/experiments/outputs/<runId>/` non esiste (o `runId` sbagliato).
- **UI non carica engine via API**: la UI (DS1) usa l’engine in-browser; l’API serve per DS2 e per consumare risultati esperimenti.

---

## Design note (coerenza)
- Tutte le soglie/policy vivono nell’engine (`src/engine/psmEngine.js`).
- L’API deve limitarsi a:
  - estrarre eventuali `personalTokens` dal campo `user`
  - invocare `evaluate(...)` / `validateFinal(...)`
  - ritornare JSON consistente

