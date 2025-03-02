"use client"

import { useRef, useEffect, useState, useCallback } from "react"
import * as THREE from "three"
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { useSimulation } from "@/lib/simulation-context"
import { generateTerrain } from "@/lib/terrain-generator"
import type { Civilization, City } from "@/lib/types"

// Constants for chunk handling
const CHUNK_SIZE = 50
const CHUNKS_X = 4
const CHUNKS_Z = 4
const CHUNK_LOAD_RADIUS = Math.max(CHUNKS_X, CHUNKS_Z) // Changed from 2 to handle full map

export default function WorldMap() {
  const containerRef = useRef<HTMLDivElement>(null)
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
  const sceneRef = useRef<THREE.Scene | null>(null)
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null)
  const controlsRef = useRef<OrbitControls | null>(null)
  const frameRef = useRef<number>(0)
  const mountedRef = useRef(false)
  const chunksRef = useRef<Map<string, THREE.Group>>(new Map())

  const { world, civilizations, selectedEntity, setSelectedEntity, currentSeason } = useSimulation()
  const [hoveredEntity, setHoveredEntity] = useState<string | null>(null)

  // Initialize Three.js scene
  const initScene = useCallback(() => {
    if (!containerRef.current || mountedRef.current || !world) return; // Ensure world exists
  
    // Create scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0x111827);
  
    // Add lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5); // Soft white light
    scene.add(ambientLight);
  
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 10, 10).normalize(); // Position the light
    scene.add(directionalLight);
  
    // Create camera
    const camera = new THREE.PerspectiveCamera(
      60,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000,
    );
  
    // Ensure world.width and world.height exist before using them
    const worldWidth = world?.width || 100;
    const worldHeight = world?.height || 100;
  
    camera.position.set(0, Math.max(worldWidth, worldHeight), Math.max(worldWidth, worldHeight));
    cameraRef.current = camera;
  
    // Create renderer with optimized settings
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: "high-performance",
      stencil: false,
      alpha: false,
    });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;
  
    // Add controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 20;
    controls.maxDistance = Math.max(worldWidth, worldHeight) * 2;
    controls.maxPolarAngle = Math.PI / 2 - 0.1;
    controlsRef.current = controls;
  
    mountedRef.current = true;
  
    return () => cleanup();
  }, [world]);

  // Cleanup function
  const cleanup = useCallback(() => {
    if (frameRef.current) {
      cancelAnimationFrame(frameRef.current)
    }

    if (controlsRef.current) {
      controlsRef.current.dispose()
    }

    if (rendererRef.current) {
      rendererRef.current.dispose()
    }

    if (sceneRef.current) {
      sceneRef.current.clear()
    }

    // Clear chunk cache
    chunksRef.current.clear()

    mountedRef.current = false
  }, [])

  // Handle window resize
  const handleResize = useCallback(() => {
    if (!containerRef.current || !rendererRef.current || !cameraRef.current) return

    const width = containerRef.current.clientWidth
    const height = containerRef.current.clientHeight

    cameraRef.current.aspect = width / height
    cameraRef.current.updateProjectionMatrix()

    rendererRef.current.setSize(width, height)
  }, [])

  // Get chunk key
  const getChunkKey = (x: number, z: number) => `${x},${z}`

  // Load chunk
  const loadChunk = useCallback(
    (chunkX: number, chunkZ: number) => {
      if (!world || !sceneRef.current) return

      const key = getChunkKey(chunkX, chunkZ)
      if (chunksRef.current.has(key)) return

      // Create chunk group
      const chunkGroup = new THREE.Group()
      chunkGroup.position.set(chunkX * CHUNK_SIZE - world.width / 2, 0, chunkZ * CHUNK_SIZE - world.height / 2)

      // Generate terrain for chunk
      const chunkWorld = {
        ...world,
        width: CHUNK_SIZE,
        height: CHUNK_SIZE,
        tiles: world.tiles
          .slice(chunkZ * CHUNK_SIZE, (chunkZ + 1) * CHUNK_SIZE)
          .map((row) => row.slice(chunkX * CHUNK_SIZE, (chunkX + 1) * CHUNK_SIZE)),
      }

      const { mesh, waterMesh } = generateTerrain(chunkWorld, currentSeason)
      chunkGroup.add(mesh)
      chunkGroup.add(waterMesh)

      // Add chunk to scene and cache
      sceneRef.current.add(chunkGroup)
      chunksRef.current.set(key, chunkGroup)
    },
    [world, currentSeason, getChunkKey],
  )

  // Unload chunk
  const unloadChunk = useCallback(
    (chunkX: number, chunkZ: number) => {
      const key = getChunkKey(chunkX, chunkZ)
      const chunk = chunksRef.current.get(key)

      if (chunk && sceneRef.current) {
        sceneRef.current.remove(chunk)
        chunk.clear()
        chunksRef.current.delete(key)
      }
    },
    [getChunkKey],
  )

  // Update visible chunks based on camera position
  const updateVisibleChunks = useCallback(() => {
    if (!cameraRef.current || !world) return

    const camera = cameraRef.current
    const cameraChunkX = Math.floor((camera.position.x + world.width / 2) / CHUNK_SIZE)
    const cameraChunkZ = Math.floor((camera.position.z + world.height / 2) / CHUNK_SIZE)

    // Load chunks in radius around camera
    const loadedChunks = new Set<string>()

    for (let x = -CHUNK_LOAD_RADIUS; x <= CHUNK_LOAD_RADIUS; x++) {
      for (let z = -CHUNK_LOAD_RADIUS; z <= CHUNK_LOAD_RADIUS; z++) {
        const chunkX = cameraChunkX + x
        const chunkZ = cameraChunkZ + z

        // Skip if out of bounds
        if (chunkX < 0 || chunkX >= CHUNKS_X || chunkZ < 0 || chunkZ >= CHUNKS_Z) continue

        const key = getChunkKey(chunkX, chunkZ)
        loadedChunks.add(key)
        loadChunk(chunkX, chunkZ)
      }
    }

    // Unload chunks outside radius
    Array.from(chunksRef.current.entries()).forEach(([key, _]) => {
      if (!loadedChunks.has(key)) {
        const [x, z] = key.split(",").map(Number)
        unloadChunk(x, z)
      }
    })
  }, [world, loadChunk, unloadChunk])

  // Animation loop
  const animate = useCallback(() => {
    if (!mountedRef.current) return

    frameRef.current = requestAnimationFrame(animate)

    if (controlsRef.current) {
      controlsRef.current.update()
    }

    // Update visible chunks
    updateVisibleChunks()

    if (rendererRef.current && sceneRef.current && cameraRef.current) {
      rendererRef.current.render(sceneRef.current, cameraRef.current)
    }
  }, [updateVisibleChunks])

  // Initialize scene
  useEffect(() => {
    initScene()
    animate()

    window.addEventListener("resize", handleResize)

    return () => {
      window.removeEventListener("resize", handleResize)
      cleanup()
    }
  }, [initScene, animate, handleResize, cleanup])

  // Update civilizations and cities
  useEffect(() => {
    if (!sceneRef.current) return

    // Remove existing civilization and city meshes
    sceneRef.current.children = sceneRef.current.children.filter(
      (child) => !child.userData.type || (child.userData.type !== "civilization" && child.userData.type !== "city"),
    )

    // Add civilization markers
    civilizations.forEach((civ) => {
      const marker = createCivilizationMarker(civ, selectedEntity === civ.id || hoveredEntity === civ.id)
      sceneRef.current?.add(marker)

      // Add city markers
      civ.cities.forEach((city) => {
        const cityMarker = createCityMarker(city, civ.color, selectedEntity === city.id || hoveredEntity === city.id)
        sceneRef.current?.add(cityMarker)
      })
    })
  }, [civilizations, selectedEntity, hoveredEntity])

  // Handle interactions
  useEffect(() => {
    if (!rendererRef.current || !cameraRef.current || !sceneRef.current) return

    const raycaster = new THREE.Raycaster()
    const mouse = new THREE.Vector2()

    const onMouseMove = (event: MouseEvent) => {
      const rect = rendererRef.current?.domElement.getBoundingClientRect()
      if (!rect) return

      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1

      raycaster.setFromCamera(mouse, cameraRef.current!)
      const intersects = raycaster.intersectObjects(sceneRef.current!.children, true)

      let foundInteractive = false
      for (const intersect of intersects) {
        const object = intersect.object
        if (object.userData.type === "civilization" || object.userData.type === "city") {
          setHoveredEntity(object.userData.id)
          document.body.style.cursor = "pointer"
          foundInteractive = true
          break
        }
      }

      if (!foundInteractive) {
        setHoveredEntity(null)
        document.body.style.cursor = "default"
      }
    }

    const onClick = () => {
      if (hoveredEntity) {
        setSelectedEntity(hoveredEntity)
      } else {
        setSelectedEntity(null)
      }
    }

    rendererRef.current.domElement.addEventListener("mousemove", onMouseMove)
    rendererRef.current.domElement.addEventListener("click", onClick)

    return () => {
      rendererRef.current?.domElement.removeEventListener("mousemove", onMouseMove)
      rendererRef.current?.domElement.removeEventListener("click", onClick)
    }
  }, [hoveredEntity, setSelectedEntity])

  return <div ref={containerRef} className="w-full h-full" />
}

