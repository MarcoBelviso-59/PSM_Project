# Risultati esperimento ufficiale (dataset_v1, seed=12345)

## Setup
- Dataset: `datasets/dataset_v1.json`
- Record totali: 120 (6 categorie × 20)
- Seed: 12345 (run riproducibile)
- Output: `outputs/run_dataset_v1_ci/`

## Metriche globali
- PSM mean: 38.53 (median: 35)
- zxcvbn mean (0–100): 52.08 (median: 50)
- Delta mean (PSM - zxcvbn): -13.55
- PSM valid_rate: 15.8%

## Risultati per categoria (mean PSM / mean zxcvbn / valid_rate PSM)
- random_strong: 96.95 / 100.00 / 95%
- short_weak: 5.00 / 25.00 / 0%
- patterns: 13.80 / 12.50 / 0%
- pop_culture: 33.40 / 32.50 / 0%
- personal_tokens: 37.25 / 75.00 / 0%
- dictionary_decorated: 44.80 / 67.50 / 0%

## Osservazioni
- PSM risulta più severo della baseline (Δ medio negativo).
- random_strong passa quasi sempre, con score alto (comportamento atteso).
- personal_tokens viene penalizzata molto più di zxcvbn: PSM intercetta e punisce fortemente token personali / pattern associati.
- Le categorie deboli (short_weak, patterns, pop_culture) risultano correttamente bloccate (valid_rate 0%).

  
