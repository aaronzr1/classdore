"use client"

import { useState } from "react"
import { Course, SortField, SortDirection } from "@/lib/types"
import { mockCourses } from "@/lib/mock-data"
import { filterAndSortCourses, getDepartments } from "@/lib/course-utils"
import { useSticky } from "@/lib/use-sticky"
import { CourseSearch } from "./course-search"
import { CourseTable } from "./course-table"
import { CourseDetailDialog } from "./course-detail-dialog"
import { EmptyState } from "./empty-state"

export default function CourseListings() {
    const [searchTerm, setSearchTerm] = useState("")
    const [selectedDepartment, setSelectedDepartment] = useState<string>("all")
    const [selectedLevel, setSelectedLevel] = useState<string>("all")
    const [sortField, setSortField] = useState<SortField>("course_code")
    const [sortDirection, setSortDirection] = useState<SortDirection>("asc")
    const [selectedCourse, setSelectedCourse] = useState<Course | null>(null)

    const { isSearchSticky, isTableHeaderSticky, searchBarRef, tableHeaderRef } = useSticky()

    const departments = getDepartments(mockCourses)

    const handleSort = (field: SortField) => {
        if (sortField === field) {
            setSortDirection(sortDirection === "asc" ? "desc" : "asc")
        } else {
            setSortField(field)
            setSortDirection("asc")
        }
    }

    const filteredAndSortedCourses = filterAndSortCourses(
        mockCourses,
        searchTerm,
        selectedDepartment,
        selectedLevel,
        sortField,
        sortDirection
    )

    return (
        <div className="container mx-auto px-4 py-6">
            <div className="text-center mb-6">
                <h1 className="font-sans text-6xl font-bold text-blue-600 mb-2">Classdore</h1>
                {/* <p className="font-serif text-gray-600 max-w-2xl mx-auto">
                    Course reviews and insights from real students. Find the perfect class for your academic journey.
                </p> */}
                <p className="font-serif text-gray-600 max-w-2xl mx-auto">
                    Find the courses you're actually interested in. Course listings updated daily.
                </p>
                {/* one stop shop for all your classes. it's glassdoor, for commodores. */}
                {/* add info on usage in this paragraph */}
            </div>

            <CourseSearch
                ref={searchBarRef}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                selectedDepartment={selectedDepartment}
                setSelectedDepartment={setSelectedDepartment}
                selectedLevel={selectedLevel}
                setSelectedLevel={setSelectedLevel}
                departments={departments}
                filteredCount={filteredAndSortedCourses.length}
                totalCount={mockCourses.length}
                isSearchSticky={isSearchSticky}
            />

            {isSearchSticky && <div className="h-[120px] mb-4" />}

            {filteredAndSortedCourses.length > 0 ? (
                <CourseTable
                    ref={tableHeaderRef}
                    courses={filteredAndSortedCourses}
                    sortField={sortField}
                    sortDirection={sortDirection}
                    onSort={handleSort}
                    onCourseSelect={setSelectedCourse}
                    isTableHeaderSticky={isTableHeaderSticky}
                    isSearchSticky={isSearchSticky}
                />
            ) : (
                <EmptyState />
            )}

            <CourseDetailDialog course={selectedCourse} onClose={() => setSelectedCourse(null)} />
        </div>
    )
}

export { CourseListings }
