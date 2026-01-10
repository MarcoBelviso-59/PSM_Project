# docs/05_relazione — Relazione finale

Questa cartella contiene la **relazione tecnica finale** del progetto PSM.

**Aggiornato al:** **10/01/2026**

---

## File principale (deliverable)
- `Relazione_tecnica_PSM.pdf`  
  Relazione finale conforme alle specifiche (contenuti DS1–DS5, architettura SSOT, validazione/verifica, valutazione sperimentale, discussione e conclusioni).

---

## Materiali citati/collegati (in repo)
- Specifiche e linee guida: `docs/00_specs/`
- UML:
  - Use case + sequence: `docs/02_uml/`
  - class diagram: `docs/02_uml/class/PSM_diagramma_classi.pdf`
- Architettura: `docs/03_architettura/`
- Valutazione sperimentale (run di riferimento + figure):
  - `docs/04_valutazione_sperimentale/`
  - `docs/04_valutazione_sperimentale/figures/`
- Test:
  - test plan manuale: `tests/README.md`
  - test automatici (Jest): `src/api/__tests__/`
  - workflow CI: `.github/workflows/`
- Riferimenti/paper: `docs/99_riferimenti/`

---

## Nota di coerenza
La relazione è coerente con:
- contratti engine/API (campi e nomi degli endpoint)
- struttura e risultati della run di riferimento (`docs/04_valutazione_sperimentale/`)
- materiale di presentazione (PDF) in `docs/06_presentazione/PSM_presentazione.pdf`

Se in futuro cambiano policy dell’engine o formati dei risultati, vanno aggiornati prima gli artifacts e poi testo/figure.
