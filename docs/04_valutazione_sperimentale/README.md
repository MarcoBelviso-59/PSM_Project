# Risultati esperimento ufficiale (dataset_v1, seed=12345)

Questa sezione documenta la run “di riferimento” usata per la valutazione sperimentale del progetto PSM.
L’obiettivo è avere un set di risultati **riproducibile, verificabile e facilmente consultabile**, includendo dataset, metadati e output finali.

Aggiornato al **31/12/2025**.

---

## 1) Setup (run di riferimento)
- **Dataset:** `artifacts/dataset_v1.json`
- **Record totali:** 120 (6 categorie × 20)
- **Seed:** `12345` (run riproducibile)
- **Metadati run:** `artifacts/meta.json`
- **Risultati completi (raw):** `artifacts/results.json`
- **Risultati consultabili (Excel):** `artifacts/PSM_results.xlsx`

> Nota: i file sopra sono copiati dagli artifacts di GitHub Actions e versionati in repo per evitare di dover riscaricare ogni volta lo zip di Actions.

---

## 2) Materiali per relazione/slide
- **Figure (PNG):** cartella `figures/`
  - `figures/psm_score_hist.png`
  - `figures/zxcvbn_score_hist.png`
  - `figures/psm_vs_zxcvbn_scatter.png`
  - `figures/mean_by_category_bars.png`

---

## 3) Metriche globali
- **PSM mean:** 38.53 (median: 35)
- **zxcvbn mean (0–100):** 52.08 (median: 50)
- **Delta mean (PSM − zxcvbn):** -13.55
- **PSM valid_rate:** 15.8%

Interpretazione rapida:
- Il Δ medio negativo indica che **PSM è mediamente più severo** rispetto alla baseline zxcvbn su questo dataset.

---

## 4) Risultati per categoria
Valori riportati come: **mean PSM / mean zxcvbn / valid_rate PSM**

- **random_strong:** 96.95 / 100.00 / 95%
- **short_weak:** 5.00 / 25.00 / 0%
- **patterns:** 13.80 / 12.50 / 0%
- **pop_culture:** 33.40 / 32.50 / 0%
- **personal_tokens:** 37.25 / 75.00 / 0%
- **dictionary_decorated:** 44.80 / 67.50 / 0%

---

## 5) Osservazioni principali (pronte da citare)
- **PSM risulta più severo della baseline** (Δ medio negativo): molti casi ricevono punteggi inferiori rispetto a zxcvbn.
- **random_strong** passa quasi sempre e con score molto alto: comportamento atteso su password realmente robuste.
- **personal_tokens** viene penalizzata molto più di zxcvbn: PSM intercetta e scoraggia password basate su informazioni personali/derivabili dal contesto.
- Le categorie deboli (**short_weak**, **patterns**, **pop_culture**) risultano correttamente bloccate (valid_rate 0%), coerentemente con l’obiettivo del validatore finale.

---

## 6) Come verificare rapidamente (senza rifare la run)
- Per controllare numeri e dettagli: aprire `artifacts/PSM_results.xlsx`
- Per audit completo record-per-record: `artifacts/results.json`
- Per spiegazioni “visive” nella relazione: usare le immagini in `figures/`

---

## 7) Regola di manutenzione
Questa cartella rappresenta una **run di riferimento**:
- se cambiano engine/policy o dataset, rigenerare la run e aggiornare **insieme**:
  - `artifacts/dataset_v1.json`
  - `artifacts/meta.json`
  - `artifacts/results.json`
  - `artifacts/PSM_results.xlsx`
  - le figure in `figures/`
- mantenere **seed=12345** per preservare la riproducibilità (salvo cambi espliciti documentati).
