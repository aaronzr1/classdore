import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export interface ParsedQuery {
    type: 'course_code_prefix' | 'general';
    dept?: string;
    codePrefix?: string;
    originalQuery: string;
}

export function parseSearchQuery(query: string): ParsedQuery {
    // Match patterns like "econ 3", "cs 1", "math 20" (dept + 1-4 digits)
    const courseCodePattern = /^([a-z]+)\s+(\d{1,4})$/i;
    const match = query.trim().match(courseCodePattern);

    if (match) {
        return {
            type: 'course_code_prefix',
            dept: match[1].toUpperCase(),
            codePrefix: match[2],
            originalQuery: query
        };
    }

    return {
        type: 'general',
        originalQuery: query
    };
}

export function sanitizeQuery(query: string): string {
    query = query.replaceAll("-", " "); // disable dash syntax
    // query = query.replaceAll(/[–—…«»'']/g, " "); // misc
    // query = query.replaceAll(/[""]/g, '"'); // smart quotes
    query = query.replaceAll(/[–—…«»‘’]/g, " "); // misc
    query = query.replaceAll(/[“”]/g, '"'); // smart quotes

    // add prefix match pattern for the last word
    if (query.length >= 2 && /\w{2}/.test(query.slice(-2))) {
        const match = /\w+$/.exec(query);
        if (match) {
            const i = match.index;
            const partial = query.substring(i);
            query = query.substring(0, i) + `(${partial}|${partial}*)`;
        }
    } else if (query.length >= 1 && /\w/.test(query.slice(-1))) { // single char query -> get all entries
        query = query.slice(0, -1);
    }

    return query;
}