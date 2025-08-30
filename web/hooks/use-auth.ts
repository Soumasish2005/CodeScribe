"use client"

import useSWR from "swr"
import { getMe, login as apiLogin, logout as apiLogout, registerUser } from "@/lib/api"

export function useAuth() {
  const { data, error, isLoading, mutate } = useSWR("me", async () => {
    const token = typeof window !== "undefined" ? localStorage.getItem("codescribe_token") : null
    if (!token) return null
    try {
      const me = await getMe()
      return me
    } catch {
      localStorage.removeItem("codescribe_token")
      return null
    }
  })

  async function login(email: string, password: string) {
    const res = await apiLogin(email, password)
    if (res?.data?.accessToken) {
      localStorage.setItem("codescribe_token", res.data.accessToken)
      await mutate()
    }
    return res
  }

  async function register(name: string, email: string, password: string) {
    return registerUser(name, email, password)
  }

  async function logout() {
    try {
      await apiLogout()
    } catch {}
    localStorage.removeItem("codescribe_token")
    await mutate(null, false)
  }

  return {
    user: data,
    isLoading,
    isLoggedIn: !!data,
    error,
    login,
    register,
    logout,
    refresh: mutate,
  }
}
