# docs/02_uml/sequence — Diagrammi di sequenza (DS1–DS5)

Questa cartella contiene i diagrammi di sequenza per gli scenari DS1–DS5.

**Aggiornato al:** **10/01/2026**  

---

## File
- `FileA_ImmaginiDS.pdf`  
  Raccolta immagini dei diagrammi di sequenza.

- `FileB_DS Spiegazione.pdf`  
  Spiegazione testuale dei diagrammi e degli obiettivi di ogni scenario.

---

## Come leggere e verificare
Per ogni DS:
- verificare che le chiamate/azioni previste siano presenti nel codice
- verificare il comportamento end-to-end

Mapping pratico:
- DS1 → `src/web/`
- DS2 → `src/api/`
- DS3 → `src/experiments/run.js`
- DS4 → `src/web/experiments.html` + `src/web/experiments.js`
- DS5 → `GET /experiments/:runId/export?...` (API) + pulsanti export in dashboard


