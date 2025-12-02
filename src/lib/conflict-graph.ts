import type { Course } from "./types"
import { parseMeetingTimes, hasTimeConflict } from "./time-utils"

/**
 * Node in the conflict graph representing a course
 */
export interface CourseNode {
  course: Course
  weight: number // base weight (credits)
  userPreference: number // 0-100, updated via comparisons (50 = neutral)
}

/**
 * Conflict graph using adjacency list representation
 * Nodes are courses, edges represent time conflicts
 */
export class ConflictGraph {
  private adjacencyList: Map<string, Set<string>>
  private courseMap: Map<string, Course>
  private preferences: Map<string, number>

  constructor(courses: Course[]) {
    this.adjacencyList = new Map()
    this.courseMap = new Map()
    this.preferences = new Map()

    // Initialize all courses
    courses.forEach((course) => {
      this.courseMap.set(course.id, course)
      this.adjacencyList.set(course.id, new Set())
      this.preferences.set(course.id, 50) // neutral start
    })

    // Build conflict edges
    this.buildConflicts(courses)
  }

  /**
   * Build conflict edges by checking all pairs of courses for time conflicts
   */
  private buildConflicts(courses: Course[]): void {
    for (let i = 0; i < courses.length; i++) {
      for (let j = i + 1; j < courses.length; j++) {
        const course1 = courses[i]
        const course2 = courses[j]

        const slots1 = parseMeetingTimes(course1)
        const slots2 = parseMeetingTimes(course2)

        // Check if any time slots conflict
        let hasConflict = false
        for (const slot1 of slots1) {
          for (const slot2 of slots2) {
            if (hasTimeConflict(slot1, slot2)) {
              hasConflict = true
              break
            }
          }
          if (hasConflict) break
        }

        if (hasConflict) {
          this.addConflict(course1.id, course2.id)
        }
      }
    }
  }

  /**
   * Add a conflict edge between two courses
   */
  private addConflict(id1: string, id2: string): void {
    this.adjacencyList.get(id1)?.add(id2)
    this.adjacencyList.get(id2)?.add(id1)
  }

  /**
   * Get all courses that conflict with the given course
   */
  getConflicts(courseId: string): Set<string> {
    return this.adjacencyList.get(courseId) || new Set()
  }

  /**
   * Get the course object by ID
   */
  getCourse(courseId: string): Course | undefined {
    return this.courseMap.get(courseId)
  }

  /**
   * Get all course IDs in the graph
   */
  getAllCourseIds(): string[] {
    return Array.from(this.courseMap.keys())
  }

  /**
   * Get all courses in the graph
   */
  getAllCourses(): Course[] {
    return Array.from(this.courseMap.values())
  }

  /**
   * Get preference score for a course (0-100)
   */
  getPreference(courseId: string): number {
    return this.preferences.get(courseId) || 50
  }

  /**
   * Set preference score for a course
   */
  setPreference(courseId: string, score: number): void {
    this.preferences.set(courseId, Math.max(0, Math.min(100, score)))
  }

  /**
   * Update preference when user picks winner over loser
   */
  updatePreference(winnerId: string, loserId: string, amount: number = 5): void {
    const winnerScore = this.getPreference(winnerId)
    const loserScore = this.getPreference(loserId)

    this.setPreference(winnerId, winnerScore + amount)
    this.setPreference(loserId, loserScore - amount)
  }

  /**
   * Propagate preference transitively to courses that conflict with the loser
   */
  propagatePreference(winnerId: string, loserId: string): void {
    const loserConflicts = this.getConflicts(loserId)

    for (const conflictId of loserConflicts) {
      if (conflictId === winnerId) continue

      // Give a smaller boost to winner over loser's conflicts
      const currentScore = this.getPreference(conflictId)
      this.setPreference(conflictId, currentScore - 2)
    }

    // Also give winner a small boost
    const winnerScore = this.getPreference(winnerId)
    this.setPreference(winnerId, winnerScore + 2)
  }

  /**
   * Check if all courses can be scheduled (no conflicts)
   */
  hasNoConflicts(): boolean {
    for (const conflicts of this.adjacencyList.values()) {
      if (conflicts.size > 0) return false
    }
    return true
  }

  /**
   * Get the number of conflicts for a course
   */
  getConflictCount(courseId: string): number {
    return this.getConflicts(courseId).size
  }

  /**
   * Calculate transitive impact: how many other courses would be affected
   * if this course is chosen
   */
  calculateTransitiveImpact(courseId: string): number {
    const directConflicts = this.getConflicts(courseId)
    let totalImpact = directConflicts.size

    // Add conflicts of conflicts
    for (const conflictId of directConflicts) {
      const secondaryConflicts = this.getConflicts(conflictId)
      totalImpact += secondaryConflicts.size
    }

    return totalImpact
  }

  /**
   * Check if course1 dominates course2 (has more credits and conflicts less)
   */
  isDominatedBy(courseId: string, dominatorId: string): boolean {
    const course = this.getCourse(courseId)
    const dominator = this.getCourse(dominatorId)

    if (!course || !dominator) return false

    const courseCredits = parseFloat(course.credit_hours) || 0
    const dominatorCredits = parseFloat(dominator.credit_hours) || 0

    const courseConflicts = this.getConflictCount(courseId)
    const dominatorConflicts = this.getConflictCount(dominatorId)

    // Dominator has more credits and same or fewer conflicts
    return dominatorCredits > courseCredits && dominatorConflicts <= courseConflicts
  }

  /**
   * Get courses sorted by preference score (descending)
   */
  getCoursesByPreference(): Course[] {
    const courses = this.getAllCourses()

    return courses.sort((a, b) => {
      const prefDiff = this.getPreference(b.id) - this.getPreference(a.id)
      if (Math.abs(prefDiff) > 1) return prefDiff

      // Tiebreaker: credits
      const creditsA = parseFloat(a.credit_hours) || 0
      const creditsB = parseFloat(b.credit_hours) || 0
      return creditsB - creditsA
    })
  }

  /**
   * Export preferences as a map
   */
  exportPreferences(): Map<string, number> {
    return new Map(this.preferences)
  }
}
