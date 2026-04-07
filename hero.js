/**
 * hero.js — Canvas animation for ETHAN GESLIN
 * Uses @chenglou/pretext for text segmentation & layout
 *
 * Two-layer architecture for smooth performance:
 *  bgCanvas  — static grid, drawn ONCE per resize (sits behind heroCanvas in DOM)
 *  heroCanvas — cleared every frame, draws ONLY active-zone cells + particles
 *
 * Draw order each frame:
 *  1. clearRect (heroCanvas → transparent, bgCanvas shows through)
 *  2. Radial gradient (heroCanvas, semi-transparent)
 *  3. Active cells only: spotlight + ripple + disturbance (heroCanvas)
 *  4. ETHAN GESLIN particles (heroCanvas)
 */
import {
  prepareWithSegments,
  layoutWithLines,
} from 'https://esm.sh/@chenglou/pretext@0.0.4'

const canvas = document.getElementById('heroCanvas')
if (!canvas) throw new Error('heroCanvas not found')
const ctx = canvas.getContext('2d')

// ── BACKGROUND LAYER ───────────────────────────────────
// Separate DOM element — sits behind heroCanvas, never cleared per frame.
// Holds the static dim text grid; drawn once in buildGrid().
const bgCanvas = document.createElement('canvas')
bgCanvas.setAttribute('aria-hidden', 'true')
bgCanvas.style.cssText = 'position:absolute;inset:0;pointer-events:none;'
canvas.parentElement.insertBefore(bgCanvas, canvas)
const bgCtx = bgCanvas.getContext('2d')
bgCtx.imageSmoothingEnabled = false

// ── STATE ──────────────────────────────────────────────
let W = 0, H = 0
let gridCells  = []   // dense bg text grid
let ripples    = []   // expanding ring waves from mouse movement
let particles  = []   // ETHAN GESLIN chars
let mouse      = { x: -9999, y: -9999 }
let prevMouse  = { x: -9999, y: -9999 }
let animFrameId = null
let animStart   = null

// ── PALETTE  violet → purple → rose → orange → gold ───
const STOPS = [
  [167, 139, 250],
  [196, 100, 245],
  [244,  63,  94],
  [249, 115,  22],
  [251, 191,  36],
]

function lerp(t) {
  const c = Math.max(0, Math.min(1, t))
  const s = c * (STOPS.length - 1)
  const lo = Math.floor(s), hi = Math.min(lo + 1, STOPS.length - 1)
  const f  = s - lo
  return STOPS[lo].map((v, i) => Math.round(v + (STOPS[hi][i] - v) * f))
}

// Glyphs used by the background disturbance effect
const SCRAMBLE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#!?&$'

// ── RESIZE ─────────────────────────────────────────────
function resize() {
  const section = canvas.parentElement
  W = section.offsetWidth
  H = section.offsetHeight

  const dpr = Math.min(window.devicePixelRatio || 1, 2)

  // heroCanvas (foreground, active effects + particles)
  canvas.width  = Math.round(W * dpr)
  canvas.height = Math.round(H * dpr)
  canvas.style.width  = W + 'px'
  canvas.style.height = H + 'px'
  ctx.setTransform(1, 0, 0, 1, 0, 0)
  ctx.scale(dpr, dpr)
  ctx.imageSmoothingEnabled = false

  // bgCanvas (background, static grid)
  bgCanvas.width  = Math.round(W * dpr)
  bgCanvas.height = Math.round(H * dpr)
  bgCanvas.style.width  = W + 'px'
  bgCanvas.style.height = H + 'px'
  bgCtx.setTransform(1, 0, 0, 1, 0, 0)
  bgCtx.scale(dpr, dpr)
  bgCtx.imageSmoothingEnabled = false

  buildScene()
}

// ── DENSE TEXT GRID ────────────────────────────────────
const ROW_SOURCES = [
  'TCP/IP', 'VLAN', 'Linux', 'SSH', 'OSPF', 'DNS', 'DHCP',
  'Docker', 'Proxmox', 'pfSense', 'PowerShell', 'Wireshark',
  'Nmap', 'BGP', 'NAT', 'TLS', 'LDAP', 'VPN', 'HTTPS', 'GPO',
  'SNMP', 'NTP', 'RAID', 'LVM', 'Bash', 'Cisco', 'Zabbix',
  'Active Directory', 'IPv6', 'VMware', 'Debian', 'Windows Server',
]

