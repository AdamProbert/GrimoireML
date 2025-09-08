"""Tag index loading and fuzzy suggestion utilities.
Assumptions:
- Tag JSON path: query/data/scryfall_tagger_tags.json (adjacent to app package parent dir) structure:
  [ {"category": "#", "tags": [{"key": "1st-place", "label": "1st-place", "url": "..."}, ...]}, ...]
- Functional/oracle tags have category containing substring '(functional)' or url containing 'oracletag'/'function'.
"""

from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
import json
import logging
import re
from functools import lru_cache
from typing import Iterable, List, Tuple

logger = logging.getLogger(__name__)

DATA_FILE = (
    Path(__file__).resolve().parent.parent.parent / "data" / "scryfall_tagger_tags.json"
)

_ART_HINTS = ("art%3A",)  # url enc variant for art tags
_ORACLE_HINTS = ("oracletag%3A", "function%3A", "otag%3A")
_FUNCTIONAL_CATEGORY_MARKER = "(functional)"

WORD_RE = re.compile(r"[a-z0-9]+(?:-[a-z0-9]+)?", re.IGNORECASE)
STOPWORDS = {"the", "a", "an", "of", "and", "or", "to", "in", "on", "for", "with"}

try:
    from rapidfuzz import fuzz
except ImportError:  # pragma: no cover - fallback path
    fuzz = None  # type: ignore
    logger.warning("rapidfuzz not installed; falling back to simple scoring")


def _simple_ratio(a: str, b: str) -> int:
    # Basic similarity: proportion of shorter string chars appearing in order
    a_l, b_l = a.lower(), b.lower()
    match = 0
    i = 0
    for ch in a_l:
        j = b_l.find(ch, i)
        if j >= 0:
            match += 1
            i = j + 1
    return int(100 * match / max(1, min(len(a_l), len(b_l))))


def _score(a: str, b: str) -> int:
    if fuzz:
        return fuzz.WRatio(a, b)  # type: ignore
    return _simple_ratio(a, b)


@dataclass(frozen=True)
class TagIndex:
    art_tags: frozenset[str]
    oracle_tags: frozenset[str]
    version: int  # simple counter for reload invalidation


@lru_cache(maxsize=1)
def load_index() -> TagIndex:
    try:
        text = DATA_FILE.read_text(encoding="utf-8")
        raw = json.loads(text)
    except FileNotFoundError:  # pragma: no cover
        logger.error("Tag data file missing: %s", DATA_FILE)
        return TagIndex(frozenset(), frozenset(), 0)
    art: set[str] = set()
    oracle: set[str] = set()
    for block in raw:
        category = block.get("category", "")
        for tag in block.get("tags", []):
            key = tag.get("key") or tag.get("label")
            if not key:
                continue
            key_l = key.strip().lower()
            url = tag.get("url", "")
            if _FUNCTIONAL_CATEGORY_MARKER in category or any(
                h in url for h in _ORACLE_HINTS
            ):
                oracle.add(key_l)
            elif any(h in url for h in _ART_HINTS):
                art.add(key_l)
            else:
                # default to art if ambiguous (rare)
                art.add(key_l)
    logger.info("Loaded %d art tags and %d oracle tags", len(art), len(oracle))
    return TagIndex(frozenset(art), frozenset(oracle), 1)


def _candidate_terms(text: str) -> List[str]:
    tokens = [t.lower() for t in WORD_RE.findall(text) if t.lower() not in STOPWORDS]
    # Add simple bigrams for oracle multi-word phrases
    bigrams = (
        [f"{tokens[i]} {tokens[i+1]}" for i in range(len(tokens) - 1)]
        if len(tokens) > 1
        else []
    )
    return list(dict.fromkeys(tokens + bigrams))  # preserve order unique


@lru_cache(maxsize=256)
def suggest_tags(
    user_text: str,
    max_art: int = 15,
    max_oracle: int = 15,
    art_threshold: int = 70,
    oracle_threshold: int = 70,
) -> tuple[list[str], list[str]]:
    idx = load_index()
    terms = _candidate_terms(user_text)
    if not terms:
        return [], []

    # Score each tag as max score across terms; early prune via first term score
    def top_k(tags: Iterable[str], k: int, threshold: int) -> List[str]:
        scored: list[tuple[int, str]] = []
        for tg in tags:
            best = 0
            for term in terms:
                s = _score(term, tg)
                if s > best:
                    best = s
                    if best == 100:
                        break
            if best >= threshold:
                scored.append((best, tg))
        scored.sort(key=lambda x: (-x[0], x[1]))
        return [t for _, t in scored[:k]]

    art_candidates = top_k(idx.art_tags, max_art, art_threshold)
    oracle_candidates = top_k(idx.oracle_tags, max_oracle, oracle_threshold)
    return art_candidates, oracle_candidates


__all__ = ["load_index", "suggest_tags", "TagIndex"]
