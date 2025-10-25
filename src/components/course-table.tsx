"use client"

import { forwardRef } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ChevronUp, ChevronDown, Clock, Users } from "lucide-react"
import { Course, SortField, SortDirection } from "@/lib/types"

interface CourseTableProps {
    courses: Course[]
    sortField: SortField
    sortDirection: SortDirection
    onSort: (field: SortField) => void
    onCourseSelect: (course: Course) => void
    isTableHeaderSticky: boolean
    isSearchSticky: boolean
}

interface SortButtonProps {
    field: SortField
    children: React.ReactNode
    currentSortField: SortField
    currentSortDirection: SortDirection
    onSort: (field: SortField) => void
}

function SortButton({ field, children, currentSortField, currentSortDirection, onSort }: SortButtonProps) {
    return (
        <Button
            variant="ghost"
            size="sm"
            onClick={() => onSort(field)}
            className="h-auto p-1 font-sans font-bold text-left flex items-center justify-start hover:bg-blue-50"
        >
            {children}
            {currentSortField === field &&
                (currentSortDirection === "asc" ? (
                    <ChevronUp className="ml-1 h-3 w-3" />
                ) : (
                    <ChevronDown className="ml-1 h-3 w-3" />
                ))}
        </Button>
    )
}

function CourseRow({ course, index, onSelect }: { course: Course; index: number; onSelect: (course: Course) => void }) {
    const enrollmentRatio = Number.parseInt(course.enrolled) / Number.parseInt(course.capacity)
    
    return (
        <div
            onClick={() => onSelect(course)}
            className={`px-4 py-3 hover:bg-blue-50 transition-colors cursor-pointer ${
                index % 2 === 0 ? "bg-white" : "bg-gray-50/50"
            }`}
        >
            <div className="grid grid-cols-12 gap-4 items-center">
                <div className="col-span-2 min-w-[120px]">
                    <div className="flex flex-col">
                        <span className="font-mono font-semibold text-blue-600 text-sm">
                            {course.course_dept} {course.course_code} {course.class_section}
                        </span>
                        <Badge
                            variant="secondary"
                            className={`text-xs w-fit mt-1 ${
                                course.career === "Graduate"
                                    ? "bg-blue-100 text-blue-800"
                                    : "bg-gray-100 text-gray-700"
                            }`}
                        >
                            {course.career}
                        </Badge>
                    </div>
                </div>

                <div className="col-span-3 min-w-[200px]">
                    <div className="flex flex-col">
                        <h3 className="font-sans font-bold text-gray-900 text-sm leading-tight">
                            {course.course_title}
                        </h3>
                        <p className="font-serif text-xs text-gray-600 mt-1 line-clamp-2">{course.description}</p>
                        {course.requirements && (
                            <p className="font-serif text-xs text-gray-500 mt-1">
                                <span className="font-semibold">Prereq:</span> {course.requirements}
                            </p>
                        )}
                    </div>
                </div>

                <div className="col-span-2 min-w-[140px]">
                    <div className="flex flex-col">
                        <span className="font-serif text-sm text-gray-900">
                            {course.instructors[0]?.replace(" (Primary)", "") || "TBA"}
                        </span>
                        <span className="font-serif text-xs text-gray-600">{course.course_dept}</span>
                    </div>
                </div>

                <div className="col-span-1 min-w-[60px]">
                    <div className="p-1">
                        <span className="font-serif text-sm font-semibold text-gray-900">{course.credit_hours}</span>
                    </div>
                </div>

                <div className="col-span-2 min-w-[120px]">
                    <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3 text-blue-600" />
                        <span className="font-serif text-xs text-gray-700">
                            {course.meeting_days.join("")} {course.meeting_times[0]}
                        </span>
                    </div>
                </div>

                <div className="col-span-2 min-w-[140px]">
                    <div className="flex items-center gap-2">
                        <Users className="h-3 w-3 text-blue-600" />
                        <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                                <span className="font-serif text-xs text-gray-700">
                                    {course.enrolled}/{course.capacity}
                                </span>
                                <Badge
                                    variant="secondary"
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
                            <div className="w-full bg-gray-200 rounded-full h-1.5">
                                <div
                                    className={`h-1.5 rounded-full transition-all duration-300 ${
                                        enrollmentRatio > 0.9
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
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export const CourseTable = forwardRef<HTMLDivElement, CourseTableProps>(
    (
        {
            courses,
            sortField,
            sortDirection,
            onSort,
            onCourseSelect,
            isTableHeaderSticky,
            isSearchSticky,
        },
        ref
    ) => {
        return (
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <div className="min-w-[800px]">
                        <div
                            ref={ref}
                            className={`bg-gray-50 border-b border-gray-200 px-4 py-3 transition-all duration-200 ${
                                isTableHeaderSticky
                                    ? `fixed ${isSearchSticky ? "top-[115px]" : "top-0"} left-0 right-0 z-40 shadow-sm`
                                    : ""
                            }`}
                        >
                            <div className={`${isTableHeaderSticky ? "container mx-auto px-4" : ""}`}>
                                <div className="grid grid-cols-12 gap-4 items-center">
                                    <div className="col-span-2">
                                        <SortButton
                                            field="course_code"
                                            currentSortField={sortField}
                                            currentSortDirection={sortDirection}
                                            onSort={onSort}
                                        >
                                            Course Code
                                        </SortButton>
                                    </div>
                                    <div className="col-span-3">
                                        <SortButton
                                            field="course_title"
                                            currentSortField={sortField}
                                            currentSortDirection={sortDirection}
                                            onSort={onSort}
                                        >
                                            Course Title
                                        </SortButton>
                                    </div>
                                    <div className="col-span-2">
                                        <SortButton
                                            field="instructors"
                                            currentSortField={sortField}
                                            currentSortDirection={sortDirection}
                                            onSort={onSort}
                                        >
                                            Instructor
                                        </SortButton>
                                    </div>
                                    <div className="col-span-1">
                                        <SortButton
                                            field="credit_hours"
                                            currentSortField={sortField}
                                            currentSortDirection={sortDirection}
                                            onSort={onSort}
                                        >
                                            Credits
                                        </SortButton>
                                    </div>
                                    <div className="col-span-2">
                                        <div className="h-auto p-1 font-sans font-bold text-sm text-gray-700 text-left">Schedule</div>
                                    </div>
                                    <div className="col-span-2">
                                        <SortButton
                                            field="enrolled"
                                            currentSortField={sortField}
                                            currentSortDirection={sortDirection}
                                            onSort={onSort}
                                        >
                                            Availability
                                        </SortButton>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {isTableHeaderSticky && <div className="h-[52px]" />}

                        <div className="divide-y divide-gray-100">
                            {courses.map((course, index) => (
                                <CourseRow key={course.id} course={course} index={index} onSelect={onCourseSelect} />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        )
    }
)

CourseTable.displayName = "CourseTable"
