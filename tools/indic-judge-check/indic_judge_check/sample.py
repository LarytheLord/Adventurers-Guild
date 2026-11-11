"""Deterministic selection of sample items from Aya Dataset rows (Apache-2.0)."""
from __future__ import annotations

import random

LANGS = {"hin": "hi", "guj": "gu"}
LICENSE = "Apache-2.0"


def select_rows(rows, per_language: int, seed: int, min_chars: int = 20, max_chars: int = 600):
    """Pick `per_language` rows per language. Returns [(row_index, row)] sorted by
    language then index. `row_index` is the position in `rows`, so pass the full
    split in its native order."""
    chosen = []
    for code in LANGS:
        cand = [
            i for i, r in enumerate(rows)
            if r.get("language_code") == code
            and min_chars <= len(r["inputs"]) <= max_chars
            and min_chars <= len(r["targets"]) <= max_chars
        ]
        if len(cand) < per_language:
            raise ValueError(f"only {len(cand)} eligible rows for {code}, need {per_language}")
        pick = sorted(random.Random(f"{seed}:{code}").sample(cand, per_language))
        chosen.extend((i, rows[i]) for i in pick)
    return chosen


def build_items(selected, source: str, revision: str, split: str):
    items = []
    for i, r in selected:
        lang = LANGS[r["language_code"]]
        items.append({
            "id": f"aya-{lang}-{i}",
            "language": lang,
            "prompt": r["inputs"],
            "response": r["targets"],
            "source": {"dataset": source, "split": split, "revision": revision,
                       "row_index": i, "license": LICENSE},
        })
    return items
