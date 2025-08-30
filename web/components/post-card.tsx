import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import type { Blog } from "@/lib/types"

function stripHtml(html: string, max = 220) {
  const txt = html
    .replace(/<[^>]+>/g, "")
    .replace(/\s+/g, " ")
    .trim()
  return txt.length > max ? txt.slice(0, max) + "..." : txt
}

export function PostCard({ post }: { post: Blog }) {
  return (
    <Card className="p-4 hover:border-blue-600 transition-colors">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>{post.author?.name || "Anonymous"}</span>
          <span>•</span>
          <time dateTime={post.createdAt}>{new Date(post.createdAt).toLocaleDateString()}</time>
        </div>

        <Link href={`/blogs/${post._id}`} className="text-xl md:text-2xl font-bold hover:text-blue-600 text-pretty">
          {post.title}
        </Link>

        {post.tags?.length ? (
          <div className="flex flex-wrap gap-2">
            {post.tags.map((t) => (
              <Badge key={t} variant="secondary" className="lowercase">
                #{t}
              </Badge>
            ))}
          </div>
        ) : null}

        <p className="text-sm md:text-base text-muted-foreground">{stripHtml(post.content || "")}</p>

        <div className="flex items-center gap-4 text-muted-foreground text-sm">
          <span>❤️ {post.likeCount ?? 0}</span>
          <span>💬 {post.commentCount ?? 0}</span>
          <span>👀 {post.viewCount ?? 0}</span>
        </div>
      </div>
    </Card>
  )
}
