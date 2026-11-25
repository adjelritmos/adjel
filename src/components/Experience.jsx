import { ContactShadows, Environment, Html, Lightformer } from '@react-three/drei'
import { useFrame, useThree } from '@react-three/fiber'
import { Suspense, useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { CHAIR, SCREEN, T, interaction } from '../data/layout'
import { usePortfolio } from '../contexts/PortfolioContext'
import { applyPose, bubbleText, cameraGoal, computePose, mouseWorld } from '../functions/animation'
import { Character } from './Character'
import { ChairTop, Office } from './Office'
import { PX_H, PX_W } from './ScreenUI'
import { screenHomography } from '../functions/homography'
import { SpeechBubble } from './SpeechBubble'
import { RealAvatar } from './RealAvatar'

const tmpPos = new THREE.Vector3()
const tmpLook = new THREE.Vector3()

export function Experience() {
  const { phase, startedAt, finish, zoom, avatarUrl, screenRef } = usePortfolio()
  const camera = useThree((s) => s.camera)
  const rig = useRef({}).current
  const mouseRef = useRef()
  const mouseBtnRef = useRef()
  const look = useRef(new THREE.Vector3(0, 1, 1))
  const [bubble, setBubble] = useState(null)
  const bubbleRef = useRef(null)
  const finished = useRef(false)

  useEffect(() => {
    if (phase === 'intro') finished.current = false
  }, [phase])

  useFrame((state, delta) => {
    const now = performance.now() / 1000
    const time = state.clock.elapsedTime
    const t = phase === 'hero' ? 0 : now - startedAt.current

    // personagem
    applyPose(rig, computePose(phase, t, time, now))
    rig.avatarUpdate?.()

    // rato da secretária
    const m = mouseWorld(now)
    if (mouseRef.current) mouseRef.current.position.set(m.pos[0], m.pos[1] - m.dip * 0.004, m.pos[2])
    // a palma real do avatar é medida e o alvo do braço corrigido até ela pousar em cima do rato
    const palm = rig.palmR
    if (palm && phase === 'working') {
      const g = Math.min(1, delta * 5)
      const f = interaction.palmFix
      const cl = (v) => THREE.MathUtils.clamp(v, -0.09, 0.09)
      f[0] = cl(f[0] + (m.pos[0] - palm.x) * g)
      f[1] = cl(f[1] + (m.pos[1] + 0.032 - palm.y) * g)
      f[2] = cl(f[2] + (m.pos[2] + 0.01 - palm.z) * g)
    }
    if (mouseBtnRef.current) mouseBtnRef.current.emissiveIntensity = m.dip * 2.5

    // câmara suave
    const goal = cameraGoal(phase, t, state.size.width / state.size.height, state.pointer, zoom)
    const k = 1 - Math.exp(-delta * (phase === 'intro' ? 6 : 3.5))
    camera.position.lerp(tmpPos.set(...goal.pos), k)
    look.current.lerp(tmpLook.set(...goal.look), k)
    camera.lookAt(look.current)

    // ecrã HTML encaixado nos 4 cantos do monitor (no mesmo frame da câmara)
    const el = screenRef.current
    if (el) {
      const hm = screenHomography(SCREEN.pos, SCREEN.w, SCREEN.h, camera, state.size, PX_W, PX_H)
      el.style.visibility = hm ? 'visible' : 'hidden'
      if (hm) {
        el.style.transform = hm.css
        el.__H = hm.H
      }
    }

    // balão de fala
    const txt = bubbleText(phase, t)
    if (txt !== bubbleRef.current) {
      bubbleRef.current = txt
      setBubble(txt)
    }

    if (phase === 'intro' && t > T.end && !finished.current) {
      finished.current = true
      finish()
    }
  })

  return (
    <>
      <color attach="background" args={['#0f1222']} />
      <fog attach="fog" args={['#0f1222', 7, 14]} />
      {/* reflexos realistas sem descarregar HDRs */}
      <Environment resolution={256} frames={1}>
        <Lightformer form="rect" intensity={2.5} color="#ffe8cc" position={[-1.6, 1.5, -1]} scale={[1.2, 1]} />
        <Lightformer form="rect" intensity={1.2} color="#ffffff" position={[0, 4, 1]} rotation-x={Math.PI / 2} scale={[6, 6]} />
        <Lightformer form="rect" intensity={0.6} color="#a5c8ff" position={[3, 1, 2]} rotation-y={-Math.PI / 2} scale={[4, 2]} />
      </Environment>
      <ambientLight intensity={0.15} />
      <directionalLight
        position={[-2.5, 4, 3]}
        intensity={1.8}
        color="#fff1dc"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-3}
        shadow-camera-right={3}
        shadow-camera-top={3}
        shadow-camera-bottom={-3}
        shadow-bias={-0.0003}
        shadow-normalBias={0.02}
      />
      <pointLight position={[-1.6, 1.6, -1.3]} intensity={1.5} distance={3.5} color="#ffe2b8" />
      <ContactShadows position={[0, 0.006, 0]} scale={6} blur={2.4} far={1.2} opacity={0.55} resolution={512} />

      <Office mouseRef={mouseRef} mouseBtnRef={mouseBtnRef} showIdleScreen={phase !== 'working'} />

      {/* parte giratória da cadeira + personagem */}
      <group position={CHAIR} ref={(g) => (rig.swivel = g)}>
        <ChairTop />
        <Character
          rig={rig}
          hidden={!!avatarUrl}
          bubble={
            bubble && (
              <Html position={[0, 0.42, 0]} center zIndexRange={[20, 10]}>
                <SpeechBubble id={bubble} />
              </Html>
            )
          }
        />
      </group>

      {avatarUrl && (
        <Suspense fallback={null}>
          <RealAvatar url={avatarUrl} rig={rig} />
        </Suspense>
      )}

    </>
  )
}
