# World Simulation

A full-scale, real-time world simulation with dynamic terrain, civilizations, wars, economy, politics, and history progression.

## Features

### 🌍 Terrain Generation
- Procedurally generated landscapes using Perlin/Voronoi noise
- Dynamic terrain including land, mountains, rivers, and biomes
- Seasonal changes with visual effects (snow in winter, etc.)
- Climate effects like droughts and floods

### 🏛️ Civilizations & Kingdoms
- Cities grow and merge into empires
- Population, economy, and technology progression
- Cultural elements like government types and rulers
- Resource management and distribution

### ⚔️ Politics & Warfare
- Dynamic borders that expand and shift
- Nations engage in wars, form alliances, and face rebellions
- Armies with battle mechanics and conquest strategies
- Diplomatic relations between civilizations

### 💰 Economy & Resources
- Trade routes and resource distribution
- Supply and demand system
- Different resource types (food, minerals, luxury)
- Economic strength affects civilization growth

### 📜 History Simulation
- Civilizations rise and fall over time
- Famous rulers and historical events
- Full timeline of world history
- Ability to replay past events

### 🖥️ UI & Interaction
- Interactive 3D map with hover effects
- Detailed information panels for nations, leaders, and cities
- Timeline visualization of historical events
- Simulation controls (speed, pause, rewind)

## Tech Stack

- **Frontend UI**: React, Next.js, Tailwind CSS
- **Rendering**: Three.js for 3D visualization
- **Procedural Terrain**: Custom Perlin noise implementation
- **Simulation Logic**: Complex systems for civilizations, warfare, and economy

## Getting Started

1. Clone the repository
2. Install dependencies with `npm install`
3. Run the development server with `npm run dev`
4. Open [http://localhost:3000](http://localhost:3000) in your browser

## How to Use

- **View the World**: Explore the 3D map by dragging to rotate, scrolling to zoom
- **Inspect Civilizations**: Click on civilization markers to view detailed information
- **Control Time**: Use the control panel to start/pause the simulation, adjust speed, or jump forward/backward in time
- **View History**: Check the timeline at the bottom to see major historical events

## Customization

The simulation parameters can be adjusted in the following files:
- `lib/world-generator.ts`: Terrain generation settings
- `lib/civilization-generator.ts`: Civilization creation parameters
- `lib/simulation-engine.ts`: Rules for simulation progression

