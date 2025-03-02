"use client"

import { useState } from "react"
import { Info } from "lucide-react"

export default function MapLegend() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="absolute top-4 right-4 z-10">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-gray-900/80 backdrop-blur-sm rounded-full p-2 text-white hover:bg-gray-800/80 transition-colors"
        title="Map Legend"
      >
        <Info className="h-5 w-5" />
      </button>

      {isOpen && (
        <div className="absolute top-10 right-0 bg-gray-900/90 backdrop-blur-sm rounded-lg p-4 w-64 shadow-lg">
          <h3 className="text-sm font-medium mb-3">Map Legend</h3>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500 rounded-sm"></div>
              <span className="text-xs">Plains</span>
            </div>

            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-700 rounded-sm"></div>
              <span className="text-xs">Forest</span>
            </div>

            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gray-500 rounded-sm"></div>
              <span className="text-xs">Mountains</span>
            </div>

            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-800 rounded-sm"></div>
              <span className="text-xs">Water</span>
            </div>

            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-yellow-500 rounded-sm"></div>
              <span className="text-xs">Desert</span>
            </div>

            <div className="border-t border-gray-700 my-2"></div>

            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-white"></div>
              <span className="text-xs">Capital City</span>
            </div>

            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-sm bg-white"></div>
              <span className="text-xs">City</span>
            </div>

            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-sm bg-white opacity-30"></div>
              <span className="text-xs">Territory</span>
            </div>

            <div className="flex items-center gap-2">
              <div className="w-4 h-1 bg-white"></div>
              <span className="text-xs">Trade Route</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

