import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import { avatarExists } from '../functions/retarget'
import { interaction } from '../data/layout'

// Coloca aqui o teu avatar realista (ex.: exportado da Avaturn). Se não existir, usa o boneco procedural.
export const AVATAR_URL = '/models/avatar.glb'

const PortfolioContext = createContext(null)

// phase: 'hero' (de pé a acenar) → 'intro' (convite, senta-se) → 'working' (ecrã interativo)
export function PortfolioProvider({ children }) {
  const [phase, setPhase] = useState('hero')
  const [zoom, setZoom] = useState(false)
  const startedAt = useRef(0)
  const screenRef = useRef(null) // elemento HTML do ecrã do computador
  const [avatarUrl, setAvatarUrl] = useState(null)

  useEffect(() => {
    avatarExists(AVATAR_URL).then((ok) => ok && setAvatarUrl(AVATAR_URL))
  }, [])

  const start = useCallback(() => {
    startedAt.current = performance.now() / 1000
    setPhase('intro')
  }, [])

  const finish = useCallback(() => setPhase('working'), [])

  const restart = useCallback(() => {
    interaction.u = 0.5
    interaction.v = 0.5
    interaction.palmFix = [0, 0, 0]
    setZoom(false)
    setPhase('hero')
  }, [])

  return (
    <PortfolioContext.Provider value={{ phase, start, finish, restart, startedAt, zoom, setZoom, avatarUrl, screenRef }}>
      {children}
    </PortfolioContext.Provider>
  )
}

export const usePortfolio = () => useContext(PortfolioContext)
