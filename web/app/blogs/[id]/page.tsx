"use client"

import { useParams } from "next/navigation"
import useSWR from "swr"
import { getBlog, addComment } from "@/lib/api"
import { Header } from "@/components/header"
import { MarkdownRenderer } from "@/components/markdown-renderer"
import { Card } from "@/components/ui/card"
import { LikeButton } from "@/components/like-button"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useState } from "react"

// HTML -> Markdown conversion (requirement)
import TurndownService from "turndown"
const turndown = new TurndownService({ headingStyle: "atx", codeBlockStyle: "fenced" })

export default function BlogDetailPage() {
  const params = useParams<{ id: string }>()
  console.log(params)
  const { data, isLoading, mutate } = useSWR(["blog", params.id], () => getBlog(params.id))
  const [comment, setComment] = useState("")
  const markdown = data?.data?.content ? turndown.turndown(data.data.content) : ""
  console.log(data?.data?.title)
  return (
    <main>
      <Header />
      <div className="mx-auto max-w-3xl px-4 py-6">
        {isLoading ? (
          <Card className="p-6">Loading...</Card>
        ) : !data ? (
          <Card className="p-6">Post not found.</Card>
        ) : (
          <article className="space-y-4">
            <h1 className="text-3xl font-bold text-pretty">{data.data.title}</h1>
            <div className="text-sm text-muted-foreground">
              By {data.data.author?.name || "Anonymous"} •{" "}
              <time dateTime={data.data.createdAt}>{new Date(data.data.createdAt).toLocaleDateString()}</time>
            </div>

            <MarkdownRenderer markdown={markdown} />

            <div className="flex items-center gap-4 pt-4">
              <LikeButton id={data.data._id} initialLiked={false} initialCount={data.data.likeCount ?? 0} />
              <span className="text-muted-foreground text-sm">💬 {data.data.commentCount ?? 0}</span>
              <span className="text-muted-foreground text-sm">👀 {data.data.viewCount ?? 0}</span>
            </div>

            <section className="pt-6">
              <h2 className="text-xl font-semibold mb-2">Comments</h2>
              <Card className="p-4 space-y-3">
                <Textarea placeholder="Add a comment..." value={comment} onChange={(e) => setComment(e.target.value)} />
                <Button
                  onClick={async () => {
                    if (!comment.trim()) return
                    await addComment(data.data._id, comment.trim())
                    setComment("")
                    mutate()
                  }}
                >
                  Post comment
                </Button>
              </Card>
            </section>
          </article>
        )}
      </div>
    </main>
  )
}
