# Test Plan (PSM_Project) — Casi di test minimi, ripetibili e tracciabili

Questa cartella raccoglie il piano di test del progetto e una batteria minima di casi con risultato atteso, pensata per verificare in modo rapido e ripetibile che UI, engine e (quando presente) API producano comportamenti coerenti. L’obiettivo non è “fare test infiniti”, ma avere un set essenziale che copra i pattern critici (sequenze, ripetizioni, dizionari, info personali), i requisiti minimi di accettazione (validateFinal) e i casi limite che in passato hanno generato sovrastime. Questo documento è anche un supporto diretto per la relazione: mostra quali verifiche sono state eseguite e quali proprietà del sistema vengono garantite.

Il progetto prevede due livelli di verifica: (1) la valutazione real-time (punteggio/livello/pattern/suggerimenti) prodotta dall’engine, consumata dalla UI e dall’API; (2) la validazione finale “accettabile/non accettabile” prodotta da `validateFinal`. Per questo motivo, ogni caso di test deve indicare almeno: l’input (password e, se rilevante, contesto personale), l’aspettativa qualitativa (ad esempio “score deve risultare basso” oppure “non deve superare un cap” oppure “validateFinal deve fallire”), e il motivo (quale pattern o requisito è coinvolto). Non imponiamo numeri esatti di score per tutti i casi, perché la taratura può cambiare; imponiamo invece vincoli stabili e difendibili (soglie minime, cap, presenza pattern, esito validateFinal). Se si decide una taratura definitiva, è possibile aggiungere colonne con score atteso, ma la priorità è evitare ambiguità e rework.

Modalità di esecuzione dei test: i casi possono essere eseguiti manualmente sulla demo in `src/web/` (inserendo i dati richiesti e osservando barra, livello e suggerimenti), oppure in modo più diretto invocando l’engine (quando sarà estratto in `src/engine/`) o l’API (quando sarà implementata in `src/api/`). In ogni caso, la proprietà da garantire è la stessa: stesso input → stesso output (determinismo) e coerenza tra i canali (UI, API, esperimenti). Per i casi con contesto, è importante impostare nome/cognome/email prima di digitare la password, così `personalTokens` è costruito e le penalità personali sono attive.

Requisiti minimi che questi test devono coprire: (a) password troppo corta o con poche categorie non deve essere accettata (validateFinal negativo) e non deve mai risultare “Molto forte”; (b) password con sequenze (alfabetiche, numeriche o da tastiera) deve essere penalizzata e non deve raggiungere punteggi alti; (c) password basata su parole comuni/dizionario o su insiemi “small-set” (mesi, giorni, colori, città, nomi, animali, squadre) deve essere penalizzata e soggetta a cap; (d) password che contiene token personali (nome, cognome, parti email) deve essere penalizzata in modo visibile; (e) password lunga e realmente varia (con più categorie e senza pattern) deve poter raggiungere punteggi alti ed essere accettata; (f) suggerimenti e livello non devono contraddirsi (es. “Molto forte” ma “troppo corta”).

Di seguito la batteria minima consigliata (almeno 20 casi). Per ogni caso, “Aspettativa” indica vincoli qualitativi e di accettazione; “Note” spiega cosa si sta verificando. Dove è indicato un cap o un vincolo di soglia, va rispettato in modo stabile dalla logica del progetto (se cambiate taratura, aggiornate questa lista). Se nel vostro progetto avete già deciso cap specifici (ad esempio per lunghezze <12 o per pop culture), riportateli in modo coerente: i casi qui sotto sono scritti per essere compatibili con l’approccio a cap discusso nel progetto.

