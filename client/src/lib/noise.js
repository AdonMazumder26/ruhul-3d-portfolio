/**
 * Compact 3D Perlin noise (Ken Perlin's improved algorithm) for smooth,
 * time-varying flow fields. Returns values in roughly [-1, 1].
 */
const permutation = (() => {
  const p = new Uint8Array(256)
  for (let i = 0; i < 256; i += 1) p[i] = i
  let seed = 1337
  for (let i = 255; i > 0; i -= 1) {
    seed = (seed * 16807) % 2147483647
    const j = seed % (i + 1)
    ;[p[i], p[j]] = [p[j], p[i]]
  }
  const out = new Uint8Array(512)
  for (let i = 0; i < 512; i += 1) out[i] = p[i & 255]
  return out
})()

const fade = (t) => t * t * t * (t * (t * 6 - 15) + 10)
const lerp = (a, b, t) => a + (b - a) * t

function grad(hash, x, y, z) {
  const h = hash & 15
  const u = h < 8 ? x : y
  const v = h < 4 ? y : h === 12 || h === 14 ? x : z
  return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v)
}

export function perlin3(x, y, z) {
  const X = Math.floor(x) & 255
  const Y = Math.floor(y) & 255
  const Z = Math.floor(z) & 255
  x -= Math.floor(x)
  y -= Math.floor(y)
  z -= Math.floor(z)
  const u = fade(x)
  const v = fade(y)
  const w = fade(z)
  const p = permutation
  const A = p[X] + Y
  const AA = p[A] + Z
  const AB = p[A + 1] + Z
  const B = p[X + 1] + Y
  const BA = p[B] + Z
  const BB = p[B + 1] + Z

  return lerp(
    lerp(
      lerp(grad(p[AA], x, y, z), grad(p[BA], x - 1, y, z), u),
      lerp(grad(p[AB], x, y - 1, z), grad(p[BB], x - 1, y - 1, z), u),
      v,
    ),
    lerp(
      lerp(grad(p[AA + 1], x, y, z - 1), grad(p[BA + 1], x - 1, y, z - 1), u),
      lerp(grad(p[AB + 1], x, y - 1, z - 1), grad(p[BB + 1], x - 1, y - 1, z - 1), u),
      v,
    ),
    w,
  )
}
