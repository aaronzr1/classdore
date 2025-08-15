"use client"

import { forwardRef } from "react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Filter } from "lucide-react"

interface CourseSearchProps {
    searchTerm: string
    setSearchTerm: (term: string) => void
    selectedDepartment: string
    setSelectedDepartment: (dept: string) => void
    selectedLevel: string
    setSelectedLevel: (level: string) => void
    departments: string[]
    filteredCount: number
    totalCount: number
    isSearchSticky: boolean
}

export const CourseSearch = forwardRef<HTMLDivElement, CourseSearchProps>(
    (
        {
            searchTerm,
            setSearchTerm,
            selectedDepartment,
            setSelectedDepartment,
            selectedLevel,
            setSelectedLevel,
            departments,
            filteredCount,
            totalCount,
            isSearchSticky,
        },
        ref
    ) => {
        return (
            <div
                ref={ref}
                className={`bg-white rounded-lg border border-gray-200 p-4 mb-4 transition-all duration-200 ${
                    isSearchSticky ? "fixed top-0 left-0 right-0 z-50 rounded-none border-b" : ""
                }`}
            >
                <div className={`${isSearchSticky ? "container mx-auto px-4" : ""}`}>
                    <div className="flex flex-col lg:flex-row gap-3 items-center">
                        {isSearchSticky && (
                            <div className="flex-shrink-0">
                                <h2 className="font-sans text-xl font-bold text-blue-600">Classdore</h2>
                            </div>
                        )}
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                            <Input
                                placeholder="Search courses, instructors, or course codes..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 font-serif"
                            />
                        </div>
                        <div className="flex gap-3">
                            <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                                <SelectTrigger className="w-48 font-serif">
                                    <Filter className="mr-2 h-4 w-4" />
                                    <SelectValue placeholder="Department" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Departments</SelectItem>
                                    {departments.map((dept) => (
                                        <SelectItem key={dept} value={dept}>
                                            {dept}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Select value={selectedLevel} onValueChange={setSelectedLevel}>
                                <SelectTrigger className="w-40 font-serif">
                                    <SelectValue placeholder="Level" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Levels</SelectItem>
                                    <SelectItem value="Undergraduate">Undergraduate</SelectItem>
                                    <SelectItem value="Graduate">Graduate</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <div className="mt-3 pt-3 border-t border-gray-100">
                        <p className="font-serif text-gray-600 text-sm">
                            Showing {filteredCount} of {totalCount} courses
                        </p>
                    </div>
                </div>
            </div>
        )
    }
)

CourseSearch.displayName = "CourseSearch"
