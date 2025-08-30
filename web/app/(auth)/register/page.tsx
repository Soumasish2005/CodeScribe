/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useAuth } from "@/hooks/use-auth"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { Header } from "@/components/header"

export default function RegisterPage() {
  const { register } = useAuth()
  const router = useRouter()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  return (
    <main>
      <Header />
      <div className="mx-auto max-w-md px-4 py-10">
        <h1 className="text-2xl font-bold mb-6">Create your account</h1>
        <div className="space-y-4">
          <div>
            <label className="block text-sm mb-1">Name</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm mb-1">Email</label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm mb-1">Password</label>
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          {message && <p className="text-sm text-green-600">{message}</p>}
          {error && <p className="text-sm text-red-600">{error}</p>}
          <Button
            className="w-full"
            disabled={loading}
            onClick={async () => {
              setLoading(true)
              setError(null)
              setMessage(null)
              try {
                await register(name, email, password)
                setMessage("Registration successful. Check your email for verification.")
                setTimeout(() => router.push("/login"), 1200)
              } catch (e: any) {
                setError(e?.message || "Registration failed")
              } finally {
                setLoading(false)
              }
            }}
          >
            {loading ? "Creating..." : "Create account"}
          </Button>
          <p className="text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link className="text-blue-600 underline" href="/login">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </main>
  )
}
