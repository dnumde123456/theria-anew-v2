import type { Resource, World } from "@/lib/types"

// Generate resources
export function generateResources(world: World): Resource[] {
  const resources: Resource[] = []

  // Resource types
  const foodResources = [
    { name: "Wheat", value: 5, rarity: 0.2 },
    { name: "Fish", value: 6, rarity: 0.3 },
    { name: "Cattle", value: 7, rarity: 0.4 },
    { name: "Fruit", value: 6, rarity: 0.5 },
    { name: "Rice", value: 5, rarity: 0.3 },
  ]

  const mineralResources = [
    { name: "Iron", value: 8, rarity: 0.6 },
    { name: "Gold", value: 10, rarity: 0.8 },
    { name: "Stone", value: 4, rarity: 0.3 },
    { name: "Copper", value: 7, rarity: 0.5 },
    { name: "Silver", value: 9, rarity: 0.7 },
  ]

  const luxuryResources = [
    { name: "Gems", value: 12, rarity: 0.9 },
    { name: "Spices", value: 11, rarity: 0.7 },
    { name: "Silk", value: 10, rarity: 0.8 },
    { name: "Dyes", value: 9, rarity: 0.6 },
    { name: "Incense", value: 8, rarity: 0.5 },
  ]

  // Place food resources
  for (let y = 0; y < world.height; y++) {
    for (let x = 0; x < world.width; x++) {
      const tile = world.tiles[y][x]

      // Skip water tiles for most resources
      if (tile.terrainType === "water") {
        // Only place fish in water
        if (Math.random() < 0.05) {
          const resource = foodResources[1] // Fish

          resources.push({
            id: `resource-${resources.length}`,
            name: resource.name,
            type: "food",
            value: resource.value,
            rarity: resource.rarity,
            position: { x, y },
          })

          tile.resourceId = `resource-${resources.length - 1}`
        }

        continue
      }

      // Place food resources based on fertility
      if (Math.random() < tile.fertility * 0.2) {
        // Select a random food resource
        const resourceIndex = Math.floor(Math.random() * foodResources.length)
        const resource = foodResources[resourceIndex]

        // Skip fish on land
        if (resource.name === "Fish") continue

        // Add resource
        resources.push({
          id: `resource-${resources.length}`,
          name: resource.name,
          type: "food",
          value: resource.value,
          rarity: resource.rarity,
          position: { x, y },
        })

        tile.resourceId = `resource-${resources.length - 1}`
      }

      // Place mineral resources in mountains
      if (tile.terrainType === "mountains" && Math.random() < 0.1) {
        // Select a random mineral resource
        const resourceIndex = Math.floor(Math.random() * mineralResources.length)
        const resource = mineralResources[resourceIndex]

        // Add resource
        resources.push({
          id: `resource-${resources.length}`,
          name: resource.name,
          type: "mineral",
          value: resource.value,
          rarity: resource.rarity,
          position: { x, y },
        })

        tile.resourceId = `resource-${resources.length - 1}`
      }

      // Place luxury resources rarely
      if (Math.random() < 0.02) {
        // Select a random luxury resource
        const resourceIndex = Math.floor(Math.random() * luxuryResources.length)
        const resource = luxuryResources[resourceIndex]

        // Add resource
        resources.push({
          id: `resource-${resources.length}`,
          name: resource.name,
          type: "luxury",
          value: resource.value,
          rarity: resource.rarity,
          position: { x, y },
        })

        tile.resourceId = `resource-${resources.length - 1}`
      }
    }
  }

  return resources
}

