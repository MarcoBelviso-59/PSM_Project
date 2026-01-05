# docs/02_uml — UML (Use Case + Sequence + Class)

Questa cartella contiene i diagrammi UML utilizzati per descrivere scenari, componenti e interazioni del progetto (DS1–DS5).

**Aggiornato al:** **05/01/2026**  
**Scadenza progetto (proroga):** **10/01/2026**

---

## Sottocartelle
- `use-case/`  
  Diagramma dei casi d’uso (attori e funzionalità).

- `sequence/`  
  Diagrammi di sequenza relativi agli scenari DS1–DS5 + spiegazione.

- `class/`  
  **Diagramma delle classi** coerente con l’implementazione corrente (Engine + UI + API + Experiments + Export).

---

## Documenti principali
- Use Case: `use-case/PSM_Diagramma_CU.pdf`
- Sequence (immagini): `sequence/FileA_ImmaginiDS.pdf`
- Spiegazione Sequence: `sequence/FileB_DS Spiegazione.pdf`
- Class Diagram: `class/PSM_diagramma_classi.pdf`

---

## Come usare questi diagrammi (per verifica e relazione)
- I diagrammi di sequenza sono la “checklist” funzionale: ogni messaggio/scenario deve essere supportato dal codice.
- Il diagramma delle classi descrive le responsabilità principali e i contratti usati in implementazione.

Mapping pratico (UML → codice):
- **DS1** (UI live + submit) → `src/web/app.js` (chiama `evaluate/generateFeedback/validateFinal`)
- **DS2** (API evaluate/validate) → `src/api/server.js`
- **DS3** (runner esperimenti) → `src/experiments/run.js`
- **DS4** (dashboard) → `src/web/experiments.html` + `src/web/experiments.js` + endpoint API `/experiments`
- **DS5** (export) → endpoint API `/experiments/:runId/export?format=...`

---

## Stato attuale
- ✅ UML presente e coerente con la repo:
  - Use Case + Sequence DS1–DS5
  - Class Diagram in `docs/02_uml/class/`

Se modificate contratti o responsabilità (es. output API, struttura `results.json`, o funzioni engine),
aggiornate **prima** il diagramma classi e **poi** riflettete i cambi in relazione/presentazione.
