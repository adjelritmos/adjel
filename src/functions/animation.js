import {
  CHAIR, KEYBOARD, MOUSE, SCREEN, T,
  HERO_LZ, STAND_LZ, SEAT_LZ, STAND_HIP, SEAT_HIP, SHOULDER_X, SHOULDER_Y, SPINE_Y, UPPER_ARM, FOREARM, HAND,
  interaction,
} from '../data/layout'

const PI = Math.PI

// ---------- utilitários ----------
export const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v))
export const lerp = (a, b, t) => a + (b - a) * t
export const seg = (t, [a, b]) => clamp((t - a) / (b - a))
export const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)
export const easeSine = (t) => -(Math.cos(PI * t) - 1) / 2
const mix3 = (a, b, t) => [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)]

// ---------- IK de 2 segmentos para o braço ----------
// (dx, dy, dz) = alvo relativo ao ombro, no referencial do tronco (personagem olha para +z)
export function armIK(dx, dy, dz) {
  const L1 = UPPER_ARM
  const L2 = FOREARM + HAND
  const D = clamp(Math.hypot(dx, dy, dz), 0.08, L1 + L2 - 0.002)
  const g = Math.asin(clamp(dx / D, -0.9, 0.9))
  const phi = Math.atan2(dz, -dy) // ângulo desde "para baixo" até "para a frente"
  const alpha = Math.acos(clamp((L1 * L1 + D * D - L2 * L2) / (2 * L1 * D), -1, 1))
  const beta = Math.acos(clamp((L1 * L1 + L2 * L2 - D * D) / (2 * L1 * L2), -1, 1))
  return { arm: [-(phi - alpha), 0, g], elbow: [-(PI - beta), 0, 0] }
}

// converte um ponto do mundo para o referencial do tronco (já sentado e virado para a mesa)
function worldToSpine([wx, wy, wz], P) {
  const c = Math.cos(P.swivel)
  const s = Math.sin(P.swivel)
  const ox = wx - CHAIR[0]
  const oz = wz - CHAIR[2]
  // inversa da rotação Y do grupo giratório
  const lx = c * ox - s * oz - P.x
  const lz = s * ox + c * oz - P.z
  const ly = wy - (P.hipY + SPINE_Y)
  const p = P.pitch
  return [lx, ly * Math.cos(p) + lz * Math.sin(p), -ly * Math.sin(p) + lz * Math.cos(p)]
}

function reachTo(world, side, P) {
  const [x, y, z] = worldToSpine(world, P)
  const sx = side === 'L' ? SHOULDER_X : -SHOULDER_X
  return armIK(x - sx, y - SHOULDER_Y, z)
}

// ---------- rato / teclado ----------
export function mouseWorld(now) {
  const dt = now - interaction.clickAt
  const dip = dt >= 0 && dt < 0.18 ? Math.sin((dt / 0.18) * PI) : 0
  return {
    pos: [MOUSE[0] + (interaction.u - 0.5) * 0.12, MOUSE[1], MOUSE[2] + (interaction.v - 0.5) * 0.08],
    dip,
  }
}

// ---------- poses ----------
const REST = { armL: [0, 0, 0.08], armR: [0, 0, -0.08], elbowL: [-0.15, 0, 0], elbowR: [-0.15, 0, 0] }
const SEAT_REST = { armL: [-0.45, 0, 0.12], armR: [-0.45, 0, -0.12], elbowL: [-0.9, 0, 0], elbowR: [-0.9, 0, 0] }
const INVITE = { armR: [0, -0.55, -1.3], elbowR: [-0.25, 0, 0] }

function basePose() {
  return {
    x: 0, z: HERO_LZ, rotY: 0, hipY: STAND_HIP, pitch: 0, yaw: 0,
    headYaw: 0, headPitch: 0, headRoll: 0,
    armL: [...REST.armL], armR: [...REST.armR], elbowL: [...REST.elbowL], elbowR: [...REST.elbowR],
    thighL: 0, thighR: 0, kneeL: 0, kneeR: 0, swivel: 0,
    handL: 0, handR: 0, curlL: 0.35, curlR: 0.35,
    // rotação da palma: +π/2 / -π/2 = virada para o corpo, π = para a frente, 0 = para baixo (no rato)
    palmL: PI / 2, palmR: -PI / 2,
  }
}

const wave = (time) => ({
  armR: [-0.15, 0, -2.25],
  elbowR: [0, 0, -0.75 + Math.sin(time * 9) * 0.42],
})

