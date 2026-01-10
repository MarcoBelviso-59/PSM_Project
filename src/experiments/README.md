# PSM_Project — Experiments (DS3–DS5)

Questa cartella contiene gli strumenti per:
- generare dataset di prova (ripetibili via seed)
- eseguire esperimenti confrontando **PSM Engine** con una baseline (**zxcvbn**)
- salvare risultati su file (raw + formati tabellari)
- rendere i risultati consultabili/esportabili tramite l’API (`src/api`) che legge da `outputs/`
- alimentare la **Dashboard DS4** (`src/web/experiments.html`) con lista run, dettaglio e statistiche

Aggiornato al **10/01/2025**.

---

## Requisiti
- Node.js **>= 18** (consigliato 20)
- npm

---

## Struttura
- `run.js` — runner esperimenti (PSM vs baseline) + salvataggio output
- `datasets/` — dataset di esempio (`sample.json`) e dataset generati
- `tools/generate_dataset.js` — generatore dataset (supporta seed)
- `baselines/zxcvbn.js` — wrapper baseline (normalizza punteggio in 0..100)
- `outputs/` — cartella dove finiscono i run (ogni run in una sottocartella)

---

## Install
~~~bash
cd src/experiments
npm install
~~~

---

## Dataset: formato atteso
Un dataset è un array JSON di record, ciascuno con:
- `id`: stringa/numero (identificatore)
- `category`: etichetta categoria (serve per aggregazioni e confronto)
- `password`: stringa password (può essere oscurata in output)
- `personalTokens`: array opzionale di token personali da passare all’engine

Esempio:
~~~json
[
  {
    "id": "1",
    "category": "random_strong",
    "password": "V9#kL2p@Qw7!zR3",
    "personalTokens": []
  },
  {
    "id": "2",
    "category": "contains_name",
    "password": "MarioRossi2026!",
    "personalTokens": ["mario", "rossi"]
  }
]
~~~

---

## Generare un dataset (ripetibile)
Il generatore crea un dataset sintetico con categorie utili per valutare pattern e regressioni.

~~~bash
node tools/generate_dataset.js datasets/dataset_v1.json 20 --seed 12345
~~~

Dove:
- `datasets/dataset_v1.json` = file output
- `20` = quantità per categoria (aumenta se vuoi più significatività)
- `--seed 12345` = ripetibilità (fondamentale per confrontare run nel tempo)

---

## Eseguire un esperimento (runner)
Esegui un run passando input e cartella output.

~~~bash
node run.js --in datasets/dataset_v1.json --out outputs/run_dataset_v1_local --redact-password --seed 12345
~~~

Parametri principali:
- `--in <path>`: dataset input
- `--out <path>`: cartella output (consigliato sotto `outputs/`)
- `--redact-password`: oscura le password nei risultati (consigliato)
- `--seed <n>`: memorizza il seed in `meta.json` (tracciabilità)

Nota importante:
- il flag corretto è **`--redact-password`** (non `--redact password`).

Suggerimento pratico:
- usa un runId descrittivo (es. `run_2025-12-27_seed12345_v1`) così è facile confrontare.

---

## Output generato
All’interno di `outputs/<runId>/` trovi:

- `meta.json`
  - timestamp, seed, conteggi, eventuali aggregati di base
- `results.json`
  - risultati completi per record (PSM + baseline + differenze)
- `results.csv`
  - tabellare con separatore `,`
- `results.tsv`
  - tabellare con separatore tab
- `results_excel.csv`
  - tabellare con separatore `;` (più comodo per Excel in locale IT)

> Se usi `--redact-password`, i campi password saranno mascherati (es. `***len:12***`) nei risultati.

---

## Baseline (zxcvbn)
La baseline è incapsulata in:
- `baselines/zxcvbn.js`

Scopo:
- avere un confronto “esterno” e relativamente standard
- confrontare trend PSM vs baseline in modo difendibile

Il wrapper normalizza il punteggio zxcvbn (0..4) in un range 0..100.

---

## Integrazione con API (DS4/DS5 lato backend)
Se avvii l’API (`src/api`), puoi consultare ed esportare i run generati qui.

L’API legge i run da:
- `src/experiments/outputs/<runId>/`

Endpoint utili:
- `GET /experiments` → lista run disponibili
- `GET /experiments/:runId?limit=20` → dettaglio run + preview + aggregati
- `GET /experiments/:runId/export?format=csv|tsv|excelcsv|json` → download

> Nota PowerShell (Windows): usare `curl.exe` (non l’alias `Invoke-WebRequest`).

Esempio export:
~~~bash
curl.exe -s "http://localhost:3000/experiments/run_dataset_v1_local/export?format=excelcsv" -o results_excel.csv
~~~

---

## Dashboard DS4 (front-end)
La dashboard è in:
- `src/web/experiments.html`
- `src/web/experiments.js`

La dashboard:
- legge la lista run da `GET /experiments`
- carica dettaglio/preview con `GET /experiments/:runId?limit=N`
- mostra statistiche (PSM vs zxcvbn) e breakdown per categoria
- offre pulsanti export (JSON/CSV/TSV/ExcelCSV)

Prerequisiti:
1) avvia l’API
2) assicurati di avere almeno 1 run in `src/experiments/outputs/`

---

## Esempio end-to-end (consigliato)
1) Genera dataset
~~~bash
cd src/experiments
npm install
node tools/generate_dataset.js datasets/dataset_v1.json 20 --seed 12345
~~~

2) Esegui run
~~~bash
node run.js --in datasets/dataset_v1.json --out outputs/run_dataset_v1_local --redact-password --seed 12345
~~~

3) Avvia API
~~~bash
cd ../api
npm install
npm start
~~~

4) Apri Dashboard (servendo `src/` come root)
~~~bash
cd ..
python -m http.server 8080
~~~
Apri:
- `http://localhost:8080/web/experiments.html`

---

## Troubleshooting
- **Non vedo run via API o dashboard**:
  - verifica che `src/experiments/outputs/<runId>/` esista davvero e contenga `meta.json` e `results.json`
  - verifica che l’API sia avviata su `http://localhost:3000` e che `/health` risponda
- **Export non scarica**:
  - controlla che il runId esista e prova `format=json` per vedere se la risposta è valida
- **File CSV “strano” in Excel**:
  - usa `format=excelcsv` (separatore `;`)
- **Run confrontabili nel tempo**:
  - usa sempre `--seed` e conserva il dataset generato insieme al runId (o versionalo)

---

## Note di progetto (coerenza)
- L’engine in `src/engine/psmEngine.js` è la single source of truth.
- Gli esperimenti servono a:
  - scoprire regressioni (score che cambia “troppo” su categorie note)
  - confrontare trend PSM vs baseline
  - produrre evidenze per relazione/presentazione (grafici e tabelle a partire dagli output)
