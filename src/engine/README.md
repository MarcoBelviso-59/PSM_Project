# PSM_Project — Engine (single source of truth)

Questa cartella contiene l’engine che implementa la logica del Password Strength Meter:
- scoring 0–100
- pattern detection (sequenze, ripetizioni, dizionari/small-set, token personali, pop culture, ecc.)
- generazione feedback (suggerimenti)
- policy finale di accettazione (`validateFinal`)

Aggiornato al **10/01/2026**.

---

## Principio chiave: single source of truth
`psmEngine.js` è la **fonte unica** di regole e soglie.

Tutti gli altri componenti devono **riusare** l’engine:
- Web UI (DS1): `src/web/` usa l’engine in-browser
- API (DS2): `src/api/` importa lo stesso engine in Node
- Experiments (DS3–DS5): `src/experiments/` usa l’engine per batch e confronto baseline

Obiettivo: evitare incoerenze (stesso input → stesso output qualitativo ovunque).

---

## File
- `psmEngine.js` — implementazione engine (dual-mode: browser + Node)

---

## Modalità d’uso (browser e Node)

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

## API principale (funzioni usate dal progetto)

### `evaluate(password, personalTokens=[])`
Ritorna la valutazione “core” usata da UI e API:

- output: `{ score, level, patterns }`
- `patterns` è un array di oggetti (almeno `{ type }`), con campi aggiuntivi per alcuni pattern (es. token matchati).

Esempio:
~~~js
{
  score: 59,
  level: "Discreta",
  patterns: [
    { type: "YEAR_OR_DATE" },
    { type: "REPEAT_2" },
    { type: "PERSONAL_INFO", hits: 2, matched: ["mario","rossi"] }
  ]
}
~~~

### `generateFeedback(evaluation)`
Trasforma `patterns` in suggerimenti testuali per l’utente.

- input: oggetto ritornato da `evaluate(...)`
- output: `string[]` (lista di suggerimenti)

Esempio:
~~~js
[
  "Evita caratteri uguali consecutivi (es. AA, 11).",
  "Evita anni o date (es. 1998, 2024, 12/05): sono tra i primi tentativi.",
  "Evita di includere nome/cognome o parti dell’email nella password."
]
~~~

### `validateFinal(password, personalTokens=[])`
È lo “sbarramento” finale per accettare una password in registrazione.

- output: `{ ok: boolean, msg: string }`
- se `ok=false`, `msg` spiega il motivo (min length, classi mancanti, token personali, ecc.)

Esempio:
~~~js
{ ok: false, msg: "Minimo 8 caratteri." }
~~~

---

## Utility (usate dal progetto)
- `normalize(str)` — normalizzazione (lowercase, trim, ecc.)
- `emailParts(email)` — tokenizzazione email (per `personalTokens`)
- `detectPatterns(password, personalTokens=[])` — rilevazione pattern (debug/esperimenti)

---

## Nota: `evaluatePassword(...)`
Nel file esiste anche `evaluatePassword(pw, personalTokens)` che ritorna `{score, level, tips}`.
È considerata una funzione “legacy/utility”; il flusso principale del progetto (UI/API/experimenti) usa:
- `evaluate(...)`
- `generateFeedback(...)`
- `validateFinal(...)`




