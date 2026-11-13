"""Loading items (JSONL) and human ratings (CSV)."""
from __future__ import annotations

import csv
import json
from dataclasses import dataclass
from pathlib import Path
from typing import Optional


@dataclass(frozen=True)
class Item:
    id: str
    language: str
    prompt: str
    response_a: Optional[str] = None
    response_b: Optional[str] = None
    response: Optional[str] = None

    @property
    def is_pairwise(self) -> bool:
        return self.response_a is not None and self.response_b is not None


def load_items(path) -> list[Item]:
    items: list[Item] = []
    seen: set[str] = set()
    with open(path, encoding="utf-8") as f:
        for lineno, line in enumerate(f, 1):
            if not line.strip():
                continue
            try:
                row = json.loads(line)
            except json.JSONDecodeError as e:
                raise ValueError(f"{path}:{lineno}: invalid JSON: {e}") from e
            for key in ("id", "language", "prompt"):
                if not row.get(key):
                    raise ValueError(f"{path}:{lineno}: missing '{key}'")
            pair = row.get("response_a") is not None and row.get("response_b") is not None
            single = row.get("response") is not None
            if pair == single:
                raise ValueError(
                    f"{path}:{lineno}: need either response_a+response_b or response"
                )
            rid = str(row["id"])
            if rid in seen:
                raise ValueError(f"{path}:{lineno}: duplicate id {rid!r}")
            seen.add(rid)
            items.append(
                Item(
                    id=rid,
                    language=str(row["language"]),
                    prompt=row["prompt"],
                    response_a=row.get("response_a"),
                    response_b=row.get("response_b"),
                    response=row.get("response"),
                )
            )
    return items


def load_ratings(path) -> dict[str, dict[str, str]]:
    """CSV with columns item_id, rater_id, label -> {item_id: {rater_id: label}}."""
    out: dict[str, dict[str, str]] = {}
    with open(path, encoding="utf-8", newline="") as f:
        reader = csv.DictReader(f)
        missing = {"item_id", "rater_id", "label"} - set(reader.fieldnames or [])
        if missing:
            raise ValueError(f"{path}: missing columns {sorted(missing)}")
        for lineno, row in enumerate(reader, 2):
            iid, rid, label = row["item_id"], row["rater_id"], row["label"].strip()
            if not iid or not rid or not label:
                raise ValueError(f"{path}:{lineno}: empty field")
            if rid in out.setdefault(iid, {}):
                raise ValueError(f"{path}:{lineno}: duplicate rating {iid}/{rid}")
            out[iid][rid] = label
    return out
