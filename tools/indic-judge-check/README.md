# indic-judge-check

A small harness that tells you whether an LLM judge can be trusted on Hindi and
Gujarati (or any language you label) before you use it to score anything.
Python 3.11, standard library only, Apache-2.0. Tests need no network.

## What it measures (per language)

| Metric | Meaning |
|---|---|
| Human-human kappa | Cohen's kappa between raters. With more than two raters, rater pairs are pooled per item. |
| Human-human alpha | Krippendorff's alpha, nominal metric, handles missing ratings; items with fewer than 2 ratings are dropped. |
| Judge-human | Kappa and raw agreement between the judge verdict and the unique plurality human label. Items where humans tie are excluded. |
| Position-bias rate | Pairwise items only. Share of items whose canonical verdict (A / B / tie) changes when the two responses swap order. 0 is ideal. |
| Self-consistency flip rate | Share of items where `--repeats` identical queries (same order) did not all agree. Needs repeats >= 2. |

Every value has a 95% percentile bootstrap CI (resampling items, `--n-boot`,
seeded). Undefined values (for example kappa when everyone uses one label)
are reported as `null`.

## Usage

    python -m indic_judge_check --items data/sample_items.jsonl \
        --ratings my_private_ratings.csv --judge mock --repeats 3 --out report.json

Items JSONL: `id`, `language`, `prompt`, and either `response_a` + `response_b`
(pairwise; labels `A`, `B`, `tie`) or `response` (single; any label set, the
built-in adapters use `good` / `bad`). Ratings CSV: `item_id,rater_id,label`.
Use the same label vocabulary for humans and the judge.

Judges: `mock` (default, deterministic, no network) and optional adapters
`openai` (OpenAI-compatible; `INDIC_JUDGE_OPENAI_API_KEY`,
`INDIC_JUDGE_OPENAI_MODEL`, optional `INDIC_JUDGE_OPENAI_BASE_URL`) and
`anthropic` (`INDIC_JUDGE_ANTHROPIC_API_KEY`, `INDIC_JUDGE_ANTHROPIC_MODEL`).
They are selected only when named, need the env vars, and are never exercised by
the tests. To add your own, implement `judge_pair(item, swap, run)` and
`judge_single(item, run)` in `judges.py`.

Tests: `python -m pytest` from this directory.

## Sample data

`data/sample_items.jsonl` is meant to hold 20 items (10 Hindi, 10 Gujarati)
drawn deterministically (seeded) from the Aya Dataset (CohereLabs/aya_dataset,
Apache-2.0), each carrying its split, pinned revision and row index.
Attribution: Singh et al., "Aya Dataset", 2024. It contains prompts and
reference completions only, no human labels. The items are single-response, so
the shipped sample exercises human-human, judge-human and self-consistency but
not position bias; for that you need pairwise items of your own.

Generate with `scripts/build_sample.py` (needs network and `datasets`). If the
file is absent the sample test skips.

## Limits

- Small n. With 10 items per language the CIs will be very wide; treat results
  as a smoke test, not a certification.
- Nominal metrics only. Ordinal scores (1-5) are treated as unordered labels.
- Judge-human uses plurality labels and drops ties; this can inflate agreement.
- Kappa and alpha depend on label prevalence; read them with raw agreement.
- Position bias is measured with one swap per item; self-consistency uses the
  judge's own sampling settings, so a temperature-0 judge may look more
  consistent than it is in production.
- Pooled pairwise kappa for 3+ raters is not a standard published estimator;
  use alpha as the primary multi-rater figure.
- The mock judge only validates the plumbing; its numbers mean nothing.
- Aya prompts are general instructions, not your domain. Results on them do
  not transfer automatically to your task.
- This tool is a self-check aid. It is not an audit, and Guild is not a CERT-In
  empanelled auditor.
