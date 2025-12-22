# PSM_Project — Password Strength Meter (UI + Engine + API)

Progetto di Ingegneria del Software (A.A. 2025/2026) per la realizzazione di un **Password Strength Meter** con feedback in tempo reale, basato su euristiche e penalità per pattern deboli (sequenze, ripetizioni, dizionari e informazioni personali quando disponibili). Questo README è aggiornato al 22/12/2025

## Team
- Belviso M.
- Vegliante G.
- Didonna A.

## Stato del progetto (sintesi aggiornata)
### Coperto e verificato
- ✅ **DS1 (Web UI)**: prototipo UI a 2 step (dati utente → password) con valutazione in tempo reale e validazione finale.
- ✅ **Engine separato**: modulo condiviso che funge da single source of truth per score/livello/pattern/suggerimenti e policy di accettazione finale.
- ✅ **DS2 (API REST)**: endpoint di valutazione e validazione password via HTTP, coerenti con l’engine, con supporto a `includeFeedback`, gestione errori 400/500 e alias endpoint.

### Da completare (resto del progetto)
- ⏳ **DS3–DS5 (Esperimenti e risultati)**: runner esperimenti su dataset, confronto con baseline, persistenza/analisi risultati, visualizzazione ed export.
- ⏳ Documentazione architetturale + **diagramma delle classi**.
- ⏳ Test (unit/integration) e report sperimentale.
- ⏳ Relazione finale e presentazione.

## Struttura repository
- `src/` — Codice
  - `src/web/` — Web UI (DS1): `index.html`, `styles.css`, `app.js`
  - `src/engine/` — Engine condiviso (valutazione + pattern + validateFinal)
  - `src/api/` — API REST (DS2): Node/Express
  - `src/experiments/` — Esperimenti (DS3–DS5) *(da completare)*
- `docs/` — Documentazione
  - `docs/00_specs/` — Specifiche e linee guida
  - `docs/02_uml/` — UML (Use Case e Sequence)
  - `docs/03_architettura/` — Architettura e diagramma classi *(da completare)*
  - `docs/04_valutazione_sperimentale/` — Dataset, metriche, risultati *(da completare)*
  - `docs/05_relazione/` — Relazione finale *(da completare)*
  - `docs/06_presentazione/` — Slide *(da completare)*
- `tests/` — Test *(da completare)*

## Demo Web UI (DS1) — `src/web`
La UI usa direttamente l’engine in locale (browser). Per un avvio riproducibile si consiglia un server statico (es. VS Code Live Server), evitando `file://`.

Avvio consigliato:
1) Apri la repository in VS Code
2) Vai in `src/web/`
3) Apri `index.html` con “Live Server” (o equivalente)
4) Compila nome/cognome/email → “Continua” → inserisci password e conferma

Nota: la UI carica l’engine via script (percorso relativo `../engine/psmEngine.js`) e lo usa per calcolare score/pattern/suggerimenti e per bloccare/sbloccare la conferma in base a `validateFinal`.

## API (DS2) — `src/api`
L’API espone via HTTP la valutazione password usando lo stesso engine (single source of truth). Sono disponibili:
- `POST /evaluatePassword` (endpoint DS2)
- `POST /api/evaluate` (alias retro-compatibile, stessa logica)
- `POST /api/validate` (validazione finale: `{ ok, msg }`)

Avvio (Windows PowerShell):
1) `cd src\api`
2) `npm.cmd install`
3) `npm.cmd start`

Nota DS2: `suggestions` è restituito **solo** se `options.includeFeedback=true`. L’API risponde 400 `BadRequest` su input non valido e 500 `InternalError` su errori interni. È presente auth opzionale “se prevista” tramite env `PSM_API_KEY` (header `x-api-key`).

## Documenti principali
- Specifiche: `docs/00_specs/Specifiche_Progetto_Richieste.pdf`
- Linee guida: `docs/00_specs/Linee_Guida_Progetto_IdS.pdf`
- Use Case (CU): `docs/02_uml/use-case/PSM_Diagramma_CU.pdf`
- Sequence (DS1–DS5): `docs/02_uml/sequence/FileA_ImmaginiDS.pdf`
- Spiegazione DS: `docs/02_uml/sequence/FileB_DS_Spiegazione.pdf`
- Bozza: `docs/01_analisi/Bozza_Progetto_PSM.pdf`

## Coerenza e “single source of truth”
- L’engine in `src/engine/` definisce scoring, pattern, feedback e policy di accettazione finale.
- UI (DS1) e API (DS2) devono limitarsi a orchestrare l’engine e non duplicare soglie/policy localmente.
- Ogni modifica alle policy va fatta nell’engine e poi verificata con test di regressione (UI/API) per mantenere coerenza.

## Licenza
Vedi file `LICENSE`.

