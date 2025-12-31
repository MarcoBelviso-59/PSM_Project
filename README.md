# PSM_Project — Password Strength Meter (UI + Engine + API + Experiments)

Progetto di Ingegneria del Software (A.A. 2025/2026): realizzazione di un **Password Strength Meter** con architettura modulare e “single source of truth”.

- **Web UI (DS1)**: registrazione a 2 step + feedback in tempo reale
- **Engine**: scoring 0–100, pattern detection, suggerimenti, policy di validazione finale
- **API REST (DS2)**: espone l’engine (evaluate/validate) con JSON standard
- **Esperimenti (DS3–DS5)**: runner + baseline (zxcvbn), risultati persistiti ed export via API
- **Dashboard (DS4)**: pagina web per consultare run, statistiche e download export

Questo README è aggiornato al **31/12/2025**.

---

## Team
- Belviso M.
- Vegliante G.
- Didonna A.

---

## Stato del progetto (sintesi)

### Implementato e verificabile end-to-end ✅
- ✅ **DS1 (Web UI)**: UI a 2 step con valutazione live + validazione finale.
- ✅ **Engine separato**: modulo condiviso `src/engine/psmEngine.js` usato da UI/API/esperimenti.
- ✅ **DS2 (API REST)**: `POST /api/evaluate`, `POST /api/validate` (+ alias `POST /evaluatePassword`).
- ✅ **DS3 (runner esperimenti + baseline)**: esecuzione su dataset + confronto zxcvbn + output su file.
- ✅ **DS4 (dashboard risultati)**: `src/web/experiments.html` + `src/web/experiments.js`.
- ✅ **DS5 (export)**: export risultati via API (CSV/TSV/ExcelCSV/JSON) + pulsanti in dashboard.
- ✅ **Test automatici + CI**: workflow “CI - Tests” (Jest su API/engine) + workflow di smoketest endpoint experiments.

### Da completare (prima della relazione finale) ⏳
- ⏳ **Diagramma delle classi** (coerente con Use Case + Sequence DS1–DS5).
- ⏳ **Docker / docker-compose** (API + UI + gestione outputs esperimenti).
- ⏳ Refinement documentale: allineare i README e chiudere eventuali TODO nei docs (la relazione finale sarà l’ultima cosa).

---

## Struttura repository
- `src/`
  - `src/web/` — Web UI (DS1) + Dashboard (DS4)
  - `src/engine/` — Engine condiviso (single source of truth)
  - `src/api/` — API REST (DS2) + backend experiments (DS4/DS5)
  - `src/experiments/` — Esperimenti (DS3–DS5): generator + runner + baseline + outputs
- `docs/` — documentazione (specifiche, UML, architettura, valutazione, relazione, presentazione)
- `tests/` — test plan manuale (checklist ripetibile)
- `.github/workflows/` — CI (tests) + experiments + smoketest API

---

# Quick start — UI DS1
La UI usa l’engine **in-browser**. Devi servire la cartella `src/` come root, perché `src/web/index.html`
include l’engine con path relativo `../engine/psmEngine.js`.

## Opzione A (Python)
~~~bash
cd src
python -m http.server 8080
~~~
Apri: `http://localhost:8080/web/`

## Opzione B (Node)
~~~bash
cd src
npx http-server -p 8080
~~~
Apri: `http://localhost:8080/web/`

---

# Avvio API (DS2)
~~~bash
cd src/api
npm install
npm start
~~~
API su: `http://localhost:3000`

Health check:
~~~bash
curl.exe -s http://localhost:3000/health
~~~

## (Opzionale) API key
Se imposti `PSM_API_KEY`, l’API richiede l’header `x-api-key`.

~~~bash
PSM_API_KEY=changeme npm start
~~~

---

# Esperimenti (DS3–DS5) + Dashboard (DS4)
## 1) Genera una run
~~~bash
cd src/experiments
npm install
npm run run:sample
~~~

## 2) Avvia API (se non è già avviata)
~~~bash
cd ../api
npm install
npm start
~~~

## 3) Apri Dashboard
Con `src/` servita come root:
- `http://localhost:8080/web/experiments.html`

La dashboard usa:
- `GET /experiments`
- `GET /experiments/:runId?limit=N`
- `GET /experiments/:runId/export?format=...`

---

# Test automatici (locale) + CI
I test automatici sono in `src/api/__tests__/` (Jest).

Esecuzione locale:
~~~bash
cd src/api
npm install
npm test
~~~

In GitHub Actions:
- workflow “CI - Tests” esegue `npm test`
- workflow “API Smoketest” verifica endpoints experiments e export su una run smoke

---

## Note (Windows / PowerShell)
- Per test API usare `curl.exe` (non l’alias PowerShell `Invoke-WebRequest`).
- Se apri `index.html` via `file://` potresti avere problemi di path: usa sempre un server statico.

---
