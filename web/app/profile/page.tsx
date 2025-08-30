"use client"

import { Header } from "@/components/header"
import { useAuth } from "@/hooks/use-auth"
import { Card } from "@/components/ui/card"

export default function ProfilePage() {
  const { user } = useAuth()
  return (
    <main>
      <Header />
      <div className="mx-auto max-w-3xl px-4 py-6">
        <Card className="p-6">
          <h1 className="text-2xl font-bold mb-2">{user?.name || "Profile"}</h1>
          <p className="text-muted-foreground">{user?.email}</p>
        </Card>
      </div>
    </main>
  )
}
