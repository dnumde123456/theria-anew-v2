"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useSimulation } from "@/lib/simulation-context"
import {
  Building2,
  Users,
  Swords,
  BookOpen,
  Landmark,
  GraduationCap,
  Crown,
  Coins,
  Wheat,
  Mountain,
  ChevronRight,
  ChevronLeft,
} from "lucide-react"

export default function InfoPanel() {
  const { selectedEntity, civilizations, resources, getHistoricalEvents } = useSimulation()
  const [isPanelOpen, setIsPanelOpen] = useState(true)

  const selectedCivilization = civilizations.find((civ) => civ.id === selectedEntity)

  if (!isPanelOpen) {
    return (
      <button
        onClick={() => setIsPanelOpen(true)}
        className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-gray-800 p-2 rounded-l-md"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>
    )
  }

  return (
    <div className="w-80 border-l border-gray-800 bg-gray-900 overflow-y-auto relative">
      <button onClick={() => setIsPanelOpen(false)} className="absolute right-4 top-4 text-gray-400 hover:text-white">
        <ChevronRight className="h-4 w-4" />
      </button>

      {selectedCivilization ? (
        <div className="p-4">
          <div className="flex items-center space-x-2 mb-4">
            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: selectedCivilization.color }} />
            <h2 className="text-xl font-bold">{selectedCivilization.name}</h2>
          </div>

          <Tabs defaultValue="overview">
            <TabsList className="grid grid-cols-4 mb-4">
              <TabsTrigger value="overview" title="Overview">
                <Building2 className="h-4 w-4" />
              </TabsTrigger>
              <TabsTrigger value="population" title="Population">
                <Users className="h-4 w-4" />
              </TabsTrigger>
              <TabsTrigger value="military" title="Military">
                <Swords className="h-4 w-4" />
              </TabsTrigger>
              <TabsTrigger value="history" title="History">
                <BookOpen className="h-4 w-4" />
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-gray-800 p-3 rounded-md">
                  <div className="flex items-center space-x-2 mb-1">
                    <Crown className="h-4 w-4 text-yellow-400" />
                    <span className="text-xs text-gray-400">Ruler</span>
                  </div>
                  <p className="text-sm font-medium">{selectedCivilization.ruler}</p>
                </div>
                <div className="bg-gray-800 p-3 rounded-md">
                  <div className="flex items-center space-x-2 mb-1">
                    <Landmark className="h-4 w-4 text-blue-400" />
                    <span className="text-xs text-gray-400">Government</span>
                  </div>
                  <p className="text-sm font-medium">{selectedCivilization.government}</p>
                </div>
                <div className="bg-gray-800 p-3 rounded-md">
                  <div className="flex items-center space-x-2 mb-1">
                    <GraduationCap className="h-4 w-4 text-purple-400" />
                    <span className="text-xs text-gray-400">Technology</span>
                  </div>
                  <p className="text-sm font-medium">Level {selectedCivilization.technologyLevel}</p>
                </div>
                <div className="bg-gray-800 p-3 rounded-md">
                  <div className="flex items-center space-x-2 mb-1">
                    <Coins className="h-4 w-4 text-amber-400" />
                    <span className="text-xs text-gray-400">Economy</span>
                  </div>
                  <p className="text-sm font-medium">{selectedCivilization.economyStrength}/10</p>
                </div>
              </div>

              <div className="bg-gray-800 p-3 rounded-md">
                <h3 className="text-sm font-medium mb-2">Resources</h3>
                <div className="grid grid-cols-3 gap-2">
                  {selectedCivilization.resources.map((resourceId) => {
                    const resource = resources.find((r) => r.id === resourceId)
                    if (!resource) return null

                    return (
                      <div key={resourceId} className="flex items-center space-x-1">
                        {resource.type === "food" ? (
                          <Wheat className="h-3 w-3 text-green-400" />
                        ) : (
                          <Mountain className="h-3 w-3 text-gray-400" />
                        )}
                        <span className="text-xs">{resource.name}</span>
                      </div>
                    )
                  })}
                </div>
              </div>

              <div className="bg-gray-800 p-3 rounded-md">
                <h3 className="text-sm font-medium mb-2">Relations</h3>
                <div className="space-y-2">
                  {selectedCivilization.relations.map((relation) => {
                    const otherCiv = civilizations.find((c) => c.id === relation.civilizationId)
                    if (!otherCiv) return null

                    return (
                      <div key={relation.civilizationId} className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: otherCiv.color }} />
                          <span className="text-xs">{otherCiv.name}</span>
                        </div>
                        <span
                          className={`text-xs ${
                            relation.status === "ally"
                              ? "text-green-400"
                              : relation.status === "enemy"
                                ? "text-red-400"
                                : "text-gray-400"
                          }`}
                        >
                          {relation.status.charAt(0).toUpperCase() + relation.status.slice(1)}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="population" className="space-y-4">
              <div className="bg-gray-800 p-3 rounded-md">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Total Population</span>
                  <span className="text-sm">{selectedCivilization.population.toLocaleString()}</span>
                </div>
                <div className="w-full bg-gray-700 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-blue-500 h-full rounded-full"
                    style={{ width: `${Math.min(selectedCivilization.population / 10000, 100)}%` }}
                  />
                </div>
              </div>

              <div className="bg-gray-800 p-3 rounded-md">
                <h3 className="text-sm font-medium mb-2">Demographics</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400">Growth Rate</span>
                    <span className="text-xs">
                      {selectedCivilization.populationGrowth > 0 ? "+" : ""}
                      {selectedCivilization.populationGrowth}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400">Happiness</span>
                    <span className="text-xs">{selectedCivilization.happiness}/10</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400">Health</span>
                    <span className="text-xs">{selectedCivilization.health}/10</span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-800 p-3 rounded-md">
                <h3 className="text-sm font-medium mb-2">Cities</h3>
                <div className="space-y-2">
                  {selectedCivilization.cities.map((city) => (
                    <div key={city.id} className="flex items-center justify-between">
                      <span className="text-xs">{city.name}</span>
                      <span className="text-xs text-gray-400">{city.population.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="military" className="space-y-4">
              <div className="bg-gray-800 p-3 rounded-md">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Military Strength</span>
                  <span className="text-sm">{selectedCivilization.militaryStrength}/10</span>
                </div>
                <div className="w-full bg-gray-700 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-red-500 h-full rounded-full"
                    style={{ width: `${selectedCivilization.militaryStrength * 10}%` }}
                  />
                </div>
              </div>

              <div className="bg-gray-800 p-3 rounded-md">
                <h3 className="text-sm font-medium mb-2">Army Units</h3>
                <div className="space-y-2">
                  {selectedCivilization.army.map((unit) => (
                    <div key={unit.type} className="flex items-center justify-between">
                      <span className="text-xs">{unit.name}</span>
                      <span className="text-xs text-gray-400">{unit.count}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-gray-800 p-3 rounded-md">
                <h3 className="text-sm font-medium mb-2">Current Wars</h3>
                {selectedCivilization.wars.length > 0 ? (
                  <div className="space-y-2">
                    {selectedCivilization.wars.map((war) => {
                      const enemy = civilizations.find((c) => c.id === war.enemyId)
                      if (!enemy) return null

                      return (
                        <div key={war.id} className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: enemy.color }} />
                            <span className="text-xs">vs {enemy.name}</span>
                          </div>
                          <span className="text-xs text-gray-400">Year {war.startYear}</span>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <p className="text-xs text-gray-400">No active conflicts</p>
                )}
              </div>
            </TabsContent>

            <TabsContent value="history" className="space-y-4">
              <div className="bg-gray-800 p-3 rounded-md">
                <h3 className="text-sm font-medium mb-2">Timeline</h3>
                <div className="space-y-3">
                  {getHistoricalEvents(selectedCivilization.id).map((event) => (
                    <div key={event.id} className="border-l-2 border-gray-700 pl-3 py-1">
                      <div className="text-xs text-gray-400">Year {event.year}</div>
                      <div className="text-sm">{event.description}</div>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-full p-6 text-center">
          <Building2 className="h-12 w-12 text-gray-600 mb-4" />
          <h3 className="text-lg font-medium text-gray-400 mb-2">No Civilization Selected</h3>
          <p className="text-sm text-gray-500">Click on a civilization on the map to view detailed information</p>
        </div>
      )}
    </div>
  )
}

