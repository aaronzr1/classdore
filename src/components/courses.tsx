"use client"

import { useEffect, useState } from "react"
import { Course, SortField, SortDirection } from "@/lib/types"
// import { filterAndSortCourses, initFuse } from "@/lib/search-utils"
import { useSticky } from "@/lib/use-sticky"
import { CourseSearch } from "./course-search"
import { ViewportCourseTable } from "./viewport-course-table"
import { CourseDetailDialog } from "./course-detail-dialog"
import { EmptyState } from "./empty-state"

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
    const [broadSearch, setBroadSearch] = useState<boolean>(false) // false = precise course code matching
    const [sortField, setSortField] = useState<SortField>("course_code")
    const [sortDirection, setSortDirection] = useState<SortDirection>("asc")
    const [selectedCourse, setSelectedCourse] = useState<Course | null>(null)

    // const [allCourses, setAllCourses] = useState<Course[]>([])
    const [allDepartments, setAllDepartments] = useState<string[]>([])
    const [allSchools, setAllSchools] = useState<string[]>([])
    const [isLoading, setIsLoading] = useState(true) // loading indicator for initial load
    const [searchResults, setSearchResults] = useState<Course[]>([])
    const [initialTotalCount, setInitialTotalCount] = useState<number>(0) // store initial course count
    
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
    

    // Local sorting function for existing searchResults
    const sortSearchResults = (results: Course[], field: SortField, direction: SortDirection): Course[] => {
        return [...results].sort((a, b) => {
            let aValue: string | number
            let bValue: string | number

            switch (field) {
                case "course_code":
                    aValue = `${a.course_dept} ${a.course_code} ${a.class_section}`
                    bValue = `${b.course_dept} ${b.course_code} ${b.class_section}`
                    break
                case "course_title":
                    aValue = a.course_title
                    bValue = b.course_title
                    break
                case "instructors":
                    aValue = a.instructors.join(", ")
                    bValue = b.instructors.join(", ")
                    break
                case "credit_hours":
                    aValue = parseInt(a.credit_hours) || 0
                    bValue = parseInt(b.credit_hours) || 0
                    break
                case "enrolled":
                    aValue = parseInt(a.enrolled) || 0
                    bValue = parseInt(b.enrolled) || 0
                    break
                default:
                    aValue = `${a.course_dept} ${a.course_code} ${a.class_section}`
                    bValue = `${b.course_dept} ${b.course_code} ${b.class_section}`
            }

            if (typeof aValue === "string" && typeof bValue === "string") {
                const comparison = aValue.localeCompare(bValue)
                return direction === "asc" ? comparison : -comparison
            } else {
                const comparison = (aValue as number) - (bValue as number)
                return direction === "asc" ? comparison : -comparison
            }
        })
    }

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
                const response = await fetch(`/api/courses?sortField=${sortField}&sortDirection=${sortDirection}`)
                const courses = await response.json()
                setSearchResults(courses)
                // Store initial total count if not already set
                if (initialTotalCount === 0) {
                    setInitialTotalCount(courses.length)
                }
                return
            }

            console.log("Searching backend for:", query, "broadSearch:", broadSearch)
            setIsLoading(true)

            const response = await fetch(`/api/courses/search?keywords=${encodeURIComponent(query)}&dept=${dept}&school=${school}&broadSearch=${broadSearch}&sortField=${sortField}&sortDirection=${sortDirection}`)
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

    // Trigger search when search term, department, school, or broad search changes
    useEffect(() => {
        handleSearch(searchTerm, selectedDepartment, selectedSchool)
    }, [searchTerm, selectedDepartment, selectedSchool, broadSearch])

    // Handle local sorting when only sortField or sortDirection changes
    useEffect(() => {
        if (searchResults.length > 0) {
            const sortedResults = sortSearchResults(searchResults, sortField, sortDirection)
            setSearchResults(sortedResults)
        }
    }, [sortField, sortDirection])

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
                filteredCount={searchResults.length}
                totalCount={initialTotalCount}
                isSearchSticky={isSearchSticky}
                isSearching={isSearching}
                broadSearch={broadSearch}
                setBroadSearch={setBroadSearch}
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
