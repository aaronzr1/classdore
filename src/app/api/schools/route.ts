import { NextResponse } from "next/server";
import { getSchools } from "@/lib/redis-service";

export async function GET() {
  try {
    const schools = await getSchools();
    return NextResponse.json(schools);
  } catch (err) {
    console.error("Error fetching all courses:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}