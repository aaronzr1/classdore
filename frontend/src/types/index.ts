export interface Course {
    id: string;
    title: string;
    description: string;
    department: string;
    level: 'undergrad' | 'grad';
  }
  
  export interface SearchFilters {
    department?: string;
    level?: 'undergrad' | 'grad';
  }
  
  export interface SearchResponse {
    courses: Course[];
  }