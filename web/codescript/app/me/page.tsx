"use client"
import useSWR from "swr"
import { swrFetcher } from "@/lib/swr-fetcher"

type MeResp = { data: { id: string; name: string; email: string; roles?: string[] } }

export default function MePage() {
  const { data, error, isLoading } = useSWR<MeResp>("/users/me", swrFetcher)
  if (isLoading) return <main className="mx-auto max-w-3xl px-4 py-6">Loading…</main>
  if (error) return <main className="mx-auto max-w-3xl px-4 py-6 text-destructive">Failed to load profile</main>

  const me = data!.data
  return (
    <main className="mx-auto max-w-3xl px-4 py-6 space-y-2">
      <h1 className="text-2xl font-semibold">My Profile</h1>
      <div>Name: {me.name}</div>
      <div>Email: {me.email}</div>
      <div>Roles: {(me.roles || []).join(", ") || "user"}</div>
    </main>
  )
}
