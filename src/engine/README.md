# Engine (PSM_Project) — Modulo di valutazione password (estratto dalla UI)

Questa cartella contiene l’engine di valutazione password, estratto dal prototipo web in `src/web/`. Dopo l'estrazione la logica non vive più in `src/web/app.js`: la UI si limita a raccogliere input, costruire `personalTokens`, invocare l’engine e mostrare output. L’engine è la single source of truth per score, livello, pattern e suggerimenti; di conseguenza è anche la base per API (DS2) ed esperimenti (DS3–DS5).

File principale: `src/engine/psmEngine.js`. Il file definisce un oggetto globale `window.PSMEngine` per consentire l’uso diretto in browser (demo). In futuro l’engine potrà essere convertito a modulo, ma la consegna richiede prima di tutto stabilità e riuso.

Responsabilità dell’engine: calcolare un punteggio (0–100) e un livello testuale, rilevare pattern deboli (sequenze, ripetizioni, parole comuni/dizionari, small-set, riferimenti riconoscibili, informazioni personali quando disponibili) e produrre suggerimenti coerenti. L’engine deve essere deterministico: stesso input → stesso output. L’engine non deve dipendere dal DOM: nessun `document`, nessun `getElementById`, nessun event listener.

Input “personale”: il progetto usa `personalTokens`, un array di stringhe normalizzate derivato da nome, cognome ed email (token da local-part e dominio). `personalTokens` è opzionale: se assente o vuoto, l’engine valuta comunque la password senza penalità personali.

Interfaccia minima congelata (nomi e output stabili fino a consegna finale): l’engine espone `evaluate(password, personalTokens)` che restituisce `{ score, level, patterns }`, espone `generateFeedback({ score, level, patterns })` che restituisce un array di stringhe con suggerimenti, ed espone `validateFinal(password, personalTokens)` che restituisce `{ ok, msg }` per la verifica finale di accettazione (requisiti minimi e messaggio di errore). Il campo `level` usa la scala italiana già adottata nella UI: Molto debole, Debole, Discreta, Buona, Molto forte.

Formato output: `score` è un intero 0–100; `level` è una delle etichette sopra; `patterns` è una lista dei pattern rilevati dall’engine (utile sia per feedback che per debug/esperimenti). I suggerimenti mostrati all’utente non sono inventati dalla UI: derivano dai pattern tramite `generateFeedback`.

Integrazione con la UI: `src/web/index.html` deve caricare prima `../engine/psmEngine.js` e poi `./app.js`. La UI costruisce `personalTokens` e invoca `evaluate` e `generateFeedback` su ogni input della password; in fase di conferma invoca `validateFinal` e abilita/disabilita la creazione account in base a esito, score minimo e match della conferma. L’estrazione è considerata corretta quando il comportamento della demo rimane identico rispetto alla versione precedente e l’engine non contiene riferimenti al DOM.

Verifica rapida (regressione): aprire la demo, inserire dati utente, testare almeno quattro casi rappresentativi: una sequenza prevedibile, una parola comune con variazioni, una password che contiene un token personale, e una password lunga e varia; verificare che punteggio/livello/suggerimenti siano coerenti e che il bottone “Crea account” si abiliti solo quando `validateFinal` è ok, lo score supera la soglia minima e la conferma coincide.

