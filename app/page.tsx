"use client"

import { useEffect, useState } from "react"
import WorldMap from "@/components/world-map"
import Timeline from "@/components/timeline"
import ControlPanel from "@/components/control-panel"
import InfoPanel from "@/components/info-panel"
import TradeRoutes from "@/components/trade-routes"
import MapLegend from "@/components/map-legend"
import { SimulationProvider } from "@/lib/simulation-context"

export default function Home() {
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate loading time
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 2000)

    return () => clearTimeout(timer)
  }, [])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-4">World Simulation</h1>
          <div className="w-64 h-2 bg-gray-700 rounded-full overflow-hidden">
            <div className="h-full bg-primary animate-pulse rounded-full"></div>
          </div>
          <p className="text-gray-400 mt-4">Generating world...</p>
        </div>
      </div>
    )
  }

  return (
    <SimulationProvider>
      <div className="flex flex-col h-screen bg-black text-white overflow-hidden">
        <header className="p-4 border-b border-gray-800">
          <h1 className="text-2xl font-bold">World Simulation</h1>
        </header>

        <main className="flex flex-1 overflow-hidden">
          <div className="flex-1 relative">
            <WorldMap />
            <TradeRoutes />
            <ControlPanel />
            <MapLegend />
          </div>
          <InfoPanel />
        </main>

        <footer className="border-t border-gray-800">
          <Timeline />
        </footer>
      </div>
    </SimulationProvider>
  )
}

