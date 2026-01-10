# PSM_Project — Documentazione (`docs/`)

Questa cartella contiene tutta la documentazione del progetto (specifiche, analisi, UML, architettura, valutazione sperimentale, relazione, presentazione e riferimenti).

**Aggiornato al:** **10/01/2026**

---

## Struttura
- `00_specs/`  
  Specifiche ufficiali del progetto e linee guida di consegna.

- `01_analisi/`  
  Bozza/analisi iniziale, scelte progettuali, note di contesto.

- `02_uml/`  
  Diagrammi UML:
  - use case
  - sequence (DS1–DS5)
  - class diagram (in `02_uml/class/`)

- `03_architettura/`  
  Materiale architetturale: componenti, responsabilità, dipendenze e contratti.

- `04_valutazione_sperimentale/`  
  Run “di riferimento” (dataset/seed/risultati/figure) pronta da citare in relazione e slide.

- `05_relazione/`  
  Relazione tecnica finale (PDF).

- `06_presentazione/`  
  Presentazione finale (PDF) + script/istruzioni demo.

- `99_riferimenti/`  
  Paper e riferimenti (versionati in repo) usati in relazione/presentazione.

---

## Documenti principali (quick links)
- Specifiche richieste: `00_specs/Specifiche_Progetto_Richieste.pdf`
- Linee guida: `00_specs/Linee_Guida_PSM_Project.pdf`
- Use Case: `02_uml/use-case/PSM_Diagramma_CU.pdf`
- Sequence DS1–DS5: `02_uml/sequence/FileA_ImmaginiDS.pdf`
- Spiegazione DS: `02_uml/sequence/FileB_DS Spiegazione.pdf`
- Class Diagram: `02_uml/class/PSM_diagramma_classi.pdf`
- Bozza/analisi iniziale: `01_analisi/Bozza_Progetto_PSM.pdf`
- Run di riferimento: `04_valutazione_sperimentale/` (artifacts + figures)
- Relazione tecnica: `05_relazione/Relazione_tecnica_PSM.pdf`
- Presentazione (PDF): `06_presentazione/PSM_presentazione.pdf`
- Paper: `99_riferimenti/`

---

## Nota operativa (coerenza)
La documentazione serve a dimostrare coerenza tra:
- requisiti / specifiche
- implementazione (UI + API + Engine + Experiments + Dashboard)
- evidenze sperimentali (confronto con baseline e export)
- relazione e demo

Nota su file “pesanti”:
- ℹ️ eventuali asset addizionali (PPTX/MP4) possono non essere inclusi in repo per limiti di dimensione;  
  in tal caso, lo script demo e i comandi di esecuzione restano in `06_presentazione/README.md`.
