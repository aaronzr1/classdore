"use client"

import type React from "react"

import { forwardRef, useEffect, useRef, useState } from "react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Filter, Sparkles, Zap, Globe } from "lucide-react"

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
    const hasTyped = useRef(false)
    const [deptSearch, setDeptSearch] = useState("")
    const [schoolSearch, setSchoolSearch] = useState("")

    const filteredDepartments = departments.filter((dept) =>
      dept.toLowerCase().includes(deptSearch.toLowerCase())
    )

    const filteredSchools = schools.filter((school) =>
      school.toLowerCase().includes(schoolSearch.toLowerCase())
    )

    // Trigger search after user types 2+ characters (with small delay to let them continue typing)
    useEffect(() => {
      if (searchTerm.length >= 2 && !hasTyped.current) {
        const timer = setTimeout(() => {
          hasTyped.current = true
          onSearch()
        }, 400) // Small delay to let user continue typing naturally
        return () => clearTimeout(timer)
      }
    }, [searchTerm, onSearch])

    return (
      <div ref={ref} className="min-h-screen flex flex-col items-center justify-center px-4 py-8 animate-in fade-in duration-700">
        <div className="w-full max-w-3xl flex flex-col items-center space-y-8">
          {/* Logo */}
          <div className="text-center animate-in slide-in-from-top duration-500">
            <h1 className="font-sans text-8xl font-bold bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent mb-3 tracking-tight">
              Classdore
            </h1>
            <p className="text-sm text-gray-500 tracking-wide">Fast, relevant class search</p>
          </div>

          {/* Search Section */}
          <div className="w-full space-y-4 animate-in slide-in-from-bottom duration-500 delay-100">
            {/* Main Search Bar */}
            <div className="w-full group">
              <div className="relative w-full">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 transition-colors group-hover:text-blue-500" />
                <Input
                  placeholder='Search for courses, instructors, topics...'
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full h-12 pl-12 pr-4 text-base border-gray-300 rounded-full shadow-sm hover:shadow-md focus:shadow-lg transition-all duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  autoFocus
                />
              </div>
            </div>

            {/* Filters - Subtle and Clean */}
            <div className="flex gap-3 justify-center flex-wrap">
              <div className="min-w-[140px]">
                <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                  <SelectTrigger className="h-10 border-gray-200 rounded-full hover:border-gray-300 transition-colors">
                    <div className="flex items-center gap-2 text-sm">
                      <Filter className="h-3.5 w-3.5 text-gray-400" />
                      <SelectValue placeholder="Department" />
                    </div>
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
                      <SelectItem value="all">All Departments</SelectItem>
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
              <div className="min-w-[140px]">
                <Select value={selectedSchool} onValueChange={setSelectedSchool}>
                  <SelectTrigger className="h-10 border-gray-200 rounded-full hover:border-gray-300 transition-colors">
                    <div className="flex items-center text-sm">
                      <SelectValue placeholder="School" />
                    </div>
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
          </div>

          {/* Welcome Section */}
          <div className="w-full max-w-2xl animate-in fade-in duration-700 delay-200">
            <div className="bg-gradient-to-br from-blue-50 to-white rounded-2xl p-8 border border-blue-100 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-blue-500" />
                Welcome to Classdore!
              </h2>
              <p className="text-sm text-gray-600 mb-6 leading-relaxed">
                A days-long project to fix class search. Here are a few pointers before you search:
              </p>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                    <Zap className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 mb-1">Lightning-fast semantic search</h3>
                    <p className="text-xs text-gray-600">
                      Type naturally—search by course code, topic, instructor name, or even describe what you're looking for
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                    <Filter className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 mb-1">Smart filters at your fingertips</h3>
                    <p className="text-xs text-gray-600">
                      Narrow down results by department or school with searchable dropdowns
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                    <Globe className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 mb-1">Click any row for details</h3>
                    <p className="text-xs text-gray-600">
                      View full course information, meeting times, enrollment, and add courses to your schedule
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Subtle hint */}
          <p className="text-xs text-gray-400 animate-in fade-in duration-700 delay-300">
            Start typing to search instantly
          </p>
        </div>
      </div>
    )
  },
)

HomePage.displayName = "HomePage"
