import * as THREE from 'three'

// Texturas geradas em canvas (sem ficheiros externos). Cada uma é criada uma única vez.
const cache = {}

function make(key, w, h, draw, { repeat = [1, 1], color = true } = {}) {
  if (cache[key]) return cache[key]
  const c = document.createElement('canvas')
  c.width = w
  c.height = h
  const g = c.getContext('2d')
  draw(g, w, h)
  const t = new THREE.CanvasTexture(c)
  if (color) t.colorSpace = THREE.SRGBColorSpace
  t.wrapS = t.wrapT = THREE.RepeatWrapping
  t.repeat.set(...repeat)
  t.anisotropy = 8
  cache[key] = t
  return t
}

let seed = 1
const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647)

function noise(g, w, h, alpha = 0.06, n = 6000) {
  for (let i = 0; i < n; i++) {
    const v = rnd() > 0.5 ? 255 : 0
    g.fillStyle = `rgba(${v},${v},${v},${alpha * rnd()})`
    g.fillRect(rnd() * w, rnd() * h, 1 + rnd() * 2, 1 + rnd() * 2)
  }
}

function grain(g, x, y, w, h, base, dark) {
  g.fillStyle = base
  g.fillRect(x, y, w, h)
  for (let i = 0; i < 70; i++) {
    const yy = y + rnd() * h
    g.strokeStyle = dark.replace('A', (0.05 + rnd() * 0.14).toFixed(2))
    g.lineWidth = 0.6 + rnd() * 2
    g.beginPath()
    g.moveTo(x, yy)
    for (let xx = x; xx <= x + w; xx += 24) g.lineTo(xx, yy + Math.sin(xx * 0.012 + i) * 3 + (rnd() - 0.5) * 1.5)
    g.stroke()
  }
}

// tampo da secretária: carvalho
export const woodTexture = () =>
  make('wood', 1024, 512, (g, w, h) => {
    seed = 11
    grain(g, 0, 0, w, h, '#b07a4f', 'rgba(70,40,20,A)')
    noise(g, w, h, 0.05)
  })

// soalho de tábuas
export const floorTexture = () =>
  make(
    'floor',
    1024,
    1024,
    (g, w, h) => {
      seed = 5
      const rows = 8
      const ph = h / rows
      const tones = ['#9a6b45', '#8d5f3c', '#a47550', '#946540', '#87593a']
      for (let r = 0; r < rows; r++) {
        let x = -rnd() * 400
        while (x < w) {
          const len = 300 + rnd() * 400
          grain(g, x, r * ph, len, ph, tones[Math.floor(rnd() * tones.length)], 'rgba(60,35,18,A)')
          g.fillStyle = 'rgba(30,18,8,0.55)'
          g.fillRect(x, r * ph, 2, ph)
          x += len
        }
        g.fillStyle = 'rgba(30,18,8,0.6)'
        g.fillRect(0, r * ph, w, 2)
      }
      noise(g, w, h, 0.05, 12000)
    },
    { repeat: [3, 3] },
  )

// parede com textura de estuque
export const wallTexture = () =>
  make(
    'wall',
    512,
    512,
    (g, w, h) => {
      seed = 3
      g.fillStyle = '#e6e0d6'
      g.fillRect(0, 0, w, h)
      noise(g, w, h, 0.05, 20000)
    },
    { repeat: [4, 2] },
  )

// tecido africano (inspirado na camisa da foto do currículo)
export const fabricTexture = () =>
  make(
    'fabric',
    512,
    512,
    (g, w, h) => {
      seed = 21
      const cell = 64
      g.fillStyle = '#e9dcc4'
      g.fillRect(0, 0, w, h)
      for (let y = 0; y < h; y += cell) {
        for (let x = 0; x < w; x += cell) {
          const cx = x + cell / 2
          const cy = y + cell / 2
          // listas diagonais laranja
          g.save()
          g.translate(cx, cy)
          g.rotate(Math.PI / 4)
          g.fillStyle = '#d9622b'
          g.fillRect(-cell * 0.7, -6, cell * 1.4, 12)
          g.fillStyle = '#a63d1a'
          g.fillRect(-cell * 0.7, 6, cell * 1.4, 3)
          g.restore()
          // losango azul com centro branco
          g.save()
          g.translate(x, y)
          g.rotate(Math.PI / 4)
          g.fillStyle = '#1f3a68'
          g.fillRect(-13, -13, 26, 26)
          g.fillStyle = '#f5f1e6'
          g.fillRect(-8, -8, 16, 16)
          g.fillStyle = '#3d6aa8'
          g.fillRect(-4, -4, 8, 8)
          g.restore()
          // pontos castanhos
          g.fillStyle = '#5a3420'
          g.beginPath()
          g.arc(cx + 18, cy - 18, 3, 0, Math.PI * 2)
          g.arc(cx - 18, cy + 18, 3, 0, Math.PI * 2)
          g.fill()
        }
      }
      noise(g, w, h, 0.08, 15000)
    },
    { repeat: [2, 2] },
  )

