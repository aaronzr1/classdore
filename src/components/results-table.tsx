"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { CourseDetailsCard, type Course } from "./course-details-card"
import { Badge } from "@/components/ui/badge"

interface ResultsTableProps {
    results: Course[]
}

export function ResultsTable({ results }: ResultsTableProps) {
    const [selectedCourse, setSelectedCourse] = useState<Course | null>(null)

    return (
        <>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Code</TableHead>
                        <TableHead>Title</TableHead>
                        <TableHead>Instructors</TableHead>
                        <TableHead>Enrolled/Capacity</TableHead>
                        <TableHead>Meeting Time</TableHead>
                        <TableHead>Status</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {results.map((course, index) => (
                        <TableRow
                            key={index}
                            className="cursor-pointer"
                            onClick={() => setSelectedCourse(course)}
                        >
                            <TableCell className="font-medium">
                                {course.course_dept} {course.course_code}-{course.class_section}
                            </TableCell>
                            <TableCell>{course.course_title}</TableCell>
                            <TableCell>{course.instructors.join(", ")}</TableCell>
                            <TableCell>{`${course.enrolled}/${course.capacity}`}</TableCell>
                            <TableCell>
                                {
                                    course.meeting_days.includes("TBA")
                                        ? "TBA"
                                        : course.meeting_days.length > 0
                                            ? `${course.meeting_days[0]} ${course.meeting_times[0] || ""}`
                                            : "N/A"
                                }
                            </TableCell>
                            <TableCell>
                                <Badge
                                    variant={
                                        course.status === "Open"
                                            ? "success"
                                            : course.status === "Wait list"
                                                ? "warning"
                                                // : "destructive"
                                                : "failure"
                                    }
                                    className="ml-auto"
                                >
                                    {
                                    course.status.replace(/\s/g, "").toLowerCase() === "waitlist"
                                        ? "Waitlist"
                                        : course.status.trim().toLowerCase() === "cancelled section"
                                            ? "Cancelled"
                                            : course.status
                                }
                                </Badge>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
            {selectedCourse && (
                <CourseDetailsCard course={selectedCourse} isOpen={!!selectedCourse} onClose={() => setSelectedCourse(null)} />
            )}
        </>
    )
}

