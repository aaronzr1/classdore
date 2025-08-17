export interface Course {
    id: string
    course_dept: string
    course_code: string
    class_section: string
    course_title: string
    school: string
    career: string
    class_type: string
    credit_hours: string
    grading_basis: string
    consent: string
    term_year: string
    term_season: string
    session: string
    dates: string
    requirements: string
    description: string | null
    notes: string | null
    status: string
    capacity: string
    enrolled: string
    wl_capacity: string
    wl_occupied: string
    attributes: string[] | null
    meeting_days: string[]
    meeting_times: string[]
    meeting_dates: string[]
    instructors: string[]
}

// export interface Course {
//     id: string;
//     course_dept: string;
//     course_code: string;
//     class_section: string;
//     course_title: string;
//     school: string;
//     career: string;
//     class_type: string;
//     credit_hours: string;
//     grading_basis: string;
//     consent: string;
//     term_year: number;
//     term_season: string;
//     session: string;
//     dates: string; // TODO: do we even need this one
//     requirements: string;
//     description: string | null;
//     notes: string | null;
//     status: string;
//     capacity: number;
//     enrolled: number;
//     wl_capacity: number;
//     wl_occupied: number;
//     attributes: string[] | null;
//     meeting_days: string[];
//     meeting_times: string[];
//     meeting_dates: string[];
//     instructors: string[];
// }

export interface RedisSearchResult {
    total: number;
    documents: Array<any>;
}

export type SortField = "course_code" | "course_title" | "instructors" | "credit_hours" | "enrolled"
export type SortDirection = "asc" | "desc"
