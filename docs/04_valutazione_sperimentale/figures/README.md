# Valutazione sperimentale (dataset_v1, seed=12345)

Questa sezione riassume i risultati dell’esperimento ufficiale eseguito tramite GitHub Actions usando `dataset_v1` con seed fisso `12345` (run riproducibile).
I punteggi confrontano il motore PSM con la baseline `zxcvbn` (normalizzata 0–100).

## Figure

### 1) Distribuzione score PSM
![PSM histogram](figures/psm_score_hist.png)

Osservazione: la distribuzione PSM è sbilanciata verso valori medio-bassi; il motore è deliberatamente più severo su pattern e token “prevedibili”.

### 2) Distribuzione score zxcvbn
![zxcvbn histogram](figures/zxcvbn_score_hist.png)

Osservazione: zxcvbn tende ad assegnare punteggi più alti su alcune categorie che PSM penalizza esplicitamente.

### 3) Scatter: PSM vs zxcvbn
![PSM vs zxcvbn scatter](figures/psm_vs_zxcvbn_scatter.png)

Interpretazione: i punti sotto la diagonale indicano casi in cui PSM è più severo di zxcvbn. Sono evidenti casi in cui zxcvbn valuta molto alto ma PSM riduce lo score per pattern/contesto (es. token personali).

### 4) Media per categoria (PSM vs zxcvbn)
![Mean by category](figures/mean_by_category_bars.png)

Risultato chiave: `random strong` è alta per entrambi; su `personal tokens` e `dictionary decorated` PSM assegna punteggi sensibilmente inferiori rispetto a zxcvbn, coerentemente con l’obiettivo del progetto.


