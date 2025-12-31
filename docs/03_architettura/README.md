# docs/03_architettura — Architettura e responsabilità

Questa cartella descrive l’architettura del progetto: componenti, responsabilità, dipendenze e contratti principali.
Obiettivo: rendere evidente la coerenza tra **UML (DS1–DS5)** e implementazione in `src/`.

Aggiornato al **31/12/2025**.

---

## 1) Principio guida: Single Source of Truth (SSOT)
La logica di scoring e validazione vive **solo** in:
- `src/engine/psmEngine.js`

UI, API ed esperimenti **non duplicano** regole/soglie: invocano l’engine e presentano/serializzano l’output.

Benefici:
- consistenza (stesso input → stesso output) tra demo UI, API e sperimentazione
- manutenzione più semplice (una sola base logica)
- test più facili (engine testabile indirettamente via API)

---

## 2) Componenti (mappa rapida)

### A) Engine (core)
Path: `src/engine/psmEngine.js`

Responsabilità:
- `evaluate(pw, personalTokens)` → score/level/patterns
- `generateFeedback(evaluation)` → suggerimenti testuali
- `validateFinal(pw, personalTokens)` → accetta/rifiuta per registrazione

Output principali:
- `evaluate(...)` → `{ score, level, patterns }`
- `validateFinal(...)` → `{ ok, msg }`

---

### B) Web UI (DS1)
Path: `src/web/`

Responsabilità:
- raccolta dati utente (nome/cognome/email)
- costruzione `personalTokens` (normalizzati)
- valutazione live: `evaluate(...)` + `generateFeedback(...)`
- controllo finale: `validateFinal(...)`

Nota: la UI non implementa penalità/soglie: visualizza l’output engine.

---

### C) API REST (DS2)
Path: `src/api/server.js`

Responsabilità:
- validazione input (limiti, formati, opzioni)
- costruzione `personalTokens` da `user` (se presente)
- delega all’engine e serializzazione JSON

Endpoint DS2:
- `POST /api/evaluate` (+ alias `POST /evaluatePassword`)
- `POST /api/validate`

Contratto sintetico:
- `/api/evaluate` → `{ score, level, patterns, suggestions? }`
- `/api/validate` → `{ ok, msg }`

---

### D) Experiments (DS3–DS5)
Path: `src/experiments/`

Responsabilità:
- generazione dataset riproducibili (seed)
- esecuzione batch: engine vs baseline (zxcvbn)
- scrittura outputs su file (per runId)

Output tipici per run:
- `meta.json`
- `results.json`
- `results.csv`, `results.tsv`, `results_excel.csv`

---

### E) Dashboard (DS4)
Path: `src/web/experiments.html` + `src/web/experiments.js`

Responsabilità:
- consultazione run via API:
  - `GET /experiments`
  - `GET /experiments/:runId?limit=N`
  - `GET /experiments/:runId/export?format=...`
- visualizzazione statistiche e pulsanti export

---

## 3) Dipendenze (direzione “corretta”)
- `web` → dipende da `engine`
- `api` → dipende da `engine`
- `experiments` → dipende da `engine` (+ baseline adapter)
- `engine` → non dipende da altri moduli del progetto

Questo evita cicli e garantisce che l’engine resti riusabile/testabile.

---

## 4) Mapping UML → codice (DS1–DS5)

- **DS1** (UI live + submit) → `src/web/app.js` (chiama `evaluate/generateFeedback/validateFinal`)
- **DS2** (API evaluate/validate) → `src/api/server.js` (delega all’engine)
- **DS3** (runner esperimenti) → `src/experiments/run.js`
- **DS4** (dashboard) → `src/web/experiments.html` + `src/web/experiments.js` + endpoint API `/experiments`
- **DS5** (export) → endpoint API `/experiments/:runId/export?format=...`

---

## 5) Contratti principali (per diagramma classi/componenti)

### Engine
- `evaluate(password: string, personalTokens: string[]) -> { score: number, level: string, patterns: Pattern[] }`
- `generateFeedback(evaluation) -> string[]`
- `validateFinal(password: string, personalTokens: string[]) -> { ok: boolean, msg: string }`

Dove `Pattern` è un oggetto con:
- `type: string`
- campi opzionali (es. `hits`, `matched`, …) a seconda del pattern

### API (DS2)
- `POST /api/evaluate` request:
  - `password: string`
  - opzionale `user: { firstName, lastName, email }`
  - opzionale `options: { includeFeedback: boolean }`
- response:
  - `{ score, level, patterns }` + opzionale `{ suggestions: string[] }`

- `POST /api/validate` response:
  - `{ ok, msg }`

---

## 6) Cosa manca (deliverable architetturali)
- **Diagramma delle classi** (o component diagram + class diagram “core”):
  - almeno: Engine, API, Web UI, ExperimentRunner, BaselineAdapter, ResultsRepository/Exporter
- **Docker / compose** per demo ripetibile (API + UI + outputs)

(La relazione finale verrà fatta per ultima, dopo aver chiuso questi punti.)

