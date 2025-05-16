import type { Course } from "@/../shared/course";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export async function searchCourses(query: string): Promise<Course[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/courses/search?query=${encodeURIComponent(query)}`);
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching courses:', error);
    // Return empty array in case of error
    return [];
  }
}

export async function getAllCourses(): Promise<Course[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/courses`);
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching all courses:', error);
    // Return empty array in case of error
    return [];
  }
}

export async function getCourseById(id: string): Promise<Course | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/courses/${id}`);
    
    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error(`API error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Error fetching course with ID ${id}:`, error);
    return null;
  }
} 