"use client"

import { useMemo } from "react"
import { useCart } from "@/hooks/useCart"
import { CartItemCard } from "@/components/cart-item-card"
import { CartEmptyState } from "@/components/cart-empty-state"
import { Button } from "@/components/ui/button"
import { Trash2, ArrowLeft, AlertTriangle } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import { findConflicts } from "@/lib/time-utils"

export default function CartPage() {
  const { cartItems, cartCount, totalCredits, removeFromCart, clearCart } = useCart()

  // Detect schedule conflicts
  const conflicts = useMemo(() => {
    const courses = cartItems.map((item) => item.course)
    return findConflicts(courses)
  }, [cartItems])

  // Build a map of course IDs to their conflicts
  const conflictMap = useMemo(() => {
    const map = new Map<string, Set<string>>()

    for (const conflict of conflicts) {
      // Add conflict for course1
      if (!map.has(conflict.course1.id)) {
        map.set(conflict.course1.id, new Set())
      }
      map.get(conflict.course1.id)!.add(conflict.course2.id)

      // Add conflict for course2
      if (!map.has(conflict.course2.id)) {
        map.set(conflict.course2.id, new Set())
      }
      map.get(conflict.course2.id)!.add(conflict.course1.id)
    }

    return map
  }, [conflicts])

  const handleClearAll = () => {
    if (cartCount === 0) return

    // Confirm before clearing
    const confirmed = window.confirm(
      `Are you sure you want to remove all ${cartCount} course${cartCount > 1 ? "s" : ""} from your cart?`
    )

    if (confirmed) {
      clearCart()
      toast.success("Cart cleared")
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/">
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">My Cart</h1>
                {cartCount > 0 && (
                  <p className="text-sm text-gray-600 mt-0.5">
                    {cartCount} course{cartCount > 1 ? "s" : ""} • {totalCredits.toFixed(1)} credit
                    {totalCredits !== 1 ? "s" : ""}
                  </p>
                )}
              </div>
            </div>

            {cartCount > 0 && (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleClearAll}
                  className="text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Clear All
                </Button>
                <Button size="sm" disabled className="bg-gray-400 cursor-not-allowed">
                  Generate Schedule
                  <span className="ml-2 text-xs opacity-75">(Coming Soon)</span>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {cartCount === 0 ? (
          <CartEmptyState />
        ) : (
          <div className="space-y-6">
            {/* Conflict warning banner */}
            {conflicts.length > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-yellow-900 mb-1">
                      {conflicts.length} Schedule Conflict{conflicts.length > 1 ? "s" : ""} Detected
                    </h3>
                    <p className="text-sm text-yellow-800">
                      Some courses in your cart have overlapping meeting times. Conflicting courses are
                      highlighted below. You can still generate a schedule - the system will try to fit as
                      many courses as possible.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Course cards */}
            <div className="grid gap-4">
              {cartItems.map((item) => {
                const courseConflicts = conflictMap.get(item.course.id)
                const hasConflict = courseConflicts && courseConflicts.size > 0
                const conflictingCourses = hasConflict
                  ? Array.from(courseConflicts)
                      .map((id) => {
                        const conflictItem = cartItems.find((ci) => ci.course.id === id)
                        return conflictItem
                          ? `${conflictItem.course.course_dept} ${conflictItem.course.course_code}`
                          : null
                      })
                      .filter((name): name is string => name !== null)
                  : []

                return (
                  <CartItemCard
                    key={item.course.id}
                    course={item.course}
                    hasConflict={hasConflict || false}
                    conflictsWith={conflictingCourses}
                    onRemove={() => {
                      removeFromCart(item.course.id)
                      toast.success("Course removed from cart", {
                        description: `${item.course.course_dept} ${item.course.course_code}`,
                      })
                    }}
                  />
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
