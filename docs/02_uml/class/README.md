# docs/02_uml/class — Diagramma delle classi

Questa cartella contiene il **diagramma delle classi** del progetto PSM, aggiornato per riflettere l’architettura modulare e il principio **Single Source of Truth (SSOT)**.

**Aggiornato al:** **10/01/2026**  


---

## File
- `PSM_diagramma_classi.pdf`  
  Diagramma delle classi (versione “da consegna”).

---

## Cosa rappresenta (in breve)
Il diagramma mette in evidenza le classi/componenti “logiche” che spiegano l’implementazione:

- **Engine (SSOT)**  
  Responsabilità: scoring, pattern detection, feedback, policy finale.  
  Riferimento codice: `src/engine/psmEngine.js`

- **Web UI (DS1)**  
  Responsabilità: raccolta dati utente, costruzione token personali, valutazione live, submit finale.  
  Riferimento codice: `src/web/app.js`, `src/web/index.html`

- **API (DS2)**  
  Responsabilità: validazione input, composizione token personali (se presenti), delega all’engine, risposta JSON.  
  Riferimento codice: `src/api/server.js`

- **Experiments (DS3–DS5)**  
  Responsabilità: generazione dataset, runner PSM vs baseline, persistenza risultati, export tabellari.  
  Riferimento codice: `src/experiments/run.js`, `src/experiments/tools/generate_dataset.js`, `src/experiments/baselines/zxcvbn.js`

- **Dashboard (DS4)**  
  Responsabilità: consultazione run via API, statistiche, pulsanti export.  
  Riferimento codice: `src/web/experiments.html`, `src/web/experiments.js`

---

