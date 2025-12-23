# Test Plan (PSM_Project) — Casi minimi, ripetibili e tracciabili

Questa cartella raccoglie un **piano di test minimo** (ma utile) per verificare in modo rapido e ripetibile che **UI**, **Engine** e **API** producano comportamenti coerenti.

Obiettivo: non “fare test infiniti”, ma avere un set essenziale che copra:
- pattern critici (sequenze, ripetizioni, dizionari/small-set, info personali)
- requisiti minimi di accettazione (`validateFinal`)
- casi limite che in passato hanno generato **sovrastime**
- coerenza tra canali (stesso input → stesso output qualitativo)

Aggiornato al **23/12/2025**.

---

## Componenti sotto test (single source of truth)
- **Engine**: `src/engine/psmEngine.js`
  - `evaluate(password, personalTokens)` → score/level/patterns
  - `generateFeedback(evaluation)` → suggerimenti
  - `validateFinal(password, personalTokens)` → { ok, msg }
- **Web UI (DS1)**: `src/web/` (consuma l’engine in-browser)
- **API (DS2)**: `src/api/` (consuma lo stesso engine)
- **Esperimenti (DS3–DS5)**: `src/experiments/` (runner + baseline + output)

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
3) Esegui submit (creazione): verifica esito `validateFinal` (accettata/rifiutata e messaggio).

---

### B) Diretto via Engine (Node)
Questo è il modo più veloce per capire se un cambio all’engine ha rotto qualcosa.

Esempio (una password):
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

### C) Via API (DS2)
Avvio:
~~~bash
cd src/api
npm install
npm start
~~~
API: `http://localhost:3000`

Valuta:
~~~bash
curl -sSf http://localhost:3000/api/evaluate \
  -H "Content-Type: application/json" \
  -d '{"password":"ExamplePassword!2026","options":{"includeFeedback":true}}'
~~~

Valida final:
~~~bash
curl -sSf http://localhost:3000/api/validate \
  -H "Content-Type: application/json" \
  -d '{"password":"ExamplePassword!2026"}'
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

### Casi SENZA contesto (nessun nome/cognome/email impostato)
1) `aaaaaaaa`  
   Aspettativa: score basso, livello basso; `validateFinal` NO (o comunque non “OK”).  
   Note: ripetizione estrema / unicità minima.

2) `abcdfeff12`  
   Aspettativa: penalità sequenza/consecutività; score non alto; non deve risultare “forte”.  
   Note: caso noto di sovrastima da evitare.

3) `12345678`  
   Aspettativa: score molto basso; `validateFinal` NO.  
   Note: sequenza numerica comune.

4) `qwerty12!`  
   Aspettativa: penalità tastiera; score non alto; non “Molto forte”.  
   Note: pattern tastiera.

5) `Password!1`  
   Aspettativa: penalità parola comune/dizionario; score medio-basso; non “Molto forte”.  
   Note: parola nota + variazione banale.

6) `novembre2025!`  
   Aspettativa: penalità small-set (mese) + prevedibilità; score non alto.  
   Note: mese + numero.

7) `RomaRomaRoma1!`  
   Aspettativa: penalità ripetizione + small-set (città); score non alto.  
   Note: ripetizioni strutturate.

8) `Milan1908!!`  
   Aspettativa: penalità small-set (squadra) e prevedibilità; score non alto.  
   Note: riferimenti sportivi.

9) `Goku2025!!`  
   Aspettativa: penalità (pop culture se prevista) e/o cap; non deve risultare “perfetta”.  
   Note: parola riconoscibile + anno.

10) `A1!a`  
   Aspettativa: score molto basso; `validateFinal` NO per lunghezza.  
   Note: troppo corta anche se multi-categoria.

11) `Aa1!Aa1!`  
   Aspettativa: penalità ripetizione di blocchi; score non alto; non “Molto forte”.  
   Note: pattern ripetuto.

12) `Z7$kQ2!m`  
   Aspettativa: score discreto (non top); `validateFinal` può essere SI o NO in base a policy, ma non deve essere “massimo”.  
   Note: corta ma varia (controllo anti-sovrastima).

13) `Z7$kQ2!mP9@rT4#x`  
   Aspettativa: score alto; `validateFinal` SI.  
   Note: lunghezza e varietà, pattern non evidenti.

14) `Z7$kQ2!mP9@rT4#xL8&nS5*`  
   Aspettativa: score molto alto; livello massimo; `validateFinal` SI.  
   Note: lunga e varia.

15) `1111aaaa!!!!`  
   Aspettativa: penalità ripetizione multi-gruppo; score non alto; non “Molto forte”.  
   Note: struttura prevedibile.

---

### Casi CON contesto (impostare prima: nome Mario, cognome Rossi, email mario.rossi@example.com)
Token suggeriti (qualitativi): `["mario","rossi","mario.rossi","example","com"]`

16) `Mario2025!`  
   Aspettativa: penalità info personali; score non alto; suggerimenti devono menzionare info personali; non “Molto forte”.  
   Note: token personale esplicito.

17) `rossi!123A`  
   Aspettativa: penalità info personali + sequenza numerica; score non alto.  
   Note: cognome + numeri.

18) `example!A1mario`  
   Aspettativa: penalità per parti email + token personale; score non alto.  
   Note: token da email (dominio/local-part).

19) `SuperLungaMarioRossi2025!!!Qx9#`  
   Aspettativa: anche se lunga deve ricevere penalità info personali; non deve essere “perfetta”.  
   Note: la lunghezza non deve annullare completamente la penalità personale (ma non deve nemmeno “distruggerla”: può restare buona ma non massima).

20) `Z7$kQ2!mP9@rT4#x` (stessa del caso 13, con contesto)  
   Aspettativa: non deve cambiare in modo significativo (nessun match con token); `validateFinal` come caso 13.  
   Note: il contesto non deve penalizzare se non c’è match reale.

---

### Coerenza livello/suggerimenti (qualità UX)
21) Una password breve (9–10 char) ma multi-categoria (es. lettere maiuscole/minuscole + numeri + simboli)  
   Aspettativa: se viene segnalata “troppo corta”, il livello non deve essere “Molto forte”.

22) Una password dichiarata “Molto forte” (es. caso 14)  
   Aspettativa: suggerimenti devono essere vuoti o marginali (non “fix drastici”).

---

## Criteri di chiusura (pass/fail)
Il test plan è “OK” quando:
1) tutti i casi sopra sono eseguibili in modo ripetibile (UI/Engine/API)
2) per ogni caso è chiaro se l’aspettativa è rispettata
3) UI e API restano coerenti con l’engine (stesso input → stesso output qualitativo)
4) eventuali cambi di policy sono documentati con motivazione + aggiornamento di questo file

Se un caso fallisce:
- aprire issue con: password, contesto, output (score/level/pattern/suggestions + validateFinal), e expected.
- se il fallimento è “atteso” (policy cambiata), aggiornare qui l’aspettativa con motivazione.
