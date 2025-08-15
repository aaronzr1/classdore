import { useState, useEffect, useRef, useCallback } from "react"

export function useSticky() {
    const [isSearchSticky, setIsSearchSticky] = useState(false)
    const [isTableHeaderSticky, setIsTableHeaderSticky] = useState(false)
    const searchBarRef = useRef<HTMLDivElement>(null)
    const tableHeaderRef = useRef<HTMLDivElement>(null)
    const [searchBarOriginalTop, setSearchBarOriginalTop] = useState(0)
    const [tableHeaderOriginalTop, setTableHeaderOriginalTop] = useState(0)

    const measurePositions = useCallback(() => {
        if (searchBarRef.current) {
            const rect = searchBarRef.current.getBoundingClientRect()
            setSearchBarOriginalTop(rect.top + window.scrollY)
        }
        if (tableHeaderRef.current) {
            const rect = tableHeaderRef.current.getBoundingClientRect()
            setTableHeaderOriginalTop(rect.top + window.scrollY)
        }
    }, [])

    useEffect(() => {
        // Wait for layout
        requestAnimationFrame(measurePositions)
    }, [measurePositions])

    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY

            let shouldSearchBeSticky = false
            if (searchBarRef.current && searchBarOriginalTop > 0) {
                shouldSearchBeSticky = currentScrollY > searchBarOriginalTop
                setIsSearchSticky(shouldSearchBeSticky)
            }

            if (tableHeaderRef.current && tableHeaderOriginalTop > 0) {
                const searchBarHeight = searchBarRef.current?.offsetHeight || 0
                const offset = shouldSearchBeSticky ? searchBarHeight : 0

                const shouldTableHeaderBeSticky = currentScrollY > tableHeaderOriginalTop - offset
                setIsTableHeaderSticky(shouldTableHeaderBeSticky)
            }
        }

        window.addEventListener("scroll", handleScroll)
        return () => window.removeEventListener("scroll", handleScroll)
    }, [searchBarOriginalTop, tableHeaderOriginalTop])

    return {
        isSearchSticky,
        isTableHeaderSticky,
        searchBarRef,
        tableHeaderRef,
    }
}
