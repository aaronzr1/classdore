"use client"

import { ShoppingCart } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export function CartEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="rounded-full bg-gray-100 p-6 mb-4">
        <ShoppingCart className="w-12 h-12 text-gray-400" />
      </div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
      <p className="text-gray-600 mb-6 max-w-md">
        Start building your schedule by adding courses from the course catalog.
      </p>
      <Link href="/">
        <Button>
          Browse Courses
        </Button>
      </Link>
    </div>
  )
}
