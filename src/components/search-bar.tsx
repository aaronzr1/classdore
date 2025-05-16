"use client"

import type React from "react"

import { useRef, useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
// import { Button } from "@/components/ui/button"
// import { Search } from "lucide-react"

interface SearchBarProps {
    onSearch: (query: string) => void
}

export function SearchBar({ onSearch }: SearchBarProps) {
    const [query, setQuery] = useState("")
    const debounceTimeout = useRef<NodeJS.Timeout | null>(null)

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        onSearch(query)
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newQuery = e.target.value
        setQuery(newQuery)
        // onSearch(newQuery) // Trigger search immediately on each keystroke
    }

    useEffect(() => {
        // Clear previous timeout
        if (debounceTimeout.current) {
            clearTimeout(debounceTimeout.current)
        }

        // Set new debounce timeout
        debounceTimeout.current = setTimeout(() => {
            onSearch(query)
        }, 300)

        // Cleanup on unmount
        return () => {
            if (debounceTimeout.current) {
                clearTimeout(debounceTimeout.current)
            }
        }
    }, [query]) // eslint-disable-line react-hooks/exhaustive-deps


    return (
        <form onSubmit={handleSubmit} className="flex w-full items-center space-x-2">
            {/* <Button type="submit" size="icon">
          <Search className="h-4 w-4" />
          <span className="sr-only">Search</span>
        </Button> */}
            <Input
                type="search"
                placeholder="Search..."
                value={query}
                onChange={handleInputChange}
                onKeyDown={(e) => {
                    if (e.key === "Enter") {
                        e.preventDefault()
                    }
                }}
                className="flex-grow"
            />
        </form>
    )
}

