import { RoundedBox, useTexture } from '@react-three/drei'
import { useMemo } from 'react'
import * as THREE from 'three'
import {
  FOREARM, HERO_LZ, NECK_Y, SHIN, SHOULDER_X, SHOULDER_Y, SPINE_Y, STAND_HIP, THIGH, UPPER_ARM,
} from '../data/layout'
import { denimTexture, fabricTexture } from '../functions/textures'

const SKIN = '#7a5444' // tom amostrado da foto do currículo
const HAIR = '#16110e'

function useMaterials() {
  return useMemo(() => {
    const fabric = fabricTexture()
    const denim = denimTexture()
    return {
      skin: new THREE.MeshStandardMaterial({ color: SKIN, roughness: 0.55 }),
      hair: new THREE.MeshStandardMaterial({ color: HAIR, roughness: 1 }),
      shirt: new THREE.MeshStandardMaterial({ map: fabric, roughness: 0.85 }),
      shirtDark: new THREE.MeshStandardMaterial({ color: '#a63d1a', roughness: 0.85 }),
      denim: new THREE.MeshStandardMaterial({ map: denim, roughness: 0.9 }),
      belt: new THREE.MeshStandardMaterial({ color: '#2b1d14', roughness: 0.5 }),
      shoe: new THREE.MeshStandardMaterial({ color: '#f4f4f5', roughness: 0.55 }),
      sole: new THREE.MeshStandardMaterial({ color: '#d4d4d8', roughness: 0.8 }),
      accent: new THREE.MeshStandardMaterial({ color: '#1f3a68', roughness: 0.6 }),
      button: new THREE.MeshStandardMaterial({ color: '#3b2416', roughness: 0.4 }),
    }
  }, [])
}

// silhueta do tronco (raio, altura) — de cintura a ombros
const TORSO = [
  [0, -0.02], [0.125, -0.02], [0.13, 0.06], [0.122, 0.16], [0.128, 0.26],
  [0.148, 0.36], [0.156, 0.42], [0.14, 0.47], [0.08, 0.5], [0, 0.505],
].map(([x, y]) => new THREE.Vector2(x, y))

const HIPS = [[0, -0.09], [0.11, -0.09], [0.135, -0.02], [0.132, 0.06], [0.126, 0.09], [0, 0.09]].map(
  ([x, y]) => new THREE.Vector2(x, y),
)

function Limb({ r1, r2, len, mat, y = -len / 2 }) {
  return (
    <mesh castShadow material={mat} position={[0, y, 0]}>
      <cylinderGeometry args={[r1, r2, len, 18]} />
    </mesh>
  )
}

function Hand({ side, rig, m }) {
  const s = side === 'L' ? 1 : -1
  return (
    <group position={[0, -FOREARM, 0]} ref={(g) => (rig['hand' + side] = g)}>
      <mesh castShadow material={m.skin} position={[0, -0.005, 0]}>
        <sphereGeometry args={[0.024, 12, 12]} />
      </mesh>
      <RoundedBox castShadow args={[0.072, 0.075, 0.026]} radius={0.012} position={[0, -0.04, 0]} material={m.skin} />
      {/* dedos */}
      <group position={[0, -0.078, 0]} ref={(g) => (rig['fingers' + side] = g)}>
        {[-0.026, -0.009, 0.009, 0.026].map((x, i) => (
          <mesh key={i} castShadow material={m.skin} position={[x, -0.024 + Math.abs(x) * 0.25, 0]}>
            <capsuleGeometry args={[0.0085, 0.036 - Math.abs(x) * 0.25, 4, 8]} />
          </mesh>
        ))}
      </group>
      {/* polegar */}
      <mesh castShadow material={m.skin} position={[0.04 * s, -0.035, 0.008]} rotation={[0.2, 0, 0.7 * s]}>
        <capsuleGeometry args={[0.01, 0.03, 4, 8]} />
      </mesh>
    </group>
  )
}

function Arm({ side, rig, m }) {
  const s = side === 'L' ? 1 : -1
  return (
    <group position={[SHOULDER_X * s, SHOULDER_Y, 0]} ref={(g) => (rig['arm' + side] = g)}>
      <mesh castShadow material={m.shirt} scale={[1, 0.9, 0.9]}>
        <sphereGeometry args={[0.05, 18, 18]} />
      </mesh>
      <Limb r1={0.048} r2={0.043} len={UPPER_ARM} mat={m.shirt} />
      <group position={[0, -UPPER_ARM, 0]} ref={(g) => (rig['elbow' + side] = g)}>
        <mesh castShadow material={m.shirt}>
          <sphereGeometry args={[0.044, 16, 16]} />
        </mesh>
        <Limb r1={0.043} r2={0.036} len={FOREARM - 0.03} mat={m.shirt} y={-(FOREARM - 0.03) / 2} />
        <mesh material={m.shirtDark} position={[0, -FOREARM + 0.035, 0]}>
          <cylinderGeometry args={[0.038, 0.038, 0.025, 16]} />
        </mesh>
        <Limb r1={0.03} r2={0.027} len={0.04} mat={m.skin} y={-FOREARM + 0.015} />
        <Hand side={side} rig={rig} m={m} />
      </group>
    </group>
  )
}

