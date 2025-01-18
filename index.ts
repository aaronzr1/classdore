export interface Course {

    class_number: string;
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

  }
  
  export interface SearchFilters {
    course_dept?: string;
    course_code?: string;
    course_title: string;
    school?: string;
    career?: string;
    class_type?: string;
    credit_hours?: string;
    grading_basis?: string;
    term_year?: number;
    term_season?: string;
    requirements?: string;
    status?: string;
    meeting_days?: string[];
    meeting_times?: string[];
    meeting_dates?: string[];
    instructors?: string[];
    keywords?: string[];
  }
  
  export interface SearchResponse {
    courses: Course[];
    total_results: number;
  }