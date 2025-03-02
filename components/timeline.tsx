"use client"

import { useRef, useEffect } from "react"
import { useSimulation } from "@/lib/simulation-context"
import type { HistoricalEvent } from "@/lib/types"

export default function Timeline() {
  const { currentYear, historicalEvents, setSelectedEntity } = useSimulation()
  const timelineRef = useRef<HTMLDivElement>(null)

  // Scroll to current year when it changes
  useEffect(() => {
    if (!timelineRef.current) return

    const currentYearElement = timelineRef.current.querySelector(`[data-year="${currentYear}"]`)
    if (currentYearElement) {
      timelineRef.current.scrollLeft = (currentYearElement as HTMLElement).offsetLeft - 100
    }
  }, [currentYear])

  // Group events by year
  const eventsByYear = historicalEvents.reduce<Record<number, HistoricalEvent[]>>((acc, event) => {
    if (!acc[event.year]) {
      acc[event.year] = []
    }
    acc[event.year].push(event)
    return acc
  }, {})

  // Create year markers
  const years = Object.keys(eventsByYear)
    .map(Number)
    .sort((a, b) => a - b)

  return (
    <div ref={timelineRef} className="overflow-x-auto whitespace-nowrap p-4 border-t border-gray-800 bg-gray-900">
      <div className="relative h-20">
        {/* Timeline line */}
        <div className="absolute top-10 left-0 right-0 h-0.5 bg-gray-700" />

        {/* Year markers and events */}
        {years.map((year) => (
          <div
            key={year}
            data-year={year}
            className={`absolute top-0 h-full flex flex-col items-center`}
            style={{ left: `${(year - years[0]) * 100 + 50}px` }}
          >
            {/* Year marker */}
            <div className={`absolute top-10 w-0.5 h-2 ${year === currentYear ? "bg-primary" : "bg-gray-600"}`} />
            <div
              className={`absolute top-14 text-xs ${year === currentYear ? "text-primary font-medium" : "text-gray-500"}`}
            >
              {year}
            </div>

            {/* Event markers */}
            {eventsByYear[year].map((event, index) => {
              // Alternate between top and bottom to avoid overlap
              const isTop = index % 2 === 0

              return (
                <div
                  key={event.id}
                  className={`absolute ${isTop ? "top-2" : "top-12"} -translate-x-1/2 cursor-pointer group`}
                  onClick={() => event.civilizationId && setSelectedEntity(event.civilizationId)}
                >
                  <div className={`w-2 h-2 rounded-full ${event.civilizationId ? "bg-blue-500" : "bg-red-500"}`} />
                  <div className="hidden group-hover:block absolute z-10 bg-gray-800 p-2 rounded shadow-lg text-xs w-48 whitespace-normal">
                    <div className="font-medium mb-1">{event.description}</div>
                    <div className="text-gray-400">Year {event.year}</div>
                  </div>
                </div>
              )
            })}
          </div>
        ))}

        {/* Current year marker */}
        <div
          className="absolute top-0 h-full flex flex-col items-center pointer-events-none"
          style={{ left: `${(currentYear - years[0]) * 100 + 50}px` }}
        >
          <div className="absolute top-8 w-1 h-4 bg-primary" />
          <div className="absolute top-6 text-xs text-primary font-bold">NOW</div>
        </div>
      </div>
    </div>
  )
}

