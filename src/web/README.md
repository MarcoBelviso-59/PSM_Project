# PSM_Project — Web UI (DS1)

UI statica che simula una registrazione a due step:
1) inserimento dati utente (nome, cognome, email)
2) scelta password con valutazione **in tempo reale**, conferma password e **validazione finale** (policy)

La UI usa **direttamente l’engine in-browser** (non richiede API per funzionare).
Aggiornato al **23/12/2025**.

---

## Struttura
- `index.html` — markup UI
- `styles.css` — stile
- `app.js` — logica UI (chiama `window.PSMEngine`)

Dipendenza principale:
- `../engine/psmEngine.js` — engine condiviso

---

## Avvio corretto (importante)
`index.html` include l’engine così:

~~~html
<script src="../engine/psmEngine.js"></script>
~~~

Quindi devi servire **la cartella `src/` come root**, non `src/web/`.
Se apri `src/web/index.html` direttamente da file (file://) o servi solo `src/web/`, il path relativo all’engine può rompersi.

---

## Run (demo DS1)

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

## Comportamento UI (DS1)
- **Step 1 (Dati utente)**:
  - l’utente inserisce nome/cognome/email
  - la UI costruisce token personali (es. nome, cognome, parti dell’email) da passare all’engine

- **Step 2 (Password)**:
  - ad ogni input password la UI invoca:
    - `evaluate(password, personalTokens)` → score/level/pattern
    - `generateFeedback(evaluation)` → suggerimenti
  - al submit finale invoca:
    - `validateFinal(password, personalTokens)` → `{ ok, msg }`
  - se `ok=false`, mostra il messaggio e blocca la creazione account

---

## Integrazione con API (DS2)
La UI attuale usa l’engine in-browser.
Se vuoi usare l’API (DS2) al posto dell’engine locale, l’approccio consigliato è:
- mantenere la UI invariata
- sostituire la chiamata diretta a `evaluate(...)` con una `fetch` verso:
  - `POST /api/evaluate` (opzione `includeFeedback`)
- sostituire `validateFinal(...)` con:
  - `POST /api/validate`

Questo passaggio è opzionale: DS1 è già coperto anche senza backend.

---

## Troubleshooting
- **Schermata bianca / errori “PSMEngine undefined”**:
  - stai servendo la cartella sbagliata o aprendo via `file://`
  - soluzione: `cd src` e avvia un server locale, poi apri `/web/`
- **Il path dell’engine non si risolve**:
  - assicurati che `src/engine/psmEngine.js` esista e che `index.html` lo referenzi come `../engine/psmEngine.js`
