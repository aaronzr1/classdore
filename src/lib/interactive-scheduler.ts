import type { Course } from "./types"
import type { ScheduleSolution } from "./schedule-solver"
import { ConflictGraph } from "./conflict-graph"

/**
 * Represents a pairwise comparison question to ask the user
 */
export interface PairwiseComparison {
  course1: Course
  course2: Course
  directConflict: boolean
  transitiveImpact: number
  reason: string // Why we're asking this question
}

/**
 * Find maximal cliques in the conflict graph using Bron-Kerbosch algorithm
 * A clique is a set of courses where every pair conflicts
 */
function findConflictCliques(graph: ConflictGraph): Set<string>[] {
  const cliques: Set<string>[] = []
  const courseIds = graph.getAllCourseIds()

  // Bron-Kerbosch algorithm with pivoting
  function bronKerbosch(
    R: Set<string>, // Current clique being built
    P: Set<string>, // Candidate nodes
    X: Set<string> // Already processed nodes
  ): void {
    if (P.size === 0 && X.size === 0) {
      // Found a maximal clique
      if (R.size > 1) {
        cliques.push(new Set(R))
      }
      return
    }

    // Choose pivot (node with most connections in P)
    let pivot: string | null = null
    let maxConnections = -1

    for (const v of new Set([...P, ...X])) {
      const connections = graph.getConflicts(v)
      const count = Array.from(P).filter((p) => connections.has(p)).length
      if (count > maxConnections) {
        maxConnections = count
        pivot = v
      }
    }

    // Process nodes not connected to pivot
    const pivotConflicts = pivot ? graph.getConflicts(pivot) : new Set<string>()
    const candidates = Array.from(P).filter((p) => !pivotConflicts.has(p))

    for (const v of candidates) {
      const vConflicts = graph.getConflicts(v)
      const newR = new Set([...R, v])
      const newP = new Set(Array.from(P).filter((p) => vConflicts.has(p)))
      const newX = new Set(Array.from(X).filter((x) => vConflicts.has(x)))

      bronKerbosch(newR, newP, newX)

      P.delete(v)
      X.add(v)
    }
  }

  // Start algorithm
  bronKerbosch(new Set(), new Set(courseIds), new Set())

  return cliques
}

/**
 * Generate minimal set of questions to ask user
 * Uses tournament-style comparison within each clique
 */
function minimizeQuestions(graph: ConflictGraph): PairwiseComparison[] {
  const questions: PairwiseComparison[] = []
  const cliques = findConflictCliques(graph)

  for (const clique of cliques) {
    if (clique.size <= 1) continue

    const cliqueArray = Array.from(clique)

    // Use tournament-style: compare against pivot
    const pivotIndex = Math.floor(cliqueArray.length / 2)
    const pivot = graph.getCourse(cliqueArray[pivotIndex])!

    for (let i = 0; i < cliqueArray.length; i++) {
      if (i === pivotIndex) continue

      const courseId = cliqueArray[i]
      const course = graph.getCourse(courseId)!

      // Skip if pivot clearly dominates
      if (graph.isDominatedBy(courseId, pivot.id)) continue

      const impact = graph.calculateTransitiveImpact(courseId)

      questions.push({
        course1: pivot,
        course2: course,
        directConflict: true,
        transitiveImpact: impact,
        reason: `These courses conflict. Choosing one will exclude the other.`,
      })
    }
  }

  // Sort by transitive impact (ask high-impact questions first)
  return questions.sort((a, b) => b.transitiveImpact - a.transitiveImpact)
}

/**
 * Check if we can schedule all courses with current preferences
 */
function canScheduleAll(graph: ConflictGraph): boolean {
  const sortedCourses = graph.getCoursesByPreference()
  const scheduled = new Set<string>()

  for (const course of sortedCourses) {
    const conflicts = graph.getConflicts(course.id)

    // Check if any scheduled course conflicts
    let hasConflict = false
    for (const scheduledId of scheduled) {
      if (conflicts.has(scheduledId)) {
        hasConflict = true
        break
      }
    }

    if (!hasConflict) {
      scheduled.add(course.id)
    }
  }

  return scheduled.size === sortedCourses.length
}

/**
 * Generate final schedule based on preferences
 */
function generateScheduleWithPreferences(graph: ConflictGraph): ScheduleSolution {
  const sortedCourses = graph.getCoursesByPreference()
  const scheduled: Course[] = []
  const scheduledIds = new Set<string>()

  for (const course of sortedCourses) {
    const conflicts = graph.getConflicts(course.id)

    // Check if any scheduled course conflicts
    let hasConflict = false
    for (const scheduledId of scheduledIds) {
      if (conflicts.has(scheduledId)) {
        hasConflict = true
        break
      }
    }

    if (!hasConflict) {
      scheduled.push(course)
      scheduledIds.add(course.id)
    }
  }

  const allCourses = graph.getAllCourses()
  const unschedulable = allCourses.filter((c) => !scheduledIds.has(c.id))

  const totalCredits = scheduled.reduce((sum, course) => {
    return sum + (parseFloat(course.credit_hours) || 0)
  }, 0)

  return {
    scheduledCourses: scheduled,
    unschedulableCourses: unschedulable,
    totalCredits,
  }
}

/**
 * Main interactive scheduling function
 * Asks user for preferences via callback, then generates optimal schedule
 *
 * @param courses Array of courses to schedule
 * @param onAskPreference Async callback to ask user which course they prefer
 * @returns Promise<ScheduleSolution> with scheduled and unschedulable courses
 */
export async function interactiveSchedule(
  courses: Course[],
  onAskPreference: (q: PairwiseComparison) => Promise<Course>
): Promise<ScheduleSolution> {
  // If no conflicts, return immediately
  const graph = new ConflictGraph(courses)

  if (graph.hasNoConflicts()) {
    return {
      scheduledCourses: courses,
      unschedulableCourses: [],
      totalCredits: courses.reduce((sum, c) => sum + (parseFloat(c.credit_hours) || 0), 0),
    }
  }

  // Generate minimal question set
  const questions = minimizeQuestions(graph)

  // If no questions needed (all dominated), generate schedule
  if (questions.length === 0) {
    return generateScheduleWithPreferences(graph)
  }

  // Ask user preferences
  for (const question of questions) {
    const winner = await onAskPreference(question)
    const loser = winner.id === question.course1.id ? question.course2 : question.course1

    // Update preferences
    graph.updatePreference(winner.id, loser.id, 5)

    // Propagate transitively
    graph.propagatePreference(winner.id, loser.id)

    // Early exit if we can schedule all
    if (canScheduleAll(graph)) {
      break
    }
  }

  // Generate final schedule
  return generateScheduleWithPreferences(graph)
}

/**
 * Get statistics about the conflicts and questions
 */
export function getSchedulingStats(courses: Course[]): {
  totalCourses: number
  conflictingPairs: number
  maxCliqueSize: number
  estimatedQuestions: number
} {
  const graph = new ConflictGraph(courses)
  const cliques = findConflictCliques(graph)
  const questions = minimizeQuestions(graph)

  let conflictingPairs = 0
  for (const courseId of graph.getAllCourseIds()) {
    conflictingPairs += graph.getConflicts(courseId).size
  }
  conflictingPairs = conflictingPairs / 2 // Each edge counted twice

  const maxCliqueSize = Math.max(0, ...cliques.map((c) => c.size))

  return {
    totalCourses: courses.length,
    conflictingPairs,
    maxCliqueSize,
    estimatedQuestions: questions.length,
  }
}
