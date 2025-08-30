"use client"

import { ThemeToggle } from "@/components/theme-toggle"
import { useAuth } from "@/hooks/use-auth"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export default function AdminTopbar() {
  const { user } = useAuth()
  return (
    <header className="h-14 border-b flex items-center justify-between px-4 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="font-medium">Dashboard</div>
      <div className="flex items-center gap-3">
        <ThemeToggle />
        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8">
            <AvatarImage src={"/placeholder.svg?height=40&width=40&query=avatar"} alt={user?.name || "admin"} />
            <AvatarFallback>{user?.name?.[0]?.toUpperCase() || "A"}</AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  )
}
