import type { SessionState } from "@entities/auth/types";
import { SESSION_KEY } from "@shared/config/env";

export const authStorage = {
  load(): SessionState | null {
    const raw = window.localStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as SessionState) : null;
  },
  save(session: SessionState) {
    window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  },
  clear() {
    window.localStorage.removeItem(SESSION_KEY);
  },
};
