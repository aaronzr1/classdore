"use client"

import { useState } from "react"
import { SearchBar } from "@/components/search-bar"
import { ResultsTable } from "@/components/results-table"
import type { Course } from "@/../shared/course"
import { sanitizeQuery } from "@/lib/utils"

export default function Home() {
    const [searchResults, setSearchResults] = useState<Course[]>([]);

    const handleSearch = async (query: string) => {

        try {
            
            if (!query.trim()) {
                setSearchResults([]);
                return;
            }
            
            query = sanitizeQuery(query); // setting some defaults
            if (!query.trim()) {
                console.log("Single character query, populating all courses");

                const response = await fetch(`http://localhost:3001/api/courses`);
                const courses = await response.json();
                setSearchResults(courses);

                return;
            }

            // send query to backend
            console.log("Input query:", query);
            const response = await fetch(`http://localhost:3001/api/courses/search?keywords=${encodeURIComponent(query)}`);
            const courses = await response.json();

            if (Array.isArray(courses)) {
                setSearchResults(courses);
            } else {
                console.error("Unexpected courses format:", courses);
                setSearchResults([]);
            }

        } catch (error) {
            console.error("Error fetching search results:", error);
            setSearchResults([]); // set searchResults to an empty array on error
        }
    };

    return (
        <main className="flex min-h-screen flex-col items-center justify-start p-16 gap-8">

            <h1 className="text-7xl font-bold mb-4">’CLASSDORE‘</h1>

            <SearchBar onSearch={handleSearch} />

            <div className="w-full overflow-x-auto">
                <ResultsTable results={searchResults} />
            </div>

        </main>
    )
}

