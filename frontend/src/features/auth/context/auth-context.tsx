import { createContext, useState, type PropsWithChildren } from "react";
import type { SessionState } from "@entities/auth/types";
import { login } from "@features/auth/api/login";
import { authStorage } from "@features/auth/services/auth-storage";

export type AuthContextValue = {
  session: SessionState | null;
  signIn: (username: string, password: string) => Promise<void>;
  signOut: () => void;
};

export const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<SessionState | null>(() => authStorage.load());

  async function signIn(username: string, password: string) {
    const nextSession = await login(username, password);
    authStorage.save(nextSession);
    setSession(nextSession);
  }

  function signOut() {
    authStorage.clear();
    setSession(null);
  }

  return <AuthContext.Provider value={{ session, signIn, signOut }}>{children}</AuthContext.Provider>;
}
