"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";

import { AuthForm } from "../components/AuthForm";
import { NoteComposer } from "../components/NoteComposer";
import { NoteList } from "../components/NoteList";
import { useAuth } from "../hooks/useAuth";
import { notesApi } from "../lib/api";
import type { Note, NotePayload } from "../types";

export default function HomePage() {
  const { user, token, isLoading, error, login, signup, logout } = useAuth();
  const [notes, setNotes] = useState<Note[]>([]);
  const [isFetching, setIsFetching] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [includeArchived, setIncludeArchived] = useState(false);
  const [query, setQuery] = useState("");
  const [activeQuery, setActiveQuery] = useState<string | undefined>(undefined);

  const loadNotes = useCallback(async () => {
    if (!token) return;
    setIsFetching(true);
    try {
      const data = await notesApi.list(token, activeQuery, includeArchived);
      setNotes(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsFetching(false);
    }
  }, [token, activeQuery, includeArchived]);

  useEffect(() => {
    loadNotes();
  }, [loadNotes]);

  useEffect(() => {
    if (!token) {
      setNotes([]);
    }
  }, [token]);

  const handleCreate = async (payload: NotePayload) => {
    if (!token) return;
    setIsSaving(true);
    try {
      const note = await notesApi.create(token, payload);
      setNotes((prev) => [note, ...prev]);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const updateNoteLocal = (updated: Note) => {
    setNotes((prev) => prev.map((note) => (note.id === updated.id ? updated : note)));
  };

  const handleTogglePin = async (noteId: number, nextValue: boolean) => {
    if (!token) return;
    const updated = await notesApi.update(token, noteId, { is_pinned: nextValue });
    updateNoteLocal(updated);
  };

  const handleToggleArchive = async (noteId: number, nextValue: boolean) => {
    if (!token) return;
    const updated = await notesApi.update(token, noteId, { is_archived: nextValue });
    if (nextValue && !includeArchived) {
      setNotes((prev) => prev.filter((note) => note.id !== noteId));
    } else {
      updateNoteLocal(updated);
    }
  };

  const handleDelete = async (noteId: number) => {
    if (!token) return;
    await notesApi.remove(token, noteId);
    setNotes((prev) => prev.filter((note) => note.id !== noteId));
  };

  const handleRegenerate = async (noteId: number) => {
    if (!token) return;
    const updated = await notesApi.update(token, noteId, { regenerate_ai: true });
    updateNoteLocal(updated);
  };

  const filteredNotes = useMemo(() => {
    if (!query) return notes;
    const lowered = query.toLowerCase();
    return notes.filter(
      (note) =>
        note.title.toLowerCase().includes(lowered) ||
        note.content.toLowerCase().includes(lowered) ||
        (note.ai_summary?.toLowerCase().includes(lowered) ?? false)
    );
  }, [notes, query]);

  const handleSearchSubmit = (event: FormEvent) => {
    event.preventDefault();
    setActiveQuery(query.trim() || undefined);
  };

  if (!user) {
    return (
      <main className="page center">
        <AuthForm onLogin={login} onSignup={signup} isLoading={isLoading} error={error} />
      </main>
    );
  }

  return (
    <div className="page">
      <header className="app-header">
        <div>
          <p className="muted small">SmartNotes</p>
          <h1>Hey {user.full_name || user.username} 👋</h1>
        </div>
        <div className="header-actions">
          <form className="search" onSubmit={handleSearchSubmit}>
            <input placeholder="Search notes" value={query} onChange={(event) => setQuery(event.target.value)} />
            <button type="submit" className="btn ghost">
              Search
            </button>
          </form>
          <label className="switch">
            <input type="checkbox" checked={includeArchived} onChange={(event) => setIncludeArchived(event.target.checked)} />
            <span>Show archived</span>
          </label>
          <button className="btn ghost" onClick={logout}>
            Logout
          </button>
        </div>
      </header>

      <section className="layout">
        <NoteComposer onCreate={handleCreate} isSubmitting={isSaving} />
        <div>
          <div className="card">
            <div className="card-header">
              <h3>Your notes</h3>
              <span className="muted small">{isFetching ? "Loading…" : `${notes.length} saved`}</span>
            </div>
            <NoteList
              notes={filteredNotes}
              onDelete={handleDelete}
              onRegenerate={handleRegenerate}
              onToggleArchive={handleToggleArchive}
              onTogglePin={handleTogglePin}
            />
          </div>
        </div>
      </section>
    </div>
  );
}