// calças de ganga
export const denimTexture = () =>
  make(
    'denim',
    256,
    256,
    (g, w, h) => {
      seed = 9
      g.fillStyle = '#2c3a55'
      g.fillRect(0, 0, w, h)
      for (let i = -h; i < w; i += 3) {
        g.strokeStyle = `rgba(255,255,255,${0.03 + rnd() * 0.05})`
        g.beginPath()
        g.moveTo(i, 0)
        g.lineTo(i + h, h)
        g.stroke()
      }
      noise(g, w, h, 0.12, 5000)
    },
    { repeat: [2, 2] },
  )

// malha da cadeira
export const meshFabricTexture = () =>
  make(
    'meshfabric',
    128,
    128,
    (g, w, h) => {
      g.fillStyle = '#1f2937'
      g.fillRect(0, 0, w, h)
      g.fillStyle = '#111827'
      for (let y = 0; y < h; y += 4) for (let x = (y / 4) % 2 ? 2 : 0; x < w; x += 4) g.fillRect(x, y, 2, 2)
    },
    { repeat: [6, 6] },
  )

// tapete
export const rugTexture = () =>
  make('rug', 512, 512, (g, w, h) => {
    seed = 31
    g.fillStyle = '#2f3e52'
    g.fillRect(0, 0, w, h)
    g.strokeStyle = '#c9b48a'
    g.lineWidth = 6
    for (let r = 230; r > 60; r -= 40) {
      g.beginPath()
      g.arc(w / 2, h / 2, r, 0, Math.PI * 2)
      g.stroke()
    }
    noise(g, w, h, 0.15, 30000)
  })

// ecrã em espera (linhas de código)
export const codeTexture = () =>
  make(
    'code',
    1024,
    576,
    (g, w, h) => {
      seed = 7
      g.fillStyle = '#0b1020'
      g.fillRect(0, 0, w, h)
      g.fillStyle = '#111832'
      g.fillRect(0, 0, 180, h)
      const colors = ['#7dd3fc', '#c084fc', '#86efac', '#fda4af', '#fde68a', '#94a3b8']
      for (let i = 0; i < 26; i++) {
        let x = 210 + Math.floor(rnd() * 4) * 28
        const parts = 1 + Math.floor(rnd() * 4)
        for (let p = 0; p < parts; p++) {
          const len = 30 + rnd() * 140
          g.fillStyle = colors[Math.floor(rnd() * colors.length)]
          g.fillRect(x, 30 + i * 20, len, 9)
          x += len + 14
        }
      }
      for (let i = 0; i < 14; i++) {
        g.fillStyle = '#334155'
        g.fillRect(24, 30 + i * 28, 80 + rnd() * 60, 9)
      }
    },
    { repeat: [1, 1] },
  )

// céu da janela
export const skyTexture = () =>
  make('sky', 256, 256, (g, w, h) => {
    const grd = g.createLinearGradient(0, 0, 0, h)
    grd.addColorStop(0, '#5aa9e6')
    grd.addColorStop(0.6, '#bfe3ff')
    grd.addColorStop(1, '#fde7c8')
    g.fillStyle = grd
    g.fillRect(0, 0, w, h)
    g.fillStyle = 'rgba(255,255,255,0.8)'
    ;[[60, 70, 30], [90, 65, 22], [180, 110, 26], [205, 105, 18]].forEach(([x, y, r]) => {
      g.beginPath()
      g.arc(x, y, r, 0, Math.PI * 2)
      g.fill()
    })
    g.fillStyle = '#6b8f71'
    g.fillRect(0, h * 0.82, w, h * 0.18)
  })
