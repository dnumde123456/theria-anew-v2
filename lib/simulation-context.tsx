"use client"

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode, useRef } from "react"
import { generateWorld } from "@/lib/world-generator"
import { generateCivilizations } from "@/lib/civilization-generator"
import { generateResources } from "@/lib/resource-generator"
import { simulateYear } from "@/lib/simulation-engine"
import type { World, Civilization, Resource, HistoricalEvent, Season } from "@/lib/types"

interface SimulationContextType {
  world: World | null
  civilizations: Civilization[]
  resources: Resource[]
  historicalEvents: HistoricalEvent[]
  currentYear: number
  currentSeason: Season
  isRunning: boolean
  simulationSpeed: number
  selectedEntity: string | null
  toggleSimulation: () => void
  setSimulationSpeed: (speed: number) => void
  setSelectedEntity: (id: string | null) => void
  advanceTime: (years?: number) => void
  rewindTime: (years?: number) => void
  resetSimulation: () => void
  getHistoricalEvents: (civilizationId: string) => HistoricalEvent[]
}

const SimulationContext = createContext<SimulationContextType | undefined>(undefined)

export function SimulationProvider({ children }: { children: ReactNode }) {
  const [world, setWorld] = useState<World | null>(null)
  const [civilizations, setCivilizations] = useState<Civilization[]>([])
  const [resources, setResources] = useState<Resource[]>([])
  const [historicalEvents, setHistoricalEvents] = useState<HistoricalEvent[]>([])
  const [currentYear, setCurrentYear] = useState(1)
  const [currentSeason, setCurrentSeason] = useState<Season>("spring")
  const [isRunning, setIsRunning] = useState(false)
  const [simulationSpeed, setSimulationSpeed] = useState(1)
  const [selectedEntity, setSelectedEntity] = useState<string | null>(null)
  const simulationIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const isProcessingRef = useRef(false)

  // Initialize simulation
  useEffect(() => {
    resetSimulation()
    return () => {
      if (simulationIntervalRef.current) {
        clearInterval(simulationIntervalRef.current)
      }
    }
  }, [])

  // Reset simulation
  const resetSimulation = useCallback(() => {
    // Stop current simulation
    if (simulationIntervalRef.current) {
      clearInterval(simulationIntervalRef.current)
      simulationIntervalRef.current = null
    }

    setIsRunning(false)
    setCurrentYear(1)
    setCurrentSeason("spring")
    setSelectedEntity(null)

    // Generate new world with larger dimensions
    const newWorld = generateWorld(200, 200) // Increased size
    setWorld(newWorld)

    // Generate resources
    const newResources = generateResources(newWorld)
    setResources(newResources)

    // Generate civilizations
    const newCivilizations = generateCivilizations(newWorld, newResources, 10) // More civilizations
    setCivilizations(newCivilizations)

    // Reset historical events
    setHistoricalEvents([
      {
        id: "event-0",
        year: 1,
        season: "spring",
        description: "The dawn of a new world",
        type: "world",
        civilizationId: null,
      },
    ])
  }, [])

  // Toggle simulation
  const toggleSimulation = useCallback(() => {
    setIsRunning((prev) => !prev)
  }, [])

  // Advance time safely
  const advanceTime = useCallback(
    (years = 1) => {
      if (isProcessingRef.current || !world) return

      isProcessingRef.current = true

      try {
        for (let i = 0; i < years; i++) {
          // Simulate the year
          const { updatedCivilizations, updatedResources, newEvents } = simulateYear(
            currentYear + i + 1,
            civilizations,
            resources,
            world,
          )

          if (i === years - 1) {
            setCivilizations(updatedCivilizations)
            setResources(updatedResources)
            setHistoricalEvents((prev) => [...prev, ...newEvents])
          }
        }

        setCurrentYear((prev) => prev + years)
      } catch (error) {
        console.error("Error advancing time:", error)
      } finally {
        isProcessingRef.current = false
      }
    },
    [civilizations, resources, world, currentYear],
  )

  // Rewind time
  const rewindTime = useCallback((years = 1) => {
    setCurrentYear((prevYear) => Math.max(1, prevYear - years))
  }, [])

  // Run simulation
  useEffect(() => {
    if (isRunning) {
      const interval = setInterval(() => {
        if (isProcessingRef.current) return

        // Cycle through seasons
        setCurrentSeason((prevSeason) => {
          const seasons: Season[] = ["spring", "summer", "autumn", "winter"]
          const currentIndex = seasons.indexOf(prevSeason)
          const nextIndex = (currentIndex + 1) % seasons.length

          // If we've completed a full year cycle, advance the year
          if (nextIndex === 0) {
            advanceTime(1)
          }

          return seasons[nextIndex]
        })
      }, 1000 / simulationSpeed)

      simulationIntervalRef.current = interval
    } else if (simulationIntervalRef.current) {
      clearInterval(simulationIntervalRef.current)
      simulationIntervalRef.current = null
    }

    return () => {
      if (simulationIntervalRef.current) {
        clearInterval(simulationIntervalRef.current)
      }
    }
  }, [isRunning, simulationSpeed, advanceTime])

  // Get historical events for a specific civilization
  const getHistoricalEvents = useCallback(
    (civilizationId: string) => {
      return historicalEvents
        .filter(
          (event) =>
            event.civilizationId === civilizationId ||
            (event.type === "war" && event.involvedCivilizations?.includes(civilizationId)),
        )
        .sort((a, b) => b.year - a.year)
    },
    [historicalEvents],
  )

  return (
    <SimulationContext.Provider
      value={{
        world,
        civilizations,
        resources,
        historicalEvents,
        currentYear,
        currentSeason,
        isRunning,
        simulationSpeed,
        selectedEntity,
        toggleSimulation,
        setSimulationSpeed,
        setSelectedEntity,
        advanceTime,
        rewindTime,
        resetSimulation,
        getHistoricalEvents,
      }}
    >
      {children}
    </SimulationContext.Provider>
  )
}

export function useSimulation() {
  const context = useContext(SimulationContext)
  if (context === undefined) {
    throw new Error("useSimulation must be used within a SimulationProvider")
  }
  return context
}

