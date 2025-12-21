# Engine (PSM_Project) — logica di valutazione password

Questa cartella conterrà la **logica dell’engine** estratta da `src/web/app.js`.
L’obiettivo è separare:
- **UI** (DOM, eventi, aggiornamento grafico) → resta in `src/web/`
- **Engine** (valutazione, pattern detection, feedback, validazione) → va in `src/engine/`

> Nota: nel prototipo attuale la logica è in `app.js` e la UI invoca `evaluate(...)`, `generateFeedback(...)` e `validateFinal(...)`.

---

## 1) Contratto attuale (da rispettare)

### Input: `personalTokens`
Nel prototipo, la penalità “info personali” usa `personalTokens`, che è un array di stringhe normalizzate.
Viene costruito a partire da nome, cognome ed email usando:
- `normalize(nome)`
- `normalize(cognome)`
- `emailParts(email)` (token da local part e dominio, min length 3)

Quindi il contratto dell’engine è:

- `evaluate(password, personalTokens)`
- `validateFinal(password, personalTokens)` (o equivalente)

> Anche se in futuro potremo passare un oggetto `context`, nel breve va mantenuta la compatibilità con `personalTokens`
per non riscrivere UI/API/esperimenti.

### Output livelli (5 livelli, già in uso)
La UI mostra un livello testuale calcolato da `strengthLabel(score)`:

- `Molto debole`
- `Debole`
- `Discreta`
- `Buona`
- `Molto forte`

(Con descrizione associata `descMap`).

---

## 2) Funzioni “engine” già presenti nel prototipo (da migrare in src/engine)

Queste funzioni sono logica pura o quasi-pura e devono vivere nell’engine (non in UI):

### Normalizzazione e token
- `normalize(s)`
- `deleetForDictionary(s)`
- `emailParts(email)`
- `tokenizeWords(pw)`

### Dizionari / pattern
- `dictionaryHits(pw)` (basata su `COMMON_WORDS`)
- `hasConsecutivePattern(pw)` (sequenze alfabetiche/numeriche + righe tastiera)
- `detectPatterns(pw, personalTokens)`  
  Produce una lista di pattern (es. `TOO_SHORT`, `DICTIONARY`, `SMALL_SET_WORDS`, `POP_CULTURE`, ecc.)

### Scoring e output
Nel prototipo esistono **due livelli di valutazione**:

1) `evaluatePassword(pw, personalTokens)`
- calcola punteggio usando la logica “Baseline” (Basic16 vs Comprehensive8) + penalità base
- ritorna: `{ score, level, tips }`

2) `evaluate(pw, personalTokens)`
- invoca `evaluatePassword(...)`
- invoca `detectPatterns(...)`
- applica CAP/limitazioni finali basate sui pattern (es. caps per dizionario, sequenze, pop culture, ecc.)
- ritorna: `{ score, level, patterns }`

> Questo doppio livello è già parte del comportamento attuale: va preservato.
In fase di refactor si può decidere se mantenere entrambe o unificarle, ma senza cambiare output verso la UI.

### Feedback e validazione finale
- `generateFeedback(evaluation)`  
  Converte `patterns` in lista di suggerimenti (stringhe), pensate per la UI.
- `validateFinal(pw, personalTokens)`  
  Applica requisiti minimi (lunghezza e classi caratteri) e soglia minima di accettazione.

---

## 3) Formato output (come oggi)

Per garantire compatibilità con la UI e con futuri moduli (API/esperimenti):

### `evaluate(password, personalTokens)` → ritorna
- `score` (0–100)
- `level` (uno dei 5 livelli sopra)
- `patterns` (array di oggetti pattern)

### `evaluatePassword(password, personalTokens)` → ritorna
- `score` (0–100)
- `level`
- `tips` (array string) *baseline*

### `generateFeedback(evaluation)` → ritorna
- array string (consigli/suggerimenti) derivati da `evaluation.patterns`

### `validateFinal(password, personalTokens)` → ritorna
- `{ ok: boolean, msg: string }`

---

## 4) Regole critiche già implementate (da NON perdere)

Nel prototipo, oltre alle penalità base, sono presenti CAP finali legati a pattern (esempi):
- cap severi per password “ovvie” (carattere unico, bassa unicità, parole comuni esatte)
- cap per parole di small-set (mesi/giorni/colori/città/squadre/animali/nomi)
- cap per sequenze (abcd/1234/qwerty)
- cap per POP_CULTURE
- cap per lunghezze sotto soglia (es. < 12 non può arrivare oltre un certo score)

Questi CAP sono parte della vostra logica attuale: l’engine deve applicarli in modo deterministico.

---

## 5) Separation of concerns (regola pratica)

### UI (src/web) deve fare solo:
- leggere input utente
- costruire `personalTokens`
- chiamare `evaluate(...)`
- chiamare `generateFeedback(...)`
- aggiornare DOM (bar, label, lista suggerimenti)
- abilitare/disabilitare “Crea” in base a `validateFinal(...)` + match conferma

### Engine (src/engine) deve fare:
- tutto ciò che produce score/level/patterns/tips
- senza dipendere dal DOM (nessun `document.getElementById`, nessun event listener)

---

## 6) Definition of Done (per considerare l’estrazione completata)
L’estrazione in `src/engine/` è “finita” quando:
1) `src/web/` continua a funzionare identico (stesso comportamento e stessi output)
2) `src/web/app.js` contiene solo “wiring UI” (eventi/DOM) e NON regole di scoring
3) l’engine espone almeno: `evaluate`, `generateFeedback`, `validateFinal`
4) README aggiornato se cambiano soglie, livelli o pattern

