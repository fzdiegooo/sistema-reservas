"use client";

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

import { AuthSession, type UserRole } from "@/lib/types";

interface AuthContextValue {
  session: AuthSession | null;
  setSession: (session: AuthSession | null) => void;
  logout: () => void;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);
const STORAGE_KEY = "sr-auth";

const readStoredSession = (): AuthSession | null => {
  if (typeof window === "undefined") return null;
  const saved = window.localStorage.getItem(STORAGE_KEY);
  if (!saved) return null;
  try {
    return JSON.parse(saved) as AuthSession;
  } catch {
    window.localStorage.removeItem(STORAGE_KEY);
    return null;
  }
};

const decodeTokenClaims = (
  token: string
): { role?: string; sub?: string; username?: string } => {
  try {
    const [, payload] = token.split(".");
    if (!payload) return {};
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const json = typeof atob === "function" ? atob(base64) : "";
    return json ? (JSON.parse(json) as Record<string, unknown>) : {};
  } catch {
    return {};
  }
};

const normalizeSession = (value: AuthSession | null): AuthSession | null => {
  if (!value?.token) return value;
  const hasUser = Boolean(value.user?.username && value.user?.role);
  if (hasUser) return value;

  const claims = decodeTokenClaims(value.token);
  const derivedRole = claims.role as UserRole | undefined;
  const username = (claims.sub || claims.username || value.user?.username || "usuario") as string;

  const role = derivedRole ?? value.user?.role ?? "USER";

  return {
    ...value,
    user: {
      username,
      role,
    },
  };
};

export function AuthProvider({
  children,
}: Readonly<{ children: ReactNode }>) {
  const [session, setSessionState] = useState<AuthSession | null>(() =>
    normalizeSession(readStoredSession())
  );

  const persistSession = useCallback((value: AuthSession | null) => {
    const normalized = normalizeSession(value);
    setSessionState(normalized);

    if (typeof window === "undefined") return;

    if (normalized) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
    } else {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  const logout = useCallback(() => persistSession(null), [persistSession]);
  const setSession = useCallback(
    (value: AuthSession | null) => persistSession(value),
    [persistSession]
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      setSession,
      logout,
      isAdmin: session?.user?.role === "ADMIN",
    }),
    [logout, session, setSession]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe usarse dentro de un AuthProvider");
  }
  return context;
};
