"use client"

import BlogsTable from "@/components/blogs-table"

export default function AdminPostsPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Posts moderation</h1>
      <p className="text-sm text-muted-foreground">
        Search posts and take moderation actions. Use Approve to publish and Reject to send back to author.
      </p>
      <BlogsTable />
    </div>
  )
}
