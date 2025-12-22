# Engine (PSM_Project) — Modulo di valutazione password

Questa cartella contiene l’engine di valutazione password, estratto dal prototipo web. La UI non implementa regole: raccoglie input, costruisce `personalTokens`, invoca l’engine e mostra output. L’engine è la **single source of truth** per score, livello, pattern e suggerimenti; di conseguenza è anche la base per API (DS2) ed esperimenti (DS3–DS5). :contentReference[oaicite:1]{index=1}

## File principale
- `src/engine/psmEngine.js`

Il file espone un oggetto globale `window.PSMEngine` per consentire l’uso diretto in browser (demo). L’engine è deterministico: stesso input → stesso output. L’engine non dipende dal DOM (niente `document`, niente event listener). :contentReference[oaicite:2]{index=2}

## Responsabilità
- Calcolare un punteggio `score` (0–100) e un livello testuale `level`.
- Rilevare pattern deboli (sequenze/ripetizioni/dizionario/small-set/pop culture/anni-date/info personali quando disponibili).
- Produrre suggerimenti coerenti tramite `generateFeedback`.
- Applicare una validazione finale tramite `validateFinal` (requisiti minimi + policy finali). :contentReference[oaicite:3]{index=3}

## Input personale (`personalTokens`)
`personalTokens` è un array di stringhe normalizzate derivato da nome, cognome ed email (token da local-part e dominio). È opzionale: se assente o vuoto, l’engine valuta comunque la password senza penalità personali. :contentReference[oaicite:4]{index=4}

Nota: `validateFinal` rifiuta password che includono info personali quando i token sono forniti (incluso matching con sostituzioni leet basilari, es. 0→o, 1→i). (La UI/API devono quindi passare `personalTokens` quando disponibili.)

## Interfaccia pubblica (stabile fino a consegna)
- `evaluate(password, personalTokens)` → `{ score, level, patterns }`
- `generateFeedback(evaluation)` → `string[]` (suggerimenti)
- `validateFinal(password, personalTokens)` → `{ ok, msg }` (accettazione finale)

`level` usa la scala italiana: **Molto debole, Debole, Discreta, Buona, Molto forte**. :contentReference[oaicite:5]{index=5}

## Integrazione con la UI
La UI deve caricare prima `../engine/psmEngine.js` e poi `app.js`. La UI invoca `evaluate`/`generateFeedback` durante la digitazione e invoca `validateFinal` in fase di conferma. La UI non deve duplicare soglie o policy già presenti in `validateFinal`. :contentReference[oaicite:6]{index=6}

## Verifica rapida (regressione)
Testare almeno questi casi:
1) sequenza prevedibile (es. `12345678Aa!`)
2) parola comune con variazioni (es. `P@ssw0rd!`)
3) password con token personale (es. `Mario2025!` con `personalTokens=["mario"]` → `validateFinal.ok=false`)
4) password lunga e varia (es. `xR7!pL9$kQ2@zN5#` → score alto e `validateFinal.ok=true`)
