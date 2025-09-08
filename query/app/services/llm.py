"""LLM assisted natural language -> QueryIR parsing (moved under services)."""

from __future__ import annotations

import json
import logging
from openai import OpenAI, OpenAIError
from pydantic import ValidationError
from app.core.config import settings
from app.models import QueryIR
from prometheus_client import Counter, Histogram

LLM_PARSE_ATTEMPTS = Counter(
    "llm_parse_attempts_total",
    "Total LLM parse attempts",
    ["result"],
    namespace="grimoire",
    subsystem="query",
)
LLM_PARSE_LATENCY = Histogram(
    "llm_parse_latency_seconds",
    "Latency per individual LLM parse attempt",
    buckets=(0.1, 0.25, 0.5, 1, 2, 5, 10),
    namespace="grimoire",
    subsystem="query",
)
LLM_FINAL_OUTCOME = Counter(
    "llm_parse_final_outcome_total",
    "Final outcome after up to 3 attempts",
    ["outcome"],
    namespace="grimoire",
    subsystem="query",
)

logger = logging.getLogger(__name__)

_FEW_SHOT = [
    {
        "input": "mono white angels mv<=5 legal commander",
        "ir": {
            "entity": {
                "card_types": ["creature"],
                "subtypes": ["angel"],
                "supertypes": [],
                "name_contains": [],
                "oracle_text_contains": [],
            },
            "mana_value": {"op": "<=", "value": 5},
            "colors": {"mode": "identity_only", "set": ["W"], "strict": False},
            "release_date": None,
            "set_codes": [],
            "rarities": [],
            "formats": [{"name": "commander", "legal": True}],
            "sort": {"by": "edhrec", "direction": "desc"},
        },
    },
    {
        "input": "blue instant card draw cmc 3 or less after 2021",
        "ir": {
            "entity": {
                "card_types": ["instant"],
                "subtypes": [],
                "supertypes": [],
                "name_contains": [],
                "oracle_text_contains": ["draw"],
            },
            "mana_value": {"op": "<=", "value": 3},
            "colors": {"mode": "identity_only", "set": ["U"], "strict": False},
            "release_date": {"op": ">=", "date": "2022-01-01"},
            "set_codes": [],
            "rarities": [],
            "formats": [],
            "sort": {"by": "edhrec", "direction": "desc"},
        },
    },
]


def _build_prompt(user_text: str) -> str:
    examples = []
    for ex in _FEW_SHOT:
        examples.append(f"Input: {ex['input']}\nIR JSON: {json.dumps(ex['ir'])}")
    return (
        "You convert natural language about Magic: The Gathering cards into a strict JSON object matching the QueryIR schema. "
        "Only output JSON. No prose. Unknown concepts should be ignored.\n"
        + "\n\n".join(examples)
        + f"\nInput: {user_text}\nIR JSON:"
    )


def llm_parse(text: str) -> QueryIR | None:
    prompt = _build_prompt(text)
    client: OpenAI | None = None
    for attempt in range(1, 4):
        try:
            if client is None:
                client = OpenAI(api_key=settings.openai_api_key)
            import time

            t0 = time.perf_counter()
            resp = client.responses.parse(
                model=settings.openai_model,
                input=[{"role": "user", "content": prompt}],
                text_format=QueryIR,
                temperature=0.0,
            )
            LLM_PARSE_LATENCY.observe(time.perf_counter() - t0)
            parsed = getattr(resp, "output_parsed", None)
            if parsed:
                if attempt > 1:
                    logger.info("LLM parse succeeded on attempt %d", attempt)
                LLM_PARSE_ATTEMPTS.labels("success").inc()
                return parsed
            logger.warning(
                "LLM parse attempt %d produced no parsed output (possible refusal)",
                attempt,
            )
            LLM_PARSE_ATTEMPTS.labels("failure").inc()
        except (OpenAIError, ValidationError, json.JSONDecodeError, TypeError) as e:
            logger.warning("LLM parse attempt %d failed: %s", attempt, e)
            LLM_PARSE_ATTEMPTS.labels("exception").inc()
    return None


def parse_nl_query(text: str) -> tuple[QueryIR, list[str]]:
    warnings: list[str] = []
    ir: QueryIR | None = None
    for attempt in range(3):
        ir = llm_parse(text)
        if ir:
            LLM_FINAL_OUTCOME.labels("success").inc()
            break
        warnings.append(f"LLM parsing attempt {attempt} failed")
    if not ir:
        warnings.append("LLM parsing failed after 3 attempts; returning None")
        LLM_FINAL_OUTCOME.labels("failed").inc()
    return ir, warnings


__all__ = ["parse_nl_query"]
