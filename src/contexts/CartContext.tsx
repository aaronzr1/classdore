"use client"

import React, { createContext, useReducer, useEffect, type ReactNode } from "react"
import type { CartState, CartAction, CartItem } from "@/lib/cart-types"
import type { Course } from "@/lib/types"

const CART_STORAGE_KEY = "classdore_cart"

// Initial state
const initialState: CartState = {
  items: [],
  term: null,
}

// Helper function to get term identifier from course
function getCourseTerm(course: Course): string {
  return `${course.term_year}-${course.term_season}`
}

// Cart reducer
function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "ADD_COURSE": {
      const course = action.payload
      const courseTerm = getCourseTerm(course)

      // Check if course already exists in cart
      if (state.items.some((item) => item.course.id === course.id)) {
        return state
      }

      // If cart has items, validate term matches
      if (state.term && state.term !== courseTerm) {
        // Don't add - term mismatch
        return state
      }

      const newItem: CartItem = {
        course,
        addedAt: Date.now(),
      }

      return {
        items: [...state.items, newItem],
        term: courseTerm,
      }
    }

    case "REMOVE_COURSE": {
      const courseId = action.payload
      const newItems = state.items.filter((item) => item.course.id !== courseId)

      return {
        items: newItems,
        term: newItems.length > 0 ? state.term : null,
      }
    }

    case "CLEAR_CART": {
      return initialState
    }

    case "LOAD_FROM_STORAGE": {
      return action.payload
    }

    default:
      return state
  }
}

// Context type
interface CartContextType {
  state: CartState
  dispatch: React.Dispatch<CartAction>
}

// Create context
export const CartContext = createContext<CartContextType | undefined>(undefined)

// Provider component
export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, initialState)

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY)
      if (stored) {
        const parsedState: CartState = JSON.parse(stored)
        dispatch({ type: "LOAD_FROM_STORAGE", payload: parsedState })
      }
    } catch (error) {
      console.error("Failed to load cart from localStorage:", error)
      // Try sessionStorage as fallback
      try {
        const stored = sessionStorage.getItem(CART_STORAGE_KEY)
        if (stored) {
          const parsedState: CartState = JSON.parse(stored)
          dispatch({ type: "LOAD_FROM_STORAGE", payload: parsedState })
        }
      } catch (sessionError) {
        console.error("Failed to load cart from sessionStorage:", sessionError)
      }
    }
  }, [])

  // Save to localStorage whenever state changes
  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(state))
    } catch (error) {
      console.error("Failed to save cart to localStorage:", error)
      // Try sessionStorage as fallback
      try {
        sessionStorage.setItem(CART_STORAGE_KEY, JSON.stringify(state))
      } catch (sessionError) {
        console.error("Failed to save cart to sessionStorage:", sessionError)
      }
    }
  }, [state])

  return <CartContext.Provider value={{ state, dispatch }}>{children}</CartContext.Provider>
}
