# docs/01_analisi — Analisi e bozza progetto

Questa cartella raccoglie materiale di analisi, bozza progettuale e note di contesto.

Aggiornato al *10/01/2025**.

---

## Contenuto
- `Bozza_Progetto_PSM.pdf`  
  Documento di bozza con scelte iniziali e struttura proposta.

- (eventuali altri PDF)  
  Appunti di lezione, note e materiale di supporto per motivare scelte implementative.

---

## Come usare questa cartella
- Per ricostruire le motivazioni dietro:
  - architettura modulare (Engine separato da UI/API)
  - policy di scoring e cap/penalità
  - modalità esperimenti e confronto con baseline

---

## Stato attuale
L’implementazione corrente segue il principio:
- **Engine** come single source of truth (`src/engine/psmEngine.js`)
- UI (DS1) e API (DS2) non duplicano regole: riusano l’engine
- esperimenti (DS3–DS5) producono output consultabili e esportabili
- dashboard (DS4) mostra risultati e download export

