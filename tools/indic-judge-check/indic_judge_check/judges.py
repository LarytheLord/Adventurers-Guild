"""Pluggable judge interface, a mock judge, and optional provider adapters.

A judge returns *canonical* labels. For pairwise items: "A" (response_a),
"B" (response_b) or "tie", regardless of the order shown. `swap=True` means
the judge is shown response_b first; the judge maps its answer back.
"""
from __future__ import annotations

import hashlib
import json
import os
import urllib.request
from typing import Protocol

from .io import Item


class Judge(Protocol):
    def judge_pair(self, item: Item, swap: bool, run: int) -> str: ...
    def judge_single(self, item: Item, run: int) -> str: ...


def _h(*parts) -> float:
    d = hashlib.sha256("|".join(map(str, parts)).encode("utf-8")).digest()
    return int.from_bytes(d[:8], "big") / 2**64


class MockJudge:
    """Deterministic fake judge for tests and dry runs. No network."""

    def __init__(self, seed: int = 0, position_bias: float = 0.2, noise: float = 0.1,
                 single_labels=("good", "bad")):
        self.seed, self.position_bias, self.noise = seed, position_bias, noise
        self.single_labels = tuple(single_labels)

    def judge_pair(self, item: Item, swap: bool, run: int) -> str:
        u = _h(self.seed, "pref", item.id)
        pref = "A" if u < 0.45 else "B" if u < 0.9 else "tie"
        if _h(self.seed, "bias", item.id, swap, run) < self.position_bias:
            return "B" if swap else "A"  # picks whatever is shown first
        if _h(self.seed, "noise", item.id, swap, run) < self.noise:
            return ("A", "B", "tie")[int(_h(self.seed, "n2", item.id, swap, run) * 3)]
        return pref

    def judge_single(self, item: Item, run: int) -> str:
        labels = self.single_labels
        base = int(_h(self.seed, "single", item.id) * len(labels))
        if _h(self.seed, "noise1", item.id, run) < self.noise:
            return labels[int(_h(self.seed, "n3", item.id, run) * len(labels))]
        return labels[base]


class FixedSlotJudge:
    """Test helper: always picks the first or second slot shown."""

    def __init__(self, slot: str = "first", single_label: str = "good"):
        if slot not in ("first", "second"):
            raise ValueError("slot must be 'first' or 'second'")
        self.slot, self.single_label = slot, single_label

    def judge_pair(self, item: Item, swap: bool, run: int) -> str:
        first = "B" if swap else "A"
        second = "A" if swap else "B"
        return first if self.slot == "first" else second

    def judge_single(self, item: Item, run: int) -> str:
        return self.single_label


# ---- optional provider adapters (never required; no network unless used) ----

_PAIR_PROMPT = (
    "You are comparing two responses to the same prompt. Reply with exactly one "
    "token: 1 if Response 1 is better, 2 if Response 2 is better, tie if equal.\n\n"
    "Prompt:\n{prompt}\n\nResponse 1:\n{r1}\n\nResponse 2:\n{r2}\n"
)
_SINGLE_PROMPT = (
    "Is the response an acceptable answer to the prompt? Reply with exactly one "
    "word: good or bad.\n\nPrompt:\n{prompt}\n\nResponse:\n{r}\n"
)


class _HTTPJudge:
    temperature = 0.0

    def _ask(self, text: str, run: int) -> str:  # pragma: no cover - network
        raise NotImplementedError

    def judge_pair(self, item: Item, swap: bool, run: int) -> str:
        r1, r2 = (item.response_b, item.response_a) if swap else (item.response_a, item.response_b)
        out = self._ask(_PAIR_PROMPT.format(prompt=item.prompt, r1=r1, r2=r2), run).strip().lower()
        if out.startswith("tie"):
            return "tie"
        if out.startswith("1"):
            return "B" if swap else "A"
        if out.startswith("2"):
            return "A" if swap else "B"
        raise ValueError(f"unparseable judge reply: {out[:40]!r}")

    def judge_single(self, item: Item, run: int) -> str:
        out = self._ask(_SINGLE_PROMPT.format(prompt=item.prompt, r=item.response), run).strip().lower()
        if out.startswith("good"):
            return "good"
        if out.startswith("bad"):
            return "bad"
        raise ValueError(f"unparseable judge reply: {out[:40]!r}")


def _post(url: str, headers: dict, body: dict) -> dict:  # pragma: no cover - network
    req = urllib.request.Request(url, data=json.dumps(body).encode("utf-8"),
                                 headers={"content-type": "application/json", **headers})
    with urllib.request.urlopen(req, timeout=60) as r:
        return json.loads(r.read().decode("utf-8"))


class OpenAICompatJudge(_HTTPJudge):
    """Env: INDIC_JUDGE_OPENAI_API_KEY (required), INDIC_JUDGE_OPENAI_MODEL,
    INDIC_JUDGE_OPENAI_BASE_URL (default https://api.openai.com/v1)."""

    def __init__(self):
        self.key = os.environ.get("INDIC_JUDGE_OPENAI_API_KEY")
        if not self.key:
            raise RuntimeError("INDIC_JUDGE_OPENAI_API_KEY is not set")
        self.model = os.environ.get("INDIC_JUDGE_OPENAI_MODEL", "")
        if not self.model:
            raise RuntimeError("INDIC_JUDGE_OPENAI_MODEL is not set")
        self.base = os.environ.get("INDIC_JUDGE_OPENAI_BASE_URL", "https://api.openai.com/v1")

    def _ask(self, text, run):  # pragma: no cover - network
        d = _post(self.base.rstrip("/") + "/chat/completions",
                  {"authorization": f"Bearer {self.key}"},
                  {"model": self.model, "temperature": self.temperature,
                   "messages": [{"role": "user", "content": text}]})
        return d["choices"][0]["message"]["content"]


class AnthropicJudge(_HTTPJudge):
    """Env: INDIC_JUDGE_ANTHROPIC_API_KEY (required), INDIC_JUDGE_ANTHROPIC_MODEL."""

    def __init__(self):
        self.key = os.environ.get("INDIC_JUDGE_ANTHROPIC_API_KEY")
        if not self.key:
            raise RuntimeError("INDIC_JUDGE_ANTHROPIC_API_KEY is not set")
        self.model = os.environ.get("INDIC_JUDGE_ANTHROPIC_MODEL", "")
        if not self.model:
            raise RuntimeError("INDIC_JUDGE_ANTHROPIC_MODEL is not set")

    def _ask(self, text, run):  # pragma: no cover - network
        d = _post("https://api.anthropic.com/v1/messages",
                  {"x-api-key": self.key, "anthropic-version": "2023-06-01"},
                  {"model": self.model, "max_tokens": 16, "temperature": self.temperature,
                   "messages": [{"role": "user", "content": text}]})
        return d["content"][0]["text"]


def get_judge(name: str, seed: int = 0) -> Judge:
    if name == "mock":
        return MockJudge(seed=seed)
    if name == "openai":
        return OpenAICompatJudge()
    if name == "anthropic":
        return AnthropicJudge()
    raise ValueError(f"unknown judge {name!r} (choose mock, openai, anthropic)")
