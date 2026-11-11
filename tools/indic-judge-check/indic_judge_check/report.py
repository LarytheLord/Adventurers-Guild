"""Build the per-language agreement report."""
from __future__ import annotations

import itertools
import math
from collections import Counter, defaultdict

from . import metrics as m
from .io import Item


def _clean(x):
    return None if isinstance(x, float) and math.isnan(x) else x


def _stat(fn, n, n_boot, seed):
    """Point estimate + bootstrap CI; fn(idx) -> float over resampled items."""
    point = fn(list(range(n))) if n else m.NAN
    lo, hi = m.bootstrap_ci(fn, n, n_boot=n_boot, seed=seed)
    return {"value": _clean(point), "ci95": [_clean(lo), _clean(hi)]}


def _consensus(labels: dict[str, str]):
    """Unique plurality label among raters, else None."""
    c = Counter(labels.values()).most_common()
    if not c:
        return None
    if len(c) > 1 and c[0][1] == c[1][1]:
        return None
    return c[0][0]


def _judge_item(judge, item: Item, repeats: int):
    """Returns (verdict, swapped_verdict_or_None, repeat_runs)."""
    if item.is_pairwise:
        runs = [judge.judge_pair(item, False, r) for r in range(repeats)]
        swapped = judge.judge_pair(item, True, 0)
        return runs[0], swapped, runs
    runs = [judge.judge_single(item, r) for r in range(repeats)]
    return runs[0], None, runs


def build_report(items, human, judge, repeats=3, n_boot=1000, seed=0) -> dict:
    by_lang: dict[str, list[Item]] = defaultdict(list)
    for it in items:
        by_lang[it.language].append(it)
    out = {"settings": {"repeats": repeats, "n_boot": n_boot, "seed": seed}, "languages": {}}
    for lang in sorted(by_lang):
        its = by_lang[lang]
        # --- human-human (pooled over rater pairs per item) ---
        hh = [human.get(it.id, {}) for it in its]
        hh = [r for r in hh if len(r) >= 2]
        pairs_by_item = [list(itertools.combinations(sorted(r), 2)) for r in hh]

        def pooled(idx, hh=hh, pairs_by_item=pairs_by_item):
            a, b = [], []
            for i in idx:
                for r1, r2 in pairs_by_item[i]:
                    a.append(hh[i][r1])
                    b.append(hh[i][r2])
            return a, b

        def kappa_fn(idx):
            a, b = pooled(idx)
            return m.cohens_kappa(a, b)

        def agree_fn(idx):
            a, b = pooled(idx)
            return m.percent_agreement(a, b)

        def alpha_fn(idx, hh=hh):
            return m.krippendorff_alpha_nominal([list(hh[i].values()) for i in idx])

        hh_n = len(hh)
        human_human = {
            "n": hh_n,
            "kappa": _stat(kappa_fn, hh_n, n_boot, seed),
            "alpha": _stat(alpha_fn, hh_n, n_boot, seed),
            "percent_agreement": _stat(agree_fn, hh_n, n_boot, seed),
        }
        # --- judge runs ---
        verdicts, swapped, runs = [], [], []
        for it in its:
            v, s, r = _judge_item(judge, it, repeats)
            verdicts.append(v)
            swapped.append(s)
            runs.append(r)
        # --- judge-human (vs unique plurality human label) ---
        jh = [(verdicts[i], _consensus(human.get(it.id, {}))) for i, it in enumerate(its)]
        jh = [(j, h) for j, h in jh if h is not None]
        jh_n = len(jh)
        judge_human = {
            "n": jh_n,
            "kappa": _stat(lambda idx: m.cohens_kappa([jh[i][0] for i in idx],
                                                      [jh[i][1] for i in idx]), jh_n, n_boot, seed),
            "percent_agreement": _stat(lambda idx: m.percent_agreement(
                [jh[i][0] for i in idx], [jh[i][1] for i in idx]), jh_n, n_boot, seed),
        }
        # --- position bias (pairwise only) ---
        pb = [(verdicts[i], swapped[i]) for i in range(len(its)) if swapped[i] is not None]
        pb_n = len(pb)
        position = {"n": pb_n, **_stat(lambda idx: m.position_bias_rate(
            [pb[i][0] for i in idx], [pb[i][1] for i in idx]), pb_n, n_boot, seed)}
        # --- self-consistency ---
        sc_n = len(runs) if repeats >= 2 else 0
        consistency = {"n": sc_n, **_stat(lambda idx: m.flip_rate([runs[i] for i in idx]),
                                          sc_n, n_boot, seed)}
        out["languages"][lang] = {
            "n_items": len(its),
            "human_human": human_human,
            "judge_human": judge_human,
            "position_bias_rate": position,
            "self_consistency_flip_rate": consistency,
        }
    return out
