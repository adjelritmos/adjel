import { Canvas } from '@react-three/fiber'
import { Suspense } from 'react'
import { Experience } from '../components/Experience'
import { Overlay } from '../components/Overlay'
import { PortfolioProvider, usePortfolio } from '../contexts/PortfolioContext'
import { ScreenUI } from '../components/ScreenUI'

function ComputerScreen() {
  const { phase } = usePortfolio()
  return phase === 'working' ? <ScreenUI /> : null
}

export function Home() {
  return (
    <PortfolioProvider>
      <main className="relative h-screen w-screen overflow-hidden bg-[#0f1222]">
        <Canvas shadows dpr={[1, 2]} camera={{ position: [-0.8, 1.45, 4.3], fov: 50, near: 0.05, far: 40 }}>
          <Suspense fallback={null}>
            <Experience />
          </Suspense>
        </Canvas>
        <ComputerScreen />
        <Overlay />
      </main>
    </PortfolioProvider>
  )
}
