export interface User {
  id: number;
  email: string;
  username: string;
  full_name?: string | null;
  is_active: boolean;
  created_at: string;
}

export interface Note {
  id: number;
  owner_id: number;
  title: string;
  content: string;
  tags?: string[] | null;
  ai_summary?: string | null;
  ai_tags?: string[] | null;
  is_pinned: boolean;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
}

export interface Credentials {
  username: string;
  password: string;
}

export interface SignupPayload extends Credentials {
  email: string;
  full_name?: string;
}

export interface NotePayload {
  title: string;
  content: string;
  tags?: string[];
  is_pinned?: boolean;
  is_archived?: boolean;
  use_ai?: boolean;
}

export interface NoteUpdatePayload {
  title?: string;
  content?: string;
  tags?: string[];
  is_pinned?: boolean;
  is_archived?: boolean;
  regenerate_ai?: boolean;
}
