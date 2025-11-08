import type { Credentials, Note, NotePayload, NoteUpdatePayload, SignupPayload, User } from "../types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000/api";

const request = async <T>(path: string, options: RequestInit = {}, token?: string): Promise<T> => {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
    cache: "no-store",
  });

  if (!response.ok) {
    let message = response.statusText;
    try {
      const body = await response.json();
      message = body.detail || body.message || message;
    } catch (error) {
      // ignore
    }
    throw new Error(message);
  }

  if (response.status === 204) {
    return null as T;
  }

  return (await response.json()) as T;
};

export const authApi = {
  signup: (payload: SignupPayload) =>
    request<User>("/auth/signup", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  login: (payload: Credentials) =>
    request<{ access_token: string; token_type: string }>("/auth/login", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  me: (token: string) => request<User>("/auth/me", {}, token),
};

export const notesApi = {
  list: (token: string, search?: string, includeArchived = false) => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (includeArchived) params.set("include_archived", "true");
    const query = params.toString() ? `?${params}` : "";
    return request<Note[]>(`/notes${query}`, {}, token);
  },
  create: (token: string, payload: NotePayload) =>
    request<Note>("/notes", {
      method: "POST",
      body: JSON.stringify(payload),
    }, token),
  update: (token: string, noteId: number, payload: NoteUpdatePayload) =>
    request<Note>(`/notes/${noteId}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    }, token),
  remove: (token: string, noteId: number) =>
    request<void>(`/notes/${noteId}`, {
      method: "DELETE",
    }, token),
};
