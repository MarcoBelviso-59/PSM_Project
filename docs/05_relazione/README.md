# docs/05_relazione — Relazione finale

Questa cartella è destinata alla relazione finale del progetto (testo, immagini, risultati sperimentali).
**Nota di progetto:** la relazione finale sarà l’ultima cosa che completeremo; qui teniamo la struttura e i riferimenti.

Aggiornato al **31/12/2025**.

---

## Contenuti attesi (deliverable)
- Introduzione e obiettivi (DS1–DS5)
- Requisiti e vincoli (da `docs/00_specs/`)
- Architettura e scelte progettuali:
  - Engine SSOT
  - separazione UI/API/experiments
  - contratti principali (evaluate/validate/export)
- Implementazione:
  - punti chiave (pattern detection, cap, token personali, pop culture, ecc.)
  - endpoint e formati di risposta
- Esperimenti:
  - dataset usati + seed
  - confronto con baseline (zxcvbn)
  - tabelle/grafici + interpretazione
- Test:
  - test plan manuale: `/tests/README.md`
  - test automatici (Jest): `src/api/__tests__/`
  - CI: `.github/workflows/test.yml` + workflow di smoketest / experiments
- Conclusioni e possibili estensioni

---

## Materiali già pronti da includere
- Risultati “ufficiali” in `docs/04_valutazione_sperimentale/`:
  - artifacts (dataset/meta/results/xlsx)
  - figures (png)
- Checklist demo/test manuale: `tests/README.md`

---

## Stato attuale
- Codice DS1–DS5 completato.
- Prima della relazione finale restano da chiudere:
  - diagramma delle classi
  - docker / compose
  - rifinitura documentale (README allineati)

Quando questi punti sono chiusi, si procede alla stesura finale (testo + immagini + tabelle/grafici).
