# docs/00_specs — Specifiche e linee guida

Questa cartella contiene i documenti “ufficiali” che definiscono requisiti e vincoli di consegna del progetto.

**Aggiornato al:** **10/01/2026**

---

## Contenuto
- `Specifiche_Progetto_Richieste.pdf`  
  Elenca deliverable richiesti, struttura obbligatoria della presentazione/relazione, e vincoli (incluso tempo demo).

- `Linee_Guida_PSM_Project.pdf`  
  Linee guida su struttura repo, qualità del deliverable, requisiti (anche non funzionali), sperimentazione, validazione/verifica.

---

## Come usare questa cartella
1) Leggere prima le **specifiche** (cosa è obbligatorio e come verrà valutato).
2) Leggere poi le **linee guida** (come presentare, argomentare e dimostrare).
3) Usare questi documenti come checklist durante:
   - revisione finale della repo (coerenza e riproducibilità)
   - preparazione presentazione e demo
   - correzioni ultime su relazione e riferimenti

---

## Stato attuale (coerente con la repo)
- ✅ Implementazione DS1–DS5 completata (UI + Engine + API + Experiments + Dashboard + Export).
- ✅ Docker/compose presenti per demo ripetibile.
- ✅ Test automatici e CI presenti (Jest + workflow).
- ✅ UML presente (use case + sequence + class diagram).
- ✅ Relazione tecnica presente: `docs/05_relazione/Relazione_tecnica_PSM.pdf`.
- ✅ Presentazione (PDF) presente: `docs/06_presentazione/PSM_presentazione.pdf`.
- ✅ Riferimenti/paper versionati: `docs/99_riferimenti/`.

Nota su file “pesanti”:
- ℹ️ eventuali **slide PPTX** e/o **video demo (MP4)** possono non essere inclusi in repo per limiti di dimensione.  
  La demo resta comunque ripetibile seguendo lo script e i comandi in `docs/06_presentazione/README.md`.
