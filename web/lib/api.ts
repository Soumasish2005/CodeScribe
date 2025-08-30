/* eslint-disable @typescript-eslint/no-explicit-any */
const API_BASE =
  (typeof window !== "undefined" && (window as any).__API_BASE__) || process.env.NEXT_PUBLIC_API_BASE_URL || ""

type HttpMethod = "GET" | "POST" | "PATCH"

function getToken() {
  if (typeof window === "undefined") return null
  return localStorage.getItem("codescribe_token")
}

export async function apiFetch<T>(
  path: string,
  options: {
    method?: HttpMethod
    body?: any
    params?: Record<string, string | number | undefined>
    auth?: boolean
  } = {},
): Promise<T> {
  const { method = "GET", body, params, auth = false } = options
  const url = new URL(path.startsWith("http") ? path : `${API_BASE}${path}`)
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null) url.searchParams.set(k, String(v))
    })
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  }
  if (auth) {
    const token = getToken()
    if (token) headers.Authorization = `Bearer ${token}`
  }

  const res = await fetch(url.toString(), {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
    cache: "no-store",
  })

  if (!res.ok) {
    const text = await res.text().catch(() => "")
    throw new Error(text || `Request failed: ${res.status}`)
  }
  if (res.status === 204) return undefined as unknown as T
  return res.json()
}

// AUTH
export async function login(email: string, password: string) {
  return apiFetch<{ success: boolean; message: string; data: { user: any; accessToken: string } }>(
    "/api/v1/auth/login",
    { method: "POST", body: { email, password } },
  )
}

export async function registerUser(name: string, email: string, password: string) {
  return apiFetch<{ message?: string }>("/api/v1/auth/register", {
    method: "POST",
    body: { name, email, password },
  })
}

export async function logout() {
  return apiFetch<void>("/api/v1/auth/logout", { method: "POST", auth: true })
}

export async function getMe() {
  return apiFetch<any>("/api/v1/users/me", { auth: true })
}

// BLOGS
export async function createBlog(input: { title: string; content: string; tags: string[] }) {
  return apiFetch<any>("/api/v1/blogs", { method: "POST", body: input, auth: true })
}

export async function getBlog(id: string) {
  return apiFetch<any>(`/api/v1/blogs/${id}`)
}

export async function searchBlogs(params: { q?: string; tags?: string; page?: number; limit?: number }) {
  return apiFetch<any>("/api/v1/blogs/search", { params })
}

export async function getTrending(params: { window?: "24h" | "7d"; limit?: number }) {
  return apiFetch<any>("/api/v1/blogs/trending", { params })
}

export async function likeBlog(id: string) {
  return apiFetch<any>(`/api/v1/blogs/${id}/like`, { method: "POST", auth: true })
}

export async function unlikeBlog(id: string) {
  return apiFetch<any>(`/api/v1/blogs/${id}/unlike`, { method: "POST", auth: true })
}

export async function addComment(id: string, content: string) {
  return apiFetch<any>(`/api/v1/blogs/${id}/comments`, { method: "POST", auth: true, body: { content } })
}

// ADMIN AND EDITING HELPERS
export async function patchBlog(id: string, input: { title?: string; content?: string; tags?: string[] }) {
  return apiFetch<any>(`/api/v1/blogs/${id}`, { method: "PATCH", body: input, auth: true })
}

export async function submitBlog(id: string) {
  return apiFetch<any>(`/api/v1/blogs/${id}/submit`, { method: "POST", auth: true })
}

export async function approveBlog(id: string) {
  return apiFetch<any>(`/api/v1/blogs/admin/${id}/approve`, { method: "POST", auth: true })
}

export async function rejectBlog(id: string, rejectionReason: string) {
  return apiFetch<any>(`/api/v1/blogs/admin/${id}/reject`, {
    method: "POST",
    auth: true,
    body: { rejectionReason },
  })
}
