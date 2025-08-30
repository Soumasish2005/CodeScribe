"use client"

import { useSearchParams, useRouter } from "next/navigation"
import useSWR from "swr"
import { searchBlogs } from "@/lib/api"
import { Header } from "@/components/header"
import { PostCard } from "@/components/post-card"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export default function SearchPage() {
  const sp = useSearchParams()
  const router = useRouter()
  const q = sp.get("q") || ""
  const page = Number(sp.get("page") || "1")
  const limit = 10
  const tags = sp.get("tags") || undefined

  const { data } = useSWR(["search", q, tags, page], () => searchBlogs({ q, tags, page, limit }))

  const posts = data?.data || []
  const meta = data?.meta

  function setParam(key: string, value?: string) {
    const params = new URLSearchParams(window.location.search)
    if (value && value.length) params.set(key, value)
    else params.delete(key)
    params.set("page", "1")
    router.push(`/search?${params.toString()}`)
  }

  return (
    <main>
      <Header />
      <div className="mx-auto max-w-6xl px-4 py-6 grid grid-cols-1 md:grid-cols-12 gap-6">
        <aside className="hidden md:block md:col-span-3">
          <Card className="p-4 space-y-2">
            <div className="space-y-2">
              <label className="text-sm">Search</label>
              <Input value={q} onChange={(e) => setParam("q", e.target.value)} placeholder="Search posts..." />
            </div>
            <div className="space-y-2">
              <label className="text-sm">Tags (comma-separated)</label>
              <Input
                defaultValue={tags || ""}
                onBlur={(e) => setParam("tags", e.target.value)}
                placeholder="e.g. react, webdev"
              />
              <Button
                variant="outline"
                onClick={() => {
                  const params = new URLSearchParams(window.location.search)
                  params.delete("q")
                  params.delete("tags")
                  params.set("page", "1")
                  router.push(`/search?${params.toString()}`)
                }}
              >
                Clear
              </Button>
            </div>
          </Card>
        </aside>

        <section className="md:col-span-9 space-y-4">
          {posts.length ? (
            posts.map((p: any) => <PostCard key={p._id} post={p} />)
          ) : (
            <Card className="p-6">No results.</Card>
          )}

          <Pagination
            page={meta?.page || page}
            totalPages={meta?.totalPages || 1}
            onChange={(next) => {
              const params = new URLSearchParams(window.location.search)
              params.set("page", String(next))
              router.push(`/search?${params.toString()}`)
            }}
          />
        </section>
      </div>
    </main>
  )
}

function Pagination({
  page,
  totalPages,
  onChange,
}: { page: number; totalPages: number; onChange: (n: number) => void }) {
  return (
    <div className="flex items-center gap-2">
      <Button variant="outline" disabled={page <= 1} onClick={() => onChange(page - 1)}>
        Prev
      </Button>
      <span className="text-sm text-muted-foreground">
        Page {page} of {totalPages}
      </span>
      <Button variant="outline" disabled={page >= totalPages} onClick={() => onChange(page + 1)}>
        Next
      </Button>
    </div>
  )
}
