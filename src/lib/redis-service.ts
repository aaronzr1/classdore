import { createClient } from "redis";
import { Course, RedisSearchResult } from "@/lib/types"; // adapt paths
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

export async function searchCourses(query: string): Promise<Course[] | null> {
    const client = await getRedisClient();
    try {
        console.log("Querying:", query);
        const result: RedisSearchResult = await client.ft.search(
            "idx:courses",
            query,
            { LIMIT: { from: 0, size: 10000 } }
        );

        // RedisSearchResults have weird formatting, we just unpack it here instead of later downstream
        return result.documents.map((doc) => doc.value); 
    } catch (error) {
        console.error(`Error searching results for "${query}":`, error);
        return null;
    }
}

// MEGA slow (15s): query for all keys
// export async function getAllCourses(): Promise<Course[]> {
//     return (await searchCourses("*")) || [];
// }

// still slow (5s): pipeline 
// export async function getAllCourses(): Promise<Course[]> {
//     const client = await getRedisClient();
//     try {
//       const keys = await client.keys("course:*");
//       if (!keys || keys.length === 0) return [];
  
//       const pipeline = client.multi();
//       keys.forEach((key) => pipeline.json.get(key, "$"));
//       const raw = (await pipeline.exec()) as (Course[] | null)[];
  
//       return raw
//         .map((entry) => (Array.isArray(entry) ? entry[0] : entry))
//         .filter((c): c is Course => c !== null);
//     } catch (error) {
//       console.error("Error fetching all courses:", error);
//       return [];
//     }
//   }
//   }

// ok for now (3s): compress, store in Redis as a single key, grab key, decompress
export async function getAllCourses(): Promise<Course[]> {
    const client = await getRedisClient();
    try {
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

        return courses;
    } catch (error) {
        console.error("Error fetching/decompressing courses snapshot:", error);
        return [];
    }
}