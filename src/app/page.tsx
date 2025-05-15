"use client"

import { useState } from "react"
import { SearchBar } from "@/components/search-bar"
import { ResultsTable } from "@/components/results-table"
import type { Course } from "@/components/course-details-card"

// Updated mock data for search results
const mockResults: Course[] = [
    {
        id: "2302",
        course_dept: "ANTH",
        course_code: "8000",
        class_section: "01",
        course_title: "History of Anthropological Theory I",
        school: "College of Arts and Science",
        career: "Graduate",
        class_type: "Lecture",
        credit_hours: "3.0",
        grading_basis: "Standard Grading Basis",
        consent: "No Special Consent Required",
        term_year: "2025",
        term_season: "Fall",
        session: "Regular Academic Session",
        dates: "8/20/25 - 12/4/25",
        requirements: "",
        description: "An advanced consideration of the history of anthropological theory from its origins to the mid-twentieth century. [3]",
        notes: null,
        status: "Open",
        capacity: 15,
        enrolled: 0,
        wl_capacity: 5,
        wl_occupied: 0,
        attributes: null,
        meeting_days: [
            "M"
        ],
        meeting_times: [
            "04:10p - 06:30p"
        ],
        meeting_dates: [
            "8/20/25-12/4/25"
        ],
        instructors: [
            "Bjork-James, Carwil R. (Primary)"
        ]
    },
    {
        id: "2998",
        course_dept: "ASTR",
        course_code: "3000",
        class_section: "01",
        course_title: "Principles of Astrophysics",
        school: "College of Arts and Science",
        career: "Undergraduate",
        class_type: "Lecture",
        credit_hours: "3.0",
        grading_basis: "Student Option Grading Basis",
        consent: "No Special Consent Required",
        term_year: "2025",
        term_season: "Fall",
        session: "Regular Academic Session",
        dates: "8/20/25 - 12/4/25",
        requirements: "Prerequisites: PHYS 1501, 1601, or 1911, and either MATH 1100, 1200, or 1300.",
        description: "Tools and methods of astrophysics, including light and telescopes. Cosmology, the Big Bang, and the origin and evolution of matter. Galaxies, star formation, and the physics of stars, including nucleosynthesis and stellar death. Techniques for discovering and measuring properties of exoplanets. Prerequisite: either PHYS 1501, 1601, or 1911: and either MATH 1100, 1200, or 1300. [3] (MNS)",
        notes: null,
        status: "Open",
        capacity: 30,
        enrolled: 0,
        wl_capacity: 12,
        wl_occupied: 0,
        attributes: [
            "AXLE: Math and Natural Sciences"
        ],
        meeting_days: [
            "TR"
        ],
        meeting_times: [
            "09:30a - 10:45a"
        ],
        meeting_dates: [
            "8/20/25-12/4/25"
        ],
        instructors: [
            "Runnoe, Jessie C. (Primary)"
        ]
    },
    {
        id: "4279",
        course_dept: "BME",
        course_code: "3000",
        class_section: "01",
        course_title: "Physiological Transport Phenomena",
        school: "School of Engineering",
        career: "Undergraduate",
        class_type: "Lecture",
        credit_hours: "3.0",
        grading_basis: "Standard Grading Basis",
        consent: "No Special Consent Required",
        term_year: "2025",
        term_season: "Fall",
        session: "Regular Academic Session",
        dates: "8/20/25 - 12/4/25",
        requirements: "Prerequisite: BME 2100 and MATH 2400 or 2420.",
        description: "Mechanics of fluids, heat transfer, and mass transfer in living systems. Basic theories of transport phenomena, applications to mammalian and cellular physiology and the design of medical devices. Prerequisite: BME 2100; MATH 2400 or 2420. [3]",
        notes: null,
        status: "Open",
        capacity: 40,
        enrolled: 0,
        wl_capacity: 5,
        wl_occupied: 0,
        attributes: null,
        meeting_days: [
            "MWF"
        ],
        meeting_times: [
            "09:05a - 09:55a"
        ],
        meeting_dates: [
            "8/20/25-12/4/25"
        ],
        instructors: [
            "Guenst, Valerie J. (Primary)"
        ]
    },
    {
        id: "4578",
        course_dept: "CE",
        course_code: "8000",
        class_section: "01",
        course_title: "Individual Study of Civil Engineering Problems",
        school: "School of Engineering",
        career: "Graduate",
        class_type: "Directed Study",
        credit_hours: "1.0-4.0",
        grading_basis: "Standard Grading Basis",
        consent: "Department Consent Required",
        term_year: "2025",
        term_season: "Fall",
        session: "Regular Academic Session",
        dates: "8/20/25 - 12/4/25",
        requirements: "",
        description: "Literature review and analysis of special problems under faculty supervision. FALL, SPRING, SUMMER. [1-4 each semester]",
        notes: null,
        status: "Open",
        capacity: 30,
        enrolled: 0,
        wl_capacity: 0,
        wl_occupied: 0,
        attributes: null,
        meeting_days: [
            "TBA"
        ],
        meeting_times: [
            "TBA"
        ],
        meeting_dates: [
            "8/20/25-12/4/25"
        ],
        instructors: [
            "Basu, Prodyot K. (Primary)"
        ]
    },
    {
        id: "12345",
        course_dept: "CS",
        course_code: "101",
        class_section: "001",
        course_title: "Introduction to Computer Science",
        school: "School of Engineering",
        career: "Undergraduate",
        class_type: "Lecture",
        credit_hours: "3.0",
        grading_basis: "Graded",
        consent: "No Special Consent Required",
        term_year: "2023",
        term_season: "Fall",
        session: "Regular Academic Session",
        dates: "08/28/2023 - 12/15/2023",
        requirements: "Prerequisite: None",
        description:
            "This course provides a broad introduction to computer science and the key ideas in modern computing. Topics include algorithmic problem-solving, data representation, abstraction, and programming basics.",
        notes: "Laptops required for in-class activities",
        status: "Open",
        capacity: 200,
        enrolled: 150,
        wl_capacity: 20,
        wl_occupied: 0,
        attributes: ["Writing Intensive", "First Year Experience"],
        meeting_days: ["Mon, Wed, Fri"],
        meeting_times: ["10:00 AM - 11:30 AM"],
        meeting_dates: ["08/28/2023 - 12/15/2023"],
        instructors: ["Dr. Jane Smith", "Prof. John Doe"],
    },
    {
        id: "23456",
        course_dept: "MATH",
        course_code: "201",
        class_section: "002",
        course_title: "Calculus II",
        school: "School of Arts & Sciences",
        career: "Undergraduate",
        class_type: "Lecture",
        credit_hours: "4.0",
        grading_basis: "Graded",
        consent: "No Special Consent Required",
        term_year: "2023",
        term_season: "Fall",
        session: "Regular Academic Session",
        dates: "08/28/2023 - 12/15/2023",
        requirements: "Prerequisite: MATH 101 or equivalent",
        description:
            "A continuation of Calculus I, this course covers integration techniques, applications of integration, infinite sequences and series, parametric equations, and polar coordinates.",
        notes: null,
        status: "Wait list",
        capacity: 100,
        enrolled: 100,
        wl_capacity: 10,
        wl_occupied: 5,
        attributes: ["Quantitative Reasoning"],
        meeting_days: ["Tue, Thu"],
        meeting_times: ["1:00 PM - 2:30 PM"],
        meeting_dates: ["08/28/2023 - 12/15/2023"],
        instructors: ["Dr. Alan Turing"],
    },
    {
        id: "34567",
        course_dept: "ENG",
        course_code: "102",
        class_section: "003",
        course_title: "English Composition",
        school: "School of Arts & Sciences",
        career: "Undergraduate",
        class_type: "Seminar",
        credit_hours: "3.0",
        grading_basis: "Graded",
        consent: "No Special Consent Required",
        term_year: "2023",
        term_season: "Fall",
        session: "Regular Academic Session",
        dates: "08/28/2023 - 12/15/2023",
        requirements: "Prerequisite: ENG 101",
        description:
            "This course focuses on developing critical thinking and writing skills. Students will learn to construct effective arguments, analyze texts, and write clear, concise, and compelling essays.",
        notes: null,
        status: "Closed",
        capacity: 30,
        enrolled: 30,
        wl_capacity: 5,
        wl_occupied: 3,
        attributes: ["Writing Intensive", "Core Curriculum"],
        meeting_days: ["Mon, Wed, Fri"],
        meeting_times: ["2:00 PM - 3:00 PM"],
        meeting_dates: ["08/28/2023 - 12/15/2023"],
        instructors: ["Prof. Emily Bronte", "Dr. William Shakespeare"],
    },
    {
        id: "45678",
        course_dept: "PHYS",
        course_code: "301",
        class_section: "001",
        course_title: "Quantum Mechanics",
        school: "School of Engineering",
        career: "Graduate",
        class_type: "Lecture/Lab",
        credit_hours: "4.0",
        grading_basis: "Graded",
        consent: "Instructor Consent Required",
        term_year: "2023",
        term_season: "Fall",
        session: "Regular Academic Session",
        dates: "08/28/2023 - 12/15/2023",
        requirements: "Prerequisites: PHYS 201, MATH 301",
        description:
            "An introduction to the principles of quantum mechanics. Topics include wave-particle duality, Schrödinger equation, quantum states, and applications to atomic and molecular systems.",
        notes: "Lab fee: $50",
        status: "Open",
        capacity: 50,
        enrolled: 40,
        wl_capacity: 0,
        wl_occupied: 0,
        attributes: null,
        meeting_days: ["Tue, Thu", "Fri"],
        meeting_times: ["9:00 AM - 11:00 AM", "1:00 PM - 3:00 PM"],
        meeting_dates: ["08/28/2023 - 12/15/2023", "08/28/2023 - 12/15/2023"],
        instructors: ["Dr. Richard Feynman"],
    },
]

