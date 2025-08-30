"use client"

import type { ReactNode } from "react"
import { useAuth } from "@/hooks/use-auth"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function AdminGuard({ children }: { children: ReactNode }) {
  const { user, isLoading, isLoggedIn } = useAuth()

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="text-sm text-muted-foreground">Loading...</div>
      </div>
    )
  }

  if (!isLoggedIn || !Array.isArray(user?.roles) || !user.roles.includes("admin")) {
    return (
      <div className="p-6 max-w-xl">
        <h2 className="text-xl font-semibold mb-2">Admin access required</h2>
        <p className="text-sm text-muted-foreground mb-4">
          You don&apos;t have permission to access the admin dashboard. Please log in with an admin account.
        </p>
        <div className="flex gap-2">
          <Button asChild>
            <Link href="/login">Log in</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/">Back to home</Link>
          </Button>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
