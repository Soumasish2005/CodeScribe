/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useAuth } from "@/hooks/use-auth"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { Header } from "@/components/header"

export default function LoginPage() {
  const { login } = useAuth()
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  return (
    <main>
      <Header />
      <div className="mx-auto max-w-md px-4 py-10">
        <h1 className="text-2xl font-bold mb-6">Log in</h1>
        <div className="space-y-4">
          <div>
            <label className="block text-sm mb-1">Email</label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm mb-1">Password</label>
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <Button
            className="w-full"
            disabled={loading}
            onClick={async () => {
              setLoading(true)
              setError(null)
              try {
                await login(email, password)
                router.push("/")
              } catch (e: any) {
                setError(e?.message || "Login failed")
              } finally {
                setLoading(false)
              }
            }}
          >
            {loading ? "Logging in..." : "Log in"}
          </Button>
          <p className="text-sm text-muted-foreground">
            New here?{" "}
            <Link className="text-blue-600 underline" href="/register">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </main>
  )
}
