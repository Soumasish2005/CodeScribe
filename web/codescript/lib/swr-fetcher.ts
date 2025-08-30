import { getToken } from "./auth"

const BASE_URL = "http://localhost:4000/api/v1"

export async function swrFetcher<Resp = any>(key: string): Promise<Resp> {
  const url = key.startsWith("http") ? key : `${BASE_URL}${key}`
  const headers: HeadersInit = { "Content-Type": "application/json" }
  const token = getToken()
  if (token) headers["Authorization"] = `Bearer ${token}`
  const res = await fetch(url, { headers })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    const message = body?.message || `Request failed: ${res.status}`
    throw new Error(message)
  }
  return res.json()
}
