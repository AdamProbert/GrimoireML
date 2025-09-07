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
