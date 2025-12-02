import type { Course } from "./types"

export interface TimeSlot {
  courseId: string
  courseName: string // For display in conflict messages
  days: string[] // ["M", "W", "F"]
  startMinutes: number
  endMinutes: number
}

export interface ConflictPair {
  course1: Course
  course2: Course
  conflictingSlots: { days: string[]; time: string }[]
}

/**
 * Parses a time string like "11:00a - 12:15p" into start and end minutes since midnight
 * Returns -1 for both if time is TBA or invalid
 *
 * @param timeString Time string in format "HH:MMa - HH:MMp"
 * @returns Object with start and end minutes since midnight
 */
export function parseTimeString(timeString: string): { start: number; end: number } {
  if (!timeString || timeString.trim() === "" || timeString.toLowerCase().includes("tba")) {
    return { start: -1, end: -1 }
  }

  try {
    // Split by " - " to get start and end times
    const parts = timeString.split(" - ")
    if (parts.length !== 2) {
      return { start: -1, end: -1 }
    }

    const [startStr, endStr] = parts

    // Parse a single time like "11:00a" or "2:30p"
    const parseTime = (timeStr: string): number => {
      const cleaned = timeStr.trim().toLowerCase()

      // Match pattern like "11:00a" or "2:30p"
      const match = cleaned.match(/^(\d{1,2}):(\d{2})([ap])m?$/i)
      if (!match) {
        return -1
      }

      let hours = parseInt(match[1])
      const minutes = parseInt(match[2])
      const period = match[3].toLowerCase()

      // Convert to 24-hour format
      if (period === "p" && hours !== 12) {
        hours += 12
      } else if (period === "a" && hours === 12) {
        hours = 0
      }

      // Convert to minutes since midnight
      return hours * 60 + minutes
    }

    const start = parseTime(startStr)
    const end = parseTime(endStr)

    if (start === -1 || end === -1) {
      return { start: -1, end: -1 }
    }

    return { start, end }
  } catch (error) {
    console.error("Error parsing time string:", timeString, error)
    return { start: -1, end: -1 }
  }
}

/**
 * Parses a course's meeting days and times into structured TimeSlot objects
 *
 * @param course The course to parse
 * @returns Array of TimeSlot objects
 */
export function parseMeetingTimes(course: Course): TimeSlot[] {
  const slots: TimeSlot[] = []

  // Handle case where meeting_days or meeting_times is empty
  if (!course.meeting_days || course.meeting_days.length === 0) {
    return slots
  }

  if (!course.meeting_times || course.meeting_times.length === 0) {
    return slots
  }

  // Parse each meeting time (typically there's one, but could be multiple)
  for (const timeString of course.meeting_times) {
    const { start, end } = parseTimeString(timeString)

    // Skip TBA or invalid times
    if (start === -1 || end === -1) {
      continue
    }

    // Expand meeting days into individual days
    // meeting_days can be ["MWF"], ["TR"], or ["M", "W", "F"]
    // Day abbreviations: M=Monday, T=Tuesday, W=Wednesday, R=Thursday, F=Friday, S=Saturday
    const days: string[] = []

    for (const dayGroup of course.meeting_days) {
      // If it's a single character like "M", just add it
      if (dayGroup.length === 1) {
        days.push(dayGroup)
      } else {
        // Otherwise, split compound days like "MWF" or "TR"
        // Common patterns: M, T, W, R (Thursday), F, S
        let remaining = dayGroup
        while (remaining.length > 0) {
          // Note: R = Thursday (not Th)
          days.push(remaining[0])
          remaining = remaining.slice(1)
        }
      }
    }

    slots.push({
      courseId: course.id,
      courseName: `${course.course_dept} ${course.course_code}`,
      days,
      startMinutes: start,
      endMinutes: end,
    })
  }

  return slots
}

/**
 * Checks if two time slots have a conflict
 * A conflict occurs if they share at least one day AND their times overlap
 *
 * @param slot1 First time slot
 * @param slot2 Second time slot
 * @returns true if slots conflict, false otherwise
 */
export function hasTimeConflict(slot1: TimeSlot, slot2: TimeSlot): boolean {
  // Check if they share any days
  const sharedDays = slot1.days.filter((day) => slot2.days.includes(day))
  if (sharedDays.length === 0) {
    return false
  }

  // Check if times overlap
  // Two intervals [a1, a2] and [b1, b2] overlap if: a1 < b2 AND b1 < a2
  const timesOverlap = slot1.startMinutes < slot2.endMinutes && slot2.startMinutes < slot1.endMinutes

  return timesOverlap
}

/**
 * Finds all schedule conflicts in a set of courses
 *
 * @param courses Array of courses to check
 * @returns Array of conflict pairs
 */
export function findConflicts(courses: Course[]): ConflictPair[] {
  const conflicts: ConflictPair[] = []

  // Parse all time slots for all courses
  const courseSlots: { course: Course; slots: TimeSlot[] }[] = courses.map((course) => ({
    course,
    slots: parseMeetingTimes(course),
  }))

  // Check each pair of courses
  for (let i = 0; i < courseSlots.length; i++) {
    for (let j = i + 1; j < courseSlots.length; j++) {
      const { course: course1, slots: slots1 } = courseSlots[i]
      const { course: course2, slots: slots2 } = courseSlots[j]

      const conflictingSlots: { days: string[]; time: string }[] = []

      // Check each pair of time slots
      for (const slot1 of slots1) {
        for (const slot2 of slots2) {
          if (hasTimeConflict(slot1, slot2)) {
            // Find shared days
            const sharedDays = slot1.days.filter((day) => slot2.days.includes(day))

            // Format time for display
            const formatMinutes = (minutes: number): string => {
              const hours = Math.floor(minutes / 60)
              const mins = minutes % 60
              const period = hours >= 12 ? "PM" : "AM"
              const displayHours = hours % 12 || 12
              return `${displayHours}:${mins.toString().padStart(2, "0")} ${period}`
            }

            const timeString = `${formatMinutes(slot1.startMinutes)} - ${formatMinutes(slot1.endMinutes)}`

            conflictingSlots.push({
              days: sharedDays,
              time: timeString,
            })
          }
        }
      }

      if (conflictingSlots.length > 0) {
        conflicts.push({
          course1,
          course2,
          conflictingSlots,
        })
      }
    }
  }

  return conflicts
}

/**
 * Helper function to format minutes since midnight to a readable time string
 */
export function formatMinutesToTime(minutes: number): string {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  const period = hours >= 12 ? "PM" : "AM"
  const displayHours = hours % 12 || 12
  return `${displayHours}:${mins.toString().padStart(2, "0")} ${period}`
}
