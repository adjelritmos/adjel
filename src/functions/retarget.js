import * as THREE from 'three'
import { STAND_HIP } from '../data/layout'

// Faz um avatar GLB realista (esqueleto Avaturn / Mixamo / Ready Player Me / Character Creator)
// seguir o esqueleto procedural que já está animado (rig).

const _v = new THREE.Vector3()
const _v2 = new THREE.Vector3()
const _q = new THREE.Quaternion()
const _qp = new THREE.Quaternion()
const _delta = new THREE.Quaternion()

// "mixamorig:LeftArm", "mixamorigLeftArm", "CC_Base_L_Upperarm" → nome canónico
const ALIASES = {
  hips: ['hips', 'pelvis', 'bip01pelvis', 'ccbasehip'],
  spine: ['spine2', 'spine02', 'chest', 'upperchest', 'spine1', 'spine', 'bip01spine2', 'bip01spine1'],
  head: ['head', 'bip01head', 'ccbasehead'],
  leftArm: ['leftarm', 'leftupperarm', 'upperarml', 'bip01lupperarm', 'ccbaselupperarm'],
  leftForeArm: ['leftforearm', 'leftlowerarm', 'lowerarml', 'bip01lforearm', 'ccbaselforearm'],
  leftHand: ['lefthand', 'handl', 'bip01lhand', 'ccbaselhand'],
  rightArm: ['rightarm', 'rightupperarm', 'upperarmr', 'bip01rupperarm', 'ccbaserupperarm'],
  rightForeArm: ['rightforearm', 'rightlowerarm', 'lowerarmr', 'bip01rforearm', 'ccbaserforearm'],
  rightHand: ['righthand', 'handr', 'bip01rhand', 'ccbaserhand'],
  leftUpLeg: ['leftupleg', 'leftupperleg', 'thighl', 'bip01lthigh', 'ccbaselthigh'],
  leftLeg: ['leftleg', 'leftlowerleg', 'calfl', 'shinl', 'bip01lcalf', 'ccbaselcalf'],
  leftFoot: ['leftfoot', 'footl', 'bip01lfoot', 'ccbaselfoot'],
  rightUpLeg: ['rightupleg', 'rightupperleg', 'thighr', 'bip01rthigh', 'ccbaserthigh'],
  rightLeg: ['rightleg', 'rightlowerleg', 'calfr', 'shinr', 'bip01rcalf', 'ccbasercalf'],
  rightFoot: ['rightfoot', 'footr', 'bip01rfoot', 'ccbaserfoot'],
}

const norm = (n) => n.toLowerCase().replace(/^mixamorig\d*/, '').replace(/[^a-z0-9]/g, '')

export function findBones(model) {
  const byName = {}
  model.traverse((o) => {
    if (o.isBone) byName[norm(o.name)] = o
  })
  const bones = {}
  for (const [key, names] of Object.entries(ALIASES)) {
    const hit = names.find((n) => byName[n])
    if (hit) bones[key] = byName[hit]
  }
  return bones
}

// filho principal de um osso (para saber a direção do osso)
function mainChild(bone) {
  const kids = bone.children.filter((c) => c.isBone)
  const pick = (k) => kids.find((c) => norm(c.name).includes(k))
  return pick('middle') || pick('finger2') || pick('index') || kids[0] || null
}

const DOWN = new THREE.Vector3(0, -1, 0)
const _m1 = new THREE.Matrix4()
const _m2 = new THREE.Matrix4()
const _x = new THREE.Vector3()
const _y = new THREE.Vector3()
const _z = new THREE.Vector3()
const _palm = new THREE.Vector3()
const _dir = new THREE.Vector3()
const _axis = new THREE.Vector3()

// cadeias de dedos de uma mão: [[seg1, seg2, seg3], ...] e qual é o polegar
function fingerChains(hand) {
  const chains = []
  for (const root of hand.children.filter((c) => c.isBone)) {
    const chain = []
    let b = root
    while (b) {
      chain.push(b)
      b = b.children.find((c) => c.isBone) || null
    }
    const n = norm(root.name)
    chains.push({ chain, thumb: n.includes('thumb') || n.includes('finger0') })
  }
  return chains
}

