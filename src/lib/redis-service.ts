import { createClient } from "redis";
import { Course, CourseSearchRequest, CourseSearchResponse, CourseTableItem, SortField, SortDirection } from "@/lib/types";
import dotenv from "dotenv";
import pako from "pako"; // For zlib/gzip decompression

dotenv.config();

const redisClient = createClient({
    url: process.env.REDIS_URL,
});

redisClient.on("error", (err: Error) => console.error("Redis Client Error", err));

let isConnected = false;
export async function getRedisClient() {
    if (!isConnected) {
        await redisClient.connect();
        isConnected = true;
        console.log("Redis connected");
    }
    return redisClient;
}

// Optimized search function using RediSearch with proper indexing
export async function searchCoursesOptimized(
    request: CourseSearchRequest
): Promise<CourseSearchResponse> {
    const client = await getRedisClient();
    const {
        query = "",
        department,
        school,
        limit = 50,
        offset = 0,
        sortField = "course_title",
        sortDirection = "asc"
    } = request;

    try {
        // Build RediSearch query with filters
        let searchQuery = "";
        const filters: string[] = [];

        // Full-text search across multiple fields
        if (query.trim()) {
            // Use RediSearch's multi-field search with weights
            // course_title gets highest weight, then course_dept, then description
            searchQuery = `(@course_title:"${query}"* | @course_dept:"${query}"* | @course_code:"${query}"* | @description:"${query}"* | @instructors:"${query}"*)`;
        } else {
            // Empty query - return all courses
            searchQuery = "*";
        }

        // Add filters
        if (department && department !== "all") {
            filters.push(`@course_dept:{${department}}`);
        }
        if (school && school !== "all") {
            filters.push(`@school:{${school}}`);
        }

        // Combine search query with filters
        const finalQuery = filters.length > 0
            ? `${searchQuery} ${filters.join(" ")}`
            : searchQuery;

        console.log("RediSearch query:", finalQuery);

        // Build search options with sorting and pagination
        const searchOptions: any = {
            LIMIT: { from: offset, size: limit },
            RETURN: ["id", "course_title", "course_dept", "instructors", "school", "description"]
        };

        // Add sorting if specified
        if (sortField && sortDirection) {
            searchOptions.SORTBY = {
                field: sortField,
                direction: sortDirection.toUpperCase()
            };
        }

        // Execute search
        const result = await client.ft.search("idx:courses", finalQuery, searchOptions);

        // Type assertion for Redis search result
        const searchResult = result as { total: number; documents: Array<{ id: string; value: any }> };

        // Transform results to CourseTableItem format for optimal performance
        const courses: CourseTableItem[] = searchResult.documents.map((doc) => ({
            id: doc.value.id,
            course_title: doc.value.course_title,
            course_dept: doc.value.course_dept,
            instructors: doc.value.instructors || [],
            school: doc.value.school,
            description: doc.value.description
        }));

        return {
            courses,
            total: searchResult.total,
            hasMore: offset + limit < searchResult.total,
            query: query.trim(),
            filters: { department, school }
        };

    } catch (error) {
        console.error("Error in optimized course search:", error);
        throw new Error("Search failed");
    }
}

// Get top courses for initial load (no search query)
export async function getTopCourses(limit: number = 50): Promise<CourseSearchResponse> {
    return searchCoursesOptimized({
        query: "",
        limit,
        offset: 0,
        sortField: "course_title",
        sortDirection: "asc"
    });
}

// Get departments for filter dropdown (optimized)
export async function getDepartments(): Promise<string[]> {
    const client = await getRedisClient();
    try {
        // Use RediSearch aggregation to get unique departments
        const result = await client.ft.aggregate("idx:courses", "*", {
            GROUPBY: { REDUCE: "COUNT", fields: ["@course_dept"] },
            SORTBY: { field: "@course_dept", direction: "ASC" }
        } as any);

        // Type assertion for aggregation result
        const aggResult = result as { results: Array<{ course_dept: string }> };
        return aggResult.results.map((item) => item.course_dept).filter(Boolean);
    } catch (error) {
        console.error("Error fetching departments:", error);
        return [];
    }
}

// Get schools for filter dropdown (optimized)
export async function getSchools(): Promise<string[]> {
    const client = await getRedisClient();
    try {
        // Use RediSearch aggregation to get unique schools
        const result = await client.ft.aggregate("idx:courses", "*", {
            GROUPBY: { REDUCE: "COUNT", fields: ["@school"] },
            SORTBY: { field: "@school", direction: "ASC" }
        } as any);

        // Type assertion for aggregation result
        const aggResult = result as { results: Array<{ school: string }> };
        return aggResult.results.map((item) => item.school).filter(Boolean);
    } catch (error) {
        console.error("Error fetching schools:", error);
        return [];
    }
}

// Legacy function for backward compatibility
export async function getAllCourses(): Promise<Course[]> {
    const client = await getRedisClient();
    try {
        const start = process.hrtime.bigint(); // High-resolution timer

        // const results = await client.ft.search('idx:courses', '*', {
        //     LIMIT: { from: 0, size: 10000 },
        //     RETURN: [
        //         'enrolled',
        //         'capacity',
        //         'course_dept',
        //         'course_code',
        //         'career',
        //         'course_title',
        //         'class_section',
        //         'instructors',
        //         'credit_hours',
        //         'meeting_days',
        //         'meeting_times',
        //         'enrolled',
        //         'capacity',
        //         'status',
        //         'id',
        //         'requirements',
        //         'description']
        // });

        // console.log(results?.documents);

        // Get the compressed snapshot from Redis as a string
        const compressedBase64 = await client.get("courses:all:compressed");
        if (!compressedBase64) return [];

        // Decode Base64 to Uint8Array
        const compressedBytes = Uint8Array.from(
            Buffer.from(compressedBase64, "base64")
        );

        // Decompress with pako
        const decompressedBytes = pako.inflate(compressedBytes);

        // Convert back to string and parse JSON
        const jsonString = new TextDecoder().decode(decompressedBytes);
        const courses: Course[] = JSON.parse(jsonString);

        const end = process.hrtime.bigint();
        const durationMs = Number(end - start) / 1_000_000;
        console.log(`Retrieved documents in ${durationMs.toFixed(2)} ms`);
        // console.log(`Retrieved ${courses.length} documents in ${durationMs.toFixed(2)} ms`);

        return courses;
    } catch (error) {
        console.error("Error fetching/decompressing courses snapshot:", error);
        return [];
    }
}
// Legacy search function for backward compatibility
export async function searchCourses(query: string): Promise<Course[] | null> {
    const client = await getRedisClient();
    try {
        console.log("Querying:", query);
        const result = await client.ft.search(
            "idx:courses",
            query,
            { LIMIT: { from: 0, size: 10000 } }
        );

        // Type assertion for Redis search result
        const searchResult = result as unknown as { documents: Array<{ value: Course }> };
        return searchResult.documents.map((doc) => doc.value);
    } catch (error) {
        console.error(`Error searching results for "${query}":`, error);
        return null;
    }
}
