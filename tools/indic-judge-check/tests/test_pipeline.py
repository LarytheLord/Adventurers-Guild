"""Loading, judge interface, and end-to-end report tests."""
import csv
import json

import pytest

from indic_judge_check import io as hio
from indic_judge_check import judges, report


def write_items(path, items):
    with open(path, "w", encoding="utf-8") as f:
        for it in items:
            f.write(json.dumps(it, ensure_ascii=False) + "\n")


def write_ratings(path, rows):
    with open(path, "w", encoding="utf-8", newline="") as f:
        w = csv.writer(f)
        w.writerow(["item_id", "rater_id", "label"])
        w.writerows(rows)


def test_load_items_pairwise_and_single(tmp_path):
    p = tmp_path / "items.jsonl"
    write_items(p, [
        {"id": "1", "language": "hi", "prompt": "p", "response_a": "x", "response_b": "y"},
        {"id": "2", "language": "gu", "prompt": "p", "response": "z"},
    ])
    items = hio.load_items(p)
    assert items[0].is_pairwise and not items[1].is_pairwise
    assert items[1].language == "gu"


def test_load_items_rejects_bad_rows(tmp_path):
    p = tmp_path / "items.jsonl"
    write_items(p, [{"id": "1", "language": "hi", "prompt": "p"}])
    with pytest.raises(ValueError):
        hio.load_items(p)


def test_load_items_rejects_duplicate_ids(tmp_path):
    p = tmp_path / "items.jsonl"
    row = {"id": "1", "language": "hi", "prompt": "p", "response": "z"}
    write_items(p, [row, row])
    with pytest.raises(ValueError):
        hio.load_items(p)


def test_load_ratings(tmp_path):
    p = tmp_path / "r.csv"
    write_ratings(p, [("1", "r1", "A"), ("1", "r2", "B")])
    r = hio.load_ratings(p)
    assert r == {"1": {"r1": "A", "r2": "B"}}


def test_load_ratings_rejects_duplicate_rater(tmp_path):
    p = tmp_path / "r.csv"
    write_ratings(p, [("1", "r1", "A"), ("1", "r1", "B")])
    with pytest.raises(ValueError):
        hio.load_ratings(p)


def test_mock_judge_is_deterministic():
    j = judges.MockJudge(seed=3)
    item = hio.Item(id="1", language="hi", prompt="p", response_a="x", response_b="y")
    assert j.judge_pair(item, swap=False, run=0) == j.judge_pair(item, swap=False, run=0)


def test_get_judge_unknown_and_missing_env(monkeypatch):
    with pytest.raises(ValueError):
        judges.get_judge("nope")
    monkeypatch.delenv("INDIC_JUDGE_OPENAI_API_KEY", raising=False)
    with pytest.raises(RuntimeError):
        judges.get_judge("openai")


def test_position_biased_judge_always_prefers_first_slot():
    j = judges.FixedSlotJudge("first")
    item = hio.Item(id="1", language="hi", prompt="p", response_a="x", response_b="y")
    assert j.judge_pair(item, swap=False, run=0) == "A"
    assert j.judge_pair(item, swap=True, run=0) == "B"  # canonical label flips


def _items(n_hi=6, n_gu=6):
    out = []
    for lang, n in (("hi", n_hi), ("gu", n_gu)):
        for i in range(n):
            out.append(hio.Item(id=f"{lang}{i}", language=lang, prompt="p",
                                response_a="a", response_b="b"))
    return out


def test_report_end_to_end_perfect_and_biased():
    items = _items()
    labels = ["A", "B"] * 6
    human = {it.id: {"r1": labels[i], "r2": labels[i]} for i, it in enumerate(items)}
    rep = report.build_report(items, human, judges.FixedSlotJudge("first"),
                              repeats=2, n_boot=200, seed=1)
    for lang in ("hi", "gu"):
        s = rep["languages"][lang]
        assert s["human_human"]["kappa"]["value"] == pytest.approx(1.0)
        assert s["human_human"]["alpha"]["value"] == pytest.approx(1.0)
        assert s["position_bias_rate"]["value"] == pytest.approx(1.0)
        assert s["self_consistency_flip_rate"]["value"] == pytest.approx(0.0)
        # first-slot judge picks A (orig order) on every item vs labels A,B,A,B...
        assert s["judge_human"]["n"] == 6


def test_report_is_deterministic_and_json_serialisable():
    items = _items()
    human = {it.id: {"r1": "A", "r2": "B"} for it in items}
    a = report.build_report(items, human, judges.MockJudge(seed=1), repeats=3, n_boot=100, seed=5)
    b = report.build_report(items, human, judges.MockJudge(seed=1), repeats=3, n_boot=100, seed=5)
    assert json.dumps(a, sort_keys=True) == json.dumps(b, sort_keys=True)


def test_report_without_human_labels_still_gives_judge_metrics():
    items = _items()
    rep = report.build_report(items, {}, judges.MockJudge(seed=1), repeats=2, n_boot=50, seed=1)
    s = rep["languages"]["hi"]
    assert s["human_human"]["n"] == 0
    assert s["position_bias_rate"]["n"] == 6
