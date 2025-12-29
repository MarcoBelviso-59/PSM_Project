# Test Plan (PSM_Project) — Manuale ripetibile + collegamento ai test automatici

Questa cartella **`/tests`** contiene un **piano di test manuale** (checklist) per verificare rapidamente e in modo ripetibile che:
- **UI (DS1)**, **Engine**, **API (DS2)** e **Dashboard (DS4)** restino coerenti;
- i casi “critici” (sequenze, ripetizioni, dizionari/small-set, token personali, pop culture) siano gestiti correttamente;
- gli endpoint experiments (DS4/DS5) funzionino (lista, dettaglio, export).

> Importante: i **test automatici** non stanno qui.
> I test automatici (unit + integration) sono in **`PSM_Project/src/api/__tests__/`** e vengono eseguiti dalla CI.

Aggiornato al **29/12/2025**.

---

## 1) Cosa testiamo e dove (mappa rapida)

### A) Test automatici (CI / Jest) ✅
- Path: `PSM_Project/src/api/__tests__/`
- Scopo: impedire regressioni su engine + API (evaluate/validate + experiments/export).
- Esecuzione locale:
  - vai in `PSM_Project/src/api`
  - `npm install`
  - `npm test`
- Esecuzione su GitHub: workflow CI (verde).

### B) Test manuali (questa cartella `/tests`) ✅
- Scopo: checklist per demo e verifica “umana” end-to-end:
  - UI DS1 (valutazione live + submit)
  - Dashboard DS4 (lista/dettaglio/statistiche/export)
  - chiamate API via curl (utile anche in Windows)
- Nota: questi test sono “ripetibili”, non “infiniti”: pochi casi ma buoni.

---

## 2) Regole del test plan (stabilità)
Non imponiamo numeri esatti di score per ogni caso (la taratura può cambiare).
Imponiamo vincoli **stabili e difendibili**, ad esempio:
- “score deve risultare basso / non alto”
- “non deve essere ‘Molto forte’”
- “deve essere penalizzata per sequenza/ripetizione/small-set/token personale”
- “`validateFinal` deve fallire / deve passare”
- “livello e suggerimenti non devono contraddirsi”

Se cambiate taratura/policy in `src/engine/psmEngine.js`, aggiornate questo documento indicando:
- quali casi cambiano aspettativa
- perché (nuova regola / nuovo dizionario / nuovo cap)

---

## 3) Come eseguire i test manuali

### A) Manuale via Web UI (DS1)
Avvio corretto (serve `src/` come root):
~~~bash
cd src
python -m http.server 8080
~~~
Apri: `http://localhost:8080/web/`

Procedura consigliata:
1) Compila nome/cognome/email (serve per i casi “con contesto”).
2) Inserisci la password: verifica barra/score, livello e suggerimenti (real-time).
3) Premi submit: verifica esito `validateFinal` (accettata/rifiutata e messaggio).

---

### B) Manuale via Dashboard (DS4)
Prerequisiti:
1) avere almeno 1 run in `src/experiments/outputs/`
   - oppure usare una run “ufficiale” scaricata da GitHub Actions e copiata in `src/experiments/outputs/`
2) avviare l’API (`src/api`) su `http://localhost:3000`

Avvio UI:
~~~bash
cd src
python -m http.server 8080
~~~
Apri: `http://localhost:8080/web/experiments.html`

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
- usate sempre gli stessi token per i casi “con contesto” per ripetibilità.

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

## 4) Requisiti minimi coperti da questi test (cosa deve succedere)

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

## 5) Batteria minima consigliata (22 casi)

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

## 6) Note di regressione emerse (da non perdere)
- In PowerShell usare `curl.exe` (evita problemi su opzioni e parsing).
- Per experiments API, il dettaglio run espone la preview in `resultsPreview` (non in `results`): la dashboard DS4 deve leggere quella chiave.
- Lo script esperimenti deve usare `--redact-password` (flag corretto).
- Gli export DS5 supportano almeno: `json`, `csv`, `tsv`, `excelcsv`.

---

## 7) Criteri di chiusura (pass/fail)
Il test plan è “OK” quando:
1) tutti i casi sopra sono eseguibili in modo ripetibile (UI/Engine/API/DS4)
2) per ogni caso è chiaro se l’aspettativa è rispettata
3) UI e API restano coerenti con l’engine (stesso input → stesso output qualitativo)
4) eventuali cambi di policy sono documentati con motivazione + aggiornamento di questo file

Se un caso fallisce:
- aprire issue con: password, contesto, output (score/level/pattern/feedback + validateFinal), e expected
- se il fallimento è “atteso” (policy cambiata), aggiornare qui l’aspettativa con motivazione

