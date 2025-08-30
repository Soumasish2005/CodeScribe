"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { likeBlog, unlikeBlog } from "@/lib/api"

export function LikeButton({
  id,
  initialLiked = false,
  initialCount = 0,
}: {
  id: string
  initialLiked?: boolean
  initialCount?: number
}) {
  const [liked, setLiked] = useState(initialLiked)
  const [count, setCount] = useState(initialCount)
  const [loading, setLoading] = useState(false)

  async function toggle() {
    if (loading) return
    setLoading(true)
    try {
      if (liked) {
        await unlikeBlog(id)
        setLiked(false)
        setCount((c) => Math.max(0, c - 1))
      } else {
        await likeBlog(id)
        setLiked(true)
        setCount((c) => c + 1)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button variant={liked ? "default" : "outline"} onClick={toggle} disabled={loading} aria-pressed={liked}>
      ❤️ {count}
    </Button>
  )
}
