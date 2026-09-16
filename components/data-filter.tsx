"use client"

import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useState, useTransition, useEffect, useRef } from "react"
import { Input } from "@/components/ui/input"
import { Search, Loader2, X } from "lucide-react"

interface DataFilterProps {
  searchPlaceholder?: string
  defaultQuery?: string
  defaultLimit?: number
  limitOptions?: { label: string; value: number }[]
}

export function DataFilter({
  searchPlaceholder = "Cari data...",
  defaultQuery = "",
  defaultLimit = 10,
  limitOptions = [
    { label: "10 data per baris", value: 10 },
    { label: "25 data per baris", value: 25 },
    { label: "50 data per baris", value: 50 },
  ],
}: DataFilterProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  const [query, setQuery] = useState(defaultQuery)
  const [limit, setLimit] = useState(defaultLimit.toString())
  const isInitialMount = useRef(true)

  // Sync state if URL changes externally (e.g. browser back / forward)
  const currentUrlQ = searchParams.get("q") || ""
  const currentUrlLimit = searchParams.get("limit") || defaultLimit.toString()

  const [prevUrlQ, setPrevUrlQ] = useState(currentUrlQ)
  const [prevUrlLimit, setPrevUrlLimit] = useState(currentUrlLimit)

  if (prevUrlQ !== currentUrlQ) {
    setPrevUrlQ(currentUrlQ)
    setQuery(currentUrlQ)
  }

  if (prevUrlLimit !== currentUrlLimit) {
    setPrevUrlLimit(currentUrlLimit)
    setLimit(currentUrlLimit)
  }

  // Debounced auto-search when user types
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false
      return
    }

    const timer = setTimeout(() => {
      const currentParams = new URLSearchParams(window.location.search)
      const currentQ = currentParams.get("q") || ""
      const trimmed = query.trim()

      if (currentQ === trimmed) return

      if (trimmed) {
        currentParams.set("q", trimmed)
      } else {
        currentParams.delete("q")
      }
      currentParams.set("page", "1")

      startTransition(() => {
        router.replace(`${pathname}?${currentParams.toString()}`)
      })
    }, 350)

    return () => clearTimeout(timer)
  }, [query, pathname, router])

  // Instant filter on limit change
  const handleLimitChange = (newLimit: string) => {
    setLimit(newLimit)
    const currentParams = new URLSearchParams(window.location.search)
    currentParams.set("limit", newLimit)
    currentParams.set("page", "1")

    startTransition(() => {
      router.replace(`${pathname}?${currentParams.toString()}`)
    })
  }

  // Clear search input
  const handleClear = () => {
    setQuery("")
    const currentParams = new URLSearchParams(window.location.search)
    currentParams.delete("q")
    currentParams.set("page", "1")

    startTransition(() => {
      router.replace(`${pathname}?${currentParams.toString()}`)
    })
  }

  return (
    <div className="flex flex-col sm:flex-row gap-2.5 items-center w-full sm:w-auto">
      <div className="relative w-full sm:w-[320px]">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={searchPlaceholder}
          className="pl-9 pr-9 h-10 w-full rounded-lg bg-background"
        />
        {isPending ? (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary animate-spin" />
        ) : query ? (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-0.5"
            title="Hapus pencarian"
          >
            <X className="h-4 w-4" />
          </button>
        ) : null}
      </div>

      <select
        value={limit}
        onChange={(e) => handleLimitChange(e.target.value)}
        className="h-10 rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring cursor-pointer w-full sm:w-auto font-medium"
      >
        {limitOptions.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  )
}
