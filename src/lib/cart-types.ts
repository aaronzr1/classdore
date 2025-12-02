import type { Course } from "./types"

export interface CartItem {
  course: Course
  addedAt: number // timestamp
}

export interface CartState {
  items: CartItem[]
  term: string | null // Format: "term_year-term_season" (e.g., "2025-Spring")
}

export type CartAction =
  | { type: "ADD_COURSE"; payload: Course }
  | { type: "REMOVE_COURSE"; payload: string } // course id
  | { type: "CLEAR_CART" }
  | { type: "LOAD_FROM_STORAGE"; payload: CartState }
