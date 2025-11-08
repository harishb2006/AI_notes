from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user, get_ai_service
from app.db.models.note import Note
from app.db.models.user import User
from app.db.session import get_db
from app.schemas.note_schema import NoteCreate, NoteResponse, NoteUpdate
from app.services import AINoteService

router = APIRouter(prefix="/notes", tags=["Notes"])


@router.get("", response_model=List[NoteResponse])
async def list_notes(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    search: Optional[str] = Query(default=None, description="Filter notes by title/content"),
    include_archived: bool = Query(default=False, description="Include archived notes in the response"),
):
    """Return notes owned by the current user."""
    query = db.query(Note).filter(Note.owner_id == current_user.id)

    if not include_archived:
        query = query.filter(Note.is_archived.is_(False))

    if search:
        like_query = f"%{search.lower()}%"
        query = query.filter(
            (Note.title.ilike(like_query)) | (Note.content.ilike(like_query))
        )

    notes = query.order_by(Note.is_pinned.desc(), Note.updated_at.desc()).all()
    return notes


@router.post("", response_model=NoteResponse, status_code=status.HTTP_201_CREATED)
async def create_note(
    note_data: NoteCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    ai_service: AINoteService = Depends(get_ai_service),
):
    """Create a note and optionally enrich it via Gemini."""
    enrichment_summary = None
    enrichment_tags = None

    if note_data.use_ai:
        ai_result = ai_service.enrich(
            title=note_data.title,
            content=note_data.content,
            manual_tags=note_data.tags,
        )
        enrichment_summary = ai_result.summary
        enrichment_tags = ai_result.tags

    note = Note(
        owner_id=current_user.id,
        title=note_data.title,
        content=note_data.content,
        tags=note_data.tags,
        ai_summary=enrichment_summary,
        ai_tags=enrichment_tags,
        is_pinned=note_data.is_pinned,
        is_archived=note_data.is_archived,
    )
    db.add(note)
    db.commit()
    db.refresh(note)
    return note


def _get_note(db: Session, note_id: int, user_id: int) -> Note:
    note = db.query(Note).filter(Note.id == note_id, Note.owner_id == user_id).first()
    if not note:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Note not found")
    return note


@router.get("/{note_id}", response_model=NoteResponse)
async def get_note(
    note_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Fetch a single note."""
    note = _get_note(db, note_id, current_user.id)
    return note


@router.put("/{note_id}", response_model=NoteResponse)
async def update_note(
    note_id: int,
    note_data: NoteUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    ai_service: AINoteService = Depends(get_ai_service),
):
    """Update a note. AI enrichment re-runs when content/title changes or regenerate_ai is set."""
    note = _get_note(db, note_id, current_user.id)

    content_changed = False
    if note_data.title is not None and note_data.title != note.title:
        note.title = note_data.title
        content_changed = True
    if note_data.content is not None and note_data.content != note.content:
        note.content = note_data.content
        content_changed = True
    if note_data.tags is not None:
        note.tags = note_data.tags

    if note_data.is_pinned is not None:
        note.is_pinned = note_data.is_pinned
    if note_data.is_archived is not None:
        note.is_archived = note_data.is_archived

    if note_data.regenerate_ai or content_changed:
        ai_result = ai_service.enrich(
            title=note.title,
            content=note.content,
            manual_tags=note.tags,
        )
        note.ai_summary = ai_result.summary
        note.ai_tags = ai_result.tags

    db.add(note)
    db.commit()
    db.refresh(note)
    return note


@router.delete("/{note_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_note(
    note_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Delete a note owned by the user."""
    note = _get_note(db, note_id, current_user.id)
    db.delete(note)
    db.commit()
    return None
