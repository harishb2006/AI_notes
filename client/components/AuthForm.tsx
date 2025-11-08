"use client";

import { ChangeEvent, FormEvent, useEffect, useState } from "react";

import type { Credentials, SignupPayload } from "../types";

interface AuthFormProps {
  onLogin: (payload: Credentials) => Promise<void>;
  onSignup: (payload: SignupPayload) => Promise<void>;
  isLoading: boolean;
  error?: string | null;
}

const initial = {
  email: "",
  username: "",
  full_name: "",
  password: "",
};

export const AuthForm = ({ onLogin, onSignup, isLoading, error }: AuthFormProps) => {
  const [form, setForm] = useState(initial);
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [feedback, setFeedback] = useState<string | null>(error ?? null);

  useEffect(() => {
    setFeedback(error ?? null);
  }, [error]);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setFeedback(null);
    try {
      if (mode === "login") {
        await onLogin({ username: form.username, password: form.password });
      } else {
        await onSignup({
          email: form.email,
          username: form.username,
          full_name: form.full_name,
          password: form.password,
        });
      }
    } catch (err) {
      setFeedback((err as { message?: string })?.message ?? "Could not complete request");
    }
  };

  const toggleMode = () => {
    setMode((prev) => (prev === "login" ? "signup" : "login"));
    setFeedback(null);
  };

  return (
    <div className="card">
      <h2>{mode === "login" ? "Welcome back" : "Create your account"}</h2>
      <p className="muted">SmartNotes keeps your ideas + AI summaries in sync.</p>
      <form onSubmit={handleSubmit} className="form">
        {mode === "signup" && (
          <label>
            Email
            <input type="email" name="email" value={form.email} onChange={handleChange} required disabled={isLoading} />
          </label>
        )}
        {mode === "signup" && (
          <label>
            Full Name
            <input type="text" name="full_name" value={form.full_name} onChange={handleChange} disabled={isLoading} />
          </label>
        )}
        <label>
          Username
          <input type="text" name="username" value={form.username} onChange={handleChange} required disabled={isLoading} />
        </label>
        <label>
          Password
          <input type="password" name="password" value={form.password} onChange={handleChange} required disabled={isLoading} />
        </label>
        {feedback && <p className="error">{feedback}</p>}
        <button type="submit" className="btn primary" disabled={isLoading}>
          {isLoading ? "Please wait…" : mode === "login" ? "Sign in" : "Sign up"}
        </button>
      </form>
      <button type="button" className="btn ghost" onClick={toggleMode} disabled={isLoading}>
        {mode === "login" ? "Need an account? Sign up" : "Have an account? Log in"}
      </button>
    </div>
  );
};
