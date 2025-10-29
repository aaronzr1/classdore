"use client"

import type React from "react"

import { forwardRef } from "react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Filter } from "lucide-react"

interface HomePageProps {
  searchTerm: string
  setSearchTerm: (term: string) => void
  selectedDepartment: string
  setSelectedDepartment: (dept: string) => void
  selectedSchool: string
  setSelectedSchool: (school: string) => void
  departments: string[]
  schools: string[]
  onSearch: () => void
}

export const HomePage = forwardRef<HTMLDivElement, HomePageProps>(
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
      onSearch,
    },
    ref,
  ) => {
    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && searchTerm.trim()) {
        onSearch()
      }
    }

    return (
      <div ref={ref} className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-3xl flex flex-col items-center">
          {/* Logo */}
          <div className="text-center mb-8">
            <h1 className="font-sans text-7xl font-bold text-blue-600 mb-2">Classdore</h1>
            <p className="font-serif text-lg text-gray-600">Fast, relevant class search</p>
          </div>

          {/* Search Bar */}
          <div className="w-full bg-white rounded-lg border border-gray-200 p-6 mb-16 shadow-sm">
            <div className="flex flex-row gap-3 items-center w-full">
              <div className="flex-1 min-w-[120px] relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder='Search topics, instructors, anything (try "ECON 3" or "travel classes")'
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="pl-10 font-serif w-full"
                  autoFocus
                />
              </div>
              <div className="flex-shrink-0" style={{ width: "min(25%, 160px)", minWidth: "80px" }}>
                <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                  <SelectTrigger className="w-full font-serif">
                    <Filter className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="Department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Dept</SelectItem>
                    {departments.map((dept) => (
                      <SelectItem key={dept} value={dept}>
                        {dept}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-shrink-0" style={{ width: "min(25%, 160px)", minWidth: "70px" }}>
                <Select value={selectedSchool} onValueChange={setSelectedSchool}>
                  <SelectTrigger className="w-full font-serif">
                    <SelectValue placeholder="School" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Schools</SelectItem>
                    {schools.map((school) => (
                      <SelectItem key={school} value={school}>
                        {school}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="text-left bg-gray-50 rounded-lg p-6 border border-gray-200 w-full max-w-2xl">
            <h3 className="font-sans text-lg font-semibold text-gray-900 mb-4">How to use Classdore:</h3>
            <ul className="space-y-3 font-serif text-gray-700">
              <li className="flex items-start">
                <span className="text-blue-600 mr-3 font-bold">•</span>
                <span>
                  <strong>Search broadly:</strong> Enter course codes, topics, or instructor names to find relevant
                  courses
                </span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 mr-3 font-bold">•</span>
                <span>
                  <strong>Filter results:</strong> Use department and school filters to narrow down your search
                </span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 mr-3 font-bold">•</span>
                <span>
                  <strong>View details:</strong> Click on any course row to see full course information and add it to
                  your schedule
                </span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 mr-3 font-bold">•</span>
                <span>
                  <strong>Sort columns:</strong> Click column headers to sort by course code, title, instructor,
                  credits, or enrollment
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    )
  },
)

HomePage.displayName = "HomePage"
