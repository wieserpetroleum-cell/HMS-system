import * as React from "react";
import type { User } from "@/lib/types";
import { ROLE_DASHBOARD } from "@/lib/types";
import { mockUsers } from "@/lib/mock/users";

const STORAGE_KEY = "hms_auth_user";

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<User>;
  logout: () => void;
  dashboardRoute: string;
}

const AuthContext = React.createContext<AuthContextValue | null>(null);

function readStored(): User | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as User) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<User | null>(null);

  React.useEffect(() => {
    setUser(readStored());
  }, []);

  const login = React.useCallback(async (email: string, password: string) => {
    await new Promise((r) => setTimeout(r, 350));
    const match = mockUsers.find(
      (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password,
    );
    if (!match) throw new Error("Invalid email or password");
    const { password: _p, ...safe } = match;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(safe));
    setUser(safe);
    return safe;
  }, []);

  const logout = React.useCallback(() => {
    window.localStorage.removeItem(STORAGE_KEY);
    setUser(null);
  }, []);

  const dashboardRoute = user ? (ROLE_DASHBOARD[user.role] ?? "/dashboard") : "/dashboard";

  const value = React.useMemo<AuthContextValue>(
    () => ({ user, isAuthenticated: !!user, login, logout, dashboardRoute }),
    [user, login, logout, dashboardRoute],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = React.useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export function getStoredUser() {
  return readStored();
}
