import type { Civilization, World, Resource, City, ArmyUnit, Relation } from "@/lib/types"

const MIN_CITY_DISTANCE = 15 // Minimum distance between cities
const CAPITAL_MIN_DISTANCE = 25 // Minimum distance between capitals

function calculateDistance(x1: number, y1: number, x2: number, y2: number): number {
  return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2))
}

function findSuitableLocations(
  world: World,
  existingLocations: Array<{ x: number; y: number }> = [],
): Array<{ x: number; y: number; score: number }> {
  const suitableLocations: Array<{ x: number; y: number; score: number }> = []
  const radius = 5 // Search radius for resources and features

  for (let y = 0; y < world.height; y++) {
    for (let x = 0; x < world.width; x++) {
      const tile = world.tiles[y][x]

      // Skip water tiles and existing civilization territories
      if (tile.terrainType === "water" || tile.civilizationId) continue

      // Check minimum distance from existing locations
      const tooClose = existingLocations.some((loc) => calculateDistance(x, y, loc.x, loc.y) < MIN_CITY_DISTANCE)
      if (tooClose) continue

      // Calculate location score based on multiple factors
      let score = 0

      // Base score from fertility
      score += tile.fertility * 10

      // Check nearby tiles for resources and features
      let nearbyWater = false
      let nearbyResources = 0
      let nearbyMountains = 0
      let suitableLand = 0

      for (let ny = Math.max(0, y - radius); ny < Math.min(world.height, y + radius); ny++) {
        for (let nx = Math.max(0, x - radius); nx < Math.min(world.width, x + radius); nx++) {
          const nearbyTile = world.tiles[ny][nx]
          const distance = calculateDistance(x, y, nx, ny)

          if (distance > radius) continue

          // Weight by distance (closer is better)
          const weight = 1 - distance / radius

          // Check for water access
          if (nearbyTile.terrainType === "water") {
            nearbyWater = true
            score += 2 * weight
          }

          // Check for resources
          if (nearbyTile.resourceId) {
            nearbyResources++
            score += 3 * weight
          }

          // Check for mountains (defensive position)
          if (nearbyTile.terrainType === "mountains") {
            nearbyMountains++
            score += weight
          }

          // Count suitable land for expansion
          if (nearbyTile.terrainType === "plains" || nearbyTile.terrainType === "forest") {
            suitableLand++
            score += weight
          }
        }
      }

      // Bonus for balanced location
      if (nearbyWater && nearbyResources > 0 && nearbyMountains > 0) {
        score *= 1.5
      }

      // Bonus for expansion potential
      score += (suitableLand / (Math.PI * radius * radius)) * 5

      // Add to suitable locations
      suitableLocations.push({ x, y, score })
    }
  }

  // Sort by score but add some randomization
  return suitableLocations.sort((a, b) => b.score + Math.random() * 5 - (a.score + Math.random() * 5))
}

// Generate civilizations
export function generateCivilizations(world: World, resources: Resource[], count = 8): Civilization[] {
  const civilizations: Civilization[] = []
  const existingLocations: Array<{ x: number; y: number }> = []

  // Generate civilizations one by one
  for (let i = 0; i < count; i++) {
    // Find suitable location for capital
    const suitableLocations = findSuitableLocations(world, existingLocations)
    const location = suitableLocations[0]

    if (!location) continue

    // Add to existing locations
    existingLocations.push(location)

    // Generate civilization
    const civ = generateCivilization(world, resources, i, location, existingLocations)
    civilizations.push(civ)

    // Update existing locations with new cities
    civ.cities.forEach((city) => {
      existingLocations.push({
        x: Math.floor(city.position.x + world.width / 2),
        y: Math.floor(city.position.z + world.height / 2),
      })
    })
  }

  return civilizations
}

