import type { Civilization, Resource, World, HistoricalEvent, City } from "@/lib/types"

// Simulate a year of world history
export function simulateYear(
  year: number,
  civilizations: Civilization[],
  resources: Resource[],
  world: World,
): {
  updatedCivilizations: Civilization[]
  updatedResources: Resource[]
  newEvents: HistoricalEvent[]
} {
  // Clone civilizations to avoid mutating the original
  const updatedCivilizations = JSON.parse(JSON.stringify(civilizations)) as Civilization[]
  const updatedResources = JSON.parse(JSON.stringify(resources)) as Resource[]
  const newEvents: HistoricalEvent[] = []

  // Process each civilization
  updatedCivilizations.forEach((civ, index) => {
    // Population growth
    simulatePopulationGrowth(civ, world)

    // Technology advancement
    simulateTechnologyAdvancement(civ, year, newEvents)

    // City growth and new cities
    simulateCityGrowth(civ, world, year, newEvents)

    // Economy
    simulateEconomy(civ, updatedResources)

    // Military
    simulateMilitary(civ)

    // Diplomacy and wars
    simulateDiplomacy(civ, updatedCivilizations, year, newEvents)

    // Cultural events
    simulateCulturalEvents(civ, year, newEvents)

    // Natural disasters
    if (Math.random() < 0.05) {
      simulateDisaster(civ, year, newEvents)
    }
  })

  // Process wars
  simulateWars(updatedCivilizations, year, newEvents)

  // Territory expansion
  simulateTerritoryExpansion(updatedCivilizations, world)

  // World events
  if (Math.random() < 0.1) {
    simulateWorldEvent(year, newEvents)
  }

  return {
    updatedCivilizations,
    updatedResources,
    newEvents,
  }
}

// Simulate population growth
function simulatePopulationGrowth(civ: Civilization, world: World) {
  // Base growth rate
  let growthRate = civ.populationGrowth / 100

  // Adjust growth rate based on happiness and health
  growthRate *= (civ.happiness / 5) * (civ.health / 5)

  // Apply growth to each city
  civ.cities.forEach((city) => {
    const oldPopulation = city.population
    city.population = Math.floor(city.population * (1 + growthRate))

    // Update total population
    civ.population += city.population - oldPopulation
  })
}

// Simulate technology advancement
function simulateTechnologyAdvancement(civ: Civilization, year: number, newEvents: HistoricalEvent[]) {
  // Chance to advance technology
  if (Math.random() < 0.1 * (civ.economyStrength / 10)) {
    civ.technologyLevel += 1

    // Add historical event
    newEvents.push({
      id: `event-${year}-${Math.random().toString(36).substr(2, 9)}`,
      year,
      season: ["spring", "summer", "autumn", "winter"][Math.floor(Math.random() * 4)] as any,
      description: `${civ.name} advances to technology level ${civ.technologyLevel}`,
      type: "discovery",
      civilizationId: civ.id,
    })
  }
}

// Simulate city growth and new cities
function simulateCityGrowth(civ: Civilization, world: World, year: number, newEvents: HistoricalEvent[]) {
  // Check if population is large enough for a new city
  if (civ.population > civ.cities.length * 5000 && Math.random() < 0.2) {
    // Find a suitable location for a new city
    const existingCityPositions = civ.cities.map((city) => ({
      x: Math.floor(city.position.x + world.width / 2),
      z: Math.floor(city.position.z + world.height / 2),
    }))

    // Find tiles owned by this civilization
    const ownedTiles: { x: number; y: number }[] = []

    for (let y = 0; y < world.height; y++) {
      for (let x = 0; x < world.width; x++) {
        if (world.tiles[y][x].civilizationId === civ.id && world.tiles[y][x].terrainType !== "water") {
          ownedTiles.push({ x, y })
        }
      }
    }

    // Find a location that's not too close to existing cities
    const minDistance = 10
    const suitableLocations = ownedTiles.filter((tile) => {
      return !existingCityPositions.some((pos) => {
        const dx = pos.x - tile.x
        const dy = pos.z - tile.y
        return Math.sqrt(dx * dx + dy * dy) < minDistance
      })
    })

    if (suitableLocations.length > 0) {
      // Choose a random suitable location
      const location = suitableLocations[Math.floor(Math.random() * suitableLocations.length)]

      // Generate city name
      const cityNames = [
        "Newtown",
        "Riverdale",
        "Oakville",
        "Westport",
        "Eastfield",
        "Southbridge",
        "Northpoint",
        "Hillcrest",
        "Valleyforge",
        "Lakeside",
        "Harborview",
        "Foresthill",
        "Meadowbrook",
        "Stonewall",
        "Brookside",
      ]

      const cityName = cityNames[Math.floor(Math.random() * cityNames.length)]

      // Create new city
      const newCity: City = {
        id: `city-${civ.id}-${civ.cities.length}`,
        name: cityName,
        position: {
          x: location.x - world.width / 2,
          y: world.tiles[location.y][location.x].elevation * 10 + 1,
          z: location.y - world.height / 2,
        },
        population: 1000,
        isCapital: false,
        foundedYear: year,
      }

      // Add city to civilization
      civ.cities.push(newCity)

      // Add historical event
      newEvents.push({
        id: `event-${year}-${Math.random().toString(36).substr(2, 9)}`,
        year,
        season: ["spring", "summer", "autumn", "winter"][Math.floor(Math.random() * 4)] as any,
        description: `${civ.name} founds the city of ${cityName}`,
        type: "civilization",
        civilizationId: civ.id,
      })
    }
  }
}

