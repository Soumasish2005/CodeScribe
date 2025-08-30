"use client"

import useSWR from "swr"
import { getTrending, searchBlogs } from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function AdminOverviewPage() {
  const { data: t24 } = useSWR(["trending", "24h"], () => getTrending({ window: "24h", limit: 10 }))
  const { data: t7d } = useSWR(["trending", "7d"], () => getTrending({ window: "7d", limit: 10 }))
  const { data: all } = useSWR(["search", 1], () => searchBlogs({ page: 1, limit: 1 }))

  const t24Count = Array.isArray(t24) ? t24.length : (t24?.data?.length ?? 0)
  const t7dCount = Array.isArray(t7d) ? t7d.length : (t7d?.data?.length ?? 0)

  const metrics = [
    { label: "Trending (24h)", value: t24Count },
    { label: "Trending (7d)", value: t7dCount },
    { label: "Total Posts", value: all?.meta?.total ?? 0 },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {metrics.map((m) => (
        <Card key={m.label}>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">{m.label}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{m.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
