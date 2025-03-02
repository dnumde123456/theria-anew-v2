"use client"

import { useEffect, useRef } from "react"
import * as THREE from "three"
import { useSimulation } from "@/lib/simulation-context"
import type { Civilization, City } from "@/lib/types"

export default function TradeRoutes() {
  const { world, civilizations, selectedEntity } = useSimulation()
  const tradeRoutesRef = useRef<THREE.Line[]>([])

  useEffect(() => {
    if (!world) return

    // Get the scene from the parent component
    const scene = document.querySelector("canvas")?.object3D as THREE.Scene
    if (!scene) return

    // Clear previous trade routes
    tradeRoutesRef.current.forEach((line) => {
      scene.remove(line)
    })
    tradeRoutesRef.current = []

    // Generate trade routes
    const tradeRoutes = generateTradeRoutes(civilizations, selectedEntity)

    // Add trade routes to scene
    tradeRoutes.forEach((route) => {
      scene.add(route)
      tradeRoutesRef.current.push(route)
    })

    return () => {
      tradeRoutesRef.current.forEach((line) => {
        scene.remove(line)
      })
    }
  }, [world, civilizations, selectedEntity])

  return null
}

// Generate trade routes between cities
function generateTradeRoutes(civilizations: Civilization[], selectedEntity: string | null): THREE.Line[] {
  const routes: THREE.Line[] = []

  // If a civilization is selected, show its trade routes
  if (selectedEntity) {
    const selectedCiv = civilizations.find((civ) => civ.id === selectedEntity)
    if (!selectedCiv) return routes

    // Connect all cities within the civilization
    const cities = selectedCiv.cities

    // Create internal trade routes
    for (let i = 0; i < cities.length; i++) {
      for (let j = i + 1; j < cities.length; j++) {
        const cityA = cities[i]
        const cityB = cities[j]

        // Create a curved line between cities
        const route = createTradeRoute(cityA, cityB, selectedCiv.color, 0.8)
        routes.push(route)
      }
    }

    // Create external trade routes with allies
    const allies = civilizations.filter(
      (civ) =>
        civ.id !== selectedEntity &&
        civ.relations.some((rel) => rel.civilizationId === selectedEntity && rel.status === "ally"),
    )

    allies.forEach((ally) => {
      // Connect capital cities
      const selectedCapital = selectedCiv.cities.find((city) => city.isCapital)
      const allyCapital = ally.cities.find((city) => city.isCapital)

      if (selectedCapital && allyCapital) {
        const route = createTradeRoute(selectedCapital, allyCapital, "#ffffff", 0.4)
        routes.push(route)
      }
    })
  } else {
    // Show major trade routes between all civilizations
    for (let i = 0; i < civilizations.length; i++) {
      for (let j = i + 1; j < civilizations.length; j++) {
        const civA = civilizations[i]
        const civB = civilizations[j]

        // Check if they are allies
        const areAllies = civA.relations.some((rel) => rel.civilizationId === civB.id && rel.status === "ally")

        if (areAllies) {
          // Connect capital cities
          const capitalA = civA.cities.find((city) => city.isCapital)
          const capitalB = civB.cities.find((city) => city.isCapital)

          if (capitalA && capitalB) {
            const route = createTradeRoute(capitalA, capitalB, "#ffffff", 0.3)
            routes.push(route)
          }
        }
      }
    }
  }

  return routes
}

// Create a curved trade route between two cities
function createTradeRoute(cityA: City, cityB: City, color: string, opacity: number): THREE.Line {
  // Create a curved path between cities
  const points = []
  const segments = 20

  const startPoint = new THREE.Vector3(cityA.position.x, cityA.position.y, cityA.position.z)
  const endPoint = new THREE.Vector3(cityB.position.x, cityB.position.y, cityB.position.z)

  // Calculate midpoint and add height for curve
  const midPoint = new THREE.Vector3().addVectors(startPoint, endPoint).multiplyScalar(0.5)
  const distance = startPoint.distanceTo(endPoint)
  midPoint.y += distance * 0.2 // Curve height based on distance

  // Create quadratic curve
  for (let i = 0; i <= segments; i++) {
    const t = i / segments

    // Quadratic bezier curve
    const point = new THREE.Vector3()
    point.x = (1 - t) * (1 - t) * startPoint.x + 2 * (1 - t) * t * midPoint.x + t * t * endPoint.x
    point.y = (1 - t) * (1 - t) * startPoint.y + 2 * (1 - t) * t * midPoint.y + t * t * endPoint.y
    point.z = (1 - t) * (1 - t) * startPoint.z + 2 * (1 - t) * t * midPoint.z + t * t * endPoint.z

    points.push(point)
  }

  // Create geometry
  const geometry = new THREE.BufferGeometry().setFromPoints(points)

  // Create material
  const material = new THREE.LineBasicMaterial({
    color: new THREE.Color(color),
    transparent: true,
    opacity: opacity,
    linewidth: 1,
  })

  // Create line
  return new THREE.Line(geometry, material)
}

