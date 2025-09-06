from __future__ import annotations
from sqlalchemy import String, Integer, ForeignKey, DateTime, func
from datetime import datetime
from sqlalchemy.orm import Mapped, mapped_column, relationship
from typing import List
from ..core.db import Base


class Deck(Base):
    __tablename__ = "decks"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    # Store timezone-aware timestamp (UTC) instead of epoch ms
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    cards: Mapped[List[DeckCard]] = relationship(
        "DeckCard", back_populates="deck", cascade="all, delete-orphan"
    )


class DeckCard(Base):
    __tablename__ = "deck_cards"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    deck_id: Mapped[int] = mapped_column(
        ForeignKey("decks.id", ondelete="CASCADE"), index=True
    )
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    count: Mapped[int] = mapped_column(Integer, nullable=False, default=1)

    deck: Mapped[Deck] = relationship("Deck", back_populates="cards")
