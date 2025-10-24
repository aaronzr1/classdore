// import Fuse, { IFuseOptions } from "fuse.js"
// import { Course, SortField, SortDirection } from "./types"

// // Reuse a single Fuse instance (faster than recreating each search)
// let fuse: Fuse<Course> | null = null
// let lastCoursesLength = 0

// export function initFuse(courses: Course[]) {
//     // Only reinitialize if courses array has changed
//     if (fuse && lastCoursesLength === courses.length) {
//         return
//     }
    
//     const options: IFuseOptions<Course> = {
//         keys: [
//             { name: "course_title", weight: 2 },
//             { name: "course_dept", weight: 2 },
//             { name: "course_code", weight: 2 },
//             { name: "instructors", weight: 1 },
//             // { name: "description", weight: 1 }
//         ],
//         threshold: 0.3, // lower = stricter matching, 0.0 exact, 1.0 very loose
//         includeScore: true,
//         ignoreLocation: true, // match anywhere in string
//         // Performance optimizations
//         minMatchCharLength: 2,
//         findAllMatches: false,
//         useExtendedSearch: false,
//     }
//     fuse = new Fuse(courses, options)
//     lastCoursesLength = courses.length
// }

// export function searchCourses(query: string, courses: Course[]): Course[] {
//     if (!query.trim()) return courses;

//     const lowerQuery = query.toLowerCase();

//     // Very short queries: simple includes for speed
//     if (query.length <= 2) {
//         return courses.filter(course =>
//             course.course_title.toLowerCase().includes(lowerQuery) ||
//             `${course.course_dept} ${course.course_code}`.toLowerCase().includes(lowerQuery) ||
//             course.instructors.some(i => i.toLowerCase().includes(lowerQuery)) ||
//             (course.description?.toLowerCase().includes(lowerQuery) ?? false))
//     }

//     // Lazy initialize Fuse
//     if (!fuse || lastCoursesLength !== courses.length) initFuse(courses);

//     // Fuse.js search
//     const results = fuse!.search(query);
//     return results.map(r => r.item);
// }

// export function filterAndSortCourses(
//     courses: Course[],
//     searchTerm: string,
//     selectedDepartment: string,
//     selectedSchool: string,
//     sortField: SortField,
//     sortDirection: SortDirection
// ): Course[] {
//     // 🔹 Use Fuse.js for search instead of manual includes()
//     const searchedCourses = searchCourses(searchTerm, courses)

//     return searchedCourses
//         // .filter((course) => {
//         //     const matchesDepartment = selectedDepartment === "all" || course.course_dept === selectedDepartment
//         //     const matchesSchool = selectedSchool === "all" || course.career === selectedSchool
//         //     return matchesDepartment && matchesSchool
//         // })
//         .sort((a, b) => {
//             let aValue: string | string[] | number = a[sortField]
//             let bValue: string | string[] | number = b[sortField]

//             if (sortField === "enrolled") {
//                 aValue = Number.parseInt(a.enrolled) / Number.parseInt(a.capacity)
//                 bValue = Number.parseInt(b.enrolled) / Number.parseInt(b.capacity)
//             } else if (sortField === "instructors") {
//                 aValue = a.instructors[0] || ""
//                 bValue = b.instructors[0] || ""
//             }

//             if (typeof aValue === "string") {
//                 aValue = aValue.toLowerCase()
//                 bValue = (bValue as string).toLowerCase()
//             }

//             if (sortDirection === "asc") {
//                 return aValue < bValue ? -1 : aValue > bValue ? 1 : 0
//             } else {
//                 return aValue > bValue ? -1 : aValue < bValue ? 1 : 0
//             }
//         })
// }

// // Legacy search function (commented out for future use)
// // export function legacySearchCourses(query: string, courses: Course[]): Course[] {
// //     return courses.filter((course) => {
// //         return (
// //             course.course_title.toLowerCase().includes(query.toLowerCase()) ||
// //             `${course.course_dept} ${course.course_code}`.toLowerCase().includes(query.toLowerCase()) ||
// //             course.instructors.some((instructor) => instructor.toLowerCase().includes(query.toLowerCase()))
// //         )
// //     })
// // }
