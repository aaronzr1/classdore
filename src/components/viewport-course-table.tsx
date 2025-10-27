"use client"

import { forwardRef, useRef, useEffect, useState, useCallback } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ChevronUp, ChevronDown, Clock, Users, Plus } from "lucide-react"
import { Course, SortField, SortDirection } from "@/lib/types"

interface ViewportCourseTableProps {
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

interface ViewportCourseRowProps {
    course: Course
    index: number
    onSelect: (course: Course) => void
    isVisible: boolean
}

function ViewportCourseRow({ course, index, onSelect, isVisible }: ViewportCourseRowProps) {
    const enrollmentRatio = Number.parseInt(course.enrolled) / Number.parseInt(course.capacity)

    // Parse course.id to extract classNumber and selectedTermCode
    // Format: cn{classNumber}tc{selectedTermCode}
    const parseClassId = (id: string) => {
        const match = id.match(/cn(\d+)tc(\d+)/)
        if (match) {
            return {
                classNumber: match[1],
                selectedTermCode: match[2]
            }
        }
        return null
    }

    const classInfo = parseClassId(course.id)
    const addCourseUrl = classInfo
        ? `https://more.app.vanderbilt.edu/more/StudentClassExecute!add.action?classNumber=${classInfo.classNumber}&selectedTermCode=${classInfo.selectedTermCode}`
        : "#"

    // If not visible, render a placeholder with the same height
    if (!isVisible) {
        return (
            <div
                className={`px-4 py-3 ${index % 2 === 0 ? "bg-white" : "bg-gray-50/50"
                    }`}
                style={{ height: '120px' }} // Match the height of actual rows
            />
        )
    }

    return (

        <div
            onClick={() => onSelect(course)}
            className={`relative pl-8 pr-4 py-3 hover:bg-blue-50 transition-colors cursor-pointer ${index % 2 === 0 ? "bg-white" : "bg-gray-50/50"
                }`}
        >
            {/* Plus button as left edge ornament */}
            <div className="absolute left-1 top-1/2 -translate-y-1/2">
                <Button
                    variant="ghost"
                    size="sm"
                    asChild
                    className="h-5 w-5 p-0 text-gray-300 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                    onClick={(e) => e.stopPropagation()}
                >
                    <a href={addCourseUrl} target="_blank" rel="noopener noreferrer" title="Add to cart">
                        <Plus className="w-3 h-3" />
                    </a>
                </Button>
            </div>

            <div className="grid grid-cols-12 gap-4 items-center">

                <div className="col-span-2 min-w-[120px]">
                    <div className="flex flex-col">
                        <span className="font-mono font-semibold text-blue-600 text-sm">
                            {course.course_dept} {course.course_code} {course.class_section}
                        </span>
                        <Badge
                            variant="secondary"
                            className={`text-xs w-fit mt-1 ${course.career === "Graduate"
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
                                    className={`text-xs ${course.status === "Open"
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
                                    className={`h-1.5 rounded-full transition-all duration-300 ${enrollmentRatio > 0.9
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

export const ViewportCourseTable = forwardRef<HTMLDivElement, ViewportCourseTableProps>(
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
        const [visibleIndices, setVisibleIndices] = useState<Set<number>>(new Set())
        const containerRef = useRef<HTMLDivElement>(null)
        const observerRef = useRef<IntersectionObserver | null>(null)

        // Row height for calculations
        const rowHeight = 120
        const buffer = 10 // Number of extra rows to render above/below viewport

        const updateVisibleIndices = useCallback(() => {
            if (!containerRef.current) return

            const container = containerRef.current
            const containerRect = container.getBoundingClientRect()

            // If container is not in viewport at all, don't render anything
            if (containerRect.bottom < 0 || containerRect.top > window.innerHeight) {
                setVisibleIndices(new Set())
                return
            }

            // Simple approach: calculate based on how much of the container is visible
            const containerTop = containerRect.top
            const containerBottom = containerRect.bottom

            // Calculate which rows are visible based on the visible portion of the container
            const visibleStart = Math.max(0, -containerTop)
            const visibleEnd = Math.min(containerRect.height, window.innerHeight - containerTop)

            const startIndex = Math.max(0, Math.floor(visibleStart / rowHeight) - buffer)
            const endIndex = Math.min(
                courses.length - 1,
                Math.floor(visibleEnd / rowHeight) + buffer + 3 // Use floor and add extra safety margin
            )

            // Ensure we always render at least the last few rows if we're near the bottom
            const minVisibleRows = 15 // Always render at least this many rows
            const adjustedEndIndex = Math.max(endIndex, Math.min(courses.length - 1, startIndex + minVisibleRows - 1))

            const newVisibleIndices = new Set<number>()
            for (let i = startIndex; i <= adjustedEndIndex; i++) {
                if (i >= 0 && i < courses.length) {
                    newVisibleIndices.add(i)
                }
            }

            // If we're near the bottom of the list, always include the last few rows
            const nearBottomThreshold = 20 // If we're within 20 rows of the end, include them
            if (adjustedEndIndex >= courses.length - nearBottomThreshold) {
                const finalEndIndex = Math.min(courses.length - 1, adjustedEndIndex + nearBottomThreshold)
                for (let i = adjustedEndIndex + 1; i <= finalEndIndex; i++) {
                    newVisibleIndices.add(i)
                }
            }

            // Additional safety: if we're very close to the bottom (last 5 rows), always include them
            const veryNearBottomThreshold = 5
            if (adjustedEndIndex >= courses.length - veryNearBottomThreshold) {
                for (let i = courses.length - veryNearBottomThreshold; i < courses.length; i++) {
                    newVisibleIndices.add(i)
                }
            }

            // // Debug logging (remove this after testing)
            // if (courses.length > 0) {
            //     console.log(`Viewport calculation: start=${startIndex}, end=${endIndex}, adjustedEnd=${adjustedEndIndex}, total=${courses.length}, visible=${newVisibleIndices.size}, containerTop=${containerRect.top.toFixed(1)}, containerBottom=${containerRect.bottom.toFixed(1)}, visibleStart=${visibleStart.toFixed(1)}, visibleEnd=${visibleEnd.toFixed(1)}`)
            // }

            setVisibleIndices(newVisibleIndices)
        }, [courses.length, buffer, rowHeight])

        useEffect(() => {
            // Initial calculation
            updateVisibleIndices()

            // Set up scroll listener with throttling
            let ticking = false
            const handleScroll = () => {
                if (!ticking) {
                    requestAnimationFrame(() => {
                        updateVisibleIndices()
                        ticking = false
                    })
                    ticking = true
                }
            }

            // Set up resize listener
            const handleResize = () => {
                updateVisibleIndices()
            }

            window.addEventListener('scroll', handleScroll, { passive: true })
            window.addEventListener('resize', handleResize, { passive: true })

            return () => {
                window.removeEventListener('scroll', handleScroll)
                window.removeEventListener('resize', handleResize)
            }
        }, [updateVisibleIndices])

        // Update when courses change
        useEffect(() => {
            updateVisibleIndices()
        }, [courses, updateVisibleIndices])

        return (
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <div className="min-w-[800px]">
                        <div
                            ref={ref}
                            className={`bg-gray-50 border-b border-gray-200 px-4 py-3 transition-all duration-200 ${isTableHeaderSticky
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

                        <div ref={containerRef} className="divide-y divide-gray-100">
                            {courses.map((course, index) => (
                                <ViewportCourseRow
                                    key={course.id}
                                    course={course}
                                    index={index}
                                    onSelect={onCourseSelect}
                                    isVisible={visibleIndices.has(index)}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        )
    }
)

ViewportCourseTable.displayName = "ViewportCourseTable"
