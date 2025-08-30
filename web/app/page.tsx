"use client"

import useSWR from "swr"
import Link from "next/link"
import { Header } from "@/components/header"
import { getTrending, searchBlogs } from "@/lib/api"
import { PostCard } from "@/components/post-card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useState } from "react"

export default function HomePage() {
  const [tab, setTab] = useState<"relevant" | "latest" | "top">("relevant")
  const { data } = useSWR(["feed", tab], async () => {
    if (tab === "relevant") {
      const res = await searchBlogs({ page: 1, limit: 10 })
      return res?.data?.data || []
    }
    if (tab === "latest") {
      const res = await getTrending({ window: "24h", limit: 10 })
      console.log(res)
      return res?.data?.data || []
    }
    // "top" -> trending 24h
    const res = await getTrending({ window: "24h", limit: 10 })
    return res?.data?.data || []
  })

  return (
    <main>
      <Header />
      <div className="mx-auto max-w-6xl px-4 py-6 grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Left rail */}
        <aside className="hidden md:block md:col-span-3">
          <nav className="flex flex-col gap-2">
            <Link className="px-3 py-2 rounded hover:bg-muted" href="/">
              Home
            </Link>
            <Link className="px-3 py-2 rounded hover:bg-muted" href="/new">
              Write a post
            </Link>
            <Link className="px-3 py-2 rounded hover:bg-muted" href="/search">
              Explore
            </Link>
            <Link className="px-3 py-2 rounded hover:bg-muted" href="https://dev.to/tags" target="_blank">
              Tags
            </Link>
          </nav>
        </aside>

        {/* Feed */}
        <section className="md:col-span-6 space-y-4">
          <Tabs value={tab} onValueChange={(v) => setTab(v as any)}>
            <TabsList>
              <TabsTrigger value="relevant">Relevant</TabsTrigger>
              <TabsTrigger value="latest">Latest</TabsTrigger>
              <TabsTrigger value="top">Top</TabsTrigger>
            </TabsList>
          </Tabs>
          <div className="space-y-4">
            {data?.length ? (
              data.map((p: any) => <PostCard key={p._id} post={p} />)
            ) : (
              <Card className="p-6">No posts found.</Card>
            )}
          </div>
        </section>

        {/* Right rail */}
        <aside className="hidden md:flex md:col-span-3 flex-col gap-4">
          <Card className="p-4">
            <h3 className="font-semibold mb-2">Welcome to codeScribe</h3>
            <p className="text-sm text-muted-foreground mb-3">
              A place for developers to share, stay up-to-date, and grow.
            </p>
            <Button asChild className="w-full">
              <Link href="/new">Create Post</Link>
            </Button>
          </Card>
          <Card className="p-4">
            <h3 className="font-semibold mb-2">Trending</h3>
            <TrendingList />
          </Card>
        </aside>
      </div>
    </main>
  )
}

function TrendingList() {
  const { data } = useSWR(["trending", "24h"], () => getTrending({ window: "24h", limit: 5 }))
  if (!data?.length) return <p className="text-sm text-muted-foreground">No trending posts.</p>
  return (
    <ul className="space-y-2">
      {data.map((p: any) => (
        <li key={p._id}>
          <Link className="hover:text-blue-600" href={`/blogs/${p._id}`}>
            {p.title}
          </Link>
        </li>
      ))}
    </ul>
  )
}
