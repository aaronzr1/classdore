import { Course } from '../types/course';
import { getCachedCourses, getCachedSearchResults } from './redis-service';

// Mock data for courses
const mockCourses: Course[] = [
  {
    id: "2998",
    course_dept: "ASTR",
    course_code: "3000",
    class_section: "01",
    course_title: "Mock Data: Principles of Astrophysics",
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
    attributes: ["AXLE: Math and Natural Sciences"],
    meeting_days: ["TR"],
    meeting_times: ["09:30a - 10:45a"],
    meeting_dates: ["8/20/25-12/4/25"],
    instructors: ["Runnoe, Jessie C. (Primary)"]
  }
];

// Get all courses
export async function getAllCourses(): Promise<Course[]> {
  
  const cachedCourses = await getCachedCourses();

  if (cachedCourses) {
    return cachedCourses;
  } else {
    console.log("No cached courses, using mock data");
  }

  return mockCourses;
}

// Search courses
export async function searchCourses(query: string): Promise<Course[]> {
  
  const cachedResults = await getCachedSearchResults(query);
  
  if (cachedResults) {
    return cachedResults;
  }

  return mockCourses;
}