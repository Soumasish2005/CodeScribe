"use client"

import { useRouter } from "next/navigation"
import { MarkdownEditor } from "@/components/markdown-editor"
import { createBlog, submitBlog } from "@/lib/api"
import { useState } from "react"
import { Header } from "@/components/header"

export default function NewPostPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  return (
    <main>
      <Header />
      <div className="mx-auto max-w-3xl px-4 py-6">
        <h1 className="text-2xl font-bold mb-4">Create a new post</h1>
        <MarkdownEditor
          onPublish={async ({ title, content, tags }) => {
            setIsSubmitting(true)
            try {
              const created = await createBlog({ title, content, tags })
              if (created?._id) {
                await submitBlog(created._id)
                window.location.assign(`/blogs/${created._id}`)
              } else {
                window.location.assign("/")
              }
            } finally {
              setIsSubmitting(false)
            }
          }}
          onSaveDraft={async ({ title, content, tags }) => {
            setIsSubmitting(true)
            try {
              const created = await createBlog({ title, content, tags })
              if (created?._id) {
                window.location.assign(`/blogs/${created._id}`)
              } else {
                window.location.assign("/")
              }
            } finally {
              setIsSubmitting(false)
            }
          }}
          isSubmitting={isSubmitting}
        />
      </div>
    </main>
  )
}
