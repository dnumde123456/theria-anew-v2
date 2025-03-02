import * as THREE from "three"
import type { World, Season } from "@/lib/types"

// Generate terrain mesh from world data
export function generateTerrain(world: World, season: Season) {
  // Create geometry with more vertices for smoother terrain
  const geometry = new THREE.PlaneGeometry(world.width, world.height, world.width - 1, world.height - 1)

  // Rotate to horizontal plane
  geometry.rotateX(-Math.PI / 2)

  // Get position attribute
  const position = geometry.attributes.position

  // Create colors array
  const colors = []
  const color = new THREE.Color()

  // Create heightmap with smooth transitions
  for (let i = 0; i < position.count; i++) {
    const x = Math.floor(i % world.width)
    const y = Math.floor(i / world.width)

    if (x < world.width && y < world.height) {
      const tile = world.tiles[y][x]

      // Apply height with smooth interpolation
      const height = tile.elevation * 10
      position.setY(i, height)

      // Set color based on terrain type and season with smooth transitions
      if (tile.terrainType === "water") {
        color.setHSL(0.6, 0.7, 0.3) // Deep blue
      } else if (tile.terrainType === "plains") {
        if (season === "winter" && tile.biome !== "tropical") {
          color.setHSL(0.0, 0.0, 0.9) // Snow white
        } else if (season === "autumn" && tile.biome !== "tropical") {
          color.setHSL(0.08, 0.8, 0.4) // Autumn orange
        } else {
          color.setHSL(0.3, 0.6, 0.4) // Green
        }
      } else if (tile.terrainType === "forest") {
        if (season === "winter" && tile.biome !== "tropical") {
          color.setHSL(0.0, 0.0, 0.6) // Dark snow
        } else if (season === "autumn" && tile.biome !== "tropical") {
          color.setHSL(0.08, 0.7, 0.3) // Dark autumn
        } else {
          color.setHSL(0.3, 0.8, 0.2) // Dark green
        }
      } else if (tile.terrainType === "mountains") {
        if (season === "winter") {
          color.setHSL(0.0, 0.0, 0.95) // Bright snow
        } else {
          color.setHSL(0.0, 0.0, 0.5) // Gray
        }
      } else if (tile.terrainType === "desert") {
        color.setHSL(0.1, 0.6, 0.7) // Sand
      }

      // Add color to array
      colors.push(color.r, color.g, color.b)
    }
  }

  // Add colors to geometry
  geometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3))

  // Create material with smooth shading
  const material = new THREE.MeshStandardMaterial({
    vertexColors: true,
    flatShading: false,
    roughness: 0.8,
    metalness: 0.2,
  })

  // Create mesh
  const mesh = new THREE.Mesh(geometry, material)
  mesh.receiveShadow = true
  mesh.castShadow = true

  // Create water plane
  const waterGeometry = new THREE.PlaneGeometry(world.width, world.height, 32, 32)
  waterGeometry.rotateX(-Math.PI / 2)

  // Add waves to water
  const waterVertices = waterGeometry.attributes.position.array
  for (let i = 0; i < waterVertices.length; i += 3) {
    const x = waterVertices[i]
    const z = waterVertices[i + 2]
    waterVertices[i + 1] = Math.sin(x * 0.05) * 0.2 + Math.cos(z * 0.05) * 0.2
  }

  const waterMaterial = new THREE.MeshStandardMaterial({
    color: new THREE.Color(0x1e40af),
    transparent: true,
    opacity: 0.8,
    metalness: 0.1,
    roughness: 0.3,
  })

  const waterMesh = new THREE.Mesh(waterGeometry, waterMaterial)
  waterMesh.position.y = 0.3
  waterMesh.receiveShadow = true

  return { mesh, waterMesh }
}

