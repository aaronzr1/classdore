"use client"

import { useEffect, useState, useMemo } from "react"
import { Course, SortField, SortDirection } from "@/lib/types"
import { mockCourses } from "@/lib/mock-data"
import { getDepartments } from "@/lib/course-utils"
// import { filterAndSortCourses, initFuse } from "@/lib/search-utils"
import { useSticky } from "@/lib/use-sticky"
import { useDebounce } from "@/lib/use-debounce"
import { CourseSearch } from "./course-search"
import { ViewportCourseTable } from "./viewport-course-table"
import { CourseDetailDialog } from "./course-detail-dialog"
import { EmptyState } from "./empty-state"
import { sanitizeQuery } from "@/lib/utils"

// const handleSearch = async (query: string) => {

//     try {
        
//         if (!query.trim()) {
//             setSearchResults([])
//             return
//         }
        
//         query = sanitizeQuery(query) // setting some defaults
//         if (!query.trim()) {
//             console.log("Single character query, populating all courses")

//             const response = await fetch(`/api/courses`)
//             const courses = await response.json()
//             setSearchResults(courses)

//             return
//         }

//         // send query to backend
//         console.log("Input query:", query)
//         const response = await fetch(`/api/courses/search?keywords=${encodeURIComponent(searchTerm)}`)
//         const courses = await response.json()

//         if (Array.isArray(courses)) {
//             setSearchResults(courses)
//         } else {
//             console.error("Unexpected courses format:", courses)
//             setSearchResults([])
//         }

//     } catch (error) {
//         console.error("Error fetching search results:", error)
//         setSearchResults([]) // set searchResults to an empty array on error
//     }
// }

export default function Courses() {
    const [searchTerm, setSearchTerm] = useState("")
    const [selectedDepartment, setSelectedDepartment] = useState<string>("all") // filter
    const [selectedSchool, setSelectedSchool] = useState<string>("all") // filter
    const [sortField, setSortField] = useState<SortField>("course_code")
    const [sortDirection, setSortDirection] = useState<SortDirection>("asc")
    const [selectedCourse, setSelectedCourse] = useState<Course | null>(null)

    // const [allCourses, setAllCourses] = useState<Course[]>([])
    const [allDepartments, setAllDepartments] = useState<string[]>([])
    const [allSchools, setAllSchools] = useState<string[]>([])
    const [isLoading, setIsLoading] = useState(true) // loading indicator for initial load
    const [searchResults, setSearchResults] = useState<Course[]>([])
    
    // debouncing: immediate on first keystroke, then wait 300ms
    // const debouncedSearchTerm = useDebounce(searchTerm, 300)
    const [isSearching, setIsSearching] = useState(false)

    const { isSearchSticky, isTableHeaderSticky, searchBarRef, tableHeaderRef } = useSticky()


    // load in departments and school
    useEffect(() => {
        const fetchData = async () => {
            const [deptRes, schRes] = await Promise.all([
                fetch(`/api/departments`),
                fetch(`/api/schools`),
            ])

            const [depts, schools] = await Promise.all([
                deptRes.json(),
                schRes.json()
            ])

            setAllDepartments(depts)
            setAllSchools(schools)
        }

        fetchData()
    }, [])
    

    const handleSort = (field: SortField) => {
        if (sortField === field) {
            setSortDirection(sortDirection === "asc" ? "desc" : "asc")
        } else {
            setSortField(field)
            setSortDirection("asc")
        }
    }

    const handleSearch = async (query: string, dept: string, school: string) => {
        try {
            if (!query.trim() && dept == "all" && school == "all") {
                console.log("Empty query, fetching all courses")
                const response = await fetch(`/api/courses`)
                const courses = await response.json()
                setSearchResults(courses)
                return
            }

            query = sanitizeQuery(query) // optional sanitization
            if (!query.trim() && dept == "all" && school == "all") {
                console.log("Single character query, fetching all courses")
                const response = await fetch(`/api/courses`)
                const courses = await response.json()
                setSearchResults(courses)
                return
            }

            console.log("Searching backend for:", query)
            setIsLoading(true)

            const response = await fetch(`/api/courses/search?keywords=${encodeURIComponent(query)}&dept=${dept}&school=${school}`)
            const courses = await response.json()

            if (Array.isArray(courses)) {
                setSearchResults(courses)
            } else {
                console.error("Unexpected courses format:", courses)
                setSearchResults([])
            }

        } catch (error) {
            console.error("Error fetching search results:", error)
            setSearchResults([])
        } finally {
            setIsLoading(false)
        }
    }

    // Trigger search whenever searchTerm changes
    useEffect(() => {
        handleSearch(searchTerm, selectedDepartment, selectedSchool)
    }, [searchTerm, selectedDepartment, selectedSchool])

    return (
        <div className="container mx-auto px-4 py-6">
            <div className="text-center mb-6">
                <h1 className="font-sans text-6xl font-bold text-blue-600 mb-2">Classdore</h1>
                <p className="font-serif text-gray-600 max-w-2xl mx-auto">
                    Fast, relevant class search. Course listings updated daily.
                </p>
            </div>

            <CourseSearch
                ref={searchBarRef}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                selectedDepartment={selectedDepartment}
                setSelectedDepartment={setSelectedDepartment}
                selectedSchool={selectedSchool}
                setSelectedSchool={setSelectedSchool}
                departments={allDepartments}
                schools={allSchools}
                filteredCount={searchResults.length} // TODO: filter/sort
                totalCount={searchResults.length}
                isSearchSticky={isSearchSticky}
                isSearching={isSearching}
            />

            {isSearchSticky && <div className="h-[120px] mb-4" />}

            {isLoading ? (
                <div className="text-center py-10">Loading courses...</div>
            ) : isSearching ? (
                <div className="text-center py-10">Searching...</div>
            ) : searchResults.length > 0 ? ( // TODO: filter/sort
                <ViewportCourseTable
                    ref={tableHeaderRef}
                    courses={searchResults} // TODO: filter/sort
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

export { Courses }
