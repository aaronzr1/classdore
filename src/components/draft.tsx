"use client"

import { useEffect, useState, useRef, useCallback } from "react"

interface Course {
  id: string
  title: string
  description?: string
  instructors?: string[]
}

export default function CourseListings() {
  const [courses, setCourses] = useState<Course[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [offset, setOffset] = useState(0)
  const observer = useRef<IntersectionObserver | null>(null)

  const LIMIT = 20 // how many to fetch per request

  const fetchCourses = useCallback(
    async (reset = false) => {
      if (loading || (!reset && !hasMore)) return
      setLoading(true)
      try {
        const res = await fetch(
          `/api/courses/search?keywords=${encodeURIComponent(searchTerm)}&offset=${reset ? 0 : offset}&limit=${LIMIT}`
        )
        if (!res.ok) throw new Error("Failed to fetch courses")
        const data = await res.json()

        setCourses((prev) => (reset ? data.results : [...prev, ...data.results]))
        setHasMore(data.results.length === LIMIT)
        setOffset((prev) => (reset ? LIMIT : prev + LIMIT))
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    },
    [searchTerm, offset, hasMore, loading]
  )

  // Reset and fetch when search term changes
  useEffect(() => {
    setOffset(0)
    setHasMore(true)
    fetchCourses(true)
  }, [searchTerm, fetchCourses])

  // Infinite scroll observer
  const lastCourseRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (loading) return
      if (observer.current) observer.current.disconnect()
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          fetchCourses()
        }
      })
      if (node) observer.current.observe(node)
    },
    [loading, hasMore, fetchCourses]
  )

  return (
    <div className="p-4">
      <input
        type="text"
        placeholder="Search courses..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="border rounded p-2 w-full mb-4"
      />

      <div className="space-y-4">
        {courses.map((course, idx) => {
          if (idx === courses.length - 1) {
            return (
              <div
                ref={lastCourseRef}
                key={course.id}
                className="border rounded p-4 shadow-sm bg-white"
              >
                <h3 className="font-bold text-lg">{course.title}</h3>
                {(course.instructors ?? []).length > 0 && (
                  <p className="text-sm text-gray-500">{(course.instructors ?? []).join(", ")}</p>
                )}
                {course.description && <p className="mt-2">{course.description}</p>}
              </div>
            )
          }
          return (
            <div
              key={course.id}
              className="border rounded p-4 shadow-sm bg-white"
            >
              <h3 className="font-bold text-lg">{course.title}</h3>
              {(course.instructors ?? []).length > 0 && (
                <p className="text-sm text-gray-500">{(course.instructors ?? []).join(", ")}</p>
              )}
              {course.description && <p className="mt-2">{course.description}</p>}
            </div>
          )
        })}

        {loading && <p className="text-center text-gray-500">Loading...</p>}
        {!hasMore && !loading && (
          <p className="text-center text-gray-400">No more results</p>
        )}
      </div>
    </div>
  )
}

// export { CourseListings }