// Helper function to create civilization marker
function createCivilizationMarker(civ: Civilization, isHighlighted: boolean) {
  const geometry = new THREE.CylinderGeometry(civ.size / 20, civ.size / 30, civ.size / 10, 8)

  const material = new THREE.MeshLambertMaterial({
    color: new THREE.Color(civ.color),
    transparent: true,
    opacity: 0.8,
  })

  const mesh = new THREE.Mesh(geometry, material)
  mesh.position.set(civ.position.x, civ.position.y + civ.size / 20, civ.position.z)
  mesh.castShadow = true
  mesh.receiveShadow = true
  mesh.userData = { type: "civilization", id: civ.id }

  if (isHighlighted) {
    mesh.scale.set(1.2, 1.2, 1.2)

    const highlightMaterial = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      wireframe: true,
      transparent: true,
      opacity: 0.3,
    })

    const highlightMesh = new THREE.Mesh(geometry, highlightMaterial)
    highlightMesh.position.copy(mesh.position)
    highlightMesh.scale.set(1.3, 1.3, 1.3)
    mesh.add(highlightMesh)
  }

  return mesh
}

// Helper function to create city marker
function createCityMarker(city: City, civColor: string, isHighlighted: boolean) {
  const group = new THREE.Group()

  const size = city.isCapital ? 1.5 : 1.0
  const height = city.isCapital ? 1.2 : 0.8

  // Base
  const baseGeometry = new THREE.CylinderGeometry(size, size, 0.2, 8)
  const baseMaterial = new THREE.MeshLambertMaterial({
    color: new THREE.Color(civColor),
    transparent: false,
    opacity: 1.0,
  })

  const baseMesh = new THREE.Mesh(baseGeometry, baseMaterial)
  group.add(baseMesh)

  // Building
  const buildingGeometry = city.isCapital
    ? new THREE.ConeGeometry(size * 0.8, height, 8)
    : new THREE.BoxGeometry(size * 1.2, height, size * 1.2)

  const buildingMaterial = new THREE.MeshLambertMaterial({
    color: 0xeeeeee,
    transparent: false,
    opacity: 1.0,
  })

  const buildingMesh = new THREE.Mesh(buildingGeometry, buildingMaterial)
  buildingMesh.position.y = height / 2 + 0.1
  group.add(buildingMesh)

  // Position
  group.position.set(city.position.x, city.position.y + 0.1, city.position.z)

  // Metadata
  group.userData = { type: "city", id: city.id }

  // Highlight
  if (isHighlighted) {
    const highlightGeometry = new THREE.CylinderGeometry(size * 1.5, size * 1.5, 0.1, 16)
    const highlightMaterial = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.3,
    })

    const highlightMesh = new THREE.Mesh(highlightGeometry, highlightMaterial)
    highlightMesh.position.y = -0.1
    group.add(highlightMesh)

    group.scale.set(1.2, 1.2, 1.2)
  }

  return group
}

