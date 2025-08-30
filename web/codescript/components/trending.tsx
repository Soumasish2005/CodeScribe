"use client"
import useSWR from "swr"
import { swrFetcher } from "@/lib/swr-fetcher"
import Link from "next/link"

type TrendItem = { id: string; title: string; likeCount?: number; commentCount?: number; viewCount?: number }
type TrendResp = { data: TrendItem[] }

export function Trending() {
  const { data, error, isLoading } = useSWR<TrendResp>("/blogs/trending?window=7d&limit=5", swrFetcher)
  if (isLoading) return <div className="p-4">Loading trending...</div>
  if (error) return <div className="p-4 text-destructive">Failed: {(error as Error).message}</div>

  return (
    <aside className="rounded-lg border p-4">
      <h3 className="mb-3 font-semibold text-blue-600 dark:text-blue-400">Trending this week</h3>
      <ul className="space-y-2">
        {data?.data?.map((t) => (
          <li key={t.id} className="flex items-center justify-between gap-3">
            <Link href={`/blog/${t.id}`} className="hover:underline text-pretty">
              {t.title}
            </Link>
            <span className="text-xs text-muted-foreground">{t.viewCount ?? 0} views</span>
          </li>
        ))}
      </ul>
    </aside>
  )
}
