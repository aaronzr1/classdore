import { createClient } from "redis";
import { Course, SortField, SortDirection } from "@/lib/types";
import dotenv from "dotenv";
import pako from "pako"; // For zlib/gzip decompression

dotenv.config();

const redisClient = createClient({
    url: process.env.REDIS_URL,
});

redisClient.on("error", (err: Error) => console.error("Redis Client Error", err));

let isConnected = false;
let connectionPromise: Promise<void> | null = null;
export async function getRedisClient() {
    if (!isConnected) {
        // If there's already a connection attempt in progress, wait for it
        if (connectionPromise) {
            await connectionPromise;
        } else {
            // Start a new connection attempt
            connectionPromise = redisClient.connect().then(() => {
                isConnected = true;
                connectionPromise = null;
                console.log("Redis connected");
            });
            await connectionPromise;
        }
    }
    return redisClient;
}

// Get departments for filter dropdown (optimized)
export async function getDepartments(): Promise<string[]> {
    const client = await getRedisClient();
    try {
        // Use RediSearch aggregation to get unique departments
        const result = await client.ft.aggregate("idx:courses", "*", {
            LOAD: ["@course_dept"],
            GROUPBY: { fields: ["@course_dept"], REDUCE: "COUNT" },
            SORTBY: { field: "@course_dept", direction: "ASC" }
        } as Record<string, unknown>);

        // Type assertion for aggregation result
        const aggResult = result as { results: Array<{ course_dept: string }> };
        const departments = aggResult.results.map((item) => item.course_dept).filter(Boolean);
        
        // Convert to Set to remove duplicates, then back to sorted array
        return Array.from(new Set(departments)).sort();
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
            LOAD: ["@school"],
            GROUPBY: { fields: ["@school"], REDUCE: "COUNT" },
            SORTBY: { field: "@school", direction: "ASC" }
        } as Record<string, unknown>);

        // Type assertion for aggregation result
        const aggResult = result as { results: Array<{ school: string }> };
        const schools = aggResult.results.map((item) => item.school).filter(Boolean);
        
        // Convert to Set to remove duplicates, then back to sorted array
        return Array.from(new Set(schools)).sort();
    } catch (error) {
        console.error("Error fetching schools:", error);
        return [];
    }
}

// Legacy function for backward compatibility
export async function getAllCourses(): Promise<Course[]> {
    const client = await getRedisClient();
    try {
        const start = process.hrtime.bigint();

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

        return courses;
    } catch (error) {
        console.error("Error fetching/decompressing courses snapshot:", error);
        return [];
    }
}
// Legacy search function for backward compatibility
export async function searchCourses(query: string, dept: string, school: string, broadSearch: boolean = true, sortField?: SortField, sortDirection?: SortDirection): Promise<Course[] | null> {
    const client = await getRedisClient();
    try {
        let redisQuery = query;

        // If not using broad search, try to detect course code patterns
        if (!broadSearch && query && query !== "*") {
            const { parseSearchQuery } = await import('./utils');
            const parsed = parseSearchQuery(query);

            if (parsed.type === 'course_code_prefix' && parsed.codePrefix) {
                // Build a field-specific query for course codes
                const prefix = parsed.codePrefix;

                // For single-digit prefixes, expand to all two-digit combinations
                // e.g., "3" becomes "(30* | 31* | 32* | ... | 39*)"
                // This works around RediSearch limitations with very short prefixes
                if (prefix.length === 1) {
                    const expansions = [];
                    for (let i = 0; i <= 9; i++) {
                        expansions.push(`${prefix}${i}*`);
                    }
                    redisQuery = `@course_dept_tag:{${parsed.dept}} (@course_code:${expansions.join(' | @course_code:')})`;
                    console.log("Detected single-digit course code pattern - expanding to two-digit prefixes");
                } else {
                    // For multi-digit prefixes, use simple wildcard
                    redisQuery = `@course_dept_tag:{${parsed.dept}} @course_code:${prefix}*`;
                }

                console.log("Detected course code pattern - dept:", parsed.dept, "prefix:", parsed.codePrefix);
                console.log("Using course code prefix search:", redisQuery);
            } else {
                // For non-pattern queries when not in broad search, still use sanitized search
                const { sanitizeQuery } = await import('./utils');
                redisQuery = sanitizeQuery(query);
                console.log("Using general non-broad search with sanitization");
            }
        } else if (broadSearch && query && query !== "*") {
            // Apply sanitization for broad search
            const { sanitizeQuery } = await import('./utils');
            redisQuery = sanitizeQuery(query);
            console.log("Using broad search with sanitization");
        }

        // Apply school and dept filters (unless already specified in course code search)
        if (school && school !== "all") {
            redisQuery = (redisQuery === "*") ? `@school_tag:{${school}}` : `@school_tag:{${school}} ${redisQuery}`
        }

        // Only add dept filter if not already part of a course code search
        if (dept && dept !== "all" && !redisQuery.includes("@course_dept_tag")) {
            redisQuery = (redisQuery === "*") ? `@course_dept_tag:{${dept}}` : `@course_dept_tag:{${dept}} ${redisQuery}`
        }

        console.log("Final Redis query:", redisQuery);
        console.log("BroadSearch mode:", broadSearch);

        const searchOptions: Record<string, unknown> = {
            LIMIT: { from: 0, size: 10000 }
        };

        // Add sorting if specified
        if (sortField && sortDirection) {
            searchOptions.SORTBY = {
                BY: sortField,
                DIRECTION: sortDirection.toUpperCase()
            };
        }

        const result = await client.ft.search(
            "idx:courses",
            redisQuery,
            searchOptions
        );

        // Type assertion for Redis search result
        const searchResult = result as unknown as { documents: Array<{ value: Course }> };
        return searchResult.documents.map((doc) => doc.value);
    } catch (error) {
        console.error(`Error searching results for "${query}":`, error);
        return null;
    }
}