export default function Home() {
    // const [searchResults, setSearchResults] = useState(mockResults)

    // const handleSearch = (query: string) => {
    //     if (!query.trim()) {
    //         setSearchResults(mockResults)
    //         return
    //     }

    //     const lowerQuery = query.toLowerCase()
    //     const filteredResults = mockResults.filter(
    //         (course) =>
    //             course.id.toLowerCase().includes(lowerQuery) ||
    //             course.course_dept.toLowerCase().includes(lowerQuery) ||
    //             course.course_code.toLowerCase().includes(lowerQuery) ||
    //             course.class_section.toLowerCase().includes(lowerQuery) ||
    //             course.course_title.toLowerCase().includes(lowerQuery) ||
    //             course.school.toLowerCase().includes(lowerQuery) ||
    //             course.career.toLowerCase().includes(lowerQuery) ||
    //             (course.description && course.description.toLowerCase().includes(lowerQuery)) ||
    //             course.instructors.some((instructor) => instructor.toLowerCase().includes(lowerQuery)) ||
    //             (course.attributes && course.attributes.some((attr) => attr.toLowerCase().includes(lowerQuery))),
    //     )
    //     setSearchResults(filteredResults)
    // }

    const [searchResults, setSearchResults] = useState(mockResults)
    
    const handleSearch = async (query: string) => {

        // // Send the query to the backend
        // const response = await fetch(`http://localhost:3001/api/courses?keywords=${encodeURIComponent(query)}`);
        
        // const data = await response.json();

        // // Set the message from the backend
        // setSearchResults(data || []);
        // // setSearchResults(mockResults);

        try {
            console.log("query", query);

            interface CourseData {
                id: string;
                value: {
                    id: string;
                    course_dept: string;
                    course_code: string;
                    class_section: string;
                    course_title: string;
                    school: string;
                    career: string;
                    class_type: string;
                    credit_hours: string;
                    grading_basis: string;
                    consent: string;
                    term_year: number;
                    term_season: string;
                    session: string;
                    dates: string;
                    requirements: string;
                    description: string | null;
                    notes: string | null;
                    status: string;
                    capacity: number;
                    enrolled: number;
                    wl_capacity: number;
                    wl_occupied: number;
                    attributes: string[] | null;
                    meeting_days: string[];
                    meeting_times: string[];
                    meeting_dates: string[];
                    instructors: string[];
                };
            }

            const response = await fetch(`http://localhost:3001/api/courses/search?keywords=${encodeURIComponent(query)}`);
            console.log("response", response);
            let data = await response.json();

            data = data.map((courseData:CourseData) => {
                const courseValue = courseData.value;
            
                return {
                  ...courseValue,
                  term_year: courseValue.term_year.toString(), // convert number to string
                };
              });
    
            // Check if the data is an array (as expected)
            if (Array.isArray(data)) {
                console.log("data", data);
                setSearchResults(data);
            } else {
                console.error("Unexpected data format:", data);
                setSearchResults([]);
            }
        } catch (error) {
            console.error("Error fetching search results:", error);
            setSearchResults([]); // Optionally, set searchResults to an empty array on error
        }
    };

    return (
        <main className="flex min-h-screen flex-col items-center justify-start p-16 gap-8">
            <h1 className="text-7xl font-bold mb-4">ClassDore Course Search</h1>
            <SearchBar onSearch={handleSearch} />
            <div className="w-full overflow-x-auto">
            {/* <div className="w-full max-w-6xl overflow-x-auto"> */}
                <ResultsTable results={searchResults} />
            </div>
        </main>
    )
}

