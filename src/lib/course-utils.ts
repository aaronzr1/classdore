import { Course, SortField, SortDirection } from "./types"

export function filterAndSortCourses(
    courses: Course[],
    searchTerm: string,
    selectedDepartment: string,
    selectedLevel: string,
    sortField: SortField,
    sortDirection: SortDirection
): Course[] {
    return courses
        .filter((course) => {
            const matchesSearch =
                course.course_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                `${course.course_dept} ${course.course_code}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
                course.instructors.some((instructor) => instructor.toLowerCase().includes(searchTerm.toLowerCase()))
            const matchesDepartment = selectedDepartment === "all" || course.course_dept === selectedDepartment
            const matchesLevel = selectedLevel === "all" || course.career === selectedLevel

            return matchesSearch && matchesDepartment && matchesLevel
        })
        .sort((a, b) => {
            let aValue: string | string[] | number = a[sortField]
            let bValue: string | string[] | number = b[sortField]

            if (sortField === "enrolled") {
                aValue = Number.parseInt(a.enrolled) / Number.parseInt(a.capacity)
                bValue = Number.parseInt(b.enrolled) / Number.parseInt(b.capacity)
            } else if (sortField === "instructors") {
                aValue = a.instructors[0] || ""
                bValue = b.instructors[0] || ""
            }

            if (typeof aValue === "string") {
                aValue = aValue.toLowerCase()
                bValue = (bValue as string).toLowerCase()
            }

            if (sortDirection === "asc") {
                return aValue < bValue ? -1 : aValue > bValue ? 1 : 0
            } else {
                return aValue > bValue ? -1 : aValue < bValue ? 1 : 0
            }
        })
}

export function getDepartments(courses: Course[]): string[] {
    return Array.from(new Set(courses.map((course) => course.course_dept)))
}
