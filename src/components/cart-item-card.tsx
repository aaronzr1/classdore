"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Trash2, Clock, Users, GraduationCap, AlertTriangle } from "lucide-react"
import type { Course } from "@/lib/types"

interface CartItemCardProps {
  course: Course
  hasConflict?: boolean
  conflictsWith?: string[]
  onRemove: () => void
}

export function CartItemCard({ course, hasConflict = false, conflictsWith = [], onRemove }: CartItemCardProps) {
  const enrollmentRatio = Math.min(1, Number.parseInt(course.enrolled) / Number.parseInt(course.capacity))

  return (
    <div
      className={`bg-white rounded-lg p-4 transition-colors ${
        hasConflict
          ? "border-2 border-yellow-300 hover:border-yellow-400"
          : "border border-gray-200 hover:border-blue-300"
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          {/* Course code and title */}
          <div className="flex items-start gap-3 mb-2">
            <div>
              <h3 className="font-mono font-semibold text-blue-600 text-base">
                {course.course_dept} {course.course_code} {course.class_section}
              </h3>
              <p className="font-sans text-gray-900 font-medium line-clamp-2 mt-1">
                {course.course_title}
              </p>
            </div>
          </div>

          {/* Badges */}
          <div className="flex flex-wrap gap-2 mb-3">
            {hasConflict && (
              <Badge
                variant="outline"
                className="font-serif text-xs bg-yellow-50 border-yellow-300 text-yellow-800"
                title={`Conflicts with: ${conflictsWith.join(", ")}`}
              >
                <AlertTriangle className="w-3 h-3 mr-1" />
                Schedule Conflict
              </Badge>
            )}
            <Badge variant="outline" className="font-serif text-xs">
              <GraduationCap className="w-3 h-3 mr-1" />
              {course.credit_hours} Credits
            </Badge>
            <Badge variant="outline" className="font-serif text-xs">
              {course.career}
            </Badge>
            <Badge
              className={`font-serif text-xs ${
                course.status === "Open"
                  ? "bg-green-100 text-green-800"
                  : course.status === "Waitlist"
                    ? "bg-yellow-100 text-yellow-800"
                    : "bg-red-100 text-red-800"
              }`}
            >
              {course.status}
            </Badge>
          </div>

          {/* Meeting info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <span className="font-mono">
                {course.meeting_days.length > 0 && course.meeting_times.length > 0
                  ? `${course.meeting_days.join("")} ${course.meeting_times[0]}`
                  : "TBA"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <span>
                {course.instructors.length > 0 ? course.instructors[0] : "Staff"}
              </span>
            </div>
          </div>

          {/* Conflict details */}
          {hasConflict && conflictsWith.length > 0 && (
            <div className="mb-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800">
              <span className="font-semibold">Conflicts with:</span> {conflictsWith.join(", ")}
            </div>
          )}

          {/* Enrollment progress */}
          <div className="mt-3">
            <div className="flex justify-between text-xs text-gray-600 mb-1">
              <span>Enrollment</span>
              <span>
                {course.enrolled}/{course.capacity}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div
                className={`h-1.5 rounded-full transition-all ${
                  enrollmentRatio >= 1
                    ? "bg-red-500"
                    : enrollmentRatio >= 0.8
                      ? "bg-yellow-500"
                      : "bg-green-500"
                }`}
                style={{ width: `${Math.min(100, enrollmentRatio * 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Remove button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onRemove}
          className="text-gray-400 hover:text-red-600 hover:bg-red-50 flex-shrink-0"
          title="Remove from cart"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )
}
