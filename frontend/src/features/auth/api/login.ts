import type { LoginResponse, SessionState } from "@entities/auth/types";
import { API_BASE_URL } from "@shared/config/env";
import { request } from "@shared/api/http-client";

export async function login(username: string, password: string): Promise<SessionState> {
  const response = await request<LoginResponse>(`${API_BASE_URL}/api/auth/login`, {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });

  return {
    accessToken: response.accessToken,
    expiresAtUtc: response.expiresAtUtc,
    user: response.user,
  };
}
