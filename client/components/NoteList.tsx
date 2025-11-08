"use client";

import type { Note } from "../types";
import { NoteCard } from "./NoteCard";

interface NoteListProps {
  notes: Note[];
  onTogglePin: (noteId: number, nextValue: boolean) => Promise<void>;
  onToggleArchive: (noteId: number, nextValue: boolean) => Promise<void>;
  onDelete: (noteId: number) => Promise<void>;
  onRegenerate: (noteId: number) => Promise<void>;
}

export const NoteList = ({ notes, onDelete, onRegenerate, onToggleArchive, onTogglePin }: NoteListProps) => {
  if (notes.length === 0) {
    return <p className="muted">No notes yet. Start by writing something inspiring ✨</p>;
  }

  return (
    <div className="notes-grid">
      {notes.map((note) => (
        <NoteCard
          key={note.id}
          note={note}
          onDelete={onDelete}
          onRegenerate={onRegenerate}
          onToggleArchive={onToggleArchive}
          onTogglePin={onTogglePin}
        />
      ))}
    </div>
  );
};