// Simulate economy
function simulateEconomy(civ: Civilization, resources: Resource[]) {
  // Calculate base economy strength
  let economyStrength = 5

  // Adjust based on resources
  civ.resources.forEach((resourceId) => {
    const resource = resources.find((r) => r.id === resourceId)
    if (resource) {
      economyStrength += resource.value / 10
    }
  })

  // Adjust based on technology
  economyStrength += civ.technologyLevel / 2

  // Adjust based on population
  economyStrength += Math.log10(civ.population) / 2

  // Cap between 1 and 10
  civ.economyStrength = Math.max(1, Math.min(10, economyStrength))

  // Update happiness based on economy
  civ.happiness = Math.max(1, Math.min(10, civ.happiness + (civ.economyStrength - 5) / 10))
}

// Simulate military
function simulateMilitary(civ: Civilization) {
  // Update army size based on population
  civ.army.forEach((unit) => {
    if (unit.type === "infantry") {
      unit.count = Math.floor(civ.population * 0.01)
    } else if (unit.type === "cavalry") {
      unit.count = Math.floor(civ.population * 0.005)
    } else if (unit.type === "archers") {
      unit.count = Math.floor(civ.population * 0.008)
    }
  })

  // Calculate military strength
  const militaryStrength = Math.min(
    10,
    Math.floor((civ.army.reduce((sum, unit) => sum + unit.count * unit.strength, 0) / civ.population) * 100),
  )

  civ.militaryStrength = militaryStrength
}

// Simulate diplomacy and wars
function simulateDiplomacy(
  civ: Civilization,
  civilizations: Civilization[],
  year: number,
  newEvents: HistoricalEvent[],
) {
  // Update relations
  civ.relations.forEach((relation) => {
    const otherCiv = civilizations.find((c) => c.id === relation.civilizationId)
    if (!otherCiv) return

    // Random change in relations
    relation.value += Math.random() * 10 - 5

    // Cap between -100 and 100
    relation.value = Math.max(-100, Math.min(100, relation.value))

    // Update status based on value
    if (relation.value > 50) {
      if (relation.status !== "ally") {
        relation.status = "ally"

        // Add historical event
        newEvents.push({
          id: `event-${year}-${Math.random().toString(36).substr(2, 9)}`,
          year,
          season: ["spring", "summer", "autumn", "winter"][Math.floor(Math.random() * 4)] as any,
          description: `${civ.name} and ${otherCiv.name} form an alliance`,
          type: "civilization",
          civilizationId: civ.id,
          involvedCivilizations: [civ.id, otherCiv.id],
        })
      }
    } else if (relation.value < -50) {
      if (relation.status !== "enemy") {
        relation.status = "enemy"

        // Chance to start a war
        if (Math.random() < 0.3 && !civ.wars.some((war) => war.enemyId === otherCiv.id)) {
          // Start war
          const warId = `war-${year}-${Math.random().toString(36).substr(2, 9)}`

          civ.wars.push({
            id: warId,
            enemyId: otherCiv.id,
            startYear: year,
          })

          // Add war to other civilization
          const otherCivIndex = civilizations.findIndex((c) => c.id === otherCiv.id)
          if (otherCivIndex >= 0) {
            civilizations[otherCivIndex].wars.push({
              id: warId,
              enemyId: civ.id,
              startYear: year,
            })
          }

          // Add historical event
          newEvents.push({
            id: `event-${year}-${Math.random().toString(36).substr(2, 9)}`,
            year,
            season: ["spring", "summer", "autumn", "winter"][Math.floor(Math.random() * 4)] as any,
            description: `War breaks out between ${civ.name} and ${otherCiv.name}`,
            type: "war",
            civilizationId: null,
            involvedCivilizations: [civ.id, otherCiv.id],
          })
        }
      }
    } else {
      relation.status = "neutral"
    }
  })
}

