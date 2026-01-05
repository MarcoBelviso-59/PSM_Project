# docs/05_relazione — Relazione finale

Questa cartella è destinata alla **relazione tecnica finale** del progetto (testo, immagini, tabelle, bibliografia).
La relazione deve rispettare le **specifiche ufficiali** (struttura e contenuti richiesti).

**Aggiornato al:** **05/01/2026**  


---

## Contenuti attesi (deliverable)
Struttura consigliata (da adattare alle specifiche):
- Introduzione e obiettivi (DS1–DS5)
- Stato dell’arte e riferimenti (paper su password strength + baseline)
- Processo di sviluppo (gantt, rischi, costi/effort)
- Requisiti (funzionali + non funzionali, es. FURPS+)
- Architettura e scelte progettuali (SSOT, separazione moduli)
- Implementazione (punti chiave: pattern, cap, token personali, pop culture, ecc.)
- Prototipo e modalità d’esecuzione (local + docker)
- Validazione e verifica (test manuali + test automatici + CI)
- Valutazione sperimentale (PSM vs baseline, dataset/seed, risultati e figure)
- Discussione (limiti, minacce alla validità, trade-off)
- Conclusioni e sviluppi futuri
- Bibliografia

---

## Materiali già pronti da includere (in repo)
- UML:
  - Use case + sequence: `docs/02_uml/`
  - class diagram: `docs/02_uml/class/PSM_diagramma_classi.pdf`
- Architettura:
  - `docs/03_architettura/`
- Risultati sperimentali “ufficiali”:
  - `docs/04_valutazione_sperimentale/` (artifacts + figures)
- Test:
  - test plan manuale: `tests/README.md`
  - test automatici (Jest): `src/api/__tests__/`
  - workflow CI: `.github/workflows/`

---

## Cosa manca (da fare in questa cartella)
- ⏳ Creare il file principale della relazione (es. `relazione.tex` o `relazione.docx`)
- ⏳ Integrare figure e tabelle (da `docs/04_valutazione_sperimentale/figures/` e artifacts)
- ⏳ Bibliografia: aggiungere i paper in `docs/99_riferimenti/` e citarli correttamente
- ⏳ Sezione “minacce alla validità” per la parte sperimentale (baseline, dataset, seed, generalizzabilità)

---

## Regola di coerenza (importante)
La relazione deve essere coerente con:
- contratti engine/API (stessi campi e nomi)
- struttura e risultati della run di riferimento
- demo e presentazione (slide devono “raccontare la stessa storia”)

Se cambiate policy nell’engine o formati dei risultati, aggiornate **prima** gli artifacts e **poi** testo/figure.
