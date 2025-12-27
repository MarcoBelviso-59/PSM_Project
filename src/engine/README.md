# PSM_Project — Engine (single source of truth)

Questa cartella contiene l’engine che implementa la logica del Password Strength Meter:
- scoring 0–100
- pattern detection (sequenze, ripetizioni, dizionari/small-set, token personali, ecc.)
- generazione feedback (suggerimenti)
- policy finale di accettazione (validateFinal)

Aggiornato al **27/12/2025**.

---

## Principio chiave: single source of truth
`psmEngine.js` è la **fonte unica** di regole e soglie.  
Tutti gli altri componenti devono **riusare** l’engine:

- Web UI (DS1): `src/web/` usa l’engine in-browser
- API (DS2): `src/api/` importa lo stesso engine in Node
- Experiments (DS3–DS5): `src/experiments/` usa l’engine per confronti contro baseline
- Dashboard (DS4): visualizza output già prodotti dall’engine (via API)

Obiettivo: evitare incoerenze (stesso input → stesso output qualitativo ovunque).

---

## File
- `psmEngine.js` — implementazione engine
- (eventuali README aggiuntivi) — note e scelte progettuali

---

## Modalità d’uso (browser e Node)
L’engine supporta due modalità:
- **Browser**: espone `window.PSMEngine`
- **Node/CommonJS**: `module.exports = ...`

### Browser (DS1)
In `src/web/index.html`:
~~~html
<script src="../engine/psmEngine.js"></script>
<script>
  const r = window.PSMEngine.evaluate("ExamplePassword!2026", []);
  console.log(r);
</script>
~~~

### Node (API/Experiments)
~~~js
const Engine = require("../engine/psmEngine.js");
const tokens = ["mario", "rossi"];
const r = Engine.evaluate("MarioRossi2026!", tokens);
console.log(r);
~~~

---

## API principale (funzioni)
Le funzioni possono variare leggermente, ma i concetti sono questi:

- `detectPatterns(password, personalTokens?)`
  - ritorna lista pattern rilevati (sequenze, ripetizioni, common words, token personali, ecc.)
- `evaluate(password, personalTokens?)`
  - ritorna valutazione “completa” con score, level, patterns, (eventuali) dettagli utili
- `evaluatePassword(password, user?, options?)`
  - wrapper più comodo per UI/API (costruisce token personali dal profilo e include feedback se richiesto)
- `generateFeedback(evaluation)`
  - produce suggerimenti coerenti con i pattern rilevati
- `validateFinal(password, personalTokens?)`
  - applica la **policy finale** (accetta/rifiuta) con motivazioni

---

## validateFinal: cosa deve garantire
`validateFinal` è lo “sbarramento” finale per accettare una password in registrazione:
- ritorna un oggetto `{ ok, score, level, reasons }`
- se `ok=false` deve spiegare i motivi (es. troppo corta, pattern critici, token personali, ecc.)
- deve essere coerente con score/level e con i suggerimenti

I vincoli sono deliberatamente “robusti”:
- non fissare numeri rigidi ovunque (taratura può evolvere)
- fissare invece regole chiare: es. cap su pattern critici, penalità per token personali, ecc.

---

## Come validare manualmente l’engine (quick check)
~~~bash
node -e '
const e = require("./src/engine/psmEngine.js");
const tokens = ["mario","rossi","mario.rossi","example","com"];
const pw = "MarioRossi2026!";
const ev = e.evaluate(pw, tokens);
console.log("eval:", ev);
console.log("feedback:", e.generateFeedback(ev));
console.log("final:", e.validateFinal(pw, tokens));
'
~~~

---

## Integrazione con test
- I test manuali minimi sono in `tests/README.md`.
- I test automatizzati (da aggiungere) devono concentrarsi su:
  - pattern detection (regressioni su sequenze/small-set/personal tokens)
  - coerenza tra `evaluate`, `generateFeedback` e `validateFinal`
  - casi pass/fail stabili (evitare asserzioni troppo fragili sui punteggi esatti)

---

## Note pratiche
- Qualsiasi modifica a soglie/policy va fatta **solo qui**.
- Dopo ogni modifica:
  - verificare rapidamente i casi del test plan (`tests/README.md`)
  - eseguire 1 run esperimenti piccolo (per vedere delta PSM vs baseline)
  - controllare coerenza UI/API (stesso input, stesso livello/pattern e outcome finale)


