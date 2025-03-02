import type { World, Tile, TerrainType, BiomeType } from "@/lib/types"
import { createNoise2D } from "@/lib/noise"

const CHUNK_SIZE = 50 // Size of each chunk
const CHUNKS_X = 4 // Number of chunks in X direction
const CHUNKS_Z = 4 // Number of chunks in Z direction

// Generate a new world
export function generateWorld(width = CHUNK_SIZE * CHUNKS_X, height = CHUNK_SIZE * CHUNKS_Z): World {
  const seed = Math.floor(Math.random() * 1000000)

  // Create noise functions with different scales for variety
  const elevationNoise = createNoise2D(seed)
  const moistureNoise = createNoise2D(seed + 1)
  const temperatureNoise = createNoise2D(seed + 2)
  const continentNoise = createNoise2D(seed + 3)
  const detailNoise = createNoise2D(seed + 4)

  // Initialize tiles
  const tiles: Tile[][] = []

  // Generate base terrain for all chunks
  for (let y = 0; y < height; y++) {
    tiles[y] = []
    for (let x = 0; x < width; x++) {
      // Calculate chunk coordinates
      const chunkX = Math.floor(x / CHUNK_SIZE)
      const chunkZ = Math.floor(y / CHUNK_SIZE)

      // Calculate local coordinates within chunk
      const localX = x % CHUNK_SIZE
      const localZ = y % CHUNK_SIZE

      // Calculate normalized coordinates for noise
      const nx = x / width - 0.5
      const ny = y / height - 0.5

      // Add chunk-based variation
      const chunkVariation = Math.sin(chunkX * 0.5) * Math.cos(chunkZ * 0.5) * 0.1

      // Create continent shapes with multiple noise layers
      const continentValue =
        (continentNoise(nx * 2, ny * 2) * 0.5 +
          continentNoise(nx * 4, ny * 4) * 0.3 +
          continentNoise(nx * 8, ny * 8) * 0.2) *
          0.5 +
        0.5

      // Create elevation with continental shapes and local variation
      let elevation =
        (elevationNoise(nx * 3, ny * 3) * 0.4 +
          elevationNoise(nx * 6, ny * 6) * 0.3 +
          elevationNoise(nx * 12, ny * 12) * 0.2 +
          detailNoise(nx * 24, ny * 24) * 0.1) *
          continentValue +
        chunkVariation

      // Ensure smooth transitions between chunks
      const chunkBlend =
        smoothstep(localX, 0, CHUNK_SIZE) *
        smoothstep(localZ, 0, CHUNK_SIZE) *
        smoothstep(CHUNK_SIZE - localX, 0, CHUNK_SIZE) *
        smoothstep(CHUNK_SIZE - localZ, 0, CHUNK_SIZE)

      elevation = elevation * (0.8 + chunkBlend * 0.2)

      // Create moisture with multiple scales
      const moisture =
        (moistureNoise(nx * 4, ny * 4) * 0.5 +
          moistureNoise(nx * 8, ny * 8) * 0.3 +
          moistureNoise(nx * 16, ny * 16) * 0.2) *
          0.5 +
        0.5

      // Create temperature with latitude variation
      const latitudeInfluence = 1 - Math.abs(ny * 2) // Colder at poles
      const temperatureBase = latitudeInfluence * 0.8 + temperatureNoise(nx * 5, ny * 5) * 0.2

      // Apply elevation-based temperature modification
      const temperature = temperatureBase - elevation * 0.3

      // Determine terrain type with more varied transitions
      let terrainType: TerrainType
      if (elevation < 0.3) {
        terrainType = "water"
      } else if (elevation < 0.4) {
        // Coastline
        terrainType = moisture > 0.6 ? "plains" : "desert"
      } else if (elevation < 0.6) {
        if (moisture > 0.6) {
          terrainType = "forest"
        } else if (moisture > 0.3) {
          terrainType = "plains"
        } else {
          terrainType = "desert"
        }
      } else if (elevation < 0.8) {
        terrainType = "mountains"
      } else {
        terrainType = "mountains"
      }

      // Determine biome with more complex rules
      let biome: BiomeType
      if (temperature < 0.2) {
        biome = "cold"
      } else if (temperature < 0.4) {
        biome = moisture > 0.5 ? "temperate" : "cold"
      } else if (temperature < 0.7) {
        biome = moisture > 0.3 ? "temperate" : "arid"
      } else {
        biome = moisture > 0.4 ? "tropical" : "arid"
      }

      // Calculate fertility with more factors
      let fertility = 0
      if (terrainType === "plains") {
        fertility = moisture * 0.7 + temperature * 0.3
      } else if (terrainType === "forest") {
        fertility = moisture * 0.8 + temperature * 0.2
      } else if (terrainType === "mountains") {
        fertility = moisture * 0.3 * (1 - elevation)
      } else if (terrainType === "water") {
        fertility = 0.2
      } else {
        fertility = moisture * 0.1
      }

      // Adjust fertility based on biome
      if (biome === "cold") {
        fertility *= 0.4
      } else if (biome === "arid") {
        fertility *= 0.2
      } else if (biome === "tropical") {
        fertility *= 1.3
      }

      // Store tile data
      tiles[y][x] = {
        x,
        y,
        elevation,
        moisture,
        temperature,
        terrainType,
        biome,
        resourceId: null,
        civilizationId: null,
        fertility: Math.max(0, Math.min(1, fertility)),
      }
    }
  }

  // Create rivers with improved distribution
  createRivers(tiles, width, height, Math.floor((width + height) / 20))

  return {
    width,
    height,
    tiles,
    seed,
  }
}

