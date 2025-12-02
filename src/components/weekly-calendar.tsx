"use client"

import type { Course } from "@/lib/types"
import { parseMeetingTimes, formatMinutesToTime } from "@/lib/time-utils"
import { useMemo } from "react"

interface WeeklyCalendarProps {
  courses: Course[]
}

// Generate consistent colors for courses
const COURSE_COLORS = [
  "bg-blue-100 border-blue-300 text-blue-900",
  "bg-green-100 border-green-300 text-green-900",
  "bg-purple-100 border-purple-300 text-purple-900",
  "bg-orange-100 border-orange-300 text-orange-900",
  "bg-pink-100 border-pink-300 text-pink-900",
  "bg-indigo-100 border-indigo-300 text-indigo-900",
  "bg-teal-100 border-teal-300 text-teal-900",
  "bg-red-100 border-red-300 text-red-900",
  "bg-yellow-100 border-yellow-300 text-yellow-900",
  "bg-cyan-100 border-cyan-300 text-cyan-900",
]

const DAY_ORDER = ["M", "T", "W", "R", "F"]
const START_HOUR = 8 // 8 AM
const END_HOUR = 18 // 6 PM
const SLOT_HEIGHT = 60 // pixels per hour

function getDayIndex(day: string): number {
  const index = DAY_ORDER.indexOf(day)
  return index >= 0 ? index : -1
}

function getColorForCourse(courseId: string): string {
  // Generate consistent color based on course ID
  let hash = 0
  for (let i = 0; i < courseId.length; i++) {
    hash = courseId.charCodeAt(i) + ((hash << 5) - hash)
  }
  return COURSE_COLORS[Math.abs(hash) % COURSE_COLORS.length]
}

export function WeeklyCalendar({ courses }: WeeklyCalendarProps) {
  const courseBlocks = useMemo(() => {
    const blocks: Array<{
      course: Course
      day: string
      dayIndex: number
      startMinutes: number
      endMinutes: number
      color: string
    }> = []

    for (const course of courses) {
      const slots = parseMeetingTimes(course)
      const color = getColorForCourse(course.id)

      for (const slot of slots) {
        for (const day of slot.days) {
          const dayIndex = getDayIndex(day)
          if (dayIndex >= 0) {
            blocks.push({
              course,
              day,
              dayIndex,
              startMinutes: slot.startMinutes,
              endMinutes: slot.endMinutes,
              color,
            })
          }
        }
      }
    }

    return blocks
  }, [courses])

  // Generate time labels
  const timeSlots: Array<{ hour: number; label: string; minutes: number }> = []
  for (let hour = START_HOUR; hour <= END_HOUR; hour++) {
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour
    const period = hour >= 12 ? "PM" : "AM"
    timeSlots.push({
      hour,
      label: `${displayHour} ${period}`,
      minutes: hour * 60,
    })
  }

  const totalHeight = (END_HOUR - START_HOUR) * SLOT_HEIGHT

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <div className="inline-block min-w-full">
          {/* Header with days */}
          <div className="grid grid-cols-6 border-b border-gray-200 bg-gray-50">
            <div className="p-3 text-sm font-semibold text-gray-600">Time</div>
            {DAY_ORDER.map((day) => (
              <div key={day} className="p-3 text-sm font-semibold text-gray-900 text-center">
                {day === "M"
                  ? "Monday"
                  : day === "T"
                    ? "Tuesday"
                    : day === "W"
                      ? "Wednesday"
                      : day === "R"
                        ? "Thursday"
                        : "Friday"}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-6 relative" style={{ minHeight: `${totalHeight}px` }}>
            {/* Time column */}
            <div className="border-r border-gray-200">
              {timeSlots.map((slot, index) => (
                <div
                  key={slot.hour}
                  className="px-2 py-1 text-xs text-gray-600 border-b border-gray-100"
                  style={{ height: `${SLOT_HEIGHT}px` }}
                >
                  {index < timeSlots.length - 1 && slot.label}
                </div>
              ))}
            </div>

            {/* Day columns */}
            {DAY_ORDER.map((day, dayIndex) => (
              <div key={day} className="border-r border-gray-200 relative">
                {/* Hour lines */}
                {timeSlots.slice(0, -1).map((slot) => (
                  <div
                    key={slot.hour}
                    className="border-b border-gray-100"
                    style={{ height: `${SLOT_HEIGHT}px` }}
                  />
                ))}

                {/* Course blocks */}
                {courseBlocks
                  .filter((block) => block.dayIndex === dayIndex)
                  .map((block, blockIndex) => {
                    const topMinutes = block.startMinutes - START_HOUR * 60
                    const heightMinutes = block.endMinutes - block.startMinutes
                    const top = (topMinutes / 60) * SLOT_HEIGHT
                    const height = (heightMinutes / 60) * SLOT_HEIGHT

                    return (
                      <div
                        key={`${block.course.id}-${block.day}-${blockIndex}`}
                        className={`absolute left-1 right-1 rounded border-l-4 px-2 py-1 overflow-hidden shadow-sm ${block.color}`}
                        style={{
                          top: `${top}px`,
                          height: `${height}px`,
                        }}
                      >
                        <div className="text-xs font-semibold leading-tight">
                          {block.course.course_dept} {block.course.course_code}
                        </div>
                        <div className="text-xs opacity-90 leading-tight mt-0.5">
                          {formatMinutesToTime(block.startMinutes)}
                        </div>
                        {block.course.instructors.length > 0 && (
                          <div className="text-xs opacity-75 leading-tight mt-0.5 truncate">
                            {block.course.instructors[0]}
                          </div>
                        )}
                      </div>
                    )
                  })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
