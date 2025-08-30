"use client"
import dynamic from "next/dynamic"
import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card"
import { api } from "@/lib/api"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"

// use dynamic import to avoid SSR issues
const MDEditor = dynamic(() => import("@uiw/react-md-editor"), { ssr: false })

export default function WritePage() {
  const [title, setTitle] = useState("")
  const [content, setContent] = useState<string>("")
  const [tags, setTags] = useState<string>("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { showToast } = useToast()

  async function submit() {
    if (!title.trim() || !content.trim()) {
      showToast("Title and content are required", "error")
      return
    }
    setLoading(true)
    try {
      // Send raw markdown to backend (content)
      const res = await api.post(
        "/blogs",
        {
          title,
          content,
          tags: tags
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean),
        },
        true,
      ) as { id: string }
      showToast(`Submitted for review (ID: ${res.id})`)
      router.push(`/blog/${res.id}`)
    } catch (e) {
      showToast(`Failed to publish: ${(e as Error).message}`, "error")
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-6 space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Create a new post</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4" data-color-mode="light">
          <Input placeholder="Post title" value={title} onChange={(e) => setTitle(e.target.value)} />
          <Input placeholder="Tags (comma separated)" value={tags} onChange={(e) => setTags(e.target.value)} />
          <div className="rounded-md border p-2">
            <MDEditor value={content} onChange={(v) => setContent(v || "")} height={400} />
          </div>
          <div className="flex justify-end">
            <Button onClick={submit} disabled={loading} className="bg-orange-500 hover:bg-orange-600 text-white">
              {loading ? "Submitting..." : "Submit"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </main>
  )
}
