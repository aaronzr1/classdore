import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function sanitizeQuery(query: string): string {
    query = query.replaceAll("-", " "); // disable dash syntax
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