"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { useSimulation } from "@/lib/simulation-context"
import {
  Play,
  Pause,
  SkipForward,
  SkipBack,
  RotateCcw,
  Calendar,
  Clock,
  Sun,
  Cloud,
  Snowflake,
  Leaf,
  Eye,
  EyeOff,
  Map,
  Layers,
  Route,
} from "lucide-react"

export default function ControlPanel() {
  const {
    isRunning,
    toggleSimulation,
    simulationSpeed,
    setSimulationSpeed,
    currentYear,
    currentSeason,
    advanceTime,
    rewindTime,
    resetSimulation,
  } = useSimulation()

  const [showControls, setShowControls] = useState(true)
  const [showLayers, setShowLayers] = useState(false)

  // Layer visibility states
  const [showTerrain, setShowTerrain] = useState(true)
  const [showCities, setShowCities] = useState(true)
  const [showTerritories, setShowTerritories] = useState(true)
  const [showTradeRoutes, setShowTradeRoutes] = useState(true)

  const seasonIcons = {
    spring: <Leaf className="h-4 w-4 text-green-400" />,
    summer: <Sun className="h-4 w-4 text-yellow-400" />,
    autumn: <Cloud className="h-4 w-4 text-orange-400" />,
    winter: <Snowflake className="h-4 w-4 text-blue-400" />,
  }

  return (
    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10">
      <div
        className={`bg-gray-900/80 backdrop-blur-sm rounded-lg p-4 transition-all duration-300 ${showControls ? "opacity-100" : "opacity-30"}`}
        onMouseEnter={() => setShowControls(true)}
        onMouseLeave={() => setShowControls(false)}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4 text-gray-400" />
            <span className="text-sm font-medium">Year {currentYear}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Clock className="h-4 w-4 text-gray-400" />
            <span className="text-sm font-medium capitalize flex items-center gap-1">
              {seasonIcons[currentSeason as keyof typeof seasonIcons]}
              {currentSeason}
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-2 mb-4">
          <Button variant="outline" size="icon" onClick={resetSimulation} title="Reset Simulation">
            <RotateCcw className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={() => rewindTime(10)} title="Rewind 10 Years">
            <SkipBack className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={toggleSimulation}
            title={isRunning ? "Pause Simulation" : "Start Simulation"}
          >
            {isRunning ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </Button>
          <Button variant="outline" size="icon" onClick={() => advanceTime(10)} title="Advance 10 Years">
            <SkipForward className="h-4 w-4" />
          </Button>

          <div className="w-32">
            <Slider
              value={[simulationSpeed]}
              min={1}
              max={10}
              step={1}
              onValueChange={(value) => setSimulationSpeed(value[0])}
            />
          </div>
          <span className="text-xs text-gray-400">Speed: {simulationSpeed}x</span>

          <Button variant="outline" size="icon" onClick={() => setShowLayers(!showLayers)} title="Toggle Layers Panel">
            <Layers className="h-4 w-4" />
          </Button>
        </div>

        {showLayers && (
          <div className="grid grid-cols-2 gap-2 mt-2 p-2 bg-gray-800 rounded-md">
            <Button
              variant="ghost"
              size="sm"
              className={`flex items-center justify-start gap-2 ${showTerrain ? "text-primary" : "text-gray-400"}`}
              onClick={() => setShowTerrain(!showTerrain)}
            >
              <Map className="h-4 w-4" />
              <span className="text-xs">Terrain</span>
              {showTerrain ? <Eye className="h-3 w-3 ml-auto" /> : <EyeOff className="h-3 w-3 ml-auto" />}
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className={`flex items-center justify-start gap-2 ${showCities ? "text-primary" : "text-gray-400"}`}
              onClick={() => setShowCities(!showCities)}
            >
              <Layers className="h-4 w-4" />
              <span className="text-xs">Cities</span>
              {showCities ? <Eye className="h-3 w-3 ml-auto" /> : <EyeOff className="h-3 w-3 ml-auto" />}
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className={`flex items-center justify-start gap-2 ${showTerritories ? "text-primary" : "text-gray-400"}`}
              onClick={() => setShowTerritories(!showTerritories)}
            >
              <Map className="h-4 w-4" />
              <span className="text-xs">Territories</span>
              {showTerritories ? <Eye className="h-3 w-3 ml-auto" /> : <EyeOff className="h-3 w-3 ml-auto" />}
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className={`flex items-center justify-start gap-2 ${showTradeRoutes ? "text-primary" : "text-gray-400"}`}
              onClick={() => setShowTradeRoutes(!showTradeRoutes)}
            >
              <Route className="h-4 w-4" />
              <span className="text-xs">Trade Routes</span>
              {showTradeRoutes ? <Eye className="h-3 w-3 ml-auto" /> : <EyeOff className="h-3 w-3 ml-auto" />}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

