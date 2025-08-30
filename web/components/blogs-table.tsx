"use client"

import useSWR from "swr"
import { useState } from "react"
import { searchBlogs, approveBlog, rejectBlog } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"

type Blog = {
  _id: string
  title: string
  content: string
  status: string
  tags: string[]
  author?: { name?: string; email?: string }
  createdAt?: string
}

export default function BlogsTable() {
  const [q, setQ] = useState("")
  const [page, setPage] = useState(1)

  const { data, isLoading, mutate } = useSWR(
    ["admin-blogs", q, page],
    async () => {
      const res = await searchBlogs({ q: q || undefined, page, limit: 10 })
      return res
    },
    { keepPreviousData: true },
  )

  async function onApprove(id: string) {
    await approveBlog(id)
    await mutate()
  }

  async function onReject(id: string) {
    const reason = window.prompt("Enter rejection reason") || ""
    await rejectBlog(id, reason)
    await mutate()
  }

  const blogs: Blog[] = data?.data || []
  const totalPages = data?.meta?.totalPages || 1

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <form
          className="flex items-center gap-2"
          onSubmit={(e) => {
            e.preventDefault()
            setPage(1)
          }}
        >
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search title, content, tags..." />
          <Button type="submit" variant="outline">
            Search
          </Button>
        </form>
        <div className="text-sm text-muted-foreground">
          Page {page} / {totalPages}
        </div>
      </div>

      <div className="rounded-md border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted">
            <tr className="[&>th]:px-3 [&>th]:py-2 text-left">
              <th>Title</th>
              <th>Status</th>
              <th>Tags</th>
              <th>Author</th>
              <th className="w-48">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td className="px-3 py-3" colSpan={5}>
                  Loading...
                </td>
              </tr>
            ) : blogs.length ? (
              blogs.map((b) => (
                <tr key={b._id} className="border-t align-top [&>td]:px-3 [&>td]:py-2">
                  <td>
                    <div className="font-medium line-clamp-2">{b.title}</div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(b.createdAt || Date.now()).toLocaleString()}
                    </div>
                  </td>
                  <td>
                    <Badge variant="outline">{b.status}</Badge>
                  </td>
                  <td>
                    <div className="flex flex-wrap gap-1">
                      {(b.tags || []).map((t) => (
                        <Badge key={t}>#{t}</Badge>
                      ))}
                    </div>
                  </td>
                  <td>
                    <div className="text-xs">
                      {b.author?.name || "-"}
                      <div className="text-muted-foreground">{b.author?.email || ""}</div>
                    </div>
                  </td>
                  <td>
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => onApprove(b._id)}>
                        Approve
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => onReject(b._id)}>
                        Reject
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td className="px-3 py-3" colSpan={5}>
                  No results
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-end gap-2">
        <Button size="sm" variant="outline" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
          Prev
        </Button>
        <Button
          size="sm"
          variant="outline"
          disabled={page >= totalPages}
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
        >
          Next
        </Button>
      </div>
    </div>
  )
}
