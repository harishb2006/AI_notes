"use client";

import type { Note } from "../types";

interface NoteCardProps {
  note: Note;
  onTogglePin: (noteId: number, nextValue: boolean) => Promise<void>;
  onToggleArchive: (noteId: number, nextValue: boolean) => Promise<void>;
  onDelete: (noteId: number) => Promise<void>;
  onRegenerate: (noteId: number) => Promise<void>;
}

export const NoteCard = ({ note, onTogglePin, onToggleArchive, onDelete, onRegenerate }: NoteCardProps) => {
  const handlePin = () => onTogglePin(note.id, !note.is_pinned);
  const handleArchive = () => onToggleArchive(note.id, !note.is_archived);

  return (
    <article className={`note ${note.is_pinned ? "pinned" : ""}`}>
      <header className="note-header">
        <div>
          <h4>{note.title}</h4>
          <p className="muted small">Updated {new Date(note.updated_at).toLocaleString()}</p>
        </div>
        <div className="note-actions">
          <button className="icon" onClick={handlePin} title={note.is_pinned ? "Unpin" : "Pin"}>
            {note.is_pinned ? "📌" : "📍"}
          </button>
          <button className="icon" onClick={handleArchive} title={note.is_archived ? "Unarchive" : "Archive"}>
            {note.is_archived ? "🗂️" : "🗄️"}
          </button>
          <button className="icon" onClick={() => onRegenerate(note.id)} title="Regenerate AI">
            🤖
          </button>
          <button className="icon" onClick={() => onDelete(note.id)} title="Delete">
            🗑️
          </button>
        </div>
      </header>
      <p className="content">{note.content}</p>
      {note.tags && note.tags.length > 0 && (
        <div className="tags">
          {note.tags.map((tag) => (
            <span key={tag}>{tag}</span>
          ))}
        </div>
      )}
      {note.ai_summary && (
        <div className="ai-summary">
          <div className="muted small">AI summary</div>
          <p>{note.ai_summary}</p>
        </div>
      )}
      {note.ai_tags && note.ai_tags.length > 0 && (
        <div className="tags ai">
          {note.ai_tags.map((tag) => (
            <span key={tag}>{tag}</span>
          ))}
        </div>
      )}
    </article>
  );
};