// Simulate cultural events
function simulateCulturalEvents(civ: Civilization, year: number, newEvents: HistoricalEvent[]) {
  // Chance for cultural event
  if (Math.random() < 0.1) {
    const eventTypes = [
      `${civ.name} celebrates a grand festival`,
      `A new artistic movement emerges in ${civ.name}`,
      `${civ.ruler} commissions a great monument in ${civ.name}`,
      `Religious reforms sweep through ${civ.name}`,
      `A new philosophical school is founded in ${civ.name}`,
    ]

    const eventDescription = eventTypes[Math.floor(Math.random() * eventTypes.length)]

    // Add historical event
    newEvents.push({
      id: `event-${year}-${Math.random().toString(36).substr(2, 9)}`,
      year,
      season: ["spring", "summer", "autumn", "winter"][Math.floor(Math.random() * 4)] as any,
      description: eventDescription,
      type: "cultural",
      civilizationId: civ.id,
    })

    // Increase happiness
    civ.happiness = Math.min(10, civ.happiness + 1)
  }
}

// Simulate natural disasters
function simulateDisaster(civ: Civilization, year: number, newEvents: HistoricalEvent[]) {
  const disasterTypes = ["earthquake", "flood", "drought", "plague", "famine"]

  const disasterType = disasterTypes[Math.floor(Math.random() * disasterTypes.length)]

  // Add historical event
  newEvents.push({
    id: `event-${year}-${Math.random().toString(36).substr(2, 9)}`,
    year,
    season: ["spring", "summer", "autumn", "winter"][Math.floor(Math.random() * 4)] as any,
    description: `A devastating ${disasterType} strikes ${civ.name}`,
    type: "disaster",
    civilizationId: civ.id,
  })

  // Decrease population
  const populationLoss = Math.floor(civ.population * (0.05 + Math.random() * 0.1))
  civ.population -= populationLoss

  // Distribute population loss among cities
  civ.cities.forEach((city) => {
    const cityLoss = Math.floor(populationLoss * (city.population / civ.population))
    city.population -= cityLoss
  })

  // Decrease happiness and health
  civ.happiness = Math.max(1, civ.happiness - 2)
  civ.health = Math.max(1, civ.health - 2)
}

