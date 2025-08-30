"use client"
import useSWR from "swr"
import { useSearchParams } from "next/navigation"
import { BlogCard, type BlogCardData } from "./blog-card"
import { swrFetcher } from "@/lib/swr-fetcher"

type ListResp = {
  data: BlogCardData[]
  page?: number
  limit?: number
  total?: number
}

export function BlogFeed() {
  const sp = useSearchParams()
  const q = sp.get("q") || ""
  const path = q ? `/blogs?search=${encodeURIComponent(q)}&page=1&limit=10` : "/blogs?page=1&limit=10"
  const { data, error, isLoading } = useSWR<ListResp>(path, swrFetcher)

  if (isLoading) return <p className="px-4">Loading...</p>
  if (error) return <p className="px-4 text-destructive">Failed to load: {(error as Error).message}</p>

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {data?.data?.map((b) => (
        <BlogCard key={b.id} blog={b} />
      ))}
    </div>
  )
}
