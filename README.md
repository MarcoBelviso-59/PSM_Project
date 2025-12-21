# PSM_Project — Password Strength Meter Engine

Progetto di Ingegneria del Software (A.A. 2025/2026) per la realizzazione di un **Password Strength Meter** con feedback in tempo reale, basato su euristiche e penalità per pattern deboli (sequenze, ripetizioni, dizionari e informazioni personali quando disponibili).

## Team
- Belviso M.
- Vegliante G.
- Didonna A.

## Stato del progetto (sintesi)
### Già presente in repo
- Prototipo web (UI + strength meter) in `src/web/`
- Diagramma casi d’uso (CU) in `docs/02_uml/use-case/`
- Diagrammi di sequenza (DS1–DS5) + spiegazione in `docs/02_uml/sequence/`
- Specifiche e linee guida in `docs/00_specs/`

### Da completare
- Separazione logica **engine** dalla UI (modularizzazione)
- API (DS2) per valutazione password
- Modulo esperimenti (DS3–DS5): runner, confronto baseline, export risultati
- Diagramma delle classi e documentazione architetturale
- Test (unit/integration) e report sperimentale
- Relazione finale e presentazione

## Struttura repository
- `src/` — Codice
  - `src/web/` — Prototipo UI (HTML/CSS/JS)
  - `src/engine/` — Modulo futuro: engine di valutazione (estrazione dal prototipo)
  - `src/api/` — Modulo futuro: API REST (DS2)
  - `src/experiments/` — Modulo futuro: esperimenti (DS3–DS5)
- `docs/` — Documentazione
  - `docs/00_specs/` — Specifiche e linee guida
  - `docs/02_uml/` — UML (Use Case e Sequence)
  - `docs/03_architettura/` — Architettura e diagramma classi (da completare)
  - `docs/04_valutazione_sperimentale/` — Dataset, metriche, risultati (da completare)
  - `docs/05_relazione/` — Relazione finale (da completare)
  - `docs/06_presentazione/` — Slide (da completare)
- `tests/` — Test (da completare)

## Demo del prototipo (src/web)
Il prototipo è una pagina web statica.

### Avvio rapido (locale)
1. Scarica o clona la repository
2. Apri `src/web/index.html` con un browser

> Nota: il prototipo mostra un flusso a 2 step (dati utente → password) e un indicatore di forza con suggerimenti.

## Documenti principali
- Specifiche: `docs/00_specs/Specifiche_Progetto_Richieste.pdf`
- Linee guida: `docs/00_specs/Linee_Guida_Progetto_IdS.pdf`
- Use Case (CU): `docs/02_uml/use-case/PSM_Diagramma_CU.pdf`
- Sequence (DS1–DS5): `docs/02_uml/sequence/FileA_ImmaginiDS.pdf`
- Spiegazione DS: `docs/02_uml/sequence/FileB_DS_Spiegazione.pdf`
- Bozza: `docs/01_analisi/Bozza_Progetto_PSM.pdf`

## Licenza
Vedi file `LICENSE`.
