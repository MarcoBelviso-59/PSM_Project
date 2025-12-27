# Test Plan (PSM_Project) — Casi minimi, ripetibili e tracciabili

Questa cartella raccoglie un **piano di test minimo** (ma utile) per verificare in modo rapido e ripetibile che **UI**, **Engine** e **API** producano comportamenti coerenti.

Obiettivo: non “fare test infiniti”, ma avere un set essenziale che copra:
- pattern critici (sequenze, ripetizioni, dizionari/small-set, info personali)
- requisiti minimi di accettazione (`validateFinal`)
- casi limite che in passato hanno generato **sovrastime**
- coerenza tra canali (stesso input → stesso output qualitativo)
- consultazione risultati esperimenti via **Dashboard DS4**

Aggiornato al **27/12/2025**.

---

## Componenti sotto test (single source of truth)
- **Engine**: `src/engine/psmEngine.js`
  - `evaluate(password, personalTokens)` → score/level/patterns
  - `generateFeedback(evaluation)` → suggerimenti
  - `validateFinal(password, personalTokens)` → { ok, level, score, reasons }
- **Web UI (DS1)**: `src/web/` (consuma l’engine in-browser)
- **API (DS2)**: `src/api/` (consuma lo stesso engine)
- **Esperimenti (DS3–DS5)**: `src/experiments/` (runner + baseline + output)
- **Dashboard (DS4)**: `src/web/experiments.html` (consuma gli endpoint experiments dell’API)

---

## Regole del test plan (stabilità)
Non imponiamo numeri esatti di score per ogni caso (la taratura può cambiare).
Imponiamo invece vincoli **stabili e difendibili**, ad esempio:
- “score deve risultare basso / non alto”
- “non deve essere ‘Molto forte’”
- “deve essere penalizzata per sequenza/ripetizione/small-set/token personale”
- “`validateFinal` deve fallire / deve passare”
- “suggerimenti e livello non devono contraddirsi”

Se cambiate taratura/policy in `psmEngine.js`, aggiornate questo documento indicando esplicitamente:
- quali casi cambiano aspettativa
- perché (nuova regola / nuovo dizionario / nuovo cap)

---

## Come eseguire i test

### A) Manuale via Web UI (DS1)
Avvio corretto (serve `src/` come root):
~~~bash
cd src
python -m http.server 8080
~~~
Apri: `http://localhost:8080/web/`

Procedura consigliata:
1) Compila nome/cognome/email (per i casi “con contesto”).
2) Inserisci la password: verifica barra/score, livello e suggerimenti (real-time).
3) Esegui submit: verifica esito `validateFinal` (accettata/rifiutata e messaggio).

---

### B) Manuale via Dashboard (DS4)
Prerequisiti:
1) avere almeno 1 run in `src/experiments/outputs/` (es. `npm run run:sample` in `src/experiments`)
2) avviare l’API (`src/api`) su `http://localhost:3000`

Avvio UI:
~~~bash
cd src
python -m http.server 8080
~~~
Apri:
- `http://localhost:8080/web/experiments.html`

Checklist DS4:
- la lista run mostra almeno 1 run
- selezionando una run si vedono `records > 0`
- le statistiche globali e il breakdown per categoria sono popolati
- i link export scaricano JSON/CSV/TSV/ExcelCSV

---

### C) Diretto via Engine (Node)
Modo più veloce per capire se un cambio all’engine ha rotto qualcosa.

~~~bash
node -e '
const e = require("./src/engine/psmEngine.js");
const tokens = ["mario","rossi","example","mario.rossi"];
const ev = e.evaluate("Mario2025!", tokens);
console.log(ev);
console.log("feedback:", e.generateFeedback(ev));
console.log("final:", e.validateFinal("Mario2025!", tokens));
'
~~~

Suggerimento:
- usate sempre gli stessi token per i casi “con contesto” (es. Mario/Rossi/mario.rossi@example.com) per ripetibilità.

---