// Guarda a pose de repouso. O modelo tem de estar na origem, sem rotação, a olhar para +z.
export function calibrate(model, bones, { headWidth = 1 } = {}) {
  model.updateMatrixWorld(true)
  const cal = {}
  for (const [key, bone] of Object.entries(bones)) {
    const restWorldQ = bone.getWorldQuaternion(new THREE.Quaternion())
    const child = mainChild(bone)
    let restDir = null
    if (child) {
      restDir = child.getWorldPosition(new THREE.Vector3()).sub(bone.getWorldPosition(new THREE.Vector3())).normalize()
    }
    cal[key] = { restWorldQ, restDir, restLocalQ: bone.quaternion.clone(), child }
  }
  for (const side of ['left', 'right']) {
    const hand = bones[side + 'Hand']
    if (!hand) continue
    const chains = fingerChains(hand)
    cal[side + 'Fingers'] = chains.map((f) => ({ ...f, rest: f.chain.map((b) => b.quaternion.clone()) }))
    // normal real da palma em repouso: direção da mão × (indicador − mindinho)
    const find = (...keys) => chains.find((f) => keys.some((k) => norm(f.chain[0].name).includes(k)))?.chain[0]
    const index = find('index', 'finger1')
    const pinky = find('pinky', 'little', 'finger4', 'finger3')
    const dir = cal[side + 'Hand'].restDir
    if (index && pinky && dir) {
      const across = index.getWorldPosition(new THREE.Vector3()).sub(pinky.getWorldPosition(new THREE.Vector3()))
      const palm = side === 'left' ? new THREE.Vector3().crossVectors(dir, across) : new THREE.Vector3().crossVectors(across, dir)
      palm.normalize()
      cal[side + 'Hand'].restPalm = palm
      if (cal[side + 'ForeArm']) cal[side + 'ForeArm'].restPalm = palm
    }
  }
  // rosto mais fino: escala a cabeça no eixo local que corresponde à largura (x do mundo)
  if (bones.head && headWidth !== 1) {
    const inv = cal.head.restWorldQ.clone().invert()
    const wx = new THREE.Vector3(1, 0, 0).applyQuaternion(inv)
    const a = [Math.abs(wx.x), Math.abs(wx.y), Math.abs(wx.z)]
    const k = a.indexOf(Math.max(...a))
    const sc = [1, 1, 1]
    sc[k] = headWidth
    bones.head.scale.set(...sc)
  }
  const hipsY = bones.hips ? bones.hips.getWorldPosition(new THREE.Vector3()).y : STAND_HIP
  cal.hipScale = hipsY / STAND_HIP
  return cal
}

function setWorldQuat(bone, worldQ) {
  bone.parent.getWorldQuaternion(_qp)
  bone.quaternion.copy(_qp.invert().multiply(worldQ))
  bone.updateMatrixWorld(true)
}

// copia a orientação de um grupo do controlador
function copyOrientation(bone, c, driver) {
  if (!bone || !driver) return
  driver.getWorldQuaternion(_q)
  setWorldQuat(bone, _q.multiply(c.restWorldQ))
}

// aponta o osso na direção (de → para) do controlador
function aim(bone, c, from, to) {
  if (!bone || !c?.restDir || !from || !to) return
  from.getWorldPosition(_v)
  to.getWorldPosition(_v2)
  const dir = _v2.sub(_v).normalize()
  _delta.setFromUnitVectors(c.restDir, dir)
  setWorldQuat(bone, _q.copy(_delta).multiply(c.restWorldQ))
}

// base ortonormal a partir de direção + "palma" (normal)
function basis(m, dir, palm) {
  _x.copy(dir).normalize()
  _z.crossVectors(_x, palm).normalize()
  _y.crossVectors(_z, _x)
  return m.makeBasis(_x, _y, _z)
}

