# docs/02_uml — UML (Use Case + Sequence)

Questa cartella contiene i diagrammi UML utilizzati per descrivere scenari e interazioni del progetto (DS1–DS5).

Aggiornato al **27/12/2025**.

---

## Sottocartelle
- `use-case/`  
  Diagrammi dei casi d’uso (attori e funzionalità).

- `sequence/`  
  Diagrammi di sequenza relativi agli scenari DS1–DS5.

- (eventuale) `class/`  
  Diagramma delle classi (se richiesto dal corso/linee guida).

---

## Documenti principali
- Use Case: `use-case/PSM_Diagramma_CU.pdf`
- Sequence (immagini): `sequence/FileA_ImmaginiDS.pdf`
- Spiegazione Sequence: `sequence/FileB_DS Spiegazione.pdf`

---

## Come usare questi diagrammi
- I diagrammi di sequenza sono la “checklist” funzionale:
  ogni messaggio/scenario deve essere supportato dal codice.
- La verifica pratica si fa con:
  - UI DS1 (`src/web/`)
  - API DS2 (`src/api/`)
  - Experiments DS3–DS5 (`src/experiments/`)
  - Dashboard DS4 (`src/web/experiments.html`)

---

## Stato attuale
Il codice copre gli scenari DS1–DS5:
- UI (registrazione + valutazione live + validazione finale)
- API (evaluate/validate)
- esperimenti (runner + baseline)
- dashboard + export
