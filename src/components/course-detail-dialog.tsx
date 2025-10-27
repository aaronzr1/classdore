"use client"

import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Calendar, MapPin, GraduationCap, Plus, X } from "lucide-react"
import { Course } from "@/lib/types"
import { Button } from "./ui/button"
import { getAddCourseUrl, parseCourseId } from "@/lib/course-utils"
import { toast } from "sonner"

interface CourseDetailDialogProps {
    course: Course | null
    onClose: () => void
}

export function CourseDetailDialog({ course, onClose }: CourseDetailDialogProps) {
    if (!course) return null

    const enrollmentRatio = Number.parseInt(course.enrolled) / Number.parseInt(course.capacity)
    const classInfo = parseCourseId(course.id)
    const addCourseUrl = getAddCourseUrl(course.id)

    const handleAddCourse = (e: React.MouseEvent) => {
        e.stopPropagation()

        if (!classInfo) {
            toast.error("Unable to add course - invalid course ID")
            return
        }

        // Open the add URL in a new window to process the request (handles 302 redirect)
        const addWindow = window.open(addCourseUrl, '_blank', 'width=800,height=600')

        // After a brief delay to let the request process, redirect to the cart page
        setTimeout(() => {
            if (addWindow && !addWindow.closed) {
                addWindow.location.href = 'https://more.app.vanderbilt.edu/more/SearchClasses.action'
            }

            // Show success toast with link to cart
            const toastId = toast.success(
                <div className="relative min-w-[225px] max-w-fit">
                    <button
                        onClick={(e) => {
                            e.stopPropagation()
                            toast.dismiss(toastId)
                        }}
                        className="absolute top-0 right-0 text-gray-400 hover:text-gray-600 transition-colors p-0.5 rounded-sm hover:bg-gray-100"
                        aria-label="Dismiss"
                    >
                        <X className="w-3 h-3" />
                    </button>
                    <div className="flex flex-col gap-1 pr-5">
                        <div className="font-semibold">Course added to cart!</div>
                        <a
                            href="https://more.app.vanderbilt.edu/more/SearchClasses.action"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline text-sm"
                            onClick={(e) => e.stopPropagation()}
                        >
                            View your cart →
                        </a>
                    </div>
                </div>,
                {
                    duration: 3000,
                    className: '!w-auto !max-w-fit justify-center',
                }
            )
        }, 500)
    }

    return (
        <Dialog open={!!course} onOpenChange={onClose}>
            {/* note: adjusting width here does nothing, check DialogPrimitive.Content in dialog.tsx (twMerge issue) */}
            <DialogContent className="w-[95vw] max-w-[95vw] max-h-[95vh] overflow-y-auto">
                {/* <DialogContent 
                className="max-h-[95vh] overflow-y-auto"
                style={{
                    width: '50vw',
                    maxWidth: '30vw',
                }}
            > */}
                <div className="space-y-6 w-full min-w-0">
                    <DialogHeader>
                        <DialogTitle className="font-sans text-3xl font-bold text-gray-900 mb-2">
                            {course.course_title}
                        </DialogTitle>
                        <div className="text-lg text-gray-600 mb-0">
                            <span className="text-blue-600 font-medium">
                                {course.course_dept} {course.course_code}
                            </span>
                            <span className="ml-2">Section {course.class_section}</span>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-0">
                            <Badge variant="outline" className="font-serif">
                                <GraduationCap className="w-3 h-3 mr-1" />
                                {course.career}
                            </Badge>
                            <Badge variant="outline" className="font-serif">
                                {course.class_type}
                            </Badge>
                            <Badge variant="outline" className="font-serif">
                                {course.credit_hours} Credits
                            </Badge>
                            <Badge
                                className={`font-serif ${course.status === "Open"
                                    ? "bg-green-100 text-green-800"
                                    : course.status === "Waitlist"
                                        ? "bg-yellow-100 text-yellow-800"
                                        : "bg-red-100 text-red-800"
                                    }`}
                            >
                                {course.status}
                            </Badge>

                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleAddCourse}
                                className="ml-auto h-7 px-3 text-xs font-sans text-blue-600 border-blue-200 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300 bg-transparent"
                            >
                                <Plus className="w-3 h-3 mr-1.5" />
                                Add to Cart
                            </Button>
                        </div>
                    </DialogHeader>

                    <div>
                        <h3 className="font-sans font-bold text-gray-900 mb-2">Course Description</h3>
                        <p className="font-serif text-gray-700 leading-relaxed">{course.description}</p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6 w-full min-w-0">
                        <div className="space-y-4">
                            <div>
                                <h4 className="font-sans font-bold text-gray-900 mb-2 flex items-center">
                                    <Calendar className="w-4 h-4 mr-2 text-blue-600" />
                                    Schedule
                                </h4>
                                <div className="font-serif text-gray-700 space-y-1">
                                    <p>
                                        <span className="font-semibold">Days:</span> {course.meeting_days.join(", ")}
                                    </p>
                                    <p>
                                        <span className="font-semibold">Time:</span> {course.meeting_times.join(", ")}
                                    </p>
                                    <p>
                                        <span className="font-semibold">Dates:</span> {course.dates}
                                    </p>
                                </div>
                            </div>

                            <div>
                                <h4 className="font-sans font-bold text-gray-900 mb-2">Instructors</h4>
                                <div className="space-y-1">
                                    {course.instructors.map((instructor, idx) => (
                                        <p key={idx} className="font-serif text-gray-700">
                                            {instructor}
                                        </p>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <h4 className="font-sans font-bold text-gray-900 mb-2">Enrollment</h4>
                                <div className="font-serif text-gray-700 space-y-2">
                                    <div className="flex justify-between">
                                        <span>Enrolled:</span>
                                        <span className="font-semibold">
                                            {course.enrolled}/{course.capacity}
                                        </span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div
                                            className={`h-2 rounded-full ${enrollmentRatio > 0.9
                                                ? "bg-red-500"
                                                : enrollmentRatio > 0.7
                                                    ? "bg-yellow-500"
                                                    : "bg-blue-600"
                                                }`}
                                            style={{
                                                width: `${enrollmentRatio * 100}%`,
                                            }}
                                        />
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span>Waitlist:</span>
                                        <span className="font-semibold">
                                            {course.wl_occupied}/{course.wl_capacity}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <h4 className="font-sans font-bold text-gray-900 mb-2 flex items-center">
                                    <MapPin className="w-4 h-4 mr-2 text-blue-600" />
                                    Course Details
                                </h4>
                                <div className="font-serif text-gray-700 space-y-1">
                                    <p>
                                        <span className="font-semibold">School:</span> {course.school}
                                    </p>
                                    <p>
                                        <span className="font-semibold">Term:</span> {course.term_season}{" "}
                                        {course.term_year}
                                    </p>
                                    <p>
                                        <span className="font-semibold">Session:</span> {course.session}
                                    </p>
                                    <p>
                                        <span className="font-semibold">Grading:</span> {course.grading_basis}
                                    </p>
                                    <p>
                                        <span className="font-semibold">Consent:</span> {course.consent}
                                    </p>
                                </div>
                            </div>

                            {course.requirements && (
                                <div>
                                    <h4 className="font-sans font-bold text-gray-900 mb-2">Prerequisites</h4>
                                    <p className="font-serif text-gray-700">{course.requirements}</p>
                                </div>
                            )}

                            {(course.attributes ?? []).length > 0 && (
                                <div>
                                    <h4 className="font-sans font-bold text-gray-900 mb-2">Course Attributes</h4>
                                    <div className="flex flex-wrap gap-2 w-full">
                                        {(course.attributes ?? []).map((attr, idx) => (
                                            <Badge key={idx} variant="secondary" className="text-xs font-serif">
                                                {attr}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {course.notes && (
                                <div>
                                    <h4 className="font-sans font-bold text-gray-900 mb-2">Notes</h4>
                                    <p className="font-serif text-gray-700">{course.notes}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