// Simulate wars
function simulateWars(civilizations: Civilization[], year: number, newEvents: HistoricalEvent[]) {
  // Process each civilization's wars
  civilizations.forEach((civ) => {
    const warsToRemove: string[] = []

    civ.wars.forEach((war) => {
      const enemy = civilizations.find((c) => c.id === war.enemyId)
      if (!enemy) return

      // Calculate war duration
      const warDuration = year - war.startYear

      // Chance to end war increases with duration
      const endWarChance = 0.1 + warDuration * 0.05

      if (Math.random() < endWarChance) {
        // Determine winner based on military strength
        const civStrength = civ.militaryStrength
        const enemyStrength = enemy.militaryStrength

        let winner: Civilization
        let loser: Civilization

        if (civStrength > enemyStrength) {
          winner = civ
          loser = enemy
        } else {
          winner = enemy
          loser = civ
        }

        // Add historical event
        newEvents.push({
          id: `event-${year}-${Math.random().toString(36).substr(2, 9)}`,
          year,
          season: ["spring", "summer", "autumn", "winter"][Math.floor(Math.random() * 4)] as any,
          description: `The war between ${civ.name} and ${enemy.name} ends with ${winner.name} victorious`,
          type: "war",
          civilizationId: null,
          involvedCivilizations: [civ.id, enemy.id],
        })

        // Update relations
        const civRelation = civ.relations.find((r) => r.civilizationId === enemy.id)
        const enemyRelation = enemy.relations.find((r) => r.civilizationId === civ.id)

        if (civRelation) {
          civRelation.value = -20 + Math.random() * 40
          civRelation.status = "neutral"
        }

        if (enemyRelation) {
          enemyRelation.value = -20 + Math.random() * 40
          enemyRelation.status = "neutral"
        }

        // Remove war from both civilizations
        warsToRemove.push(war.id)

        const enemyWarIndex = enemy.wars.findIndex((w) => w.id === war.id)
        if (enemyWarIndex >= 0) {
          enemy.wars.splice(enemyWarIndex, 1)
        }
      } else {
        // War continues - battle occurs
        const battleChance = 0.3

        if (Math.random() < battleChance) {
          // Determine battle winner based on military strength with some randomness
          const civStrength = civ.militaryStrength * (0.8 + Math.random() * 0.4)
          const enemyStrength = enemy.militaryStrength * (0.8 + Math.random() * 0.4)

          let winner: Civilization
          let loser: Civilization

          if (civStrength > enemyStrength) {
            winner = civ
            loser = enemy
          } else {
            winner = enemy
            loser = civ
          }

          // Add historical event
          newEvents.push({
            id: `event-${year}-${Math.random().toString(36).substr(2, 9)}`,
            year,
            season: ["spring", "summer", "autumn", "winter"][Math.floor(Math.random() * 4)] as any,
            description: `${winner.name} defeats ${loser.name} in a major battle`,
            type: "war",
            civilizationId: null,
            involvedCivilizations: [civ.id, enemy.id],
          })

          // Reduce loser's army
          loser.army.forEach((unit) => {
            unit.count = Math.floor(unit.count * 0.8)
          })

          // Reduce loser's population
          const populationLoss = Math.floor(loser.population * 0.02)
          loser.population -= populationLoss

          // Distribute population loss among cities
          loser.cities.forEach((city) => {
            const cityLoss = Math.floor(populationLoss * (city.population / loser.population))
            city.population -= cityLoss
          })
        }
      }
    })

    // Remove ended wars
    civ.wars = civ.wars.filter((war) => !warsToRemove.includes(war.id))
  })
}

// Simulate territory expansion
function simulateTerritoryExpansion(civilizations: Civilization[], world: World) {
  civilizations.forEach((civ) => {
    // Find current territory
    const territory: { x: number; y: number }[] = []

    for (let y = 0; y < world.height; y++) {
      for (let x = 0; x < world.width; x++) {
        if (world.tiles[y][x].civilizationId === civ.id) {
          territory.push({ x, y })
        }
      }
    }

    // Expand territory
    const newTerritory: { x: number; y: number }[] = []

    territory.forEach((tile) => {
      // Check adjacent tiles
      const directions = [
        { dx: 1, dy: 0 },
        { dx: -1, dy: 0 },
        { dx: 0, dy: 1 },
        { dx: 0, dy: -1 },
      ]

      directions.forEach((dir) => {
        const nx = tile.x + dir.dx
        const ny = tile.y + dir.dy

        // Skip if out of bounds
        if (nx < 0 || nx >= world.width || ny < 0 || ny >= world.height) return

        const neighborTile = world.tiles[ny][nx]

        // Skip if water or already claimed
        if (neighborTile.terrainType === "water" || neighborTile.civilizationId) return

        // Chance to claim based on civilization strength
        const claimChance = 0.01 * (civ.militaryStrength / 10) * (civ.population / 10000)

        if (Math.random() < claimChance) {
          newTerritory.push({ x: nx, y: ny })
        }
      })
    })

    // Claim new territory
    newTerritory.forEach((tile) => {
      world.tiles[tile.y][tile.x].civilizationId = civ.id
    })
  })
}

// Simulate world events
function simulateWorldEvent(year: number, newEvents: HistoricalEvent[]) {
  const worldEvents = [
    "A great comet appears in the sky",
    "A solar eclipse darkens the land",
    "Unusual weather patterns affect the entire world",
    "A new star appears in the night sky",
    "Strange lights are seen in the northern sky",
  ]

  const eventDescription = worldEvents[Math.floor(Math.random() * worldEvents.length)]

  // Add historical event
  newEvents.push({
    id: `event-${year}-${Math.random().toString(36).substr(2, 9)}`,
    year,
    season: ["spring", "summer", "autumn", "winter"][Math.floor(Math.random() * 4)] as any,
    description: eventDescription,
    type: "world",
    civilizationId: null,
  })
}

