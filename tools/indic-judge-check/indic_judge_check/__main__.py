from __future__ import annotations

import argparse
import json
import sys

from . import io as hio
from .judges import get_judge
from .report import build_report


def main(argv=None) -> int:
    p = argparse.ArgumentParser(prog="indic_judge_check", description=__doc__)
    p.add_argument("--items", required=True, help="items JSONL")
    p.add_argument("--ratings", help="human ratings CSV (item_id,rater_id,label)")
    p.add_argument("--judge", default="mock", help="mock | openai | anthropic")
    p.add_argument("--repeats", type=int, default=3)
    p.add_argument("--n-boot", type=int, default=1000)
    p.add_argument("--seed", type=int, default=0)
    p.add_argument("--out", help="write JSON report here (default: stdout)")
    a = p.parse_args(argv)
    items = hio.load_items(a.items)
    human = hio.load_ratings(a.ratings) if a.ratings else {}
    known = {i.id for i in items}
    unknown = sorted(set(human) - known)
    if unknown:
        print(f"warning: ratings for unknown item ids ignored: {unknown[:5]}", file=sys.stderr)
    rep = build_report(items, human, get_judge(a.judge, a.seed), a.repeats, a.n_boot, a.seed)
    for w in rep["warnings"]:
        print(f"warning: {w}", file=sys.stderr)
    text = json.dumps(rep, indent=2, ensure_ascii=False)
    if a.out:
        with open(a.out, "w", encoding="utf-8") as f:
            f.write(text + "\n")
    else:
        print(text)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
