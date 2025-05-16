"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
// import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import type { Course } from "../types/course"

interface CourseDetailsCardProps {
    course: Course
    isOpen: boolean
    onClose: () => void
}

export function CourseDetailsCard({ course, isOpen, onClose }: CourseDetailsCardProps) {
    // Helper function to check if a field exists and is not empty
    const hasValue = (value: any): boolean => {
        if (value === null || value === undefined) return false
        if (Array.isArray(value)) return value.length > 0
        if (typeof value === "string") return value.trim() !== ""
        return true
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <span>
                            {course.course_dept} {course.course_code}
                        </span>
                        <span className="text-sm text-muted-foreground">Section {course.class_section}</span>
                        {hasValue(course.status) && (
                            //   <Badge variant={course.status === "Open" ? "success" : "destructive"} className="ml-auto">
                            //     {course.status}
                            //   </Badge>
                            <Badge
                                variant={
                                    course.status === "Open"
                                        ? "success"
                                        : course.status === "Wait list"
                                            ? "warning"
                                            // : "destructive"
                                            : "failure"
                                }
                                // className="absolute right-8"
                                className="ml-auto"
                            >
                                {
                                    course.status.replace(/\s/g, "").toLowerCase() === "waitlist"
                                        ? "Waitlist"
                                        : course.status.trim().toLowerCase() === "cancelled section"
                                            ? "Cancelled"
                                            : course.status
                                }
                            </Badge>
                        )}
                    </DialogTitle>
                    <h2 className="text-xl font-semibold mt-1">{course.course_title}</h2>
                </DialogHeader>

                <div className="grid gap-4 py-2">
                    {/* Basic course info */}
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                        {hasValue(course.school) && (
                            <div>
                                <span className="font-medium">School:</span> {course.school}
                            </div>
                        )}
                        {hasValue(course.career) && (
                            <div>
                                <span className="font-medium">Career:</span> {course.career}
                            </div>
                        )}
                        {hasValue(course.class_type) && (
                            <div>
                                <span className="font-medium">Type:</span> {course.class_type}
                            </div>
                        )}
                        {hasValue(course.credit_hours) && (
                            <div>
                                <span className="font-medium">Credits:</span> {course.credit_hours}
                            </div>
                        )}
                        {hasValue(course.grading_basis) && (
                            <div>
                                <span className="font-medium">Grading:</span> {course.grading_basis}
                            </div>
                        )}
                        {hasValue(course.consent) && (
                            <div>
                                <span className="font-medium">Consent:</span> {course.consent}
                            </div>
                        )}
                    </div>

                    {/* Term info */}
                    {(hasValue(course.term_season) ||
                        hasValue(course.term_year) ||
                        hasValue(course.session) ||
                        hasValue(course.dates)) && (
                            <>
                                <Separator />
                                <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                                    {(hasValue(course.term_season) || hasValue(course.term_year)) && (
                                        <div>
                                            <span className="font-medium">Term:</span> {course.term_season} {course.term_year}
                                        </div>
                                    )}
                                    {hasValue(course.session) && (
                                        <div>
                                            <span className="font-medium">Session:</span> {course.session}
                                        </div>
                                    )}
                                    {hasValue(course.dates) && (
                                        <div>
                                            <span className="font-medium">Dates:</span> {course.dates}
                                        </div>
                                    )}
                                </div>
                            </>
                        )}

                    {/* Enrollment info */}
                    <Separator />
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                        <div>
                            <span className="font-medium">Enrollment:</span> {course.enrolled}/{course.capacity}
                        </div>
                        {hasValue(course.wl_capacity) && course.wl_capacity > 0 && (
                            <div>
                                <span className="font-medium">Waitlist:</span> {course.wl_occupied}/{course.wl_capacity}
                            </div>
                        )}
                    </div>

                    {/* Meeting times */}
                    {(hasValue(course.meeting_days) || hasValue(course.meeting_times) || hasValue(course.meeting_dates)) && (
                        <>
                            <Separator />
                            <div>
                                <h3 className="font-medium mb-1">Schedule:</h3>
                                {course.meeting_days.map((day, index) => (
                                    <div key={index} className="text-sm mb-1 grid grid-cols-[1fr_2fr] gap-2">
                                        <div>{day}</div>
                                        <div className="flex justify-between">
                                            {day !== "TBA" && <span>{course.meeting_times[index] || ""}</span>}
                                            {day !== "TBA" && <span className="text-muted-foreground">{course.meeting_dates[index] || ""}</span>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}

                    {/* Instructors */}
                    {hasValue(course.instructors) && (
                        <>
                            <Separator />
                            <div>
                                <h3 className="font-medium mb-1">Instructors:</h3>
                                <div className="text-sm">{course.instructors.join(" • ").replace(/ \(Primary\)/g, "")}</div>
                            </div>
                        </>
                    )}

                    {/* Description */}
                    {hasValue(course.description) && (
                        <>
                            <Separator />
                            <div>
                                <h3 className="font-medium mb-1">Description:</h3>
                                <p className="text-sm">{course.description}</p>
                            </div>
                        </>
                    )}

                    {/* Requirements */}
                    {hasValue(course.requirements) && (
                        <>
                            <Separator />
                            <div>
                                <h3 className="font-medium mb-1">Requirements:</h3>
                                <p className="text-sm">{course.requirements}</p>
                            </div>
                        </>
                    )}

                    {/* Notes */}
                    {hasValue(course.notes) && (
                        <>
                            <Separator />
                            <div>
                                <h3 className="font-medium mb-1">Notes:</h3>
                                <p className="text-sm">{course.notes}</p>
                            </div>
                        </>
                    )}

                    {/* Attributes */}
                    {hasValue(course.attributes) && (
                        <>
                            <Separator />
                            <div>
                                <h3 className="font-medium mb-1">Attributes:</h3>
                                <div className="flex flex-wrap gap-1">
                                    {course.attributes?.map((attr, index) => (
                                        <Badge key={index} variant="outline">
                                            {attr}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}
                </div>

                {/* <Button onClick={onClose} className="absolute right-4 top-4" size="icon" variant="ghost">
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </Button> */}
            </DialogContent>
        </Dialog>
    )
}

