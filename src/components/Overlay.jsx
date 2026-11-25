import { Avatar, Button, Chip } from '@heroui/react'
import { ArrowLeft, ArrowRight, GraduationCap, MapPin, MousePointerClick, ZoomIn, ZoomOut } from 'lucide-react'
import { profile } from '../data/profile'
import { usePortfolio } from '../contexts/PortfolioContext'
import { LinkedinIcon } from './LinkedinIcon'

export function Overlay() {
  const { phase, start, restart, zoom, setZoom } = usePortfolio()

  return (
    <div className="pointer-events-none fixed inset-0 z-[100] text-white">
      {/* HERO */}
      <section
        className={`absolute inset-x-0 bottom-0 p-5 transition-all duration-700 md:inset-y-0 md:left-0 md:right-auto md:flex md:w-[46%] md:flex-col md:justify-center md:p-14 ${
          phase === 'hero' ? 'opacity-100' : 'pointer-events-none -translate-x-10 opacity-0'
        }`}
      >
        <div className="rounded-3xl bg-slate-950/60 p-6 backdrop-blur-md md:bg-transparent md:p-0 md:backdrop-blur-none">
          <div className="mb-4 flex items-center gap-3">
            <Avatar src="/me/avatar.jpg" isBordered color="primary" className="h-14 w-14" />
            <Chip variant="flat" color="primary" startContent={<MapPin size={14} className="ml-1" />}>
              {profile.location}
            </Chip>
          </div>
          <h1 className="text-4xl font-extrabold leading-tight drop-shadow md:text-6xl">
            Olá, eu sou <span className="bg-gradient-to-r from-cyan-300 to-blue-500 bg-clip-text text-transparent">{profile.name}</span>
          </h1>
          <p className="mt-3 text-lg text-slate-200 md:text-xl">{profile.role}</p>
          <p className="mt-2 flex items-center gap-2 text-sm text-slate-300">
            <GraduationCap size={16} /> {profile.education}
          </p>
          <div className="pointer-events-auto mt-7 flex flex-wrap gap-3">
            <Button size="lg" color="primary" radius="full" className="cursor-pointer font-bold shadow-lg shadow-blue-500/30" endContent={<ArrowRight size={18} />} onPress={start}>
              Conhecer
            </Button>
            <Button
              as="a"
              href={profile.linkedin}
              target="_blank"
              rel="noreferrer"
              size="lg"
              radius="full"
              variant="bordered"
              className="cursor-pointer border-white/30 font-semibold text-white"
              startContent={<LinkedinIcon size={18} />}
            >
              LinkedIn
            </Button>
          </div>
        </div>
      </section>

      {/* MODO COMPUTADOR */}
      {phase === 'working' && (
        <div className="fade-in pointer-events-auto absolute left-4 top-4 flex gap-2">
          <Button size="sm" radius="full" variant="flat" className="cursor-pointer bg-slate-900/70 text-white backdrop-blur" startContent={<ArrowLeft size={16} />} onPress={restart}>
            Início
          </Button>
          <Button
            size="sm"
            radius="full"
            variant="flat"
            className="cursor-pointer bg-slate-900/70 text-white backdrop-blur"
            startContent={zoom ? <ZoomOut size={16} /> : <ZoomIn size={16} />}
            onPress={() => setZoom(!zoom)}
          >
            {zoom ? 'Afastar' : 'Aproximar ecrã'}
          </Button>
        </div>
      )}
      {phase === 'working' && !zoom && (
        <p className="fade-in absolute bottom-5 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-full bg-slate-900/70 px-4 py-2 text-sm text-slate-200 backdrop-blur">
          <MousePointerClick size={16} /> Clica nos ícones do computador
        </p>
      )}
    </div>
  )
}
