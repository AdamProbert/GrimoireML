from pydantic import BaseModel, Field
from typing import Optional


class Example(BaseModel):
    id: int = Field(..., description="Unique identifier")
    name: str = Field(..., description="Human readable name")
    description: Optional[str] = Field(None, description="Optional details")
