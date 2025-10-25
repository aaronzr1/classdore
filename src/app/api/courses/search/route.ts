import { NextResponse } from "next/server";
import { getAllCourses, searchCourses } from "@/lib/redis-service";
import { SortField, SortDirection } from "@/lib/types";

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const keywords = searchParams.get("keywords") || "*";
    const dept = searchParams.get("dept") || "all";
    const school = searchParams.get("school") || "all";
    const broadSearch = searchParams.get("broadSearch") === "true";
    const sortField = searchParams.get("sortField") || "course_code";
    const sortDirection = searchParams.get("sortDirection") || "asc";

    if (keywords === "*" && dept === "all" && school === "all") { // shouldn't happen
        try {
            const courses = await getAllCourses();
            return NextResponse.json(courses);
        } catch (err) {
            console.error("Error fetching all courses:", err);
            return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
        }
    }

    try {
        const courses = await searchCourses(
            keywords,
            dept,
            school,
            broadSearch,
            sortField as SortField,
            sortDirection as SortDirection
        );
        if (!courses) return NextResponse.json([], { status: 200 });
        return NextResponse.json(courses);
    } catch (err) {
        console.error("Error searching courses:", err);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}