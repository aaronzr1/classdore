import { NextResponse } from "next/server";
import { getAllCourses } from "@/lib/redis-service";

export async function GET() {
  try {
    const courses = await getAllCourses();
    return NextResponse.json(courses);
  } catch (err) {
    console.error("Error fetching all courses:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}