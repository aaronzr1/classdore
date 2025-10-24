import { NextResponse } from "next/server";
import { getDepartments } from "@/lib/redis-service";

export async function GET() {
  try {
    const dept = await getDepartments();
    return NextResponse.json(dept);
  } catch (err) {
    console.error("Error fetching all courses:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}