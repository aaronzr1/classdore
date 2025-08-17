import { useState, useEffect, useRef } from 'react'

export function useDebounce<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value)
    const isFirstCall = useRef(true)

    useEffect(() => {
        if (isFirstCall.current) {
            // Execute immediately on first call
            setDebouncedValue(value)
            isFirstCall.current = false
            return
        }

        const handler = setTimeout(() => {
            setDebouncedValue(value)
        }, delay)

        return () => {
            clearTimeout(handler)
        }
    }, [value, delay])

    return debouncedValue
}
