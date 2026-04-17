import type { PropsWithChildren } from "react";
import { AuthProvider } from "@features/auth/context/auth-context";

export function AppProviders({ children }: PropsWithChildren) {
  return <AuthProvider>{children}</AuthProvider>;
}
