# PSM_Project — Engine (shared core)

Questo modulo contiene **tutta la logica** di valutazione password del progetto:
- calcolo **score 0–100**
- determinazione del **livello** (stringa)
- rilevamento **pattern** (sequenze, ripetizioni, token personali, ecc.)
- generazione suggerimenti (**feedback**)
- **validazione finale** (policy di accettazione al submit)

È progettato come **single source of truth**: lo usano sia la **Web UI (browser)** sia l’**API** e gli **esperimenti (Node)**.

Aggiornato al **23/12/2025**.

---

## File principali
- `psmEngine.js` — implementazione engine (dual-mode: Browser + Node)

---

## API pubblica (stable)

### `evaluate(password, personalTokens = [])`
Valuta una password e ritorna un oggetto con score, livello e pattern rilevati.

**Firma:**
~~~js
evaluate(password, personalTokens = [])
~~~

**Ritorno:**
~~~js
{
  score: number,          // 0..100
  level: string,          // es. "Molto debole" | "Debole" | "Discreta" | "Buona" | "Molto forte"
  patterns: Array<object> // lista pattern rilevati (con type + dettagli)
}
~~~

**Esempio (Node):**
~~~js
const engine = require("./psmEngine.js");
const evaluation = engine.evaluate("ExamplePassword!2026", ["mario", "rossi"]);
console.log(evaluation.score, evaluation.level, evaluation.patterns);
~~~

---

### `generateFeedback(evaluation)`
Genera suggerimenti (array di stringhe) a partire dall’output di `evaluate`.

**Firma:**
~~~js
generateFeedback(evaluation)
~~~

**Ritorno:**
~~~js
["Suggerimento 1", "Suggerimento 2", "..."]
~~~

**Esempio:**
~~~js
const engine = require("./psmEngine.js");
const evaluation = engine.evaluate("password123", []);
const suggestions = engine.generateFeedback(evaluation);
console.log(suggestions);
~~~

---

### `validateFinal(password, personalTokens = [])`
Applica la **policy di accettazione finale** (pensata per il “submit”, es. creazione account).
Ritorna `ok` + messaggio.

**Firma:**
~~~js
validateFinal(password, personalTokens = [])
~~~

**Ritorno:**
~~~js
{ ok: boolean, msg: string }
~~~

**Esempio:**
~~~js
const engine = require("./psmEngine.js");
const res = engine.validateFinal("ExamplePassword!2026", ["mario"]);
if (!res.ok) console.log("Rifiutata:", res.msg);
~~~

> Nota: `validateFinal` NON è pensata per aggiornarsi ad ogni tasto premuto: quello è il ruolo di `evaluate` + `generateFeedback`.

---

## Token personali (`personalTokens`)
Molte penalità/pattern hanno senso solo se l’engine conosce token “personali” (nome, cognome, email parts, ecc.).

- In UI: i token possono essere derivati dai campi inseriti dall’utente.
- In API: i token possono essere derivati dal campo `user` della request.

Il formato atteso è un array di stringhe:
~~~js
["mario", "rossi", "mario.rossi", "example", "2026"]
~~~

---

## Uso in Browser (DS1)
La UI carica l’engine come script e lo trova su `window.PSMEngine`.

Esempio (in `src/web/index.html`):
~~~html
<script src="../engine/psmEngine.js"></script>
<script src="../web/app.js"></script>
~~~

Esempio (in `src/web/app.js`):
~~~js
const { evaluate, generateFeedback, validateFinal } = window.PSMEngine;

const evaluation = evaluate("ExamplePassword!2026", ["mario", "rossi"]);
const suggestions = generateFeedback(evaluation);
const finalCheck = validateFinal("ExamplePassword!2026", ["mario", "rossi"]);
~~~

---

## Uso in Node (API / Experiments)
In Node l’engine viene importato con `require(...)`.

Esempio (API):
~~~js
const engine = require("../engine/psmEngine.js");
app.post("/api/evaluate", (req, res) => {
  const { password } = req.body;
  const evaluation = engine.evaluate(password, []);
  res.json(evaluation);
});
~~~

---

## Regole di progetto (coerenza)
- **Non duplicare soglie/policy** in UI/API/experiments.
- Ogni modifica a scoring/pattern/policy va fatta **solo** in `psmEngine.js`.
- Dopo modifiche all’engine:
  1) eseguire una suite di test (unit/integration)
  2) rieseguire un run esperimenti (DS3) per confrontare trend e regressioni
  3) verificare che UI e API diano output coerenti per le stesse password
