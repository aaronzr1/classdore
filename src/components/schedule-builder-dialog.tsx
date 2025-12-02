"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { WeeklyCalendar } from "./weekly-calendar"
import { AlertTriangle, CheckCircle, ExternalLink, Loader2 } from "lucide-react"
import type { ScheduleSolution } from "@/lib/schedule-solver"
import { handleAddCourseToYES } from "@/lib/utils"
import { toast } from "sonner"

interface ScheduleBuilderDialogProps {
  isOpen: boolean
  onClose: () => void
  solution: ScheduleSolution | null
}

export function ScheduleBuilderDialog({ isOpen, onClose, solution }: ScheduleBuilderDialogProps) {
  const [isExporting, setIsExporting] = useState(false)
  const [exportedCount, setExportedCount] = useState(0)

  if (!solution) return null

  const handleExportToYES = async () => {
    if (solution.scheduledCourses.length === 0) {
      toast.error("No courses to export")
      return
    }

    const confirmed = window.confirm(
      `Export ${solution.scheduledCourses.length} scheduled course${solution.scheduledCourses.length > 1 ? "s" : ""} to YES cart?\n\nThis will open ${solution.scheduledCourses.length} new window${solution.scheduledCourses.length > 1 ? "s" : ""}.`
    )

    if (!confirmed) return

    setIsExporting(true)
    setExportedCount(0)

    // Export courses one by one with a delay
    for (let i = 0; i < solution.scheduledCourses.length; i++) {
      const course = solution.scheduledCourses[i]

      // Add delay between courses to avoid overwhelming the browser
      if (i > 0) {
        await new Promise((resolve) => setTimeout(resolve, 500))
      }

      handleAddCourseToYES(course.id)
      setExportedCount(i + 1)
    }

    setIsExporting(false)
    toast.success(`Exported ${solution.scheduledCourses.length} courses to YES cart`, {
      description: "Check your YES cart to register for these courses.",
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Generated Schedule</DialogTitle>
          <div className="flex flex-wrap gap-2 mt-2">
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span>
                <span className="font-semibold">{solution.scheduledCourses.length}</span> courses
                scheduled • <span className="font-semibold">{solution.totalCredits.toFixed(1)}</span>{" "}
                credits
              </span>
            </div>
            {solution.unschedulableCourses.length > 0 && (
              <div className="flex items-center gap-2 text-sm text-yellow-700">
                <AlertTriangle className="w-4 h-4" />
                <span>
                  <span className="font-semibold">{solution.unschedulableCourses.length}</span>{" "}
                  course{solution.unschedulableCourses.length > 1 ? "s" : ""} couldn&apos;t be scheduled
                </span>
              </div>
            )}
          </div>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Weekly Calendar */}
          {solution.scheduledCourses.length > 0 ? (
            <div>
              <h3 className="text-lg font-semibold mb-3">Your Schedule</h3>
              <WeeklyCalendar courses={solution.scheduledCourses} />
            </div>
          ) : (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
              <AlertTriangle className="w-12 h-12 text-yellow-600 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-yellow-900 mb-2">
                No Valid Schedule Found
              </h3>
              <p className="text-yellow-800">
                All courses in your cart have conflicting times. Try removing some courses to create
                a valid schedule.
              </p>
            </div>
          )}

          {/* Unschedulable Courses */}
          {solution.unschedulableCourses.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-3 text-yellow-900">
                Courses Not Scheduled (Time Conflicts)
              </h3>
              <div className="grid gap-3">
                {solution.unschedulableCourses.map((course) => (
                  <div
                    key={course.id}
                    className="bg-yellow-50 border border-yellow-200 rounded-lg p-3"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="font-mono font-semibold text-yellow-900">
                          {course.course_dept} {course.course_code} {course.class_section}
                        </div>
                        <div className="text-sm text-yellow-800 mt-1">{course.course_title}</div>
                        <div className="text-xs text-yellow-700 mt-1 font-mono">
                          {course.meeting_days.length > 0 && course.meeting_times.length > 0
                            ? `${course.meeting_days.join("")} ${course.meeting_times[0]}`
                            : "TBA"}
                        </div>
                      </div>
                      <div className="text-xs text-yellow-700 bg-yellow-100 px-2 py-1 rounded">
                        {course.credit_hours} credits
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-sm text-yellow-800 mt-3">
                These courses conflict with courses in your schedule. Remove courses from your cart
                or adjust your selections to fit them in.
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-between items-center pt-4 border-t border-gray-200">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
            {solution.scheduledCourses.length > 0 && (
              <Button
                onClick={handleExportToYES}
                disabled={isExporting}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isExporting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Exporting {exportedCount}/{solution.scheduledCourses.length}...
                  </>
                ) : (
                  <>
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Export to YES Cart
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