### D) Via API (DS2)
Avvio:
~~~bash
cd src/api
npm install
npm start
~~~
API: `http://localhost:3000`

> Nota PowerShell (Windows): usare `curl.exe` (non l’alias `Invoke-WebRequest`).

Valuta:
~~~bash
curl.exe -s http://localhost:3000/api/evaluate ^
  -H "Content-Type: application/json" ^
  -d "{\"password\":\"ExamplePassword!2026\",\"options\":{\"includeFeedback\":true}}"
~~~

Valida final:
~~~bash
curl.exe -s http://localhost:3000/api/validate ^
  -H "Content-Type: application/json" ^
  -d "{\"password\":\"ExamplePassword!2026\"}"
~~~

Se `PSM_API_KEY` è impostata, aggiungere:
~~~bash
-H "x-api-key: <value>"
~~~

---

## Requisiti minimi coperti da questi test
(a) Password troppo corta o con poche categorie:
- `validateFinal` deve essere NO
- non deve mai risultare “Molto forte”

(b) Password con sequenze (alfabetiche, numeriche, tastiera):
- deve essere penalizzata
- non deve raggiungere punteggi alti

(c) Password basata su parole comuni/dizionario o “small-set” (mesi, giorni, colori, città, nomi, animali, squadre):
- deve essere penalizzata e/o soggetta a cap

(d) Password che contiene token personali (nome/cognome/parti email):
- deve essere penalizzata in modo visibile
- i suggerimenti devono evidenziare l’uso di info personali

(e) Password lunga e realmente varia (multi-categoria, senza pattern):
- deve poter raggiungere punteggi alti
- deve essere accettata da `validateFinal`

(f) Coerenza messaggi:
- livello e suggerimenti non devono contraddirsi (es. “Molto forte” ma “troppo corta”)

---

## Batteria minima consigliata (22 casi)

### Casi SENZA contesto
1) `aaaaaaaa`
2) `abcdfeff12`
3) `12345678`
4) `qwerty12!`
5) `Password!1`
6) `novembre2025!`
7) `RomaRomaRoma1!`
8) `Milan1908!!`
9) `Goku2025!!`
10) `A1!a`
11) `Aa1!Aa1!`
12) `Z7$kQ2!m`
13) `Z7$kQ2!mP9@rT4#x`
14) `Z7$kQ2!mP9@rT4#xL8&nS5*`
15) `1111aaaa!!!!`

### Casi CON contesto
Impostare prima: nome Mario, cognome Rossi, email mario.rossi@example.com  
Token suggeriti: `["mario","rossi","mario.rossi","example","com"]`

16) `Mario2025!`
17) `rossi!123A`
18) `example!A1mario`
19) `SuperLungaMarioRossi2025!!!Qx9#`
20) `Z7$kQ2!mP9@rT4#x`

### Coerenza livello/suggerimenti
21) Password breve (9–10 char) ma multi-categoria
22) Password molto forte (es. caso 14)

---

## Note di regressione emerse (da non perdere)
- In PowerShell usare `curl.exe` (evita errori su opzioni tipo `-sSf`).
- Per experiments API, il dettaglio run espone la preview in `resultsPreview` (non in `results`): la dashboard DS4 deve leggere quella chiave.
- Lo script esperimenti deve usare `--redact-password` (flag corretto).

---

## Criteri di chiusura (pass/fail)
Il test plan è “OK” quando:
1) tutti i casi sopra sono eseguibili in modo ripetibile (UI/Engine/API/DS4)
2) per ogni caso è chiaro se l’aspettativa è rispettata
3) UI e API restano coerenti con l’engine (stesso input → stesso output qualitativo)
4) eventuali cambi di policy sono documentati con motivazione + aggiornamento di questo file

Se un caso fallisce:
- aprire issue con: password, contesto, output (score/level/pattern/feedback + validateFinal), e expected
- se il fallimento è “atteso” (policy cambiata), aggiornare qui l’aspettativa con motivazione