const CELL_FZ  = 9      // px — tiny monospace
const CELL_H   = 14     // row height
const SPOT_R   = 160    // spotlight radius
const RIPPLE_R = 240    // max ripple radius

async function buildGrid() {
  await document.fonts.ready
  gridCells = []
  ripples   = []

  const fontStr = `500 ${CELL_FZ}px 'Fira Code', monospace`
  ctx.font = fontStr

  const CELL_W = ctx.measureText('A').width
  const ROWS   = Math.ceil(H / CELL_H) + 1

  for (let r = 0; r < ROWS; r++) {
    const keyword = ROW_SOURCES[r % ROW_SOURCES.length]
    const repeated = (keyword + ' ').repeat(Math.ceil(W / (CELL_W * (keyword.length + 1)) + 3))

    const prepared  = prepareWithSegments(repeated, fontStr)
    const { lines } = layoutWithLines(prepared, W, CELL_H)
    const lineText  = lines[0]?.text ?? repeated.slice(0, Math.floor(W / CELL_W))

    const offsetX = (r % 2 === 0) ? 0 : CELL_W * 0.5

    let cx = offsetX
    for (const ch of [...lineText]) {
      const cw     = ctx.measureText(ch).width
      const colorT = ((r * 7 + gridCells.length) % 100) / 100 * 0.85
      const [cr, cg, cb] = lerp(colorT)

      gridCells.push({
        ch,
        bx: cx,
        by: r * CELL_H + CELL_FZ * 0.88,
        cw,
        colorT,
        colorFill:  `rgb(${cr},${cg},${cb})`,  // pre-built, reused by bgCtx
        baseAlpha:  0.028 + Math.random() * 0.024,
        phase:      Math.random() * Math.PI * 2,
        phaseSpeed: 0.25 + Math.random() * 0.55,
        disturbance: 0,
      })
      cx += cw
    }
  }

  // ── Draw static grid to bgCanvas (ONCE — no per-frame cost) ──
  bgCtx.clearRect(0, 0, W, H)
  bgCtx.font         = fontStr
  bgCtx.textBaseline = 'alphabetic'
  bgCtx.textAlign    = 'left'
  for (const cell of gridCells) {
    bgCtx.globalAlpha = cell.baseAlpha
    bgCtx.fillStyle   = cell.colorFill
    bgCtx.fillText(cell.ch, Math.round(cell.bx), Math.round(cell.by))
  }
  bgCtx.globalAlpha = 1
}

