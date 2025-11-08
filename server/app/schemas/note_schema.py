from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, Field, ConfigDict


class NoteBase(BaseModel):
    """Shared attributes for note requests/responses."""

    title: str = Field(..., min_length=1, max_length=255)
    content: str = Field(..., min_length=1)
    tags: Optional[List[str]] = Field(default=None, description="Optional manual tags for the note")
    is_pinned: bool = False
    is_archived: bool = False


class NoteCreate(NoteBase):
    """Payload for creating a note."""

    use_ai: bool = Field(
        default=True,
        description="When true, the backend will call Gemini to create summaries and tags.",
    )


class NoteUpdate(BaseModel):
    """Payload for updating an existing note."""

    title: Optional[str] = Field(default=None, min_length=1, max_length=255)
    content: Optional[str] = Field(default=None, min_length=1)
    tags: Optional[List[str]] = None
    is_pinned: Optional[bool] = None
    is_archived: Optional[bool] = None
    regenerate_ai: bool = Field(
        default=False,
        description="Force re-run of AI enrichment even if title/content do not change.",
    )


class NoteResponse(BaseModel):
    """Response schema sent back to the client."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    owner_id: int
    title: str
    content: str
    ai_summary: Optional[str] = None
    ai_tags: Optional[List[str]] = None
    tags: Optional[List[str]] = None
    is_pinned: bool
    is_archived: bool
    created_at: datetime
    updated_at: datetime
