import { useCallback } from "react"

export function useToast() {
  const showToast = useCallback((message: string, type: "success" | "error" = "success") => {
    // Simple browser alert for demonstration. Replace with a real toast library if needed.
    alert(`${type === "error" ? "Error: " : ""}${message}`)
  }, [])

  return { showToast }
}