function Leg({ side, rig, m }) {
  const s = side === 'L' ? 1 : -1
  return (
    <group position={[0.085 * s, 0, 0]} ref={(g) => (rig['leg' + side] = g)}>
      <mesh castShadow material={m.denim}>
        <sphereGeometry args={[0.075, 18, 18]} />
      </mesh>
      <Limb r1={0.075} r2={0.056} len={THIGH} mat={m.denim} />
      <group position={[0, -THIGH, 0]} ref={(g) => (rig['knee' + side] = g)}>
        <mesh castShadow material={m.denim}>
          <sphereGeometry args={[0.057, 16, 16]} />
        </mesh>
        <Limb r1={0.055} r2={0.046} len={SHIN} mat={m.denim} />
        {/* sapatilha */}
        <group position={[0, -SHIN, 0]} ref={(g) => (rig['ankle' + side] = g)}>
          <group position={[0, -0.04, 0.16]} ref={(g) => (rig['toe' + side] = g)} />
          <RoundedBox castShadow args={[0.095, 0.07, 0.25]} radius={0.03} position={[0, -0.03, 0.045]} material={m.shoe} />
          <RoundedBox args={[0.1, 0.022, 0.258]} radius={0.01} position={[0, -0.059, 0.045]} material={m.sole} />
          <mesh material={m.accent} position={[0.049 * s, -0.03, 0.03]} rotation={[0, (Math.PI / 2) * s, 0]}>
            <planeGeometry args={[0.12, 0.025]} />
          </mesh>
        </group>
      </group>
    </group>
  )
}

function Head({ rig, m, children }) {
  const face = useTexture('/me/face.png')
  face.colorSpace = THREE.SRGBColorSpace
  const scale = [0.9, 1.08, 1]
  return (
    <group position={[0, NECK_Y, 0]} ref={(g) => (rig.head = g)}>
      <group position={[0, 0.11, 0]} scale={scale}>
        <mesh castShadow material={m.skin}>
          <sphereGeometry args={[0.1, 40, 40]} />
        </mesh>
        {/* rosto da foto */}
        <mesh renderOrder={2}>
          <sphereGeometry args={[0.1006, 48, 48, 0.12, Math.PI - 0.24, 0.55, 1.95]} />
          <meshStandardMaterial map={face} transparent depthWrite={false} roughness={0.6} polygonOffset polygonOffsetFactor={-2} />
        </mesh>
        {/* cabelo curto */}
        <mesh castShadow material={m.hair} rotation={[-0.62, 0, 0]} renderOrder={3}>
          <sphereGeometry args={[0.1035, 40, 20, 0, Math.PI * 2, 0, 1.28]} />
        </mesh>
      </group>
      {/* orelhas */}
      {[1, -1].map((s) => (
        <mesh key={s} castShadow material={m.skin} position={[0.087 * s, 0.105, -0.005]} scale={[0.4, 1, 0.75]}>
          <sphereGeometry args={[0.026, 14, 14]} />
        </mesh>
      ))}
      {children}
    </group>
  )
}

// hidden = true quando um avatar realista (GLB) está a ser usado: este esqueleto
// continua a ser animado, mas só serve de "controlador" para o modelo realista.
export function Character({ rig, bubble, hidden = false }) {
  const m = useMaterials()
  return (
    <group ref={(g) => (rig.root = g)} position={[0, 0, HERO_LZ]}>
      <group visible={!hidden}>
      <group ref={(g) => (rig.pelvis = g)} position={[0, STAND_HIP, 0]}>
        <mesh castShadow material={m.denim} scale={[1.08, 1, 0.68]}>
          <latheGeometry args={[HIPS, 28]} />
        </mesh>
        <mesh material={m.belt} position={[0, 0.07, 0]} scale={[1.08, 1, 0.68]}>
          <cylinderGeometry args={[0.129, 0.129, 0.03, 28]} />
        </mesh>
        <Leg side="L" rig={rig} m={m} />
        <Leg side="R" rig={rig} m={m} />

        <group ref={(g) => (rig.spine = g)} position={[0, SPINE_Y, 0]}>
          <mesh castShadow material={m.shirt} scale={[1.14, 1, 0.64]}>
            <latheGeometry args={[TORSO, 32]} />
          </mesh>
          {/* gola e botões */}
          <mesh material={m.shirt} position={[0, 0.49, 0]} rotation={[Math.PI / 2, 0, 0]} scale={[1, 0.8, 1]}>
            <torusGeometry args={[0.05, 0.013, 10, 24]} />
          </mesh>
          {[0.42, 0.34, 0.26, 0.18, 0.1].map((y) => (
            <mesh key={y} material={m.button} position={[0, y, y > 0.35 ? 0.1 : 0.083]}>
              <sphereGeometry args={[0.0065, 8, 8]} />
            </mesh>
          ))}
          <mesh material={m.skin} position={[0, 0.51, 0]}>
            <cylinderGeometry args={[0.042, 0.047, 0.09, 16]} />
          </mesh>
          <Head rig={rig} m={m}>{bubble}</Head>
          <Arm side="L" rig={rig} m={m} />
          <Arm side="R" rig={rig} m={m} />
        </group>
      </group>
      </group>
    </group>
  )
}
