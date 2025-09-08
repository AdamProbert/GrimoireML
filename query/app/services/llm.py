"""LLM assisted natural language -> QueryIR parsing (moved under services)."""

from __future__ import annotations

import json
import logging
from openai import OpenAI, OpenAIError
from pydantic import ValidationError
from app.core.config import settings
from app.models import QueryIR
from prometheus_client import Counter, Histogram
from .few_shot_examples import FEW_SHOT
from .tag_index import suggest_tags, load_index

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


def _build_prompt(user_text: str) -> str:
    examples = []
    for ex in FEW_SHOT:
        examples.append(f"Input: {ex['input']}\nIR JSON: {json.dumps(ex['ir'])}")
    # Include full Scryfall syntax: art:, atag:, arttag: for art tags; function:, otag:, oracletag: for Oracle tags; flavor:, pow/tou/loy/number, priceusd/priceeur/pricetix;
    # categorical filters: layout:, lang:, artist:, watermark:, border:, frame:, reprint:, related:.
    prompt_intro = (
        "Convert natural language about Magic: The Gathering cards into a strict JSON object matching the QueryIR schema. "
        "Support Scryfall search syntax including art:, atag:, arttag:, function:, otag:, oracletag:, flavor:, pow/tou/loy/number, priceusd/priceeur/pricetix, layout:, lang:, artist:, watermark:, border:, frame:, reprint:, related:. "
        "Only output valid JSON, no explanations or prose. Unknown concepts should be ignored."
    )
    prompt = prompt_intro + "\n\n" + "\n\n".join(examples)
    # Candidate tag injection (phase 4) if enabled
    from app.core.config import settings

    if settings.enable_tag_candidates:
        art_cand, oracle_cand = suggest_tags(
            user_text,
            max_art=settings.tags_max_art,
            max_oracle=settings.tags_max_oracle,
            art_threshold=settings.tags_threshold_art,
            oracle_threshold=settings.tags_threshold_oracle,
        )
        blocks = []
        if art_cand:
            blocks.append(
                "Candidate art_tags (choose zero or more ONLY from this list; omit if unsure):\n"
                + ", ".join(art_cand)
            )
        if oracle_cand:
            blocks.append(
                "Candidate oracle_tags (choose zero or more ONLY from this list; omit if unsure):\n"
                + ", ".join(oracle_cand)
            )
        if blocks:
            prompt += "\n\n" + "\n" + "\n".join(blocks)
        else:
            prompt += "\n\nIf no candidate tag list is shown, do not invent tags; leave art_tags and oracle_tags empty unless obviously implied and widely known."
    prompt += f"\nInput: {user_text}\nIR JSON:"
    return prompt


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
                # Post-parse defense: remove any tags not in whitelist & note if trimmed
                idx = load_index()
                original_art = set(parsed.art_tags)
                original_oracle = set(parsed.oracle_tags)
                filtered_art = [t for t in parsed.art_tags if t in idx.art_tags]
                filtered_oracle = [
                    t for t in parsed.oracle_tags if t in idx.oracle_tags
                ]
                if len(filtered_art) != len(parsed.art_tags):
                    logger.debug(
                        "Removed %d unknown art_tags: %s",
                        len(original_art - set(filtered_art)),
                        sorted(original_art - set(filtered_art)),
                    )
                    parsed.art_tags = filtered_art  # type: ignore
                if len(filtered_oracle) != len(parsed.oracle_tags):
                    logger.debug(
                        "Removed %d unknown oracle_tags: %s",
                        len(original_oracle - set(filtered_oracle)),
                        sorted(original_oracle - set(filtered_oracle)),
                    )
                    parsed.oracle_tags = filtered_oracle  # type: ignore
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
