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

    // Trigger search immediately on first keystroke
    useEffect(() => {
      if (searchTerm.length > 0 && !hasTyped.current) {
        hasTyped.current = true
        onSearch()
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
            <p className="text-sm text-gray-500 tracking-wide">Fast, relevant class search. Course listings updated daily.</p>
          </div>

          {/* Search Section */}
          <div className="w-full space-y-4 animate-in slide-in-from-bottom duration-500 delay-100">
            {/* Main Search Bar */}
            <div className="w-full group">
              <div className="relative w-full">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 transition-colors group-hover:text-blue-500" />
                <Input
                  type="search"
                  placeholder='Search topics, instructors, anything (try &quot;ECON 3&quot; or &quot;travel class&quot;)'
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full h-12 pl-12 pr-4 text-base border-gray-300 rounded-full shadow-sm hover:shadow-md focus:shadow-lg transition-all duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  autoFocus
                  autoComplete="off"
                  data-form-type="other"
                  data-lpignore="true"
                  data-1p-ignore
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
                          autoComplete="off"
                          data-form-type="other"
                          data-lpignore="true"
                          data-1p-ignore
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
                          autoComplete="off"
                          data-form-type="other"
                          data-lpignore="true"
                          data-1p-ignore
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
              <h2 className="text-base font-semibold text-gray-900 mb-4">
                Welcome to Classdore!
              </h2>
              <p className="text-sm text-gray-700 mb-5 leading-relaxed">
                What you see here is an <em className="font-medium">ongoing effort</em> to make finding classes easier. It's still a work in progress, but a few tips to get started:
              </p>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <span className="text-blue-500 font-bold text-lg leading-none mt-0.5">•</span>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    As of now, the primary focus is <b>class search</b>, not registration. That means stuff like the "class availability" field will be updated reasonably, but not necessarily instantly.
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-blue-500 font-bold text-lg leading-none mt-0.5">•</span>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    While this website exists separate from YES, it can link to YES. Clicking "+" or "Add to cart" will save listings and open your cart in a new tab. Note this requires for you to have logged into YES somewhat recently.
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-blue-500 font-bold text-lg leading-none mt-0.5">•</span>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    Bugs and missing features will probably spring up. Feel free to shoot an email at <span className="text-blue-600">[tbd]</span>. Typing anything in the search bar will bring you to the main page. Happy searching! :)
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Subtle hint */}
          {/* <p className="text-xs text-gray-400 animate-in fade-in duration-700 delay-300">
            Start typing to search instantly
          </p> */}
        </div>
      </div>
    )
  },
)

HomePage.displayName = "HomePage"
