import { NextResponse } from "next/server";
import { searchCourses } from "@/lib/redis-service";

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const keywords = searchParams.get("keywords");

    if (!keywords) {
        return NextResponse.json({ error: "Search query is required" }, { status: 400 });
    }

    try {
        const courses = await searchCourses(keywords);
        if (!courses) return NextResponse.json([], { status: 200 });
        return NextResponse.json(courses);
    } catch (err) {
        console.error("Error searching courses:", err);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}