// Medidas reais da cena em metros. O personagem olha para +z por defeito.
export const HEIGHT = 1.63 // altura do Adjel

export const CHAIR = [0, 0, -0.56]
export const SEAT_TOP = 0.38
export const DESK = { z: -1.3, top: 0.72, width: 1.6, depth: 0.7 }
export const SCREEN = { w: 0.96, h: 0.54, pos: [0, 1.1, -1.535] }
export const KEYBOARD = [-0.12, DESK.top + 0.009, -1.13]
export const MOUSE = [0.3, DESK.top + 0.001, -1.12]

// posições locais do personagem dentro do grupo giratório da cadeira
export const HERO_LZ = 1.7 // de pé, à frente do escritório (mundo z = 1.2)
export const STAND_LZ = 0.4 // em frente à cadeira
export const SEAT_LZ = 0.05 // sentado

// proporções corporais (somam 1.63 m)
export const THIGH = 0.38
export const SHIN = 0.38
export const FOOT_H = 0.07
export const STAND_HIP = THIGH + SHIN + FOOT_H // 0.83
export const SEAT_HIP = SHIN + FOOT_H // 0.45
export const SPINE_Y = 0.05 // pivô do tronco acima da anca
export const SHOULDER_Y = 0.46 // ombro dentro do tronco
export const SHOULDER_X = 0.17
export const NECK_Y = 0.53 // base da cabeça dentro do tronco
export const UPPER_ARM = 0.28
export const FOREARM = 0.25
export const HAND = 0.05 // pulso → centro da palma

// linha do tempo da animação "Conhecer" (segundos)
export const T = {
  turn1: [1.7, 2.2],
  walk: [2.2, 3.7],
  turn2: [3.7, 4.2],
  sit: [4.2, 5.1],
  swivel: [5.1, 6.4],
  reach: [6.3, 7.1],
  end: 7.2,
}

// estado partilhado entre o ecrã HTML e a cena 3D (sem re-render)
// palmFix: correção automática (x, y, z) para a palma do avatar pousar no rato
export const interaction = { u: 0.5, v: 0.5, clickAt: -10, palmFix: [0, 0, 0] }