// orienta o osso: direção do controlador E rotação da palma (evita mãos "de lado")
function orient(bone, c, from, to, palmWorld) {
  if (!bone || !c?.restDir || !from || !to) return
  from.getWorldPosition(_v)
  to.getWorldPosition(_v2)
  _dir.subVectors(_v2, _v).normalize()
  basis(_m1, _dir, palmWorld)
  basis(_m2, c.restDir, c.restPalm || DOWN) // palma real do modelo em repouso
  _m1.multiply(_m2.transpose())
  _q.setFromRotationMatrix(_m1).multiply(c.restWorldQ)
  setWorldQuat(bone, _q)
}

// dobra os dedos em direção à palma
function curlFingers(chains, palmWorld, dirWorld, amount) {
  if (!chains) return
  _axis.crossVectors(dirWorld, palmWorld).normalize()
  for (const f of chains) {
    const ang = amount * (f.thumb ? 0.25 : 0.55)
    f.chain.forEach((b, i) => {
      b.quaternion.copy(f.rest[i])
      b.updateMatrixWorld(true)
      b.getWorldQuaternion(_q)
      _delta.setFromAxisAngle(_axis, ang)
      setWorldQuat(b, _delta.multiply(_q))
    })
  }
}

// palma do controlador = -z do grupo da mão procedural
function palmOf(group, out) {
  group.getWorldQuaternion(_q)
  return out.set(0, 0, -1).applyQuaternion(_q)
}

export function retarget(rig, bones, cal, out) {
  if (!rig.root || !bones.hips) return
  rig.swivel?.updateMatrixWorld(true)

  // anca: posição e orientação
  const hips = bones.hips
  rig.pelvis.getWorldPosition(_v)
  _v.y *= cal.hipScale
  hips.parent.updateWorldMatrix(true, false)
  hips.position.copy(hips.parent.worldToLocal(_v.clone()))
  copyOrientation(hips, cal.hips, rig.pelvis)

  copyOrientation(bones.spine, cal.spine, rig.spine)
  copyOrientation(bones.head, cal.head, rig.head)

  for (const s of ['L', 'R']) {
    const side = s === 'L' ? 'left' : 'right'
    const palm = palmOf(rig['hand' + s], _palm)
    aim(bones[side + 'Arm'], cal[side + 'Arm'], rig['arm' + s], rig['elbow' + s])
    orient(bones[side + 'ForeArm'], cal[side + 'ForeArm'], rig['elbow' + s], rig['hand' + s], palm)
    orient(bones[side + 'Hand'], cal[side + 'Hand'], rig['hand' + s], rig['fingers' + s], palm)
    rig['hand' + s].getWorldPosition(_v)
    rig['fingers' + s].getWorldPosition(_v2)
    curlFingers(cal[side + 'Fingers'], palm, _v2.sub(_v).normalize(), rig['fingers' + s].rotation.x)
    aim(bones[side + 'UpLeg'], cal[side + 'UpLeg'], rig['leg' + s], rig['knee' + s])
    aim(bones[side + 'Leg'], cal[side + 'Leg'], rig['knee' + s], rig['ankle' + s])
    aim(bones[side + 'Foot'], cal[side + 'Foot'], rig['ankle' + s], rig['toe' + s])
  }

  // centro real da palma direita do avatar (o rato segue-a)
  if (out && bones.rightHand && cal.rightHand.child) {
    bones.rightHand.getWorldPosition(_v)
    cal.rightHand.child.getWorldPosition(_v2)
    out.palmR = (out.palmR || new THREE.Vector3()).lerpVectors(_v, _v2, 0.6)
  }
}

// o ficheiro existe mesmo? (o Vite devolve index.html para caminhos inexistentes)
export async function avatarExists(url) {
  try {
    const r = await fetch(url, { method: 'HEAD' })
    const type = r.headers.get('content-type') || ''
    return r.ok && !type.includes('text/html')
  } catch {
    return false
  }
}
