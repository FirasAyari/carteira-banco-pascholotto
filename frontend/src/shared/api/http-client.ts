type RequestOptions = RequestInit & {
  token?: string | null;
};

export async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const headers = new Headers(options.headers);
  headers.set("Content-Type", "application/json");

  if (options.token) {
    headers.set("Authorization", `Bearer ${options.token}`);
  }

  const response = await fetch(path, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorPayload = (await response.json().catch(() => null)) as { detail?: string } | null;
    throw new Error(errorPayload?.detail ?? "Falha na requisicao.");
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}
