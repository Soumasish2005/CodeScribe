import { BlogFeed } from "@/components/blog-feed"
import { Trending } from "@/components/trending"

export default function Page() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-6">
      <section className="mb-6">
        <h1 className="text-2xl md:text-3xl font-semibold text-balance">Discover and share knowledge on CodeScript</h1>
        <p className="text-muted-foreground">
          Search posts, see what’s trending, and publish your own with our markdown editor.
        </p>
      </section>
      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2">
          <BlogFeed />
        </div>
        <div className="md:col-span-1">
          <Trending />
        </div>
      </div>
    </main>
  )
}
