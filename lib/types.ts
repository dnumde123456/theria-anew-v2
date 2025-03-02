// World and Terrain Types
export type TerrainType = "water" | "plains" | "forest" | "mountains" | "desert"
export type BiomeType = "temperate" | "tropical" | "arid" | "cold"
export type Season = "spring" | "summer" | "autumn" | "winter"

export interface Tile {
  x: number
  y: number
  elevation: number
  moisture: number
  temperature: number
  terrainType: TerrainType
  biome: BiomeType
  resourceId: string | null
  civilizationId: string | null
  fertility: number
}

export interface World {
  width: number
  height: number
  tiles: Tile[][]
  seed: number
}

// Civilization Types
export interface City {
  id: string
  name: string
  position: { x: number; y: number; z: number }
  population: number
  isCapital: boolean
  foundedYear: number
}

export interface ArmyUnit {
  type: string
  name: string
  count: number
  strength: number
}

export interface War {
  id: string
  enemyId: string
  startYear: number
}

export interface Relation {
  civilizationId: string
  status: "neutral" | "ally" | "enemy"
  value: number
}

export interface Civilization {
  id: string
  name: string
  color: string
  position: { x: number; y: number; z: number }
  size: number
  population: number
  populationGrowth: number
  cities: City[]
  ruler: string
  government: string
  technologyLevel: number
  militaryStrength: number
  economyStrength: number
  happiness: number
  health: number
  resources: string[]
  army: ArmyUnit[]
  wars: War[]
  relations: Relation[]
}

// Resource Types
export interface Resource {
  id: string
  name: string
  type: "food" | "mineral" | "luxury"
  value: number
  rarity: number
  position: { x: number; y: number }
}

// Historical Event Types
export type EventType = "world" | "civilization" | "war" | "discovery" | "disaster" | "cultural"

export interface HistoricalEvent {
  id: string
  year: number
  season: Season
  description: string
  type: EventType
  civilizationId: string | null
  involvedCivilizations?: string[]
}

