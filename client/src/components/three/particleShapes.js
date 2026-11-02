/**
 * Point-cloud targets for the hero particle morph. Every shape returns a flat
 * Float32Array of `count * 3` coordinates in roughly a 2.4-unit radius.
 */

export const SHAPE_ORDER = ['sphere', 'knot', 'code', 'initials']
export const GLYPH_SHAPES = new Set(['code', 'initials'])

/** Deterministic PRNG so shapes are stable across renders. */
function mulberry32(seed) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function sphere(count, radius = 2.1) {
  const out = new Float32Array(count * 3)
  const random = mulberry32(11)
  const golden = Math.PI * (3 - Math.sqrt(5))
  for (let i = 0; i < count; i += 1) {
    const y = 1 - (i / (count - 1)) * 2
    const r = Math.sqrt(1 - y * y)
    const theta = golden * i
    // Mostly a shell with a sprinkling inside so it reads as volume.
    const depth = random() < 0.85 ? 1 : 0.35 + random() * 0.6
    out[i * 3] = Math.cos(theta) * r * radius * depth
    out[i * 3 + 1] = y * radius * depth
    out[i * 3 + 2] = Math.sin(theta) * r * radius * depth
  }
  return out
}

function torusKnot(count, p = 2, q = 3, R = 1.55, tube = 0.42) {
  const out = new Float32Array(count * 3)
  const random = mulberry32(23)
  for (let i = 0; i < count; i += 1) {
    const t = random() * Math.PI * 2
    const phi = random() * Math.PI * 2
    const rr = R + Math.cos(q * t) * 0.55
    const cx = rr * Math.cos(p * t)
    const cy = rr * Math.sin(p * t)
    const cz = Math.sin(q * t) * 0.55
    // Approximate tube normal via finite difference of the centre curve.
    const dt = 0.01
    const rr2 = R + Math.cos(q * (t + dt)) * 0.55
    const tx = rr2 * Math.cos(p * (t + dt)) - cx
    const ty = rr2 * Math.sin(p * (t + dt)) - cy
    const tz = Math.sin(q * (t + dt)) * 0.55 - cz
    const len = Math.hypot(tx, ty, tz) || 1
    const ux = tx / len
    const uy = ty / len
    const uz = tz / len
    // Build an orthonormal frame around the tangent.
    let nx = -uy
    let ny = ux
    let nz = 0
    const nlen = Math.hypot(nx, ny, nz) || 1
    nx /= nlen
    ny /= nlen
    nz /= nlen
    const bx = uy * nz - uz * ny
    const by = uz * nx - ux * nz
    const bz = ux * ny - uy * nx
    const rad = tube * Math.sqrt(random())
    const ox = (nx * Math.cos(phi) + bx * Math.sin(phi)) * rad
    const oy = (ny * Math.cos(phi) + by * Math.sin(phi)) * rad
    const oz = (nz * Math.cos(phi) + bz * Math.sin(phi)) * rad
    out[i * 3] = cx + ox
    out[i * 3 + 1] = cy + oy
    out[i * 3 + 2] = cz + oz
  }
  return out
}

/** Rasterises text to a canvas and samples lit pixels into a thin 3D slab. */
function text(count, label, { fontSize = 300, weight = 700, depth = 0.5, width = 4.6 } = {}) {
  const out = new Float32Array(count * 3)
  const random = mulberry32(label.length * 97 + 5)
  if (typeof document === 'undefined') return sphere(count)

  const canvas = document.createElement('canvas')
  canvas.width = 1024
  canvas.height = 512
  const ctx = canvas.getContext('2d', { willReadFrequently: true })
  if (!ctx) return sphere(count)

  ctx.fillStyle = '#000'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.fillStyle = '#fff'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  let size = fontSize
  ctx.font = `${weight} ${size}px "Space Grotesk", "Inter", system-ui, sans-serif`
  // Shrink until the label fits with a margin.
  while (ctx.measureText(label).width > canvas.width * 0.88 && size > 40) {
    size -= 10
    ctx.font = `${weight} ${size}px "Space Grotesk", "Inter", system-ui, sans-serif`
  }
  ctx.fillText(label, canvas.width / 2, canvas.height / 2)
  const textWidth = ctx.measureText(label).width

  const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height)
  const lit = []
  for (let y = 0; y < canvas.height; y += 3) {
    for (let x = 0; x < canvas.width; x += 3) {
      if (data[(y * canvas.width + x) * 4] > 128) lit.push(x, y)
    }
  }
  if (lit.length < 6) return sphere(count)

  // Scale so the glyph itself (not the canvas) spans `width` world units.
  const scale = width / textWidth
  for (let i = 0; i < count; i += 1) {
    const pick = Math.floor(random() * (lit.length / 2)) * 2
    const jitter = 1.5
    out[i * 3] = (lit[pick] - canvas.width / 2 + (random() - 0.5) * jitter) * scale
    out[i * 3 + 1] = -(lit[pick + 1] - canvas.height / 2 + (random() - 0.5) * jitter) * scale
    out[i * 3 + 2] = (random() - 0.5) * depth
  }
  return out
}

export function buildShapes(count, initials = 'R') {
  return {
    sphere: sphere(count),
    knot: torusKnot(count),
    code: text(count, '</>', { fontSize: 340, weight: 600, width: 4.4 }),
    initials: text(count, initials.slice(0, 3).toUpperCase(), { fontSize: 360, width: 4.2 }),
  }
}
