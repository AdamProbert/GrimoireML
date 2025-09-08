"""Compiler from QueryIR -> Scryfall query string (moved under services)."""

from __future__ import annotations

from typing import List
import re
from app.models import QueryIR
from prometheus_client import Counter, Histogram

# Metrics
COMPILE_COUNT = Counter(
    "compile_attempts_total",
    "Total QueryIR -> Scryfall compile attempts",
    ["outcome"],  # outcome: success, empty
    namespace="grimoire",
    subsystem="query",
)
COMPILE_WARNINGS = Counter(
    "compile_warnings_total",
    "Total warnings emitted by compiler",
    ["category"],
    namespace="grimoire",
    subsystem="query",
)
COMPILE_LATENCY = Histogram(
    "compile_latency_seconds",
    "Latency of compiling QueryIR to Scryfall query string",
    buckets=(0.001, 0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1),
    namespace="grimoire",
    subsystem="query",
)


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


def _categorize_warning(w: str) -> str:
    if "empty" in w:
        return "empty"
    if "invalid" in w or "unknown" in w:
        return "invalid"
    if "broad" in w:
        return "broad"
    if "skipping" in w:
        return "skipped"
    return "other"


class ScryfallCompiler:
    def __init__(self, ir: QueryIR):
        self.ir = ir
        self.parts: List[str] = []
        self.warnings: List[str] = []

    def compile(self) -> tuple[str, list[str]]:
        # Compile each IR section into Scryfall tokens
        self._compile_entity()
        self._compile_text_filters()
        self._compile_name_filters()
        self._compile_oracle_filters()
        self._compile_flavor_filters()
        self._compile_tags()
        self._compile_numeric()
        self._compile_categorical()
        self._compile_mana_and_colors()
        self._compile_release_date()
        self._compile_set_codes()
        self._compile_rarities()
        self._compile_formats()
        self._compile_sort()
        return " ".join(self.parts).strip(), self.warnings

    def _compile_entity(self):
        ent = self.ir.entity
        if not (
            ent.card_types
            or ent.subtypes
            or ent.supertypes
            or ent.name_contains
            or ent.oracle_text_contains
        ):
            self.warnings.append(
                "entity has no constraints (no types, names, or oracle filters)"
            )
        for t in ent.card_types:
            if not t:
                self.warnings.append("ignoring empty card_type token")
                continue
            self.parts.append(f"t:{_quote_token(t)}")
        for st in ent.subtypes:
            if not st:
                self.warnings.append("ignoring empty subtype token")
                continue
            self.parts.append(f"t:{_quote_token(st)}")
        for sp in ent.supertypes:
            if not sp:
                self.warnings.append("ignoring empty supertype token")
                continue
            self.parts.append(f"t:{_quote_token(sp)}")
        for n in ent.name_contains:
            self.parts.append(f"name:{_quote_token(n)}")
        for o in ent.oracle_text_contains:
            self.parts.append(f"o:{_quote_token(o)}")

    def _compile_text_filters(self):
        # name_contains and oracle_text_contains from entity
        ent = self.ir.entity
        for n in ent.name_contains:
            self.parts.append(f"name:{_quote_token(n)}")
        for o in ent.oracle_text_contains:
            self.parts.append(f"o:{_quote_token(o)}")

    def _compile_name_filters(self):
        # exact and negative name filters
        for ne in self.ir.name_exact:
            self.parts.append(f"name={_quote_token(ne)}")
        for nn in self.ir.name_not:
            self.parts.append(f"-name:{_quote_token(nn)}")

    def _compile_oracle_filters(self):
        # exact and negative oracle text filters
        for oe in self.ir.oracle_text_exact:
            self.parts.append(f"o={_quote_token(oe)}")
        for on in self.ir.oracle_text_not:
            self.parts.append(f"-o:{_quote_token(on)}")

    def _compile_flavor_filters(self):
        # flavor text filters
        for fc in self.ir.flavor_text_contains:
            self.parts.append(f"flavor:{_quote_token(fc)}")
        for fe in self.ir.flavor_text_exact:
            self.parts.append(f"flavor={_quote_token(fe)}")
        for fn in self.ir.flavor_text_not:
            self.parts.append(f"-flavor:{_quote_token(fn)}")

    def _compile_tags(self):
        art_set = sorted({(at or "").lower() for at in self.ir.art_tags if at})
        oracle_set = sorted({(ot or "").lower() for ot in self.ir.oracle_tags if ot})
        for at in art_set:
            self.parts.append(f"arttag:{_quote_token(at)}")
        for ot in oracle_set:
            self.parts.append(f"otag:{_quote_token(ot)}")

    def _compile_numeric(self):
        # numeric comparisons: power, toughness, loyalty, card number, prices
        if self.ir.power:
            self.parts.append(f"pow{self.ir.power.op}{self.ir.power.value}")
        if self.ir.toughness:
            self.parts.append(f"tou{self.ir.toughness.op}{self.ir.toughness.value}")
        if self.ir.loyalty:
            self.parts.append(f"loy{self.ir.loyalty.op}{self.ir.loyalty.value}")
        if self.ir.card_number:
            self.parts.append(
                f"number{self.ir.card_number.op}{self.ir.card_number.value}"
            )
        if self.ir.price_usd:
            self.parts.append(
                f"priceusd{self.ir.price_usd.op}{self.ir.price_usd.value}"
            )
        if self.ir.price_eur:
            self.parts.append(
                f"priceeur{self.ir.price_eur.op}{self.ir.price_eur.value}"
            )
        if self.ir.price_tix:
            self.parts.append(
                f"pricetix{self.ir.price_tix.op}{self.ir.price_tix.value}"
            )

    def _compile_categorical(self):
        # categorical filters: layout, language, artist, watermark, border, frame, etc.
        for layout in self.ir.layout:
            self.parts.append(f"layout:{layout}")
        for lang in self.ir.languages:
            self.parts.append(f"lang:{lang}")
        for artist in self.ir.artist:
            self.parts.append(f"artist:{_quote_token(artist)}")
        for wm in self.ir.watermark:
            self.parts.append(f"watermark:{_quote_token(wm)}")
        for bd in self.ir.border:
            self.parts.append(f"border:{bd}")
        for fr in self.ir.frame:
            self.parts.append(f"frame:{fr}")
        for rg in self.ir.reprint_groups:
            self.parts.append(f"reprint:{_quote_token(rg)}")
        for rel in self.ir.related:
            self.parts.append(f"related:{rel}")

    def _compile_mana_and_colors(self):
        # mana value
        if self.ir.mana_value:
            self.parts.append(f"mv{self.ir.mana_value.op}{self.ir.mana_value.value}")
        # colors filter
        if self.ir.colors:
            if not self.ir.colors.set:
                self.warnings.append("colors object provided but color set is empty")
            else:
                invalid = [c for c in self.ir.colors.set if c not in VALID_COLORS]
                if invalid:
                    self.warnings.append(
                        f"ignoring invalid color codes: {','.join(invalid)}"
                    )
                kept = [c for c in self.ir.colors.set if c in VALID_COLORS]
                if kept:
                    key = "id" if self.ir.colors.mode == "identity_only" else "c"
                    op = "=" if self.ir.colors.strict else "<="
                    letters = "".join(
                        sorted([c.lower() for c in kept], key="wubrg".index)
                    )
                    self.parts.append(f"{key}{op}{letters}")
                else:
                    self.warnings.append(
                        "no valid colors left after filtering invalid codes; skipping color filter"
                    )

    def _compile_release_date(self):
        if self.ir.release_date:
            rd = self.ir.release_date
            if rd.op in (">=", ">"):
                year = rd.date.split("-")[0]
                if rd.date.endswith("-01-01"):
                    self.parts.append(f"year{rd.op}{year}")
                else:
                    self.parts.append(f"date{rd.op}{rd.date}")
            else:
                self.parts.append(f"date{rd.op}{rd.date}")

    def _compile_set_codes(self):
        for sc in self.ir.set_codes:
            if not sc:
                self.warnings.append("ignoring empty set code")
                continue
            if not SET_CODE_RE.match(sc):
                self.warnings.append(f"invalid set code format: {sc}")
                continue
            self.parts.append(f"e:{sc.lower()}")

    def _compile_rarities(self):
        if self.ir.rarities:
            valid_rars: list[str] = []
            for r in self.ir.rarities:
                rl = r.lower()
                if rl not in VALID_RARITIES:
                    self.warnings.append(f"unknown rarity '{r}' ignored")
                else:
                    valid_rars.append(rl)
            if valid_rars:
                if len(valid_rars) == 1:
                    self.parts.append(f"r:{valid_rars[0]}")
                else:
                    ors = " or ".join([f"r:{r}" for r in valid_rars])
                    self.parts.append(f"({ors})")
            else:
                self.warnings.append(
                    "all provided rarities were invalid; skipping rarity filter"
                )

    def _compile_formats(self):
        for fmt in self.ir.formats:
            if fmt.legal is None or fmt.legal:
                self.parts.append(f"legal:{fmt.name.lower()}")
            else:
                self.parts.append(f"banned:{fmt.name.lower()}")

    def _compile_sort(self):
        if self.ir.sort:
            self.parts.append(f"sort:{self.ir.sort.by}")
            if self.ir.sort.direction == "asc":
                self.parts.append("order:asc")


def compile_to_scryfall(ir: QueryIR) -> tuple[str, list[str], list[str]]:
    import time

    start = time.perf_counter()
    compiler = ScryfallCompiler(ir)
    query, warnings = compiler.compile()
    parts = compiler.parts[:]
    outcome = "empty" if not query else "success"
    COMPILE_COUNT.labels(outcome).inc()
    for w in warnings:
        COMPILE_WARNINGS.labels(_categorize_warning(w)).inc()
    COMPILE_LATENCY.observe(time.perf_counter() - start)
    return query, parts, warnings


__all__ = ["compile_to_scryfall", "ScryfallCompiler"]