// ── DRAW GRID (active cells only, on heroCanvas) ───────
//
// bgCanvas already shows all cells at base alpha.
// This function only draws cells that have a VISIBLE EFFECT BEYOND BASE:
//   • inside mouse spotlight
//   • inside ripple ring
//   • still decaying from disturbance
//
// Typical active cell count: ~600 vs ~16 000 total → ~27× less fillText.
function drawGrid(elapsed) {
  const fontStr = `500 ${CELL_FZ}px 'Fira Code', monospace`
  ctx.font         = fontStr
  ctx.textBaseline = 'alphabetic'
  ctx.textAlign    = 'left'

  // Advance ripples
  ripples = ripples.filter(rip => {
    rip.r += rip.speed
    rip.alpha -= rip.decay
    return rip.alpha > 0 && rip.r < RIPPLE_R
  })

  const scrTick     = Math.floor(elapsed / 68)
  const hasRipples  = ripples.length > 0
  const mouseActive = mouse.x > -999

  for (const cell of gridCells) {
    const { bx, by } = cell

    // ── Cheap zone reject ────────────────────────────────
    // Cells with no disturbance that can't be reached by any effect are skipped
    // entirely — bgCanvas handles their base rendering.
    if (cell.disturbance < 0.002) {
      // Check bounding box around mouse spotlight + disturbance zone
      const inMouseZone = mouseActive
        && Math.abs(bx - mouse.x) <= SPOT_R
        && Math.abs(by - mouse.y) <= SPOT_R

      if (!inMouseZone) {
        if (!hasRipples) continue
        // Check if any ripple ring is nearby
        let inRippleZone = false
        for (const rip of ripples) {
          const outer = rip.r + rip.width
          if (Math.abs(bx - rip.x) <= outer && Math.abs(by - rip.y) <= outer) {
            inRippleZone = true
            break
          }
        }
        if (!inRippleZone) continue
      }
    }

    // ── Full effect computation ──────────────────────────
    const dMouse = mouseActive ? Math.hypot(bx - mouse.x, by - mouse.y) : Infinity
    const spot   = dMouse < SPOT_R
      ? Math.pow(1 - dMouse / SPOT_R, 2.2) * 0.70
      : 0

    let rippleBoost = 0
    if (hasRipples) {
      for (const rip of ripples) {
        const d    = Math.hypot(bx - rip.x, by - rip.y)
        const dist = Math.abs(d - rip.r)
        if (dist < rip.width)
          rippleBoost = Math.max(rippleBoost, (1 - dist / rip.width) * rip.alpha * 0.55)
      }
    }

    const DISTURB_R = 72
    const targetDisturbance = (mouseActive && dMouse < DISTURB_R)
      ? Math.pow(1 - dMouse / DISTURB_R, 1.4) : 0
    cell.disturbance += (targetDisturbance - cell.disturbance) *
      (targetDisturbance > cell.disturbance ? 0.35 : 0.055)

    const totalDisturbance = Math.min(cell.disturbance + rippleBoost * 0.6, 1)

    // Skip if computed effect is negligible (bgCanvas base is sufficient)
    if (spot < 0.005 && rippleBoost < 0.005 && totalDisturbance < 0.01) continue

    // Choose glyph (disturbance morphing)
    let glyph = cell.ch
    if (totalDisturbance > 0.55) {
      glyph = SCRAMBLE[(scrTick + cell.bx * 3 + cell.by) % SCRAMBLE.length]
    } else if (totalDisturbance > 0.15) {
      const flipRate = Math.floor(totalDisturbance * 4)
      glyph = ((scrTick + Math.floor(cell.bx)) % (flipRate + 2) === 0)
        ? SCRAMBLE[(scrTick * 3 + cell.bx + cell.by * 2) % SCRAMBLE.length]
        : cell.ch
    }

    const alpha  = Math.min(cell.baseAlpha + spot + rippleBoost, 0.82)
    const tBoost = (spot + totalDisturbance * 0.4 + rippleBoost * 0.3) * 0.38
    const [r, g, b] = lerp(Math.min(cell.colorT + tBoost, 1))

    ctx.globalAlpha = alpha
    ctx.fillStyle   = `rgb(${r},${g},${b})`
    ctx.fillText(glyph, Math.round(bx), Math.round(by))
  }

  ctx.globalAlpha = 1
}

// ── SPAWN RIPPLE ────────────────────────────────────────
function spawnRipple(x, y, strength) {
  ripples.push({
    x, y,
    r:     0,
    speed: 2.8 + strength * 1.8,
    width: 28 + strength * 18,
    alpha: 0.28 + strength * 0.30,
    decay: 0.004 + strength * 0.003,
  })
  if (ripples.length > 6) ripples.shift()
}

// ── MAIN PARTICLES (ETHAN GESLIN) ──────────────────────
async function buildParticles() {
  await document.fonts.ready
  particles = []

  const LINES   = ['ETHAN', 'GESLIN']
  const fz      = Math.min(Math.max(W * 0.14, 72), 190)
  const nameFnt = `900 ${fz}px Syne, sans-serif`
  const lineH   = fz * 1.08

  const totalBlock = lineH * 2 + fz * 0.22
  const blockTop   = (H - totalBlock) * 0.44
  const totalChars = LINES.reduce((n, w) => n + [...w].length, 0)
  let gIdx = 0

  LINES.forEach((word, li) => {
    const prepared  = prepareWithSegments(word, nameFnt)
    const { lines } = layoutWithLines(prepared, 99999, lineH)
    const lineText  = lines[0]?.text ?? word

    ctx.font = nameFnt
    const totalW  = ctx.measureText(lineText).width
    let cx        = (W - totalW) / 2
    const targetY = Math.round(blockTop + li * (lineH + fz * 0.22) + fz * 0.72)

    for (const ch of [...lineText]) {
      if (ch === ' ') { cx += fz * 0.3; continue }
      const cw = ctx.measureText(ch).width
      const t  = gIdx / Math.max(totalChars - 1, 1)
      gIdx++

      particles.push({
        ch,
        x: Math.round(cx + cw * 0.5),
        y: targetY,
        t,
        font: nameFnt,
        phase:      Math.random() * Math.PI * 2,
        phaseSpeed: 0.4 + Math.random() * 0.5,
        alpha: 0,
        delay: li * 60 + gIdx * 18,
      })
      cx += cw
    }
  })
}

