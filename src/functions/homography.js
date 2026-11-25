import * as THREE from 'three'

// Projeta um retângulo 3D (o ecrã do monitor) no canvas e devolve a matrix3d CSS que deforma
// um elemento HTML de w×h px para encaixar exatamente nesses 4 cantos.

const _v = new THREE.Vector3()

// quadrado unitário → quadrilátero (Heckbert). p = [TL, TR, BR, BL]
function squareToQuad([[x0, y0], [x1, y1], [x2, y2], [x3, y3]]) {
  const dx1 = x1 - x2, dx2 = x3 - x2, dx3 = x0 - x1 + x2 - x3
  const dy1 = y1 - y2, dy2 = y3 - y2, dy3 = y0 - y1 + y2 - y3
  let g = 0, h = 0
  if (Math.abs(dx3) > 1e-9 || Math.abs(dy3) > 1e-9) {
    const det = dx1 * dy2 - dx2 * dy1
    g = (dx3 * dy2 - dx2 * dy3) / det
    h = (dx1 * dy3 - dx3 * dy1) / det
  }
  return {
    a: x1 - x0 + g * x1, b: x3 - x0 + h * x3, c: x0,
    d: y1 - y0 + g * y1, e: y3 - y0 + h * y3, f: y0,
    g, h,
  }
}

/**
 * center/width/height do ecrã em metros (plano virado para +z), camera, tamanho do canvas e do elemento.
 * Devolve { css, H } ou null se o ecrã estiver atrás da câmara.
 */
export function screenHomography(center, width, height, camera, size, elW, elH) {
  camera.updateMatrixWorld()
  const [cx, cy, cz] = center
  const corners = [[-1, 1], [1, 1], [1, -1], [-1, -1]].map(([sx, sy]) => {
    _v.set(cx + (sx * width) / 2, cy + (sy * height) / 2, cz).project(camera)
    return _v.z > 1 ? null : [((_v.x + 1) / 2) * size.width, ((1 - _v.y) / 2) * size.height]
  })
  if (corners.some((c) => !c)) return null
  const m = squareToQuad(corners)
  // escala px do elemento → quadrado unitário
  const A = m.a / elW, B = m.b / elH, D = m.d / elW, E = m.e / elH, G = m.g / elW, Hh = m.h / elH
  const css = `matrix3d(${A},${D},0,${G},${B},${E},0,${Hh},0,0,1,0,${m.c},${m.f},0,1)`
  return { css, H: [A, B, m.c, D, E, m.f, G, Hh, 1] }
}

// ponto do canvas (px) → coordenadas normalizadas (0..1) dentro do ecrã
export function invertPoint(H, x, y, elW, elH) {
  const [a, b, c, d, e, f, g, h, i] = H
  // inversa da matriz 3x3
  const A = e * i - f * h, B = -(d * i - f * g), C = d * h - e * g
  const D = -(b * i - c * h), E = a * i - c * g, F = -(a * h - b * g)
  const G = b * f - c * e, Hh = -(a * f - c * d), I = a * e - b * d
  const w = C * x + F * y + I
  const u = (A * x + D * y + G) / w
  const v = (B * x + E * y + Hh) / w
  return [Math.min(1, Math.max(0, u / elW)), Math.min(1, Math.max(0, v / elH))]
}
