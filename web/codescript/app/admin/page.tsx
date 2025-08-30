"use client"
import useSWR, { mutate } from "swr"
import { swrFetcher } from "@/lib/swr-fetcher"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { api } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

type AdminBlog = { id: string; title: string; status: string; author?: { name?: string } }
type ListResp = { data: AdminBlog[] }

export default function AdminPage() {
  const { data, error, isLoading } = useSWR<ListResp>("/admin/blogs?status=pending&page=1&limit=20", swrFetcher)
  const { showToast } = useToast()

  async function act(id: string, action: "approve" | "reject" | "hide" | "delete") {
    try {
      if (action === "delete") await api.del(`/admin/blogs/${id}`, true)
      else await api.post(`/admin/blogs/${id}/${action}`, undefined, true)
      mutate("/admin/blogs?status=pending&page=1&limit=20")
    } catch (e) {
      showToast(`Action failed: ${(e as Error).message}`)
    }
  }

  if (isLoading) return <main className="mx-auto max-w-5xl px-4 py-6">Loading…</main>
  if (error) return <main className="mx-auto max-w-5xl px-4 py-6 text-destructive">Failed to load queue</main>

  return (
    <main className="mx-auto max-w-5xl px-4 py-6 space-y-4">
      <h1 className="text-2xl font-semibold">Moderation Queue</h1>
      {data?.data?.map((b) => (
        <Card key={b.id} className="transition hover:-translate-y-0.5">
          <CardHeader>
            <CardTitle>{b.title}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-muted-foreground mr-auto">by {b.author?.name || "Unknown"}</span>
            <Button onClick={() => act(b.id, "approve")} className="bg-blue-600 hover:bg-blue-700 text-white">
              Approve
            </Button>
            <Button onClick={() => act(b.id, "reject")} variant="secondary">
              Reject
            </Button>
            <Button onClick={() => act(b.id, "hide")} variant="outline">
              Hide
            </Button>
            <Button onClick={() => act(b.id, "delete")} variant="destructive">
              Delete
            </Button>
          </CardContent>
        </Card>
      ))}
    </main>
  )
}
