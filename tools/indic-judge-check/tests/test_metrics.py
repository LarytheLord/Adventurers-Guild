"""Metric tests against hand-computed known values (no network)."""
import math
import random

import pytest

from indic_judge_check import metrics as m


def test_cohen_kappa_perfect():
    assert m.cohens_kappa(["a", "b", "a", "b"], ["a", "b", "a", "b"]) == pytest.approx(1.0)


def test_cohen_kappa_known_value():
    # Classic 2x2 example: 20 yes/yes, 5 yes/no, 10 no/yes, 15 no/no.
    # po = 35/50 = 0.7 ; pe = 0.6*0.5 + 0.4*0.5 = 0.5 ; kappa = 0.4
    a = ["y"] * 20 + ["y"] * 5 + ["n"] * 10 + ["n"] * 15
    b = ["y"] * 20 + ["n"] * 5 + ["y"] * 10 + ["n"] * 15
    assert m.cohens_kappa(a, b) == pytest.approx(0.4)


def test_cohen_kappa_chance_level_is_zero():
    a = ["y", "y", "n", "n"]
    b = ["y", "n", "y", "n"]
    assert m.cohens_kappa(a, b) == pytest.approx(0.0)


def test_cohen_kappa_degenerate_is_nan():
    assert math.isnan(m.cohens_kappa(["a", "a"], ["a", "a"]))
    assert math.isnan(m.cohens_kappa([], []))


def test_cohen_kappa_length_mismatch():
    with pytest.raises(ValueError):
        m.cohens_kappa(["a"], ["a", "b"])


def test_krippendorff_alpha_perfect():
    data = [["a", "a"], ["b", "b"], ["a", "a"]]
    assert m.krippendorff_alpha_nominal(data) == pytest.approx(1.0)


def test_krippendorff_alpha_known_value():
    # Two raters, 4 units: 2 agree on "a", 1 agrees on "b", 1 disagrees.
    # Coincidence matrix: o_aa=4, o_bb=2, o_ab=o_ba=1 ; n=8
    # n_a=5, n_b=3. Do = 2/8 ; De = 2*5*3/(8*7) = 30/56
    # alpha = 1 - (2/8)/(30/56) = 1 - 7/15 = 8/15
    data = [["a", "a"], ["a", "a"], ["b", "b"], ["a", "b"]]
    assert m.krippendorff_alpha_nominal(data) == pytest.approx(8 / 15)


def test_krippendorff_alpha_handles_missing_and_unpairable():
    data = [["a", "a", None], ["b", None, "b"], ["a", None, None]]
    # third unit has one rating -> dropped; remaining perfect agreement
    assert m.krippendorff_alpha_nominal(data) == pytest.approx(1.0)


def test_krippendorff_alpha_all_same_is_nan():
    assert math.isnan(m.krippendorff_alpha_nominal([["a", "a"], ["a", "a"]]))


def test_krippendorff_matches_kappa_sign_for_disagreement():
    data = [["a", "b"], ["b", "a"], ["a", "b"], ["b", "a"]]
    assert m.krippendorff_alpha_nominal(data) < 0


def test_position_bias_rate():
    # preferences in original order vs swapped order, canonical labels
    orig = ["A", "A", "B", "tie"]
    swap = ["A", "B", "B", "tie"]  # item 2 flipped
    # a consistent judge returns the same canonical winner in both orders
    assert m.position_bias_rate(orig, swap) == pytest.approx(0.25)


def test_position_bias_rate_empty_is_nan():
    assert math.isnan(m.position_bias_rate([], []))


def test_self_consistency_flip_rate():
    runs = [["A", "A", "A"], ["A", "B", "A"], ["B", "B", "B"], ["A", "B", "B"]]
    # items with any disagreement across repeats: 2 of 4
    assert m.flip_rate(runs) == pytest.approx(0.5)


def test_flip_rate_single_run_is_nan():
    assert math.isnan(m.flip_rate([["A"], ["B"]]))


def test_percent_agreement():
    assert m.percent_agreement(["a", "b", "a"], ["a", "a", "a"]) == pytest.approx(2 / 3)


def test_bootstrap_ci_is_deterministic_and_brackets_point():
    a = ["y", "n"] * 30 + ["y"] * 10
    b = ["y", "n"] * 30 + ["n"] * 10
    f = lambda idx: m.percent_agreement([a[i] for i in idx], [b[i] for i in idx])
    lo, hi = m.bootstrap_ci(f, len(a), n_boot=500, seed=7)
    lo2, hi2 = m.bootstrap_ci(f, len(a), n_boot=500, seed=7)
    assert (lo, hi) == (lo2, hi2)
    point = f(list(range(len(a))))
    assert lo <= point <= hi
    assert 0 <= lo < hi <= 1


def test_bootstrap_ci_tiny_sample_is_nan():
    lo, hi = m.bootstrap_ci(lambda idx: 1.0, 1, n_boot=10, seed=1)
    assert math.isnan(lo) and math.isnan(hi)
