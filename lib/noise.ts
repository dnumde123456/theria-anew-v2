// Simple implementation of Perlin noise
export function createNoise2D(seed: number) {
  // Simple hash function
  const hash = (x: number) => {
    let h = x * 15731 + seed
    h = h & h
    return (h % 1000000) / 1000000
  }

  // Linear interpolation
  const lerp = (a: number, b: number, t: number) => a + t * (b - a)

  // Smooth step function
  const smoothStep = (t: number) => t * t * (3 - 2 * t)

  // Gradient function
  const grad = (hash: number, x: number, y: number) => {
    const h = hash * 16
    const u = h < 8 ? x : y
    const v = h < 4 ? y : h === 12 || h === 14 ? x : 0
    return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v)
  }

  return (x: number, y: number) => {
    // Grid cell coordinates
    const x0 = Math.floor(x)
    const y0 = Math.floor(y)
    const x1 = x0 + 1
    const y1 = y0 + 1

    // Relative coordinates within cell
    const sx = x - x0
    const sy = y - y0

    // Smooth the coordinates
    const nx = smoothStep(sx)
    const ny = smoothStep(sy)

    // Hash values for the four corners
    const n00 = hash(x0 * 12.9898 + y0 * 78.233)
    const n10 = hash(x1 * 12.9898 + y0 * 78.233)
    const n01 = hash(x0 * 12.9898 + y1 * 78.233)
    const n11 = hash(x1 * 12.9898 + y1 * 78.233)

    // Interpolate the four corners
    const ix0 = lerp(n00, n10, nx)
    const ix1 = lerp(n01, n11, nx)
    const value = lerp(ix0, ix1, ny)

    // Map from [0, 1] to [-1, 1]
    return value * 2 - 1
  }
}

