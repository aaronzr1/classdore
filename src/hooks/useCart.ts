"use client"

import { useContext, useCallback } from "react"
import { toast } from "sonner"
import { CartContext } from "@/contexts/CartContext"
import type { Course } from "@/lib/types"

export function useCart() {
  const context = useContext(CartContext)

  if (!context) {
    throw new Error("useCart must be used within a CartProvider")
  }

  const { state, dispatch } = context

  // Helper function to get term identifier
  function getCourseTerm(course: Course): string {
    return `${course.term_year}-${course.term_season}`
  }

  // Add course to cart
  const addToCart = useCallback(
    (course: Course): boolean => {
      const courseTerm = getCourseTerm(course)

      // Check if course already exists
      if (state.items.some((item) => item.course.id === course.id)) {
        toast.error("Course is already in your cart")
        return false
      }

      // Validate term matches if cart has items
      if (state.term && state.term !== courseTerm) {
        toast.error(
          `Cannot add course from ${courseTerm.replace("-", " ")}. Your cart contains courses from ${state.term.replace("-", " ")}.`,
          {
            description: "Please clear your cart first to add courses from a different term.",
          }
        )
        return false
      }

      dispatch({ type: "ADD_COURSE", payload: course })
      return true
    },
    [state.items, state.term, dispatch]
  )

  // Remove course from cart
  const removeFromCart = useCallback(
    (courseId: string) => {
      dispatch({ type: "REMOVE_COURSE", payload: courseId })
    },
    [dispatch]
  )

  // Clear entire cart
  const clearCart = useCallback(() => {
    dispatch({ type: "CLEAR_CART" })
  }, [dispatch])

  // Get total credit hours
  const getTotalCredits = useCallback((): number => {
    return state.items.reduce((total, item) => {
      const credits = parseFloat(item.course.credit_hours) || 0
      return total + credits
    }, 0)
  }, [state.items])

  return {
    // State
    cartItems: state.items,
    cartCount: state.items.length,
    cartTerm: state.term,
    totalCredits: getTotalCredits(),

    // Actions
    addToCart,
    removeFromCart,
    clearCart,
  }
}
