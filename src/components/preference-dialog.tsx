"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, Clock, Users, GraduationCap, ArrowRight } from "lucide-react"
import type { Course } from "@/lib/types"
import type { PairwiseComparison } from "@/lib/interactive-scheduler"

interface PreferenceDialogProps {
  isOpen: boolean
  question: PairwiseComparison | null
  questionNumber: number
  totalQuestions: number
  onSelect: (course: Course) => void
}

function CourseComparisonCard({
  course,
  onSelect,
  isLeft,
}: {
  course: Course
  onSelect: () => void
  isLeft: boolean
}) {
  const enrollmentRatio = Math.min(1, Number.parseInt(course.enrolled) / Number.parseInt(course.capacity))

  return (
    <button
      onClick={onSelect}
      className={`flex-1 bg-white border-2 border-gray-200 hover:border-blue-500 hover:shadow-lg rounded-lg p-4 transition-all text-left ${
        isLeft ? "mr-2" : "ml-2"
      }`}
    >
      <div className="space-y-3">
        {/* Course code and title */}
        <div>
          <div className="font-mono font-bold text-blue-600 text-lg">
            {course.course_dept} {course.course_code}
          </div>
          <div className="font-semibold text-gray-900 mt-1 line-clamp-2">{course.course_title}</div>
        </div>

        {/* Badges */}
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline" className="text-xs">
            <GraduationCap className="w-3 h-3 mr-1" />
            {course.credit_hours} Credits
          </Badge>
          <Badge variant="outline" className="text-xs">
            {course.career}
          </Badge>
          <Badge
            className={`text-xs ${
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
        <div className="space-y-1 text-sm text-gray-600">
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
            <span>{course.instructors.length > 0 ? course.instructors[0] : "Staff"}</span>
          </div>
        </div>

        {/* Enrollment */}
        <div>
          <div className="flex justify-between text-xs text-gray-600 mb-1">
            <span>Enrollment</span>
            <span>
              {course.enrolled}/{course.capacity}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1.5">
            <div
              className={`h-1.5 rounded-full ${
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

        {/* Call to action */}
        <div className="pt-2 border-t border-gray-100">
          <div className="text-center text-sm font-semibold text-blue-600">
            Choose this course →
          </div>
        </div>
      </div>
    </button>
  )
}

export function PreferenceDialog({
  isOpen,
  question,
  questionNumber,
  totalQuestions,
  onSelect,
}: PreferenceDialogProps) {
  if (!question) return null

  return (
    <Dialog open={isOpen} onOpenChange={() => {}} modal={true}>
      <DialogContent
        className="max-w-5xl max-h-[90vh] overflow-y-auto"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-bold">Which course do you prefer?</DialogTitle>
            <Badge variant="outline" className="text-sm">
              Question {questionNumber} of {totalQuestions}
            </Badge>
          </div>
          <div className="flex items-start gap-2 mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-yellow-800">
              <p className="font-semibold mb-1">Schedule Conflict Detected</p>
              <p>{question.reason}</p>
              {question.transitiveImpact > 2 && (
                <p className="mt-1 text-xs">
                  Your choice may affect {question.transitiveImpact} other course
                  {question.transitiveImpact > 1 ? "s" : ""} in your schedule.
                </p>
              )}
            </div>
          </div>
        </DialogHeader>

        <div className="mt-6">
          <div className="flex items-center gap-4">
            <CourseComparisonCard
              course={question.course1}
              onSelect={() => onSelect(question.course1)}
              isLeft={true}
            />

            <div className="flex flex-col items-center justify-center flex-shrink-0 px-2">
              <div className="text-gray-400 text-sm font-semibold">OR</div>
              <ArrowRight className="w-6 h-6 text-gray-300 my-2 hidden md:block" />
            </div>

            <CourseComparisonCard
              course={question.course2}
              onSelect={() => onSelect(question.course2)}
              isLeft={false}
            />
          </div>

          <div className="mt-6 text-center text-sm text-gray-500">
            Click on a course card to select your preference
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
