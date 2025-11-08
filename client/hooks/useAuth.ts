"use client";

import { useCallback, useEffect, useState } from "react";

import { authApi } from "../lib/api";
import type { Credentials, SignupPayload, User } from "../types";

const TOKEN_KEY = "smartnotes_token";

const getPersistedToken = () => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
};

const getErrorMessage = (err: unknown) => (err as { message?: string })?.message ?? "Something went wrong";

export const useAuth = () => {
  const [token, setToken] = useState<string | null>(getPersistedToken);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(!!token);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadProfile = async () => {
      if (!token) {
        setIsLoading(false);
        setUser(null);
        return;
      }
      setIsLoading(true);
      try {
        const profile = await authApi.me(token);
        setUser(profile);
        setError(null);
      } catch (err) {
        setError(getErrorMessage(err));
        setToken(null);
        if (typeof window !== "undefined") {
          localStorage.removeItem(TOKEN_KEY);
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, [token]);

  const persistToken = useCallback((value: string | null) => {
    setToken(value);
    if (typeof window === "undefined") return;
    if (value) {
      localStorage.setItem(TOKEN_KEY, value);
    } else {
      localStorage.removeItem(TOKEN_KEY);
    }
  }, []);

  const login = useCallback(
    async (payload: Credentials) => {
      setError(null);
      try {
        const { access_token } = await authApi.login(payload);
        persistToken(access_token);
        const profile = await authApi.me(access_token);
        setUser(profile);
        return profile;
      } catch (err) {
        const message = getErrorMessage(err);
        setError(message);
        throw new Error(message);
      }
    },
    [persistToken]
  );

  const signup = useCallback(
    async (payload: SignupPayload) => {
      setError(null);
      try {
        await authApi.signup(payload);
        await login({ username: payload.username, password: payload.password });
      } catch (err) {
        const message = getErrorMessage(err);
        setError(message);
        throw new Error(message);
      }
    },
    [login]
  );

  const logout = useCallback(() => {
    persistToken(null);
    setUser(null);
  }, [persistToken]);

  return {
    token,
    user,
    isLoading,
    error,
    login,
    signup,
    logout,
    setError,
  };
};