Casi senza contesto (nessun nome/cognome/email impostato):
1) Password: `aaaaaaaa` — Aspettativa: score basso, livello basso, validateFinal probabilmente NO; Note: ripetizione estrema (unicità minima), pattern ovvio.
2) Password: `abcdfeff12` — Aspettativa: score basso o comunque non alto, deve essere penalizzata per sequenza; validateFinal può variare ma non deve risultare “forte”; Note: sequenza alfabetica/consecutività (caso noto di sovrastima da evitare).
3) Password: `12345678` — Aspettativa: score molto basso, validateFinal NO; Note: numerica e sequenza comune.
4) Password: `qwerty12!` — Aspettativa: penalità sequenza tastiera, score non alto, validateFinal può variare ma non deve essere alta; Note: pattern tastiera.
5) Password: `Password!1` — Aspettativa: penalità dizionario/parola comune, score medio-basso, non deve raggiungere “Molto forte”; Note: parola nota + semplice variazione.
6) Password: `novembre2025!` — Aspettativa: penalità “small-set” (mese) + pattern prevedibile, score non alto; Note: mese + numero.
7) Password: `RomaRomaRoma1!` — Aspettativa: penalità ripetizione e parola “small-set” (città), score non alto; Note: ripetizioni strutturate.
8) Password: `Milan1908!!` — Aspettativa: penalità “small-set” (squadra) e prevedibilità, score non alto; Note: riferimenti sportivi.
9) Password: `Goku2025!!` — Aspettativa: penalità pop culture (se prevista) e/o cap, score non deve risultare massimo; Note: caso rappresentativo di parole riconoscibili.
10) Password: `A1!a` — Aspettativa: score molto basso, validateFinal NO per lunghezza; Note: troppo corta, anche se ha categorie.
11) Password: `Aa1!Aa1!` — Aspettativa: penalità ripetizione pattern, score non alto, validateFinal potrebbe essere SI ma non deve essere “Molto forte”; Note: ripetizione di blocchi.
12) Password: `Z7$kQ2!m` — Aspettativa: score discreto, validateFinal SI; Note: corta ma varia (controllo che non venga sovrastimata a “top”).
13) Password: `Z7$kQ2!mP9@rT4#x` — Aspettativa: score alto, validateFinal SI; Note: buona entropia apparente, lunghezza e varietà.
14) Password: `Z7$kQ2!mP9@rT4#xL8&nS5*` — Aspettativa: score molto alto, livello massimo, validateFinal SI; Note: lunga e varia senza pattern evidenti.
15) Password: `1111aaaa!!!!` — Aspettativa: penalità ripetizione multi-gruppo, score non alto, validateFinal può variare ma non deve risultare “Molto forte”; Note: composizione prevedibile.

Casi con contesto (impostare prima nome/cognome/email):
Impostare contesto esempio: nome = Mario, cognome = Rossi, email = mario.rossi@example.com.
16) Password: `Mario2025!` — Aspettativa: penalità info personali, score non alto, suggerimenti devono menzionare info personali; validateFinal può variare ma non deve risultare alta; Note: token personale esplicito.
17) Password: `rossi!123A` — Aspettativa: penalità info personali + sequenza numerica, score non alto; Note: cognome + numeri.
18) Password: `example!A1mario` — Aspettativa: penalità per parti email, score non alto; Note: token da dominio/local-part.
19) Password: `SuperLungaMarioRossi2025!!!Qx9#` — Aspettativa: anche se lunga, deve ricevere penalità info personali e non ottenere valutazione “perfetta”; Note: verifica che la lunghezza non annulli penalità personali (ma nemmeno la renda “inutile”: deve restare “buona” ma non “massima”).
20) Password: `Z7$kQ2!mP9@rT4#x` con contesto impostato — Aspettativa: non deve cambiare rispetto al caso 13 (nessun match con token); Note: contesto non deve penalizzare se non c’è match reale.

Casi di coerenza UI/engine/suggerimenti:
21) Password: qualsiasi che risulti breve (es. 9–10 caratteri) ma con molte categorie — Aspettativa: livello e suggerimenti non devono contraddirsi (non “Molto forte” con “troppo corta”); Note: coerenza messaggi.
22) Password: una password dichiarata “Molto forte” — Aspettativa: suggerimenti devono essere vuoti o marginali, non devono proporre fix drastici; Note: qualità feedback.

Criteri di chiusura del test plan: (1) tutti i casi sopra possono essere eseguiti in modo ripetibile; (2) per ciascun caso è possibile osservare chiaramente se l’aspettativa è soddisfatta; (3) quando l’engine viene estratto o quando si implementa l’API, lo stesso set produce gli stessi esiti qualitativi (coerenza cross-canale). In caso di modifiche alle regole (penalità, dizionari, cap), questo documento va aggiornato in modo esplicito indicando quali aspettative cambiano e perché.

