"use client"
import Link from "next/link"
import type React from "react"

import { useRouter, useSearchParams } from "next/navigation"
import { useState, useEffect } from "react"
import { ThemeToggle } from "./theme-toggle"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { getToken, clearToken } from "@/lib/auth"

export function Navbar() {
  const router = useRouter()
  const sp = useSearchParams()
  const [q, setQ] = useState(sp.get("q") || "")
  const [authed, setAuthed] = useState(false)

  useEffect(() => {
    setAuthed(!!getToken())
  }, [])

  function onSearch(e: React.FormEvent) {
    e.preventDefault()
    router.push(q ? `/?q=${encodeURIComponent(q)}` : "/")
  }

  function logout() {
    clearToken()
    setAuthed(false)
    router.push("/login")
  }

  return (
    <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3">
        <Link href="/" className="font-semibold text-xl text-blue-600 dark:text-blue-400">
          CodeScript
        </Link>
        <nav className="ml-auto flex items-center gap-2">
          <form onSubmit={onSearch} className="hidden md:flex items-center gap-2">
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search blogs..." className="w-64" />
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">
              Search
            </Button>
          </form>
          <Link href="/write" className="hidden sm:block">
            <Button className="bg-orange-500 hover:bg-orange-600 text-white transition-transform hover:-translate-y-0.5">
              Write
            </Button>
          </Link>
          <Link href="/me">
            <Button variant="ghost">Me</Button>
          </Link>
          <Link href="/admin">
            <Button variant="ghost">Admin</Button>
          </Link>
          <ThemeToggle />
          {!authed ? (
            <Link href="/login">
              <Button variant="outline">Login</Button>
            </Link>
          ) : (
            <Button variant="outline" onClick={logout}>
              Logout
            </Button>
          )}
        </nav>
      </div>
    </header>
  )
}