function generateCivilization(
  world: World,
  resources: Resource[],
  index: number,
  capitalLocation: { x: number; y: number },
  existingLocations: Array<{ x: number; y: number }>,
): Civilization {
  // Generate random color - use a distinct color palette
  const hue = ((index * 360) / 8) % 360
  const color = `hsl(${hue}, 70%, 50%)`

  // Generate cities
  const cities: City[] = []
  const numCities = 2 + Math.floor(Math.random() * 3) // 2-4 cities per civilization

  // Add capital city
  cities.push({
    id: `city-${index}-0`,
    name: "Capital",
    position: {
      x: capitalLocation.x - world.width / 2,
      y: world.tiles[capitalLocation.y][capitalLocation.x].elevation * 10,
      z: capitalLocation.y - world.height / 2,
    },
    population: 5000 + Math.floor(Math.random() * 5000),
    isCapital: true,
    foundedYear: 1,
  })

  // Add additional cities
  for (let j = 1; j < numCities; j++) {
    // Find location for city - search in a wider radius
    const suitableCityLocations = findSuitableLocations(world, [...existingLocations, capitalLocation])
    const cityLocation = suitableCityLocations[0]

    if (!cityLocation) continue

    cities.push({
      id: `city-${index}-${j}`,
      name: "City",
      position: {
        x: cityLocation.x - world.width / 2,
        y: world.tiles[cityLocation.y][cityLocation.x].elevation * 10,
        z: cityLocation.y - world.height / 2,
      },
      population: 2000 + Math.floor(Math.random() * 3000),
      isCapital: false,
      foundedYear: 1,
    })
    existingLocations.push(cityLocation)
  }

  // Calculate total population
  const totalPopulation = cities.reduce((sum, city) => sum + city.population, 0)

  // Generate army units
  const army: ArmyUnit[] = [
    {
      type: "infantry",
      name: "Infantry",
      count: Math.floor(totalPopulation * 0.01),
      strength: 1,
    },
    {
      type: "cavalry",
      name: "Cavalry",
      count: Math.floor(totalPopulation * 0.005),
      strength: 2,
    },
    {
      type: "archers",
      name: "Archers",
      count: Math.floor(totalPopulation * 0.008),
      strength: 1.5,
    },
  ]

  // Calculate military strength
  const militaryStrength = Math.min(
    10,
    Math.floor((army.reduce((sum, unit) => sum + unit.count * unit.strength, 0) / totalPopulation) * 100),
  )

  // Find nearby resources
  const civResources: string[] = []
  const radius = 15 // Increased resource claim radius

  for (let y = Math.max(0, capitalLocation.y - radius); y < Math.min(world.height, capitalLocation.y + radius); y++) {
    for (let x = Math.max(0, capitalLocation.x - radius); x < Math.min(world.width, capitalLocation.x + radius); x++) {
      const tile = world.tiles[y][x]

      if (tile.resourceId && !civResources.includes(tile.resourceId)) {
        civResources.push(tile.resourceId)

        // Claim the resource
        tile.civilizationId = `civ-${index}`
      }
    }
  }

  // Generate relations with other civilizations
  const relations: Relation[] = []

  for (let j = 0; j < index; j++) {
    const status = Math.random() < 0.7 ? "neutral" : Math.random() < 0.5 ? "ally" : "enemy"
    const value =
      status === "ally"
        ? 50 + Math.random() * 50
        : status === "enemy"
          ? -50 - Math.random() * 50
          : Math.random() * 100 - 50

    relations.push({
      civilizationId: `civ-${j}`,
      status,
      value,
    })
  }

  // Create civilization
  const civilization: Civilization = {
    id: `civ-${index}`,
    name: `Civilization ${index + 1}`,
    color,
    position: {
      x: capitalLocation.x - world.width / 2,
      y: world.tiles[capitalLocation.y][capitalLocation.x].elevation * 10 + 1,
      z: capitalLocation.y - world.height / 2,
    },
    size: Math.sqrt(totalPopulation) / 10,
    population: totalPopulation,
    populationGrowth: 1 + Math.random() * 2,
    cities,
    ruler: "Ruler",
    government: "Government",
    technologyLevel: 1 + Math.floor(Math.random() * 3),
    militaryStrength,
    economyStrength: 3 + Math.floor(Math.random() * 7),
    happiness: 5 + Math.floor(Math.random() * 5),
    health: 5 + Math.floor(Math.random() * 5),
    resources: civResources,
    army,
    wars: [],
    relations,
  }

  // Claim territory - larger radius for initial territory
  const territoryRadius = 10
  for (
    let y = Math.max(0, capitalLocation.y - territoryRadius);
    y < Math.min(world.height, capitalLocation.y + territoryRadius);
    y++
  ) {
    for (
      let x = Math.max(0, capitalLocation.x - territoryRadius);
      x < Math.min(world.width, capitalLocation.x + territoryRadius);
      x++
    ) {
      const tile = world.tiles[y][x]
      const distance = Math.sqrt(Math.pow(x - capitalLocation.x, 2) + Math.pow(y - capitalLocation.y, 2))

      if (tile.terrainType !== "water" && distance <= territoryRadius) {
        tile.civilizationId = `civ-${index}`
      }
    }
  }

  // Also claim territory around each city
  cities.forEach((city) => {
    const cityX = Math.floor(city.position.x + world.width / 2)
    const cityY = Math.floor(city.position.z + world.height / 2)
    const cityRadius = city.isCapital ? 8 : 5

    for (let y = Math.max(0, cityY - cityRadius); y < Math.min(world.height, cityY + cityRadius); y++) {
      for (let x = Math.max(0, cityX - cityRadius); x < Math.min(world.width, cityX + cityRadius); x++) {
        const tile = world.tiles[y][x]
        const distance = Math.sqrt(Math.pow(x - cityX, 2) + Math.pow(y - cityY, 2))

        if (tile.terrainType !== "water" && distance <= cityRadius) {
          tile.civilizationId = `civ-${index}`
        }
      }
    }
  })

  return civilization
}

