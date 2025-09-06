from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from ..core.db import get_session
from ..models.deck import Deck, DeckCard
import time


router = APIRouter(prefix="/decks", tags=["decks"])


class DeckCardIn(BaseModel):
    name: str
    count: int = Field(ge=1)


class DeckCreate(BaseModel):
    name: str
    cards: List[DeckCardIn] = []


class DeckUpdate(BaseModel):
    name: Optional[str] = None
    cards: Optional[List[DeckCardIn]] = None


class DeckCardOut(DeckCardIn):
    id: int

    class Config:
        from_attributes = True


class DeckOut(BaseModel):
    id: int
    name: str
    created_at: int
    cards: List[DeckCardOut]

    class Config:
        from_attributes = True


@router.get("/", response_model=List[DeckOut])
async def list_decks(session: AsyncSession = Depends(get_session)):
    result = await session.execute(select(Deck).order_by(Deck.id.desc()))
    decks = result.scalars().unique().all()
    return decks


@router.post("/", response_model=DeckOut, status_code=status.HTTP_201_CREATED)
async def create_deck(
    payload: DeckCreate, session: AsyncSession = Depends(get_session)
):
    deck = Deck(name=payload.name, created_at=int(time.time() * 1000))
    for c in payload.cards:
        deck.cards.append(DeckCard(name=c.name, count=c.count))
    session.add(deck)
    await session.commit()
    await session.refresh(deck)
    return deck


async def _get_deck_or_404(deck_id: int, session: AsyncSession) -> Deck:
    deck = await session.get(Deck, deck_id)
    if not deck:
        raise HTTPException(status_code=404, detail="Deck not found")
    return deck


@router.get("/{deck_id}", response_model=DeckOut)
async def get_deck(deck_id: int, session: AsyncSession = Depends(get_session)):
    return await _get_deck_or_404(deck_id, session)


@router.put("/{deck_id}", response_model=DeckOut)
async def update_deck(
    deck_id: int, payload: DeckUpdate, session: AsyncSession = Depends(get_session)
):
    deck = await _get_deck_or_404(deck_id, session)
    if payload.name is not None:
        deck.name = payload.name
    if payload.cards is not None:
        deck.cards.clear()
        for c in payload.cards:
            deck.cards.append(DeckCard(name=c.name, count=c.count))
    await session.commit()
    await session.refresh(deck)
    return deck


@router.delete("/{deck_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_deck(deck_id: int, session: AsyncSession = Depends(get_session)):
    deck = await _get_deck_or_404(deck_id, session)
    await session.delete(deck)
    await session.commit()
    return None
