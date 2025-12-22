# API (DS2) — Password Evaluation Service (PSM_Project)

Questa cartella contiene l’API del progetto e implementa lo scenario DS2: valutazione e validazione password via HTTP usando come single source of truth l’engine in `src/engine/psmEngine.js`. L’API non replica né riscrive regole di scoring: valida input e opzioni, costruisce i token personali quando disponibili, invoca l’engine e restituisce una risposta deterministica. L’engine espone `evaluate(password, personalTokens)` (ritorna score/level/patterns), `generateFeedback(evaluation)` (ritorna suggerimenti) e `validateFinal(password, personalTokens)` (ritorna `{ ok, msg }`); l’API orchestra questi metodi.

La request accetta JSON con `password` obbligatoria (stringa non vuota), più opzionalmente `personalTokens` (array di stringhe) oppure `user` come oggetto `{ firstName, lastName, email }`. La priorità è: se è presente `personalTokens` viene usato quello; altrimenti, se è presente `user`, i token vengono derivati da nome/cognome/email (inclusi token estratti dalla email). L’oggetto `options` è opzionale e supporta `includeFeedback` (boolean): se `true` la risposta include anche `suggestions`, se assente o `false` la risposta non include suggerimenti. L’API applica limiti anti-abuso a lunghezza massima della password, quantità massima di token e lunghezza massima per token.

Gli endpoint DS2 sono: `POST /evaluatePassword` che valuta la password; `POST /api/evaluate` che è un alias retro-compatibile con lo stesso comportamento e schema; `POST /api/validate` che esegue la validazione finale coerente con `validateFinal`. La risposta di valutazione (`/evaluatePassword` e `/api/evaluate`) contiene sempre `score` (0–100), `level` (scala italiana), `patterns` (lista dei pattern rilevati dal motore) e contiene `suggestions` solo quando `options.includeFeedback=true`. La risposta di validazione (`/api/validate`) contiene sempre `{ ok, msg }`.

Error handling: l’API risponde 400 `BadRequest` quando `password` manca, non è stringa o è vuota (solo spazi), quando `options` è malformato, o quando `options.includeFeedback` non è boolean; il formato è `{ "error": "BadRequest", "message": "..." }`. In caso di errore interno risponde 500 `InternalError` con `{ "error": "InternalError", "message": "Errore interno durante la valutazione." }` oppure `{ "error": "InternalError", "message": "Errore interno durante la validazione." }`. Nota PowerShell: `Invoke-RestMethod` può sollevare eccezioni su risposte 4xx/5xx, ma il body JSON contiene comunque `{ error, message }`.

Auth “se prevista”: se è impostata la variabile d’ambiente `PSM_API_KEY`, l’API richiede l’header `x-api-key: <valore>` e risponde 401 se manca, 403 se è errato; se `PSM_API_KEY` non è impostata, non richiede autenticazione.

Avvio (Windows PowerShell) dalla root repository: entra in `src\api`, installa dipendenze e avvia il server (porta e URL vengono mostrati in console). Per i test, puoi usare `Invoke-RestMethod` oppure qualsiasi client HTTP. L’esempio seguente riassume in un’unica sezione: avvio, chiamata a `/evaluatePassword` senza feedback, chiamata a `/evaluatePassword` con feedback, chiamata all’alias `/api/evaluate` e chiamata a `/api/validate`, includendo anche un esempio di payload e gli output attesi (a livello di campi).

```powershell
# Avvio (esegui in un terminale)
cd src\api
npm.cmd install
npm.cmd start

# 1) POST /evaluatePassword (senza feedback: niente "suggestions" in risposta)
$body1 = @{ password="Roma2025!"; personalTokens=@("mario","rossi","mario.rossi","example") } | ConvertTo-Json
Invoke-RestMethod -Method Post -Uri http://localhost:3000/evaluatePassword -ContentType "application/json" -Body $body1

# 2) POST /evaluatePassword (con feedback: include "suggestions" in risposta)
$body2 = @{ password="Roma2025!"; personalTokens=@("mario","rossi","mario.rossi","example"); options=@{ includeFeedback=$true } } | ConvertTo-Json
Invoke-RestMethod -Method Post -Uri http://localhost:3000/evaluatePassword -ContentType "application/json" -Body $body2

# 3) POST /api/evaluate (alias retro-compatibile, stesso schema di /evaluatePassword)
$body3 = @{ password="Roma2025!"; personalTokens=@("mario") } | ConvertTo-Json
Invoke-RestMethod -Method Post -Uri http://localhost:3000/api/evaluate -ContentType "application/json" -Body $body3

# 4) POST /api/validate (validazione finale: ritorna { ok, msg })
$body4 = @{ password="Mr0ss12024!"; personalTokens=@("rossi") } | ConvertTo-Json
Invoke-RestMethod -Method Post -Uri http://localhost:3000/api/validate -ContentType "application/json" -Body $body4

# Note attese:
# - /evaluatePassword e /api/evaluate ritornano sempre: score (0–100), level, patterns
# - "suggestions" compare solo se options.includeFeedback = true
# - /api/validate ritorna { ok: true/false, msg: "..." }
# - in caso di input non valido l’API risponde 400 BadRequest con { error, message }

Coerenza: UI, engine e API devono rimanere allineati; la policy finale sta in validateFinal, e lo scoring/patterns in evaluate. L’API non introduce soglie proprie: valida input/opzioni e invoca l’engine.
