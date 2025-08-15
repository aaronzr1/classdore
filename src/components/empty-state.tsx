"use client"

import { BookOpen } from "lucide-react"

export function EmptyState() {
    return (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <BookOpen className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="font-sans text-lg font-semibold text-gray-900 mb-2">No courses found</h3>
            <p className="font-serif text-gray-600">Try adjusting your search criteria or filters.</p>
        </div>
    )
}
