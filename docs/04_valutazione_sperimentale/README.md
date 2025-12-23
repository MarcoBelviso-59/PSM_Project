# Valutazione sperimentale (PSM_Project) — Metodologia, baseline, metriche, riproducibilità

Questa cartella documenta come valutiamo sperimentalmente il Password Strength Meter (PSM), in modo che i risultati siano ripetibili (stessi input → stessi output a parità di seed), tracciabili (dataset, parametri, versione, runId) e riusabili nella relazione e nella presentazione finale.

Aggiornato al 23/12/2025.

## Presupposto (single source of truth)
Tutta la logica di scoring/pattern/policy vive nell’engine:
- src/engine/psmEngine.js

La sperimentazione NON deve “aggiustare” manualmente risultati o soglie: deve misurare ciò che l’engine produce e confrontarlo con una baseline.

## Obiettivi sperimentali
1) Verificare che lo score del PSM sia coerente con intuizioni di sicurezza:
   - password ovvie/strutturate → score basso
   - password lunghe e varie → score alto

2) Verificare che la presenza di pattern (sequenze, ripetizioni, small-set, token personali) venga:
   - rilevata in patterns
   - riflessa in penalità/limitazioni di score
   - spiegata da suggerimenti coerenti (generateFeedback)

3) Confrontare il comportamento del PSM con una baseline zxcvbn:
   - dove concordiamo (buon segnale)
   - dove divergemmo (da discutere e motivare nella relazione)

## Baseline
La baseline usata è:
- src/experiments/baselines/zxcvbn.js

Il wrapper normalizza il punteggio zxcvbn (0..4) in 0..100 per confronto diretto col PSM.

## Dataset: principi e formato

### Principi
- Niente dati reali o sensibili: usare dataset sintetici o pubblici senza PII.
- Dataset ripetibili: usare seed quando si generano dataset sintetici.
- Categorie che coprono scenari rilevanti:
  - sequenze alfabetiche/numeriche
  - pattern tastiera
  - ripetizioni e blocchi ripetuti
  - small-set (mesi, giorni, colori, città, nomi, animali, squadre, ecc.)
  - password “random” forti (alta entropia)
  - password lunghe con token personali (nome/cognome/parti email)

### Formato
I dataset sono array JSON di record (vedi src/experiments/datasets/sample.json). Ogni record può contenere:
- id: identificatore
- category: etichetta categoria
- password: stringa password
- personalTokens: array opzionale di token personali da passare all’engine

Esempio (formato dataset):

    [
      { "id": "1", "category": "random_strong", "password": "V9#kL2p@Qw7!zR3", "personalTokens": [] },
      { "id": "2", "category": "contains_name", "password": "MarioRossi2026!", "personalTokens": ["mario","rossi"] }
    ]

## Procedura sperimentale (ripetibile)

### 1) Generazione dataset (consigliata)
Genera un dataset sintetico e ripetibile:

    cd src/experiments
    npm install
    node tools/generate_dataset.js datasets/dataset_v1.json 20 --seed 12345

Dove:
- datasets/dataset_v1.json = file output
- 20 = quantità per categoria (aumenta per più significatività)
- --seed 12345 = ripetibilità

### 2) Esecuzione run
Esegui il runner confrontando PSM vs baseline:

    node run.js --in datasets/dataset_v1.json --out outputs/run_dataset_v1_local --redact-password --seed 12345

Parametri chiave:
- --seed: fondamentale per confronti nel tempo
- --redact-password: consigliato per evitare che le password finiscano in output/relazione

### 3) Output del run (fonte ufficiale dei risultati)
Ogni run produce una cartella:
- src/experiments/outputs/<runId>/

File tipici:
- meta.json (tracciabilità: timestamp, seed, conteggi, note/aggregati)
- results.json (raw, completo)
- results.csv (separatore ,)
- results.tsv (separatore tab)
- results_excel.csv (separatore ;, comodo per Excel IT)

Nota importante: questa cartella docs/04_valutazione_sperimentale dovrebbe contenere solo materiali “di lettura” (metodologia, grafici, sintesi), mentre i dati grezzi stanno in src/experiments/outputs/.

## Metriche e letture consigliate (non solo “media score”)
Per evitare conclusioni fuorvianti, non basta riportare una media.

### A) Distribuzione dello score per categoria
- istogrammi o boxplot per category
- obiettivo: categorie “deboli” concentrate su score bassi, categorie “strong” su score alti

### B) Coerenza pattern → penalità
Per ogni categoria “pattern-based” verificare:
- percentuale record in cui il pattern corretto appare in patterns
- score medio/mediano più basso rispetto alle categorie “strong”
- suggerimenti coerenti con pattern (qualità UX)

### C) Confronto PSM vs baseline (zxcvbn)
Definire:
- delta = score_psm - score_baseline

Analizzare:
- delta medio per categoria
- outlier (delta molto alto o molto basso) e motivazione

### D) Casi “critici” (da discutere nella relazione)
- password corte ma multi-categoria (rischio sovrastima)
- sequenze mascherate (rischio sovrastima)
- password lunghe con token personali (trade-off: lunghezza vs penalità personale)
- small-set + anno (pattern prevedibile)

## Cosa deve finire in questa cartella (deliverable “di docs”)
Per chiudere la valutazione sperimentale, qui dentro dovreste includere:
1) Metodologia (questo README, eventualmente esteso)
2) Sintesi risultati (tabelle e/o grafici)
3) Discussione:
   - dove PSM concorda con baseline
   - dove diverge e perché (scelte progettuali, pattern detection, policy)
4) Minacce alla validità (oneste e concise):
   - dataset sintetico (generalizzazione limitata)
   - baseline non è “verità assoluta”
   - dimensione dataset e scelta categorie
   - dipendenza da seed/parametri (ma tracciati)

Suggerimento struttura file in questa cartella:
- results_summary.md (testo + tabelle principali)
- figures/ (grafici esportati)
- notes.md (note su outlier o casi interessanti)

## Criterio di completamento (quando possiamo dire “valutazione sperimentale ok”)
La valutazione è “chiusa” quando:
- esiste almeno 1 dataset salvato/versionato con seed e parametri
- esiste almeno 1 run completo in src/experiments/outputs/<runId>/
- sono presenti:
  - distribuzioni score per categoria
  - confronto con baseline (anche su subset significativo)
  - 5–10 esempi commentati di casi interessanti (pattern/outlier)
- i risultati sono riproducibili rieseguendo i comandi con lo stesso seed
