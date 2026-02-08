// Parse course.id to extract classNumber and selectedTermCode
// Format: cn{classNumber}tc{selectedTermCode}
export function parseCourseId(id: string) {
    const match = id.match(/cn(\d+)tc(\d+)/)
    if (match) {
        return {
            classNumber: match[1],
            selectedTermCode: match[2]
        }
    }
    return null
}

// Generate the add-to-cart URL for a course
export function getAddCourseUrl(courseId: string): string {
    const classInfo = parseCourseId(courseId)
    return classInfo
        ? `https://more.app.vanderbilt.edu/more/StudentClassExecute!add.action?classNumber=${classInfo.classNumber}&selectedTermCode=${classInfo.selectedTermCode}`
        : "#"
}
