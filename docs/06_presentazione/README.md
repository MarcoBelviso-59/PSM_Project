# docs/06_presentazione — Slide e demo

Questa cartella contiene materiale per la **presentazione finale** e la **demo** del progetto.

**Aggiornato al:** **05/01/2026**  


---

## Vincoli (da specifiche)
- La presentazione deve seguire lo schema richiesto dal corso (copertina con logo + gruppo, presentazione incrementale degli step richiesti, implementazione/interfaccia, validazione, conclusioni).
- La demo deve essere **funzionante e ripetibile**, durata massima **1’30”**.

---

## Contenuti attesi in questa cartella
- Slide finali (PPTX e/o PDF), es:
  - `presentazione.pptx`
  - `presentazione.pdf` (export)

- Script demo (checklist con tempi), es:
  - `demo_script.md` (o `demo_script.pdf`)

- (Opzionale) asset per slide:
  - immagini UML, screenshot UI, figure sperimentali

---

## Outline consigliato slide (coerente con specifiche)
1) **Copertina** (logo, progetto, gruppo)
2) **Problema e obiettivo** (cos’è un Password Strength Meter e perché)
3) **Incremento Step 1–2**: UI + API (cosa dimostriamo e come)
4) **Incremento Step 3–5**: Experiments + Dashboard + Export (cosa dimostriamo e come)
5) **Architettura (SSOT)**: Engine riusato da UI/API/Experiments
6) **Implementazione / Interfaccia**: UI DS1 e dashboard DS4
7) **Validazione / Verifica**: test manuali + test automatici + CI
8) **Valutazione sperimentale**: confronto PSM vs zxcvbn (1–2 grafici chiave)
9) **Conclusioni + sviluppi futuri**

Fonti pronte:
- UML: `docs/02_uml/`
- Figure esperimenti: `docs/04_valutazione_sperimentale/figures/`

---

## Script demo (1’30”) — flow minimale consigliato
Obiettivo: far vedere valore + completezza DS1–DS5 senza perdere tempo.

1) **DS1 UI** (30–40s)
   - Inserimento dati utente (token personali)
   - Password debole (pattern/token) → feedback + rifiuto `validateFinal`
   - Password forte → accettazione

2) **DS4 Dashboard** (30–40s)
   - Selezione run
   - 1 metrica chiave (PSM vs zxcvbn) + breakdown per categoria

3) **DS5 Export** (10–20s)
   - Click export (es. ExcelCSV o JSON) e download file

Stop.

---

## Prerequisiti demo (ripetibilità)
- API avviata su `http://localhost:3000` (`/health` OK)
- UI servita da `src/` come root (`python -m http.server 8080`)
- Almeno 1 run presente in `src/experiments/outputs/`
- Se usate la run “ufficiale”: conservarla anche in `docs/04_valutazione_sperimentale/` e/o copiarla in `src/experiments/outputs/` per la dashboard
