"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { LayoutGrid, FileText } from "lucide-react"

const items = [
  { href: "/admin", label: "Overview", icon: LayoutGrid },
  { href: "/admin/posts", label: "Posts", icon: FileText },
]

export default function AdminSidebar() {
  const pathname = usePathname()
  return (
    <aside className="w-60 shrink-0 border-r bg-background">
      <div className="p-4 font-bold">codeScribe Admin</div>
      <nav className="px-2 py-2 space-y-1">
        {items.map((item) => {
          const Icon = item.icon
          const active = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-accent",
                active ? "bg-accent text-accent-foreground" : "text-foreground",
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
