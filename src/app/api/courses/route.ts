import { NextResponse } from "next/server";
import { getAllCourses } from "@/lib/redis-service";
import { SortField, SortDirection } from "@/lib/types";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const sortField = (searchParams.get("sortField") || "course_code") as SortField;
    const sortDirection = (searchParams.get("sortDirection") || "asc") as SortDirection;
    
    const courses = await getAllCourses();
    
    // Sort courses after fetching
    const sortedCourses = [...courses].sort((a, b) => {
        let aValue: string | number
        let bValue: string | number

        switch (sortField) {
            case "course_code":
                aValue = a.course_code
                bValue = b.course_code
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
                aValue = a.course_code
                bValue = b.course_code
        }

        if (typeof aValue === "string" && typeof bValue === "string") {
            const comparison = aValue.localeCompare(bValue)
            return sortDirection === "asc" ? comparison : -comparison
        } else {
            const comparison = (aValue as number) - (bValue as number)
            return sortDirection === "asc" ? comparison : -comparison
        }
    });
    
    return NextResponse.json(sortedCourses);
  } catch (err) {
    console.error("Error fetching all courses:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}