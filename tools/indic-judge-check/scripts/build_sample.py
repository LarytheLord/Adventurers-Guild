"""Build data/sample_items.jsonl from the Aya Dataset (Apache-2.0).

Needs network and the `datasets` package, so it is NOT run in tests.
  pip install datasets
  python scripts/build_sample.py --revision <commit sha> --out data/sample_items.jsonl
Or from a local JSONL export of the split (rows in native order):
  python scripts/build_sample.py --input aya_train.jsonl --revision <sha> --out ...
`--revision` is mandatory so that cited row indices stay reproducible.
"""
import argparse
import json
import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
from indic_judge_check import sample  # noqa: E402


def main():
    p = argparse.ArgumentParser()
    p.add_argument("--revision", required=True)
    p.add_argument("--input", help="local JSONL of the split instead of downloading")
    p.add_argument("--dataset", default="CohereLabs/aya_dataset")
    p.add_argument("--split", default="train")
    p.add_argument("--per-language", type=int, default=10)
    p.add_argument("--seed", type=int, default=20240601)
    p.add_argument("--out", required=True)
    a = p.parse_args()
    if a.input:
        with open(a.input, encoding="utf-8") as f:
            rows = [json.loads(l) for l in f if l.strip()]
    else:
        from datasets import load_dataset
        rows = list(load_dataset(a.dataset, split=a.split, revision=a.revision))
    sel = sample.select_rows(rows, a.per_language, a.seed)
    items = sample.build_items(sel, a.dataset, a.revision, a.split)
    with open(a.out, "w", encoding="utf-8") as f:
        for it in items:
            f.write(json.dumps(it, ensure_ascii=False) + "\n")
    print(f"wrote {len(items)} items to {a.out}")


if __name__ == "__main__":
    main()
