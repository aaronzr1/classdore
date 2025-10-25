"use client"

import { forwardRef, useState } from "react"
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
    broadSearch: boolean
    setBroadSearch: (value: boolean) => void
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
            broadSearch,
            setBroadSearch,
        },
        ref
    ) => {
        const [deptSearch, setDeptSearch] = useState("")
        const [schoolSearch, setSchoolSearch] = useState("")
        const [showBroadSearchTooltip, setShowBroadSearchTooltip] = useState(false)

        const filteredDepartments = departments.filter((dept) =>
            dept.toLowerCase().includes(deptSearch.toLowerCase())
        )

        const filteredSchools = schools.filter((school) =>
            school.toLowerCase().includes(schoolSearch.toLowerCase())
        )

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
                                placeholder='Search topics, instructors, anything (try "ECON 3" or "travel classes")'
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
                                <SelectContent className="max-h-[300px]">
                                    <div className="sticky top-0 bg-white p-2 border-b">
                                        <div className="relative">
                                            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                                            <Input
                                                placeholder="Search departments..."
                                                value={deptSearch}
                                                onChange={(e) => setDeptSearch(e.target.value)}
                                                className="h-8 text-sm pl-8"
                                                onClick={(e) => e.stopPropagation()}
                                                onKeyDown={(e) => e.stopPropagation()}
                                            />
                                        </div>
                                    </div>
                                    <div className="max-h-[240px] overflow-y-auto">
                                        <SelectItem value="all">All Dept</SelectItem>
                                        {filteredDepartments.map((dept) => (
                                            <SelectItem key={dept} value={dept}>
                                                {dept}
                                            </SelectItem>
                                        ))}
                                        {filteredDepartments.length === 0 && (
                                            <div className="py-6 text-center text-sm text-gray-500">
                                                No departments found
                                            </div>
                                        )}
                                    </div>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex-shrink-0" style={{ width: 'min(20%, 140px)', minWidth: '50px' }}>
                            <Select value={selectedSchool} onValueChange={setSelectedSchool}>
                                <SelectTrigger className="w-full font-serif">
                                    <SelectValue placeholder="School" />
                                </SelectTrigger>
                                <SelectContent className="max-h-[300px]">
                                    <div className="sticky top-0 bg-white p-2 border-b">
                                        <div className="relative">
                                            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                                            <Input
                                                placeholder="Search schools..."
                                                value={schoolSearch}
                                                onChange={(e) => setSchoolSearch(e.target.value)}
                                                className="h-8 text-sm pl-8"
                                                onClick={(e) => e.stopPropagation()}
                                                onKeyDown={(e) => e.stopPropagation()}
                                            />
                                        </div>
                                    </div>
                                    <div className="max-h-[240px] overflow-y-auto">
                                        <SelectItem value="all">All Schools</SelectItem>
                                        {filteredSchools.map((school) => (
                                            <SelectItem key={school} value={school}>
                                                {school}
                                            </SelectItem>
                                        ))}
                                        {filteredSchools.length === 0 && (
                                            <div className="py-6 text-center text-sm text-gray-500">
                                                No schools found
                                            </div>
                                        )}
                                    </div>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between gap-4 flex-wrap">
                        <p className="font-serif text-gray-600 text-sm">
                            Showing {filteredCount} of {totalCount} courses
                        </p>
                        <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer hover:text-gray-900 transition-colors">
                            <input
                                type="checkbox"
                                checked={broadSearch}
                                onChange={(e) => setBroadSearch(e.target.checked)}
                                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                            />
                            <span
                                className="font-serif relative inline-block border-b border-dotted border-gray-400 hover:border-gray-700 transition-colors"
                                onMouseEnter={() => setShowBroadSearchTooltip(true)}
                                onMouseLeave={() => setShowBroadSearchTooltip(false)}
                            >
                                Broad search
                                {showBroadSearchTooltip && (
                                    <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded shadow-lg w-50 z-10 pointer-events-none">
                                        Searching &quot;econ 3&quot; surfaces &quot;ECON 3XXX&quot; courses by default. Broad search disables this specialized search.
                                        <span className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900"></span>
                                    </span>
                                )}
                            </span>
                        </label>
                    </div>
                </div>
            </div>
        )
    }
)

CourseSearch.displayName = "CourseSearch"