// Smoothstep function for chunk blending
function smoothstep(x: number, min: number, max: number): number {
  x = Math.max(0, Math.min(1, (x - min) / (max - min)))
  return x * x * (3 - 2 * x)
}

// Create rivers with improved flow
function createRivers(tiles: Tile[][], width: number, height: number, count: number) {
  const heightMap = tiles.map((row) => row.map((tile) => tile.elevation))

  for (let i = 0; i < count; i++) {
    // Find mountain sources
    let startX = 0
    let startY = 0
    let attempts = 0
    let maxElevation = 0

    // Look for high elevation points
    while (attempts < 100) {
      const x = Math.floor(Math.random() * width)
      const y = Math.floor(Math.random() * height)

      if (tiles[y][x].elevation > maxElevation && tiles[y][x].terrainType === "mountains") {
        startX = x
        startY = y
        maxElevation = tiles[y][x].elevation
      }

      attempts++
    }

    if (maxElevation < 0.6) continue // Skip if no good source found

    // Create river path using A* pathfinding to nearest water
    let currentX = startX
    let currentY = startY
    let riverLength = 0
    const maxLength = width + height

    while (riverLength < maxLength) {
      // Mark as water
      if (tiles[currentY][currentX].terrainType !== "water") {
        tiles[currentY][currentX].terrainType = "water"
        tiles[currentY][currentX].fertility = Math.min(1, tiles[currentY][currentX].fertility + 0.3)
      }

      // Find lowest neighbor with some randomness
      const neighbors = [
        { x: currentX - 1, y: currentY },
        { x: currentX + 1, y: currentY },
        { x: currentX, y: currentY - 1 },
        { x: currentX, y: currentY + 1 },
        { x: currentX - 1, y: currentY - 1 },
        { x: currentX + 1, y: currentY - 1 },
        { x: currentX - 1, y: currentY + 1 },
        { x: currentX + 1, y: currentY + 1 },
      ].filter((n) => n.x >= 0 && n.x < width && n.y >= 0 && n.y < height)

      if (neighbors.length === 0) break

      // Sort by elevation with some randomness
      neighbors.sort((a, b) => heightMap[a.y][a.x] + Math.random() * 0.1 - (heightMap[b.y][b.x] + Math.random() * 0.1))

      // Move to lowest neighbor
      currentX = neighbors[0].x
      currentY = neighbors[0].y

      // Stop if we reached water
      if (tiles[currentY][currentX].terrainType === "water") {
        break
      }

      riverLength++
    }
  }
}

