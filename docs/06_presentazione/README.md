# docs/06_presentazione — Slide e demo

Questa cartella contiene materiale per la **presentazione finale** e lo **script demo** del progetto.

**Aggiornato al:** **10/01/2026**

---

## Deliverable presenti in repo
- `PSM_presentazione.pdf`  
  Presentazione finale in formato PDF.

Nota su file “pesanti”:
- ℹ️ eventuale **PPTX** e/o **video demo (MP4)** possono non essere versionati in repo per limiti di dimensione.
  La demo resta comunque **ripetibile** seguendo lo script e i comandi sotto.

---

## Vincoli (da specifiche)
- La presentazione deve seguire lo schema richiesto dal corso (copertina con logo + gruppo, presentazione incrementale degli step richiesti, implementazione/interfaccia, validazione, conclusioni).
- La demo deve essere **funzionante e ripetibile**, durata massima **1’30”**.

---

## Fonti pronte (per slide e demo)
- UML: `docs/02_uml/`
- Figure esperimenti: `docs/04_valutazione_sperimentale/figures/`
- Run di riferimento: `docs/04_valutazione_sperimentale/` (artifacts + metrics)

---

## Script demo (1’30”) — flow minimale consigliato
Obiettivo: far vedere valore + completezza DS1–DS5 senza perdere tempo.

### 1) DS1 UI 
- Inserimento dati utente (serve per i token personali).
- Password debole con pattern/token → feedback + rifiuto `validateFinal`.
- Password forte → accettazione.

### 2) DS4 Dashboard 
- Apri dashboard e seleziona una run.
- Mostra 1 metrica chiave (PSM vs zxcvbn) + breakdown per categoria.

### 3) DS5 Export 
- Click export (es. ExcelCSV o JSON) e download file.

Stop.

---

## Prerequisiti demo (ripetibilità)
- API avviata su `http://localhost:3000` (`/health` OK)
- UI servita da `src/` come root (`python -m http.server 8080`)
- Almeno 1 run presente in `src/experiments/outputs/`

---

## Comandi rapidi (demo pronta)
### A) Avvia UI (serve `src/` come root)
~~~bash
cd src
python -m http.server 8080
~~~
Apri:
- UI: `http://localhost:8080/web/`
- Dashboard: `http://localhost:8080/web/experiments.html`

### B) Avvia API
~~~bash
cd src/api
npm install
npm start
~~~
Verifica:
~~~bash
curl.exe -s http://localhost:3000/health
~~~

### C) Genera una run (se `outputs/` è vuota)
~~~bash
cd src/experiments
npm install
npm run run:sample
~~~
