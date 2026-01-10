# PSM_Project — Web UI (DS1) + Dashboard (DS4)

Questa cartella contiene:
- **UI statica DS1**: registrazione a due step + valutazione password in tempo reale
- **Dashboard DS4**: consultazione run esperimenti via API (lista/dettaglio/statistiche/export)

Aggiornato al **10/01/2025**.

---

## File principali
### DS1 — UI
- `index.html` — markup UI
- `styles.css` — stile condiviso (usato anche dalla dashboard)
- `app.js` — logica UI (chiama `window.PSMEngine`)

Dipendenza:
- `../engine/psmEngine.js` — engine condiviso

### DS4 — Dashboard esperimenti
- `experiments.html` — pagina dashboard
- `experiments.js` — logica dashboard (fetch verso API su `http://localhost:3000`)

---

## Avvio corretto (importante)
La UI include l’engine così:

~~~html
<script src="../engine/psmEngine.js"></script>
~~~

Quindi devi servire **la cartella `src/` come root**, non `src/web/`.
Se apri `src/web/index.html` direttamente da file (file://) o servi solo `src/web/`, il path relativo all’engine può rompersi.

---

## Run — Demo DS1
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

---

## Run — Dashboard DS4
### Prerequisiti
1) Avvia l’API:
~~~bash
cd src/api
npm install
npm start
~~~

2) Genera almeno 1 run in `src/experiments/outputs/`:
~~~bash
cd src/experiments
npm install
npm run run:sample
~~~

### Avvio
Con `src/` servita come root, apri:
- `http://localhost:8080/web/experiments.html`

La dashboard:
- mostra lista run (`GET /experiments`)
- carica dettaglio/preview (`GET /experiments/:runId?limit=N`)
- espone export (`GET /experiments/:runId/export?format=...`)

> Nota PowerShell (Windows): per test manuali API usa `curl.exe` (non l’alias `Invoke-WebRequest`).

---

## Comportamento UI (DS1)
- **Step 1 (Dati utente)**:
  - l’utente inserisce nome/cognome/email
  - la UI costruisce token personali (es. nome, cognome, parti dell’email) da passare all’engine

- **Step 2 (Password)**:
  - ad ogni input password la UI invoca:
    - `evaluate(password, personalTokens)` → score/level/pattern
    - `generateFeedback(evaluation)` → suggerimenti
  - al submit finale invoca:
    - `validateFinal(password, personalTokens)` → `{ ok, level, score, reasons }`
  - se `ok=false`, mostra il motivo e blocca la creazione account

---

## Troubleshooting
- **Schermata bianca / errori “PSMEngine undefined”**:
  - stai servendo la cartella sbagliata o aprendo via `file://`
  - soluzione: `cd src` e avvia un server locale, poi apri `/web/`

- **Dashboard vuota (0 run)**:
  - non ci sono output in `src/experiments/outputs/`
  - soluzione: esegui `npm run run:sample` in `src/experiments`

- **Dashboard non carica (errori fetch)**:
  - l’API non è avviata su `http://localhost:3000`
  - soluzione: avvia `src/api` e verifica `/health`


