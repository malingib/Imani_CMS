export class ApiError extends Error {
  constructor(public status: number, public statusText: string, public data?: unknown) {
    super(`API Error: ${status} ${statusText}`);
    this.name = "ApiError";
  }
}

const BASE_URL = "";
const DEFAULT_TIMEOUT_MS = 30_000;

export async function apiFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);
  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      ...options, signal: options.signal ?? controller.signal,
      credentials: "include",
      headers: { "Content-Type": "application/json", ...options.headers },
    });
    if (!response.ok) {
      let data: unknown;
      try { data = await response.json(); } catch {}
      throw new ApiError(response.status, response.statusText, data);
    }
    if (response.status === 204) return undefined as T;
    return response.json();
  } finally { clearTimeout(timeoutId); }
}

export function apiGet<T>(endpoint: string): Promise<T> { return apiFetch<T>(endpoint, { method: "GET" }); }
export function apiPost<T>(endpoint: string, body?: unknown): Promise<T> {
  return apiFetch<T>(endpoint, { method: "POST", ...(body ? { body: JSON.stringify(body) } : {}) });
}
export function apiPatch<T>(endpoint: string, body?: unknown): Promise<T> {
  return apiFetch<T>(endpoint, { method: "PATCH", ...(body ? { body: JSON.stringify(body) } : {}) });
}
export function apiDelete<T>(endpoint: string): Promise<T> {
  return apiFetch<T>(endpoint, { method: "DELETE" });
}
