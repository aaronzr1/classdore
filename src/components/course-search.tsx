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
    selectedSchool: string
    setSelectedSchool: (school: string) => void
    departments: string[]
    schools: string[]
    filteredCount: number
    totalCount: number
    isSearchSticky: boolean
    isSearching?: boolean
}

export const CourseSearch = forwardRef<HTMLDivElement, CourseSearchProps>(
    (
        {
            searchTerm,
            setSearchTerm,
            selectedDepartment,
            setSelectedDepartment,
            selectedSchool,
            setSelectedSchool,
            departments,
            schools,
            filteredCount,
            totalCount,
            isSearchSticky,
            isSearching = false,
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
                    <div className="flex flex-col sm:flex-row gap-3 items-center w-full">
                        {isSearchSticky && (
                            <div className="flex-shrink-0">
                                <h2 className="font-sans text-xl font-bold text-blue-600">Classdore</h2>
                            </div>
                        )}
                        <div className="flex-1 min-w-0 relative">
                            <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 ${isSearching ? 'text-blue-500 animate-pulse' : 'text-gray-400'}`} />
                            <Input
                                placeholder="Search courses, instructors, or course codes..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className={`pl-10 font-serif w-full ${isSearching ? 'border-blue-300' : ''}`}
                            />
                        </div>
                        <div className="flex-shrink-0" style={{ width: 'min(20%, 140px)', minWidth: '60px' }}>
                            <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                                <SelectTrigger className="w-full font-serif">
                                    <Filter className="mr-2 h-4 w-4" />
                                    <SelectValue placeholder="Department" />
                                </SelectTrigger>
                                <SelectContent className="max-h-[300px] overflow-y-auto">
                                    <SelectItem value="all">All Dept</SelectItem>
                                    {departments.map((dept) => (
                                        <SelectItem key={dept} value={dept}>
                                            {dept}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex-shrink-0" style={{ width: 'min(20%, 140px)', minWidth: '50px' }}>
                            <Select value={selectedSchool} onValueChange={setSelectedSchool}>
                                <SelectTrigger className="w-full font-serif">
                                    <SelectValue placeholder="School" />
                                </SelectTrigger>
                                <SelectContent className="max-h-[300px] overflow-y-auto">
                                    <SelectItem value="all">All Schools</SelectItem>
                                    {schools.map((school) => (
                                        <SelectItem key={school} value={school}>
                                            {school}
                                        </SelectItem>
                                    ))}
                                    {/* <SelectItem value="Undergraduate">Undergraduate</SelectItem>
                                    <SelectItem value="Graduate">Graduate</SelectItem> */}
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
