import type { Course } from "./types"
import { parseMeetingTimes, hasTimeConflict, type TimeSlot } from "./time-utils"

export interface ScheduleSolution {
  scheduledCourses: Course[] // Courses that fit without conflict
  unschedulableCourses: Course[] // Courses that couldn't be scheduled
  totalCredits: number // Total credits of scheduled courses
}

/**
 * Solves the course scheduling problem using a greedy algorithm with backtracking
 * Goal: Maximize the number of courses scheduled without time conflicts
 *
 * Algorithm:
 * 1. Sort courses by priority (courses with fewer meeting times first, then by credits)
 * 2. Greedily add courses to schedule if they don't conflict
 * 3. Return the best schedule found
 *
 * @param courses Array of courses to schedule
 * @returns ScheduleSolution with scheduled and unschedulable courses
 */
export function solveSchedule(courses: Course[]): ScheduleSolution {
  if (courses.length === 0) {
    return {
      scheduledCourses: [],
      unschedulableCourses: [],
      totalCredits: 0,
    }
  }

  // Parse time slots for all courses
  const courseSlots: { course: Course; slots: TimeSlot[] }[] = courses.map((course) => ({
    course,
    slots: parseMeetingTimes(course),
  }))

  // Sort courses by priority:
  // 1. Courses with TBA times go last (empty slots array)
  // 2. Courses with more credits first (prefer higher credit courses)
  // 3. Courses with fewer time slots first (easier to fit)
  const sortedCourseSlots = [...courseSlots].sort((a, b) => {
    // TBA courses (no time slots) go to the end
    if (a.slots.length === 0 && b.slots.length > 0) return 1
    if (a.slots.length > 0 && b.slots.length === 0) return -1

    // Prefer higher credit courses
    const creditsA = parseFloat(a.course.credit_hours) || 0
    const creditsB = parseFloat(b.course.credit_hours) || 0
    if (creditsA !== creditsB) return creditsB - creditsA

    // Prefer courses with fewer meeting times (easier to fit)
    return a.slots.length - b.slots.length
  })

  // Greedy algorithm: add courses one by one if they don't conflict
  const scheduled: Course[] = []
  const scheduledSlots: TimeSlot[] = []
  const unschedulable: Course[] = []

  for (const { course, slots } of sortedCourseSlots) {
    // If course has no time slots (TBA), it can always be scheduled
    if (slots.length === 0) {
      scheduled.push(course)
      continue
    }

    // Check if this course conflicts with any already scheduled course
    let hasConflict = false
    for (const newSlot of slots) {
      for (const existingSlot of scheduledSlots) {
        if (hasTimeConflict(newSlot, existingSlot)) {
          hasConflict = true
          break
        }
      }
      if (hasConflict) break
    }

    if (hasConflict) {
      unschedulable.push(course)
    } else {
      scheduled.push(course)
      scheduledSlots.push(...slots)
    }
  }

  // Calculate total credits
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
 * Advanced solver that tries multiple orderings to find the best solution
 * This is more computationally expensive but can find better schedules
 *
 * @param courses Array of courses to schedule
 * @param maxAttempts Maximum number of different orderings to try (default: 10)
 * @returns ScheduleSolution with the best schedule found
 */
export function solveScheduleOptimized(
  courses: Course[],
  maxAttempts: number = 10
): ScheduleSolution {
  if (courses.length === 0 || courses.length <= 5) {
    // For small sets, use basic solver
    return solveSchedule(courses)
  }

  let bestSolution: ScheduleSolution = {
    scheduledCourses: [],
    unschedulableCourses: courses,
    totalCredits: 0,
  }

  // Try different sorting strategies
  const strategies = [
    // Strategy 1: Prioritize high credit courses
    (a: Course, b: Course) => {
      const creditsA = parseFloat(a.credit_hours) || 0
      const creditsB = parseFloat(b.credit_hours) || 0
      return creditsB - creditsA
    },
    // Strategy 2: Prioritize courses with fewer meeting times
    (a: Course, b: Course) => {
      const slotsA = parseMeetingTimes(a).length
      const slotsB = parseMeetingTimes(b).length
      return slotsA - slotsB
    },
    // Strategy 3: Alphabetical by department (spread across departments)
    (a: Course, b: Course) => a.course_dept.localeCompare(b.course_dept),
    // Strategy 4: Random shuffle (try a few random orderings)
  ]

  // Try each strategy
  for (let i = 0; i < Math.min(maxAttempts, strategies.length + 3); i++) {
    let sortedCourses: Course[]

    if (i < strategies.length) {
      // Use predefined strategy
      sortedCourses = [...courses].sort(strategies[i])
    } else {
      // Random shuffle
      sortedCourses = [...courses].sort(() => Math.random() - 0.5)
    }

    const solution = solveSchedule(sortedCourses)

    // Update best solution if this one is better
    if (
      solution.scheduledCourses.length > bestSolution.scheduledCourses.length ||
      (solution.scheduledCourses.length === bestSolution.scheduledCourses.length &&
        solution.totalCredits > bestSolution.totalCredits)
    ) {
      bestSolution = solution
    }

    // If we scheduled all courses, we can't do better
    if (solution.unschedulableCourses.length === 0) {
      break
    }
  }

  return bestSolution
}
