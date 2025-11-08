"use client";

import { FormEvent, useState } from "react";

import type { NotePayload } from "../types";

interface NoteComposerProps {
  onCreate: (payload: NotePayload) => Promise<void>;
  isSubmitting: boolean;
}

const buildInitial = (): NotePayload => ({
  title: "",
  content: "",
  tags: [],
  is_pinned: false,
  use_ai: true,
});

export const NoteComposer = ({ onCreate, isSubmitting }: NoteComposerProps) => {
  const [form, setForm] = useState<NotePayload>(() => buildInitial());

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!form.title.trim() || !form.content.trim()) return;
    await onCreate({
      ...form,
      tags: form.tags?.filter(Boolean),
    });
    setForm(buildInitial());
  };

  return (
    <form className="card composer" onSubmit={handleSubmit}>
      <div className="composer-header">
        <h3>New Note</h3>
        <label className="switch">
          <input type="checkbox" checked={form.use_ai} onChange={(event) => setForm((prev) => ({ ...prev, use_ai: event.target.checked }))} />
          <span>AI summary</span>
        </label>
      </div>
      <input
        className="input title"
        placeholder="Note title"
        value={form.title}
        onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
        disabled={isSubmitting}
        required
      />
      <textarea
        className="input"
        placeholder="Capture your idea..."
        value={form.content}
        rows={4}
        onChange={(event) => setForm((prev) => ({ ...prev, content: event.target.value }))}
        disabled={isSubmitting}
        required
      />
      <input
        className="input"
        placeholder="Tags (comma separated)"
        value={form.tags?.join(", ") ?? ""}
        onChange={(event) =>
          setForm((prev) => ({
            ...prev,
            tags: event.target.value.split(",").map((tag) => tag.trim()).filter(Boolean),
          }))
        }
        disabled={isSubmitting}
      />
      <label className="switch">
        <input type="checkbox" checked={form.is_pinned ?? false} onChange={(event) => setForm((prev) => ({ ...prev, is_pinned: event.target.checked }))} disabled={isSubmitting} />
        <span>Pin to top</span>
      </label>
      <button type="submit" className="btn primary" disabled={isSubmitting}>
        {isSubmitting ? "Saving…" : "Save note"}
      </button>
    </form>
  );
};
