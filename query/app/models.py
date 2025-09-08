"""Pydantic v2 models defining the intermediate representation (IR) and I/O schemas."""

from __future__ import annotations

from typing import Literal, List
from pydantic import BaseModel, Field

Color = Literal["W", "U", "B", "R", "G"]


class Entity(BaseModel):
    card_types: List[str] = []
    subtypes: List[str] = []
    supertypes: List[str] = []
    name_contains: List[str] = []
    oracle_text_contains: List[str] = []


class CompareNumber(BaseModel):
    op: Literal["<", "<=", "=", ">=", ">"]
    value: int


class Colors(BaseModel):
    mode: Literal["identity_only", "card_color"] = "identity_only"
    set: List[Color] = []
    strict: bool = False


class ReleaseDate(BaseModel):
    op: Literal[">=", "<=", ">", "<", "="] = ">="
    date: str  # YYYY-MM-DD


class Formats(BaseModel):
    name: str
    legal: bool | None = None


class SortSpec(BaseModel):
    by: str = "edhrec"
    direction: Literal["asc", "desc"] = "desc"


class QueryIR(BaseModel):
    entity: Entity = Field(default_factory=Entity)
    mana_value: CompareNumber | None = None
    colors: Colors | None = None
    release_date: ReleaseDate | None = None
    set_codes: List[str] = []
    rarities: List[str] = []
    # name and oracle text variants
    name_exact: List[str] = []
    name_not: List[str] = []
    oracle_text_exact: List[str] = []
    oracle_text_not: List[str] = []
    # flavor text filters
    flavor_text_contains: List[str] = []
    flavor_text_exact: List[str] = []
    flavor_text_not: List[str] = []
    # numeric comparisons
    power: CompareNumber | None = None
    toughness: CompareNumber | None = None
    loyalty: CompareNumber | None = None
    card_number: CompareNumber | None = None
    price_usd: CompareNumber | None = None
    price_eur: CompareNumber | None = None
    price_tix: CompareNumber | None = None
    # categorical filters
    layout: List[str] = []  # scryfall layouts
    languages: List[str] = []
    artist: List[str] = []
    watermark: List[str] = []
    border: List[str] = []
    frame: List[str] = []
    reprint_groups: List[str] = []
    related: List[str] = []
    art_tags: List[str] = []  # art:, atag:, arttag:
    oracle_tags: List[str] = []  # function:, otag:, oracletag:
    formats: List[Formats] = []
    sort: SortSpec = Field(default_factory=SortSpec)


class ParseRequest(BaseModel):
    text: str

    model_config = {
        "json_schema_extra": {
            "examples": [
                {"text": "blue instant draw spells cmc 3 or less released after 2021"},
                {"text": "mono white angels mv<=5 legal commander"},
            ]
        }
    }


class ParseResponse(BaseModel):
    ir: QueryIR
    query: str
    warnings: list[str] = []
    query_parts: list[str] = []

    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "ir": {
                        "entity": {
                            "card_types": ["creature"],
                            "subtypes": ["angel"],
                            "name_contains": [],
                            "oracle_text_contains": [],
                        },
                        "colors": {
                            "mode": "identity_only",
                            "set": ["W"],
                            "strict": False,
                        },
                        "mana_value": {"op": "<=", "value": 5},
                        "release_date": {"op": ">=", "date": "2021-01-01"},
                        "set_codes": [],
                        "rarities": [],
                        "formats": [{"name": "commander", "legal": True}],
                        "sort": {"by": "edhrec", "direction": "desc"},
                    },
                    "query": "t:creature t:angel id<=w mv<=5 year>=2021 legal:commander sort:edhrec",
                    "parts": [
                        "t:creature",
                        "t:angel",
                        "id<=w",
                        "mv<=5",
                        "year>=2021",
                        "legal:commander",
                        "sort:edhrec",
                    ],
                    "warnings": [],
                }
            ]
        }
    }
