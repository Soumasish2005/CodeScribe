import type React from "react"
import AdminGuard from "@/components/admin-guard"
import AdminSidebar from "@/components/sidebar"
import AdminTopbar from "@/components/topbar"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminGuard>
      <div className="min-h-dvh flex bg-background">
        <AdminSidebar />
        <div className="flex-1 flex flex-col">
          <AdminTopbar />
          <main className="p-4">{children}</main>
        </div>
      </div>
    </AdminGuard>
  )
}
