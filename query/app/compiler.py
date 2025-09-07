"""Compiler from QueryIR -> Scryfall query string.

Adds lightweight validation & heuristic warnings so callers get feedback
about potentially unintended broad or malformed queries without bloating
the parser layer. All validation here is non-fatal; the compiler will
emit a best-effort query string regardless (unless IR is entirely empty).
"""

from __future__ import annotations

from typing import List
import re
from .models import QueryIR


def _quote_token(tok: str) -> str:
    if not tok:
        return tok
    needs_quote = any(c.isspace() for c in tok) or '"' in tok
    escaped = tok.replace('"', '\\"')
    if needs_quote:
        return f'"{escaped}"'
    return escaped


VALID_RARITIES = {"common", "uncommon", "rare", "mythic", "special", "bonus"}
VALID_COLORS = {"W", "U", "B", "R", "G"}
SET_CODE_RE = re.compile(r"^[A-Za-z0-9]{2,5}$")


def compile_to_scryfall(ir: QueryIR) -> tuple[str, list[str]]:
    """Compile IR into a Scryfall syntax query string and collect warnings.

    Warning categories:
    - empty / broad queries
    - invalid or unknown field values (rarity, set code, colors)
    - structural hints (empty entity constraints)
    """
    parts: List[str] = []
    warnings: List[str] = []

    ent = ir.entity
    if not (
        ent.card_types
        or ent.subtypes
        or ent.supertypes
        or ent.name_contains
        or ent.oracle_text_contains
    ):
        warnings.append(
            "entity has no constraints (no types, names, or oracle filters)"
        )

    for t in ent.card_types:
        if not t:
            warnings.append("ignoring empty card_type token")
            continue
        parts.append(f"t:{_quote_token(t)}")
    for st in ent.subtypes:
        if not st:
            warnings.append("ignoring empty subtype token")
            continue
        parts.append(f"t:{_quote_token(st)}")
    for sp in ent.supertypes:
        if not sp:
            warnings.append("ignoring empty supertype token")
            continue
        parts.append(f"t:{_quote_token(sp)}")
    for n in ent.name_contains:
        parts.append(f"name:{_quote_token(n)}")
    for o in ent.oracle_text_contains:
        parts.append(f"o:{_quote_token(o)}")

    if ir.mana_value:
        parts.append(f"mv{ir.mana_value.op}{ir.mana_value.value}")

    if ir.colors:
        if not ir.colors.set:
            warnings.append("colors object provided but color set is empty")
        else:
            invalid = [c for c in ir.colors.set if c not in VALID_COLORS]
            if invalid:
                warnings.append(f"ignoring invalid color codes: {','.join(invalid)}")
            kept = [c for c in ir.colors.set if c in VALID_COLORS]
            if kept:
                key = "id" if ir.colors.mode == "identity_only" else "c"
                op = "=" if ir.colors.strict else "<="
                letters = "".join(sorted([c.lower() for c in kept], key="wubrg".index))
                parts.append(f"{key}{op}{letters}")
            else:
                warnings.append(
                    "no valid colors left after filtering invalid codes; skipping color filter"
                )

    if ir.release_date:
        rd = ir.release_date
        if rd.op in (">=", ">"):
            # Shortcut using year if operator is >= or > and date is start of year.
            year = rd.date.split("-")[0]
            if rd.date.endswith("-01-01"):
                parts.append(f"year{rd.op}{year}")
            else:
                parts.append(f"date{rd.op}{rd.date}")
        else:
            parts.append(f"date{rd.op}{rd.date}")

    for sc in ir.set_codes:
        if not sc:
            warnings.append("ignoring empty set code")
            continue
        if not SET_CODE_RE.match(sc):
            warnings.append(f"invalid set code format: {sc}")
            continue
        parts.append(f"e:{sc.lower()}")

    if ir.rarities:
        valid_rars = []
        for r in ir.rarities:
            rl = r.lower()
            if rl not in VALID_RARITIES:
                warnings.append(f"unknown rarity '{r}' ignored")
            else:
                valid_rars.append(rl)
        if valid_rars:
            if len(valid_rars) == 1:
                parts.append(f"r:{valid_rars[0]}")
            else:
                ors = " or ".join([f"r:{r}" for r in valid_rars])
                parts.append(f"({ors})")
        else:
            warnings.append(
                "all provided rarities were invalid; skipping rarity filter"
            )

    for fmt in ir.formats:
        if fmt.legal is None or fmt.legal:
            parts.append(f"legal:{fmt.name.lower()}")
        elif fmt.legal is False:
            parts.append(f"banned:{fmt.name.lower()}")

    if ir.sort:
        parts.append(f"sort:{ir.sort.by}")
        if ir.sort.direction == "asc":
            parts.append("order:asc")

    if not parts:
        warnings.append("empty query produced from IR (no usable constraints)")
    else:
        # Heuristic: if only sort directives present it's too broad.
        non_sort_parts = [
            p for p in parts if not p.startswith("sort:") and not p.startswith("order:")
        ]
        if not non_sort_parts:
            warnings.append(
                "query has only sort/order directives; will match almost all cards"
            )
        elif len(non_sort_parts) < 2:
            warnings.append(
                "very broad query (only one primary filter); consider adding more constraints"
            )

    return " ".join(parts).strip(), warnings
