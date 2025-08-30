"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Heart } from "lucide-react"
import { api } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

export function LikeButton({
  blogId,
  initiallyLiked,
  initialCount = 0,
}: { blogId: string; initiallyLiked?: boolean; initialCount?: number }) {
  const [liked, setLiked] = useState(!!initiallyLiked)
  const [count, setCount] = useState(initialCount)
  const { showToast } = useToast()

  async function toggle() {
    try {
      if (liked) {
        await api.post(`/blogs/${blogId}/unlike`, undefined, true)
        setLiked(false)
        setCount((c) => Math.max(0, c - 1))
      } else {
        await api.post(`/blogs/${blogId}/like`, undefined, true)
        setLiked(true)
        setCount((c) => c + 1)
      }
    } catch (e) {
      showToast(`Action failed: ${(e as Error).message}`)
    }
  }

  return (
    <Button
      onClick={toggle}
      variant={liked ? "default" : "outline"}
      className={liked ? "bg-orange-500 hover:bg-orange-600 text-white" : ""}
    >
      <Heart className={`mr-2 size-4 ${liked ? "fill-current" : ""}`} />
      {liked ? "Liked" : "Like"} • {count}
    </Button>
  )
}
