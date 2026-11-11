"""Sample-builder and shipped-sample checks."""
import json
from pathlib import Path

import pytest

from indic_judge_check import sample

ROOT = Path(__file__).resolve().parents[1]


def fake_rows():
    rows = []
    for lang_name, code in (("Hindi", "hin"), ("Gujarati", "guj")):
        for i in range(40):
            rows.append({"inputs": f"fixture prompt {code} {i}",
                         "targets": f"fixture answer {code} {i}",
                         "language": lang_name, "language_code": code,
                         "annotation_type": "original-annotations",
                         "user_id": "u"})
    return rows


def test_select_is_deterministic_and_balanced():
    a = sample.select_rows(fake_rows(), per_language=10, seed=11)
    b = sample.select_rows(fake_rows(), per_language=10, seed=11)
    assert a == b
    assert len(a) == 20
    assert sum(r["language_code"] == "hin" for _, r in a) == 10


def test_build_items_records_source_row_and_license():
    sel = sample.select_rows(fake_rows(), per_language=2, seed=1)
    items = sample.build_items(sel, source="CohereLabs/aya_dataset", revision="REV",
                               split="train")
    for it in items:
        assert it["source"]["row_index"] >= 0
        assert it["source"]["license"] == "Apache-2.0"
        assert it["source"]["revision"] == "REV"
        assert "label" not in it and "human" not in json.dumps(it).lower()
        assert it["language"] in ("hi", "gu")


def test_select_fails_loudly_when_too_few_rows():
    with pytest.raises(ValueError):
        sample.select_rows(fake_rows()[:5], per_language=10, seed=1)


def test_shipped_sample_if_present_is_valid():
    p = ROOT / "data" / "sample_items.jsonl"
    if not p.exists():
        pytest.skip("sample not generated yet (see README, 'Sample data')")
    rows = [json.loads(l) for l in p.read_text(encoding="utf-8").splitlines() if l.strip()]
    assert len(rows) == 20
    assert {r["language"] for r in rows} == {"hi", "gu"}
    for r in rows:
        assert r["source"]["dataset"] == "CohereLabs/aya_dataset"
        assert r["source"]["license"] == "Apache-2.0"
        assert "row_index" in r["source"] and r["source"]["revision"]


def test_unknown_language_code_lists_codes_present():
    rows = [r for r in fake_rows() if r["language_code"] == "hin"]
    with pytest.raises(ValueError, match="guj.*hin"):
        sample.select_rows(rows, per_language=2, seed=1)