/**
 * Calcula a pose do personagem.
 * phase: 'hero' | 'intro' | 'working'; t = segundos desde "Conhecer"; time = relógio global (s)
 */
export function computePose(phase, t, time, now) {
  const P = basePose()
  const breathe = Math.sin(time * 1.6) * 0.012

  if (phase === 'hero') {
    const w = wave(time)
    P.curlR = 0.05
    P.palmR = -PI // palma para a frente ao acenar
    P.armR = w.armR
    P.elbowR = w.elbowR
    P.pitch = breathe
    P.headRoll = Math.sin(time * 1.2) * 0.02
    P.hipY += Math.sin(time * 1.6) * 0.004
    return P
  }
  if (phase === 'working') t = Math.max(t, T.end)

  // 1) convite: aponta para o escritório
  const inIn = ease(seg(t, [0.1, 0.7]))
  const inOut = ease(seg(t, [1.5, 2.0]))
  const w = wave(time)
  P.armR = mix3(mix3(w.armR, INVITE.armR, inIn), REST.armR, inOut)
  P.elbowR = mix3(mix3(w.elbowR, INVITE.elbowR, inIn), REST.elbowR, inOut)
  P.palmR = lerp(-PI, -PI / 2, inOut)
  P.curlR = lerp(0.05, 0.35, inOut)
  P.headYaw = -0.7 * inIn * (1 - inOut)
  P.yaw = -0.2 * inIn * (1 - inOut)

  // 2) vira-se para o escritório
  P.rotY = PI * ease(seg(t, T.turn1))

  // 3) caminha até à cadeira
  const wp = seg(t, T.walk)
  P.z = lerp(HERO_LZ, STAND_LZ, easeSine(wp))
  if (wp > 0 && wp < 1) {
    const amp = Math.min(1, wp * 6, (1 - wp) * 6)
    const g = wp * PI * 2 * 2.5
    const sn = Math.sin(g)
    P.thighL = -sn * 0.5 * amp
    P.thighR = sn * 0.5 * amp
    P.kneeL = Math.max(0, -Math.cos(g)) * 0.7 * amp
    P.kneeR = Math.max(0, Math.cos(g)) * 0.7 * amp
    P.armL = [sn * 0.35 * amp, 0, 0.08]
    P.armR = [-sn * 0.35 * amp, 0, -0.08]
    P.elbowL = [-0.3, 0, 0]
    P.elbowR = [-0.3, 0, 0]
    P.hipY += (Math.abs(Math.cos(g)) * 0.03 - 0.015) * amp
  }

  // 4) vira-se de costas para a cadeira
  P.rotY += PI * ease(seg(t, T.turn2))

  // 5) senta-se
  const s = ease(seg(t, T.sit))
  if (s > 0) {
    P.hipY = lerp(STAND_HIP, SEAT_HIP, s)
    P.z = lerp(STAND_LZ, SEAT_LZ, s)
    P.thighL = P.thighR = (-PI / 2) * s
    P.kneeL = P.kneeR = (PI / 2 + 0.05) * s
    P.pitch = Math.sin(s * PI) * 0.45 + 0.12 * s
    P.armL = mix3(REST.armL, SEAT_REST.armL, s)
    P.armR = mix3(REST.armR, SEAT_REST.armR, s)
    P.elbowL = mix3(REST.elbowL, SEAT_REST.elbowL, s)
    P.elbowR = mix3(REST.elbowR, SEAT_REST.elbowR, s)
    P.palmL = lerp(PI / 2, 0, s)
    P.palmR = lerp(-PI / 2, 0, s)
  }

  // 6) gira a cadeira para o computador
  const sw = ease(seg(t, T.swivel))
  P.swivel = PI * sw
  P.headYaw += Math.sin(sw * PI) * 0.35 // olha para o visitante durante a rotação

  // 7) mãos no rato e no teclado
  const r = ease(seg(t, T.reach))
  if (r > 0) {
    const m = mouseWorld(now)
    const fx = interaction.palmFix
    const mouseT = [m.pos[0] + fx[0], m.pos[1] + 0.035 + fx[1] - m.dip * 0.008, m.pos[2] + 0.025 + fx[2]]
    const tap = Math.sin(time * 0.8) > 0.2 ? Math.max(0, Math.sin(time * 16)) * 0.012 : 0
    const keyT = [KEYBOARD[0] - 0.08, KEYBOARD[1] + 0.03 + tap, KEYBOARD[2] + 0.02]
    const R = reachTo(mouseT, 'R', P)
    const L = reachTo(keyT, 'L', P)
    P.armR = mix3(P.armR, R.arm, r)
    P.elbowR = mix3(P.elbowR, R.elbow, r)
    P.armL = mix3(P.armL, L.arm, r)
    P.elbowL = mix3(P.elbowL, L.elbow, r)
    // pulso: palma paralela à mesa
    const flat = (arm, elbow) => clamp(-PI / 2 - (P.pitch + arm[0] + elbow[0]), -0.7, 0.7)
    P.handR = (flat(P.armR, P.elbowR) + 0.14) * r // pulso ligeiramente para baixo: dedos sobre o rato
    P.handL = flat(P.armL, P.elbowL) * r
    P.curlR = lerp(0.35, 0.75 + m.dip * 0.3, r)
    P.curlL = lerp(0.35, 0.55, r)
    P.palmR = lerp(P.palmR, 0, r)
    P.palmL = lerp(P.palmL, 0, r)

    // cabeça segue o cursor no ecrã
    P.headYaw = lerp(P.headYaw, -(interaction.u - 0.5) * 0.45, r)
    P.headPitch = lerp(0, 0.05 + (interaction.v - 0.5) * 0.25, r)
    P.pitch += breathe * r
  }
  return P
}

