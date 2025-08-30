import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export type BlogCardData = {
  id: string
  title: string
  author?: { name?: string }
  likeCount?: number
  commentCount?: number
  viewCount?: number
  createdAt?: string
}

export function BlogCard({ blog }: { blog: BlogCardData }) {
  return (
    <Link href={`/blog/${blog.id}`} className="block transition hover:-translate-y-0.5">
      <Card>
        <CardHeader>
          <CardTitle className="text-pretty">{blog.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            <span>{blog.author?.name || "Unknown"}</span>
            <span>•</span>
            <span>{blog.likeCount ?? 0} likes</span>
            <span>•</span>
            <span>{blog.commentCount ?? 0} comments</span>
            <span>•</span>
            <span>{blog.viewCount ?? 0} views</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
