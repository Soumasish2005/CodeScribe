"use client"
import useSWR, { mutate } from "swr"
import { swrFetcher } from "@/lib/swr-fetcher"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useState } from "react"
import { api } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

type Comment = { id: string; content: string; author?: { name?: string }; createdAt?: string }
type ListResp = { data: Comment[] }

export function Comments({ blogId }: { blogId: string }) {
  const path = `/blogs/${blogId}/comments`
  const { data, error, isLoading } = useSWR<ListResp>(path, swrFetcher)
  const [text, setText] = useState("")
  const { showToast } = useToast()

  async function submit() {
    if (!text.trim()) return
    try {
      await api.post(path, { content: text }, true)
      setText("")
      mutate(path)
    } catch (e) {
      showToast(`Failed to comment: ${(e as Error).message}`)
    }
  }

  if (isLoading) return <div>Loading comments...</div>
  if (error) return <div className="text-destructive">Failed to load comments</div>

  return (
    <section className="space-y-4">
      <h3 className="text-lg font-semibold">Comments</h3>
      <div className="space-y-3">
        {data?.data?.map((c) => (
          <div key={c.id} className="rounded-md border p-3">
            <div className="text-sm text-muted-foreground">{c.author?.name || "Anonymous"}</div>
            <div className="mt-1">{c.content}</div>
          </div>
        ))}
      </div>
      <div className="space-y-2">
        <Textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="Write a comment..." />
        <Button onClick={submit} className="bg-blue-600 hover:bg-blue-700 text-white">
          Post Comment
        </Button>
      </div>
    </section>
  )
}
