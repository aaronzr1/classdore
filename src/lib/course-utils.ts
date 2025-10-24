import { Course, SortField, SortDirection } from "./types"

// 🔄 LEGACY SEARCH FUNCTION - COMMENTED OUT FOR FUTURE REFERENCE
// This was used for Redis-based search. To revert back to Redis search:
// 1. Uncomment this function
// 2. Update courses.tsx to use handleSearch instead of client-side filtering
// 3. Update imports to use this function instead of search-utils.ts

export async function searchCoursesRedis(query: string): Promise<Course[]> {
    try {
        const response = await fetch(`/api/courses/search?keywords=${encodeURIComponent(query)}`)
        const courses = await response.json()
        return Array.isArray(courses) ? courses : []
    } catch (error) {
        console.error("Error fetching search results:", error)
        return []
    }
}

export function getDepartments(courses: Course[]): string[] {
    return Array.from(new Set(courses.map((course) => course.course_dept)))
}
