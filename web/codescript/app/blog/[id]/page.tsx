"use client"
import useSWR from "swr"
import { useParams } from "next/navigation"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import rehypeRaw from "rehype-raw"
import { swrFetcher } from "@/lib/swr-fetcher"
import { LikeButton } from "@/components/like-button"
import { Comments } from "@/components/comments"

type BlogDetail = {
  id: string
  title: string
  content: string // raw markdown from backend
  author?: { name?: string }
  likeCount?: number
  likedByMe?: boolean
  commentCount?: number
  viewCount?: number
  createdAt?: string
}

export default function BlogDetailPage() {
  const params = useParams<{ id: string }>()
  const id = params.id
  const { data, error, isLoading } = useSWR<{ data: BlogDetail }>(`/blogs/${id}`, swrFetcher)

  if (isLoading) return <main className="mx-auto max-w-3xl px-4 py-6">Loading post...</main>
  if (error) return <main className="mx-auto max-w-3xl px-4 py-6 text-destructive">Failed to load post</main>

  const post = data!.data

  return (
    <main className="mx-auto max-w-3xl px-4 py-6 space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl md:text-3xl font-semibold text-pretty">{post.title}</h1>
        <div className="text-sm text-muted-foreground">
          By {post.author?.name || "Unknown"} • {post.viewCount ?? 0} views
        </div>
      </header>

      <article className="prose dark:prose-invert max-w-none">
        <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
          {post.content}
        </ReactMarkdown>
      </article>

      <div className="flex items-center gap-3">
        <LikeButton blogId={post.id} initiallyLiked={post.likedByMe} initialCount={post.likeCount ?? 0} />
        <div className="text-sm text-muted-foreground">{post.commentCount ?? 0} comments</div>
      </div>

      <Comments blogId={post.id} />
    </main>
  )
}
