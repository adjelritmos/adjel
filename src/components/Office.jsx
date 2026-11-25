import { RoundedBox, useTexture } from '@react-three/drei'
import { useLayoutEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { CHAIR, DESK, KEYBOARD, MOUSE, SCREEN, SEAT_TOP } from '../data/layout'
import {
  codeTexture, floorTexture, meshFabricTexture, rugTexture, skyTexture, wallTexture, woodTexture,
} from '../functions/textures'

const WALL_Z = -1.95
const metal = { color: '#2a2a2e', metalness: 0.85, roughness: 0.3 }
const alu = { color: '#c7c9cc', metalness: 0.9, roughness: 0.25 }

function Keyboard() {
  const ref = useRef()
  const keys = useMemo(() => {
    const out = []
    for (let r = 0; r < 5; r++) {
      for (let c = 0; c < 15; c++) {
        if (r === 4 && c > 3 && c < 11) continue
        out.push([-0.196 + c * 0.028, 0.012, -0.05 + r * 0.025])
      }
    }
    out.push([0.0, 0.012, 0.05]) // barra de espaço
    return out
  }, [])
  useLayoutEffect(() => {
    const o = new THREE.Object3D()
    keys.forEach((p, i) => {
      o.position.set(...p)
      o.scale.set(i === keys.length - 1 ? 7.5 : 1, 1, 1)
      o.updateMatrix()
      ref.current.setMatrixAt(i, o.matrix)
    })
    ref.current.instanceMatrix.needsUpdate = true
  }, [keys])
  return (
    <group position={KEYBOARD}>
      <RoundedBox castShadow receiveShadow args={[0.44, 0.016, 0.14]} radius={0.006}>
        <meshStandardMaterial color="#d4d4d8" metalness={0.6} roughness={0.35} />
      </RoundedBox>
      <instancedMesh ref={ref} args={[null, null, keys.length]} castShadow>
        <boxGeometry args={[0.024, 0.008, 0.021]} />
        <meshStandardMaterial color="#f4f4f5" roughness={0.5} />
      </instancedMesh>
    </group>
  )
}

function Mouse({ mouseRef, mouseBtnRef }) {
  return (
    <>
      <RoundedBox receiveShadow args={[0.26, 0.004, 0.21]} radius={0.002} position={[MOUSE[0], DESK.top + 0.002, MOUSE[2]]}>
        <meshStandardMaterial color="#18181b" roughness={0.95} />
      </RoundedBox>
      <group ref={mouseRef} position={MOUSE}>
        <mesh castShadow scale={[0.031, 0.018, 0.054]} position={[0, 0.004, 0]}>
          <sphereGeometry args={[1, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial color="#e4e4e7" roughness={0.3} />
        </mesh>
        <mesh scale={[0.031, 0.054, 1]} position={[0, 0.004, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[1, 24]} />
          <meshStandardMaterial color="#71717a" />
        </mesh>
        <mesh position={[0, 0.0215, -0.022]} rotation={[-0.25, 0, 0]}>
          <boxGeometry args={[0.0015, 0.002, 0.03]} />
          <meshStandardMaterial ref={mouseBtnRef} color="#52525b" emissive="#22d3ee" emissiveIntensity={0} />
        </mesh>
      </group>
    </>
  )
}

function Monitor({ showIdleScreen }) {
  const tex = codeTexture()
  return (
    <group>
      <RoundedBox castShadow args={[0.26, 0.012, 0.18]} radius={0.005} position={[0, DESK.top + 0.006, -1.58]}>
        <meshStandardMaterial {...alu} />
      </RoundedBox>
      <RoundedBox castShadow args={[0.05, 0.3, 0.02]} radius={0.008} position={[0, DESK.top + 0.15, -1.61]} rotation={[-0.08, 0, 0]}>
        <meshStandardMaterial {...alu} />
      </RoundedBox>
      <RoundedBox castShadow args={[SCREEN.w + 0.02, SCREEN.h + 0.02, 0.018]} radius={0.006} position={[0, SCREEN.pos[1], -1.547]}>
        <meshStandardMaterial color="#0a0a0c" metalness={0.4} roughness={0.35} />
      </RoundedBox>
      <mesh position={[0, SCREEN.pos[1], SCREEN.pos[2] - 0.003]}>
        <planeGeometry args={[SCREEN.w, SCREEN.h]} />
        {showIdleScreen ? <meshBasicMaterial map={tex} toneMapped={false} /> : <meshBasicMaterial color="#0b1020" toneMapped={false} />}
      </mesh>
      {/* brilho do ecrã */}
      <pointLight position={[0, SCREEN.pos[1], -1.3]} intensity={0.8} distance={1.6} color="#a5c8ff" />
    </group>
  )
}

function Desk({ mouseRef, mouseBtnRef, showIdleScreen }) {
  const wood = useMemo(() => {
    const t = woodTexture().clone()
    t.needsUpdate = true
    return t
  }, [])
  const legX = DESK.width / 2 - 0.08
  return (
    <group>
      <RoundedBox castShadow receiveShadow args={[DESK.width, 0.035, DESK.depth]} radius={0.008} position={[0, DESK.top - 0.0175, DESK.z]}>
        <meshStandardMaterial map={wood} roughness={0.45} />
      </RoundedBox>
      {/* pernas em T, aço preto */}
      {[-legX, legX].map((x) => (
        <group key={x} position={[x, 0, DESK.z]}>
          <mesh castShadow position={[0, (DESK.top - 0.035) / 2, 0]}>
            <boxGeometry args={[0.05, DESK.top - 0.035, 0.05]} />
            <meshStandardMaterial {...metal} />
          </mesh>
          <mesh castShadow position={[0, 0.015, 0]}>
            <boxGeometry args={[0.06, 0.03, DESK.depth - 0.05]} />
            <meshStandardMaterial {...metal} />
          </mesh>
          <mesh castShadow position={[0, DESK.top - 0.05, 0]}>
            <boxGeometry args={[0.05, 0.03, DESK.depth - 0.08]} />
            <meshStandardMaterial {...metal} />
          </mesh>
        </group>
      ))}
      <mesh castShadow position={[0, DESK.top - 0.06, DESK.z - 0.25]}>
        <boxGeometry args={[DESK.width - 0.2, 0.04, 0.02]} />
        <meshStandardMaterial {...metal} />
      </mesh>

      <Monitor showIdleScreen={showIdleScreen} />
      <Keyboard />
      <Mouse mouseRef={mouseRef} mouseBtnRef={mouseBtnRef} />

      {/* portátil fechado */}
      <RoundedBox castShadow args={[0.32, 0.016, 0.22]} radius={0.006} position={[-0.55, DESK.top + 0.008, -1.4]} rotation={[0, 0.25, 0]}>
        <meshStandardMaterial {...alu} />
      </RoundedBox>

      {/* caneca */}
      <group position={[0.64, DESK.top, -1.3]}>
        <mesh castShadow position={[0, 0.048, 0]}>
          <cylinderGeometry args={[0.04, 0.037, 0.096, 32, 1, true]} />
          <meshStandardMaterial color="#f8fafc" roughness={0.25} side={THREE.DoubleSide} />
        </mesh>
        <mesh position={[0, 0.002, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.037, 32]} />
          <meshStandardMaterial color="#f8fafc" />
        </mesh>
        <mesh position={[0.046, 0.05, 0]}>
          <torusGeometry args={[0.022, 0.006, 10, 24]} />
          <meshStandardMaterial color="#f8fafc" roughness={0.25} />
        </mesh>
        <mesh position={[0, 0.085, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.038, 32]} />
          <meshStandardMaterial color="#2b170c" roughness={0.1} />
        </mesh>
      </group>

      {/* candeeiro articulado */}
      <group position={[-0.66, DESK.top, -1.6]}>
        <mesh castShadow position={[0, 0.008, 0]}>
          <cylinderGeometry args={[0.07, 0.075, 0.016, 32]} />
          <meshStandardMaterial {...metal} />
        </mesh>
        <mesh castShadow position={[0.04, 0.19, 0]} rotation={[0, 0, -0.22]}>
          <cylinderGeometry args={[0.007, 0.007, 0.38, 10]} />
          <meshStandardMaterial {...metal} />
        </mesh>
        <mesh castShadow position={[0.16, 0.39, 0.0]} rotation={[0, 0, 1.1]}>
          <cylinderGeometry args={[0.007, 0.007, 0.28, 10]} />
          <meshStandardMaterial {...metal} />
        </mesh>
        <mesh castShadow position={[0.29, 0.31, 0.0]} rotation={[0, 0, 0.5]}>
          <cylinderGeometry args={[0.035, 0.06, 0.1, 24, 1, true]} />
          <meshStandardMaterial {...metal} side={THREE.DoubleSide} />
        </mesh>
        <mesh position={[0.31, 0.275, 0]}>
          <sphereGeometry args={[0.022, 12, 12]} />
          <meshStandardMaterial color="#fff7e0" emissive="#ffd59a" emissiveIntensity={3} toneMapped={false} />
        </mesh>
        <pointLight position={[0.3, 0.22, 0.05]} intensity={1.2} distance={1.4} color="#ffd59a" />
      </group>

      {/* livros */}
      {['#7f1d1d', '#14532d', '#1e3a8a'].map((c, i) => (
        <RoundedBox key={c} castShadow args={[0.22, 0.03, 0.16]} radius={0.004} position={[0.62, DESK.top + 0.016 + i * 0.031, -1.5]} rotation={[0, 0.15 * i - 0.1, 0]}>
          <meshStandardMaterial color={c} roughness={0.7} />
        </RoundedBox>
      ))}
    </group>
  )
}

function ChairBase() {
  return (
    <group position={CHAIR}>
      {[0, 1, 2, 3, 4].map((i) => (
        <group key={i} rotation={[0, (i / 5) * Math.PI * 2, 0]}>
          <mesh castShadow position={[0.15, 0.075, 0]} rotation={[0, 0, 0.08]}>
            <boxGeometry args={[0.3, 0.025, 0.045]} />
            <meshStandardMaterial {...metal} />
          </mesh>
          <mesh castShadow position={[0.29, 0.03, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.028, 0.028, 0.035, 16]} />
            <meshStandardMaterial color="#09090b" roughness={0.6} />
          </mesh>
        </group>
      ))}
      <mesh castShadow position={[0, 0.2, 0]}>
        <cylinderGeometry args={[0.022, 0.028, 0.24, 16]} />
        <meshStandardMaterial {...alu} />
      </mesh>
    </group>
  )
}

// assento e encosto — rodam com o personagem
export function ChairTop() {
  const fabric = meshFabricTexture()
  return (
    <group>
      <mesh castShadow position={[0, SEAT_TOP - 0.09, 0]}>
        <boxGeometry args={[0.2, 0.04, 0.2]} />
        <meshStandardMaterial {...metal} />
      </mesh>
      <RoundedBox castShadow receiveShadow args={[0.5, 0.07, 0.48]} radius={0.03} smoothness={4} position={[0, SEAT_TOP - 0.035, 0]}>
        <meshStandardMaterial map={fabric} roughness={0.9} />
      </RoundedBox>
      <mesh castShadow position={[0, SEAT_TOP + 0.12, -0.27]} rotation={[-0.12, 0, 0]}>
        <boxGeometry args={[0.06, 0.3, 0.025]} />
        <meshStandardMaterial {...metal} />
      </mesh>
      <RoundedBox castShadow args={[0.46, 0.6, 0.06]} radius={0.03} smoothness={4} position={[0, SEAT_TOP + 0.42, -0.29]} rotation={[-0.12, 0, 0]}>
        <meshStandardMaterial map={fabric} roughness={0.9} />
      </RoundedBox>
      <RoundedBox args={[0.3, 0.12, 0.04]} radius={0.02} position={[0, SEAT_TOP + 0.22, -0.245]} rotation={[-0.12, 0, 0]}>
        <meshStandardMaterial color="#111827" roughness={0.8} />
      </RoundedBox>
    </group>
  )
}

function Shelf() {
  const books = useMemo(() => {
    const cols = ['#7f1d1d', '#9a3412', '#14532d', '#1e3a8a', '#4c1d95', '#334155', '#a16207', '#0f766e', '#e7e5e4']
    const out = []
    let s = 3
    const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647)
    ;[0.06, 0.56, 1.06, 1.56].forEach((y, r) => {
      let x = -0.37
      const n = r === 3 ? 5 : 14
      for (let i = 0; i < n; i++) {
        const w = 0.025 + rnd() * 0.03
        const h = 0.22 + rnd() * 0.12
        if (x + w > 0.37) break
        const tilt = i === n - 1 ? 0.25 : 0
        out.push({ x: x + w / 2, y: y + 0.013 + h / 2, w, h, d: 0.18 + rnd() * 0.05, c: cols[Math.floor(rnd() * cols.length)], tilt })
        x += w + 0.003
      }
    })
    return out
  }, [])
  const wood = { color: '#efe9e1', roughness: 0.7 }
  return (
    <group position={[1.45, 0, -1.75]}>
      {[-0.4, 0.4].map((x) => (
        <mesh key={x} castShadow receiveShadow position={[x, 1, 0]}>
          <boxGeometry args={[0.025, 2, 0.3]} />
          <meshStandardMaterial {...wood} />
        </mesh>
      ))}
      {[0.05, 0.55, 1.05, 1.55, 1.99].map((y) => (
        <mesh key={y} castShadow receiveShadow position={[0, y, 0]}>
          <boxGeometry args={[0.8, 0.025, 0.3]} />
          <meshStandardMaterial {...wood} />
        </mesh>
      ))}
      {books.map((b, i) => (
        <mesh key={i} castShadow position={[b.x, b.y, 0.02]} rotation={[0, 0, b.tilt]}>
          <boxGeometry args={[b.w, b.h, b.d]} />
          <meshStandardMaterial color={b.c} roughness={0.75} />
        </mesh>
      ))}
      {/* vaso decorativo */}
      <mesh castShadow position={[0.22, 1.66, 0]}>
        <sphereGeometry args={[0.08, 24, 24]} />
        <meshStandardMaterial color="#c2410c" roughness={0.4} />
      </mesh>
    </group>
  )
}

function Plant({ position }) {
  const leaves = useMemo(
    () =>
      [...Array(22)].map((_, i) => {
        const a = i * 2.399
        const h = 0.45 + (i % 7) * 0.07
        return { a, h, tilt: 0.25 + (i % 5) * 0.12 }
      }),
    [],
  )
  return (
    <group position={position}>
      <mesh castShadow position={[0, 0.17, 0]}>
        <cylinderGeometry args={[0.15, 0.11, 0.34, 32]} />
        <meshStandardMaterial color="#d6d3d1" roughness={0.9} />
      </mesh>
      <mesh position={[0, 0.33, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.14, 24]} />
        <meshStandardMaterial color="#3f2a1d" roughness={1} />
      </mesh>
      {leaves.map((l, i) => (
        <group key={i} position={[0, 0.33, 0]} rotation={[0, l.a, 0]}>
          <group rotation={[l.tilt, 0, 0]}>
            <mesh castShadow position={[0, l.h / 2, 0]} scale={[0.045, l.h / 2, 0.008]}>
              <sphereGeometry args={[1, 12, 12]} />
              <meshStandardMaterial color={i % 3 ? '#2f6b3a' : '#3f7d47'} roughness={0.6} />
            </mesh>
          </group>
        </group>
      ))}
    </group>
  )
}

function Window() {
  const sky = skyTexture()
  return (
    <group position={[-1.6, 1.5, WALL_Z + 0.02]}>
      <mesh>
        <planeGeometry args={[1.1, 1.0]} />
        <meshBasicMaterial map={sky} toneMapped={false} />
      </mesh>
      {[[0, 0, 1.16, 0.04], [0, 0.5, 1.18, 0.06], [0, -0.5, 1.22, 0.07], [0, 0, 0.04, 1.0], [-0.57, 0, 0.06, 1.06], [0.57, 0, 0.06, 1.06]].map(([x, y, w, h], i) => (
        <mesh key={i} castShadow position={[x, y, 0.025]}>
          <boxGeometry args={[w, h, i === 2 ? 0.12 : 0.05]} />
          <meshStandardMaterial color="#f5f5f4" roughness={0.5} />
        </mesh>
      ))}
    </group>
  )
}

function Neon() {
  const mat = <meshStandardMaterial color="#22d3ee" emissive="#22d3ee" emissiveIntensity={2.5} toneMapped={false} />
  const bar = (pos, rot, len = 0.18) => (
    <mesh position={pos} rotation={[0, 0, rot]}>
      <capsuleGeometry args={[0.009, len, 4, 8]} />
      {mat}
    </mesh>
  )
  return (
    <group position={[0, 1.95, WALL_Z + 0.03]}>
      {bar([-0.27, 0.055, 0], -0.95)}
      {bar([-0.27, -0.055, 0], 0.95)}
      {bar([0, 0, 0], -0.35, 0.3)}
      {bar([0.27, 0.055, 0], 0.95)}
      {bar([0.27, -0.055, 0], -0.95)}
      <pointLight position={[0, 0, 0.25]} intensity={0.8} distance={1.8} color="#22d3ee" />
    </group>
  )
}

function PhotoFrame() {
  const photo = useTexture('/me/portrait.jpg')
  photo.colorSpace = THREE.SRGBColorSpace
  return (
    <group position={[0.85, 1.55, WALL_Z + 0.02]}>
      <RoundedBox castShadow args={[0.3, 0.36, 0.025]} radius={0.004}>
        <meshStandardMaterial color="#1c1917" roughness={0.5} />
      </RoundedBox>
      <mesh position={[0, 0, 0.0135]}>
        <planeGeometry args={[0.25, 0.31]} />
        <meshStandardMaterial color="#fafaf9" />
      </mesh>
      <mesh position={[0, 0.01, 0.014]}>
        <planeGeometry args={[0.2, 0.2]} />
        <meshStandardMaterial map={photo} roughness={0.4} />
      </mesh>
    </group>
  )
}

export function Office({ mouseRef, mouseBtnRef, showIdleScreen }) {
  const floor = floorTexture()
  const wall = wallTexture()
  const rug = rugTexture()
  return (
    <group>
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 1]}>
        <planeGeometry args={[9, 7]} />
        <meshStandardMaterial map={floor} roughness={0.55} />
      </mesh>
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.004, -0.75]}>
        <circleGeometry args={[1.05, 64]} />
        <meshStandardMaterial map={rug} roughness={1} />
      </mesh>
      <mesh receiveShadow position={[0, 1.6, WALL_Z]}>
        <planeGeometry args={[9, 3.2]} />
        <meshStandardMaterial map={wall} roughness={0.95} />
      </mesh>
      <mesh receiveShadow position={[-3, 1.6, 0.6]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[5.2, 3.2]} />
        <meshStandardMaterial map={wall} color="#ddd6cc" roughness={0.95} />
      </mesh>
      <mesh receiveShadow position={[0, 0.05, WALL_Z + 0.008]}>
        <boxGeometry args={[9, 0.1, 0.015]} />
        <meshStandardMaterial color="#f5f5f4" />
      </mesh>
      <Window />
      <Neon />
      <PhotoFrame />
      <Shelf />
      <Plant position={[-1.0, 0, -1.65]} />
      <Desk mouseRef={mouseRef} mouseBtnRef={mouseBtnRef} showIdleScreen={showIdleScreen} />
      <ChairBase />
    </group>
  )
}
