# docs/06_presentazione — Slide e demo

Questa cartella contiene materiale per la presentazione finale e la demo del progetto.

Aggiornato al **27/12/2025**.

---

## Contenuti attesi
- Slide (PPT/PDF) con:
  - problema e obiettivo
  - architettura (UI / Engine / API / Experiments / Dashboard)
  - demo flow (DS1 e DS4)
  - risultati sperimentali (PSM vs baseline)
  - conclusioni

- Script demo (checklist in ordine):
  1) aprire UI DS1 e mostrare valutazione live
  2) mostrare validateFinal (accetta/rifiuta)
  3) avviare/mostrare un run esperimenti (o usare una run già presente)
  4) aprire dashboard DS4 e mostrare statistiche + export

---

## Nota
La demo deve essere ripetibile:
- usare dataset/seed noti
- avere almeno 1 run in `src/experiments/outputs/`
- API avviata su `localhost:3000`
- UI servita con `src/` come root (es. `python -m http.server 8080`)