// Click → large ripple wave on background
canvas.addEventListener('click', e => {
  const rect = canvas.getBoundingClientRect()
  spawnRipple(e.clientX - rect.left, e.clientY - rect.top, 1)
})

// ── SCENE BUILD ─────────────────────────────────────────
async function buildScene() {
  cancelAnimationFrame(animFrameId)
  animStart = null
  await Promise.all([buildGrid(), buildParticles()])
  animFrameId = requestAnimationFrame(frame)
}

// ── BACKGROUND GRADIENT ─────────────────────────────────
function drawBackground() {
  const gr = ctx.createRadialGradient(W * 0.5, H * 0.44, 0, W * 0.5, H * 0.44, W * 0.5)
  gr.addColorStop(0,   'rgba(124,58,237,0.09)')
  gr.addColorStop(0.5, 'rgba(244,63,94,0.04)')
  gr.addColorStop(1,   'rgba(0,0,0,0)')
  ctx.fillStyle = gr
  ctx.fillRect(0, 0, W, H)
}

// ── FRAME LOOP ──────────────────────────────────────────
function frame(ts) {
  if (!animStart) animStart = ts
  const elapsed = ts - animStart

  // heroCanvas is transparent by default after clearRect — bgCanvas shows through
  ctx.clearRect(0, 0, W, H)
  drawBackground()
  drawGrid(elapsed)

  particles.forEach(p => {
    if (elapsed < p.delay) return

    p.alpha = Math.min(p.alpha + 0.04, 0.95)

    const t  = elapsed * 0.001
    const dx = Math.sin(t * p.phaseSpeed       + p.phase)       * 2.8
    const dy = Math.cos(t * p.phaseSpeed * 0.7 + p.phase + 1.2) * 1.8

    const waveT     = p.t + Math.sin(elapsed * 0.00020 + p.t * Math.PI * 3) * 0.13
    const [r, g, b] = lerp(waveT)

    ctx.globalAlpha  = p.alpha
    ctx.fillStyle    = `rgb(${r},${g},${b})`
    ctx.font         = p.font
    ctx.textBaseline = 'alphabetic'
    ctx.textAlign    = 'center'
    ctx.fillText(p.ch, Math.round(p.x + dx), Math.round(p.y + dy))
  })
  ctx.globalAlpha = 1

  animFrameId = requestAnimationFrame(frame)
}

// ── EVENTS ──────────────────────────────────────────────
window.addEventListener('mousemove', e => {
  const rect = canvas.getBoundingClientRect()
  const nx = e.clientX - rect.left
  const ny = e.clientY - rect.top

  const vel = Math.hypot(nx - prevMouse.x, ny - prevMouse.y)
  if (vel > 18 && prevMouse.x > -999) {
    spawnRipple(
      (prevMouse.x + nx) / 2,
      (prevMouse.y + ny) / 2,
      Math.min(vel / 80, 1)
    )
  }

  prevMouse.x = mouse.x
  prevMouse.y = mouse.y
  mouse.x = nx
  mouse.y = ny
}, { passive: true })

window.addEventListener('mouseleave', () => {
  mouse.x = prevMouse.x = -9999
  mouse.y = prevMouse.y = -9999
})

let resizeTimer
window.addEventListener('resize', () => {
  clearTimeout(resizeTimer)
  resizeTimer = setTimeout(resize, 120)
}, { passive: true })

canvas.addEventListener('touchmove', e => {
  const rect = canvas.getBoundingClientRect()
  const t = e.touches[0]
  mouse.x = t.clientX - rect.left
  mouse.y = t.clientY - rect.top
}, { passive: true })

canvas.addEventListener('touchend', () => {
  mouse.x = prevMouse.x = -9999
  mouse.y = prevMouse.y = -9999
})

// ── INIT ────────────────────────────────────────────────
resize()
