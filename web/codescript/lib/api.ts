import { getToken } from "./auth"

const BASE_URL = "http://localhost:4000/api/v1"

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE"


async function request<T>(path: string, options: RequestInit & { auth?: boolean } = {}): Promise<T> {
  const { auth, headers: providedHeaders, ...rest } = options as RequestInit & { auth?: boolean }

  let headers: Record<string, string> = {
    "Content-Type": "application/json",
  }

  if (providedHeaders) {
    if (providedHeaders instanceof Headers) {
      providedHeaders.forEach((value, key) => {
        headers[key] = value
      })
    } else if (typeof providedHeaders === "object" && !Array.isArray(providedHeaders)) {
      headers = { ...headers, ...providedHeaders }
    }
  }

  // Always send token if available
  const token = getToken()
  if (token) headers["Authorization"] = `Bearer ${token}`

  const res = await fetch(`${BASE_URL}${path}`, {
    ...rest,
    headers,
  })

  if (!res.ok) {
    let message = `Request failed: ${res.status}`
    try {
      const body = await res.json()
      message = (body as any)?.message || message
    } catch {
      // ignore JSON parse errors
    }
    throw new Error(message)
  }

  // 204 No Content
  if (res.status === 204) {
    return undefined as T
  }

  return (await res.json()) as T
}

export const api = {
  get: (path: string, auth = false) => request(path, { method: "GET", auth }),
  post: (path: string, body?: unknown, auth = false) =>
    request(path, {
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
      auth,
    }),
  patch: (path: string, body?: unknown, auth = false) =>
    request(path, {
      method: "PATCH",
      body: body ? JSON.stringify(body) : undefined,
      auth,
    }),
  del: (path: string, auth = false) => request(path, { method: "DELETE", auth }),
}
