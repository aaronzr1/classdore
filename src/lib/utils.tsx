import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { toast } from "sonner"
import { X } from "lucide-react"
import { parseCourseId, getAddCourseUrl } from "./course-utils"

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
    query = query.replaceAll(/[–—…«»'']/g, " "); // misc
    query = query.replaceAll(/[""]/g, '"'); // smart quotes

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

/**
 * Shows a success toast notification for course added to cart
 * with a dismiss button and link to view cart
 */
export function showAddToCartToast() {
    const toastId = toast.success(
        <div className="relative min-w-[225px] max-w-fit">
            <button
                onClick={(e) => {
                    e.stopPropagation()
                    toast.dismiss(toastId)
                }}
                className="absolute top-0 right-0 text-gray-400 hover:text-gray-600 transition-colors p-0.5 rounded-sm hover:bg-gray-100"
                aria-label="Dismiss"
            >
                <X className="w-3 h-3" />
            </button>
            <div className="flex flex-col gap-1 pr-5">
                <div className="font-semibold">Course added to cart!</div>
                <a
                    href="https://more.app.vanderbilt.edu/more/SearchClasses.action"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline text-sm"
                    onClick={(e) => e.stopPropagation()}
                >
                    View your cart in YES →
                </a>
            </div>
        </div>,
        {
            duration: 3000,
            className: '!w-auto !max-w-fit justify-center',
        }
    )
}

/**
 * Handles adding a course to the cart
 * - Validates the course ID
 * - Opens the add course URL in a new window
 * - Redirects the new window to the cart page after a brief delay
 * - Shows a success toast notification
 *
 * @param courseId The course ID to add
 * @returns true if the course was added successfully, false otherwise
 */
export function handleAddCourse(courseId: string): boolean {
    const classInfo = parseCourseId(courseId)

    if (!classInfo) {
        toast.error("Unable to add course - invalid course ID")
        return false
    }

    const addCourseUrl = getAddCourseUrl(courseId)

    // Open the add URL in a new window to process the request (handles 302 redirect)
    const addWindow = window.open(addCourseUrl, '_blank')

    // After a brief delay to let the request process, redirect to the cart page
    setTimeout(() => {
        if (addWindow && !addWindow.closed) {
            addWindow.location.href = 'https://more.app.vanderbilt.edu/more/SearchClasses.action'
        }

        // Show success toast with link to cart
        showAddToCartToast()
    }, 500)

    return true
}