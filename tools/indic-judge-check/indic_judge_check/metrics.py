"""Agreement metrics and bootstrap CIs. Pure Python, no dependencies."""
from __future__ import annotations

import math
import random
from collections import Counter
from typing import Callable, Sequence

NAN = float("nan")


def percent_agreement(a: Sequence, b: Sequence) -> float:
    if len(a) != len(b):
        raise ValueError("length mismatch")
    if not a:
        return NAN
    return sum(x == y for x, y in zip(a, b)) / len(a)


def cohens_kappa(a: Sequence, b: Sequence) -> float:
    """Cohen's kappa for two raters over nominal labels.

    Returns NaN when undefined (no items, or expected agreement is 1, e.g.
    both raters used a single identical label throughout).
    """
    if len(a) != len(b):
        raise ValueError("length mismatch")
    n = len(a)
    if n == 0:
        return NAN
    po = sum(x == y for x, y in zip(a, b)) / n
    ca, cb = Counter(a), Counter(b)
    pe = sum(ca[k] * cb[k] for k in set(ca) | set(cb)) / (n * n)
    if pe >= 1.0:
        return NAN
    return (po - pe) / (1.0 - pe)


def krippendorff_alpha_nominal(units: Sequence[Sequence]) -> float:
    """Krippendorff's alpha, nominal metric.

    `units` is a list of units; each unit is a list of ratings, with None for
    a missing rating. Units with fewer than two ratings are ignored.
    Returns NaN when undefined (no pairable values, or no expected disagreement).
    """
    o: Counter = Counter()  # coincidence matrix, ordered pairs of distinct slots
    for unit in units:
        vals = [v for v in unit if v is not None]
        m = len(vals)
        if m < 2:
            continue
        for i in range(m):
            for j in range(m):
                if i != j:
                    o[(vals[i], vals[j])] += 1.0 / (m - 1)
    n = sum(o.values())
    if n <= 1:
        return NAN
    nc: Counter = Counter()
    for (c, _k), w in o.items():
        nc[c] += w
    d_obs = sum(w for (c, k), w in o.items() if c != k) / n
    d_exp = sum(nc[c] * nc[k] for c in nc for k in nc if c != k) / (n * (n - 1))
    if d_exp == 0:
        return NAN
    return 1.0 - d_obs / d_exp


def position_bias_rate(orig: Sequence, swapped: Sequence) -> float:
    """Share of items whose canonical verdict changes when response order is swapped."""
    if len(orig) != len(swapped):
        raise ValueError("length mismatch")
    if not orig:
        return NAN
    return sum(x != y for x, y in zip(orig, swapped)) / len(orig)


def flip_rate(runs_per_item: Sequence[Sequence]) -> float:
    """Share of items where repeated identical queries gave differing verdicts.

    NaN unless at least one item has two or more repeats.
    """
    usable = [r for r in runs_per_item if len(r) >= 2]
    if not usable:
        return NAN
    return sum(len(set(r)) > 1 for r in usable) / len(usable)


def bootstrap_ci(
    stat: Callable[[list[int]], float],
    n: int,
    n_boot: int = 1000,
    seed: int = 0,
    alpha: float = 0.05,
) -> tuple[float, float]:
    """Percentile bootstrap CI over items. `stat` maps resampled indices to a value.

    Resamples that give NaN are dropped; returns (NaN, NaN) if n < 2 or fewer
    than 2 valid resamples remain.
    """
    if n < 2:
        return NAN, NAN
    rng = random.Random(seed)
    vals = []
    for _ in range(n_boot):
        idx = [rng.randrange(n) for _ in range(n)]
        v = stat(idx)
        if not math.isnan(v):
            vals.append(v)
    if len(vals) < 2:
        return NAN, NAN
    vals.sort()
    lo = vals[int((alpha / 2) * (len(vals) - 1))]
    hi = vals[int(math.ceil((1 - alpha / 2) * (len(vals) - 1)))]
    return lo, hi