export function applyPose(rig, P) {
  if (!rig.root) return
  rig.root.position.set(P.x, 0, P.z)
  rig.root.rotation.y = P.rotY
  rig.pelvis.position.y = P.hipY
  rig.spine.rotation.set(P.pitch, P.yaw, 0)
  rig.head.rotation.set(P.headPitch, P.headYaw, P.headRoll)
  rig.armL.rotation.set(...P.armL)
  rig.armR.rotation.set(...P.armR)
  rig.elbowL.rotation.set(...P.elbowL)
  rig.elbowR.rotation.set(...P.elbowR)
  rig.legL.rotation.x = P.thighL
  rig.legR.rotation.x = P.thighR
  rig.kneeL.rotation.x = P.kneeL
  rig.kneeR.rotation.x = P.kneeR
  rig.handL.rotation.set(P.handL, P.palmL, 0)
  rig.handR.rotation.set(P.handR, P.palmR, 0)
  rig.fingersL.rotation.x = P.curlL
  rig.fingersR.rotation.x = P.curlR
  if (rig.swivel) rig.swivel.rotation.y = P.swivel
}

// ---------- câmara ----------
const TAN = Math.tan((50 / 2) * (PI / 180))

export function cameraGoal(phase, t, aspect, pointer, zoom) {
  const shift = aspect > 1.1 ? -0.8 : 0
  const kh = aspect < 1 ? Math.min(1.8, 1.05 / aspect) : 1
  const hero = {
    pos: [shift + pointer.x * 0.25, 1.35 + pointer.y * 0.1, 1.2 + 3.0 * kh],
    look: [shift, aspect < 1 ? 0.7 : 0.92, 1.0],
  }

  const look = [0.02, 0.98, -1.5]
  const kf = aspect < 1.3 ? Math.min(2, 1.3 / aspect) : 1
  const final = {
    pos: [look[0] + 0.5 * kf, look[1] + 0.66 * kf, look[2] + 1.55 * kf],
    look,
  }
  if (zoom && phase === 'working') {
    const d = Math.max(0.78, (SCREEN.w * 0.56) / (TAN * aspect), (SCREEN.h * 0.56) / TAN)
    return { pos: [SCREEN.pos[0], SCREEN.pos[1], SCREEN.pos[2] + d], look: SCREEN.pos }
  }
  if (phase === 'hero') return hero
  if (phase === 'working') return final
  // ponto intermédio: observa-o a andar e a sentar, depois vai para trás do ombro
  const mid = { pos: [1.1 * kf, 1.55, 1.2 + 1.3 * kh], look: [0, 0.85, -0.5] }
  const a = ease(seg(t, [1.8, 4.6]))
  const b = ease(seg(t, [5.0, 6.9]))
  return {
    pos: mix3(mix3(hero.pos, mid.pos, a), final.pos, b),
    look: mix3(mix3(hero.look, mid.look, a), final.look, b),
  }
}

// ---------- balão de fala ----------
// devolve o id do balão a mostrar (os textos/ícones estão em components/SpeechBubble.jsx)
export function bubbleText(phase, t) {
  if (phase === 'hero') return 'hello'
  if (phase === 'intro' && t < 2.0) return 'invite'
  if (phase === 'intro' && t > 5.3 && t < 6.6) return 'click'
  return null
}
