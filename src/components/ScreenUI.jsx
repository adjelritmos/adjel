import { Avatar, Button, Card, CardBody, Chip, Link, ScrollShadow } from '@heroui/react'
import {
  Award, BatteryFull, Briefcase, Code, ExternalLink, FolderOpen, GraduationCap, Languages, Mail,
  Layers, MapPin, Server, TrendingUp, User, Wifi, Wrench,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { profile } from '../data/profile'
import { SCREEN, interaction } from '../data/layout'
import { usePortfolio } from '../contexts/PortfolioContext'
import { invertPoint } from '../functions/homography'
import { LinkedinIcon } from './LinkedinIcon'

export const PX_W = 960
export const PX_H = Math.round((PX_W * SCREEN.h) / SCREEN.w)

const APPS = [
  { id: 'about', Icon: User, label: 'Sobre mim', file: 'sobre-mim.md' },
  { id: 'projects', Icon: FolderOpen, label: 'Projetos', file: 'projetos/' },
  { id: 'skills', Icon: Wrench, label: 'Skills', file: 'skills.json' },
  { id: 'experience', Icon: TrendingUp, label: 'Experiência', file: 'experiencia.log' },
  { id: 'education', Icon: GraduationCap, label: 'Formação', file: 'formacao.txt' },
  { id: 'contact', Icon: Mail, label: 'Contacto', file: 'contacto.sh' },
]

function Clock() {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 10000)
    return () => clearInterval(id)
  }, [])
  return <span>{now.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })}</span>
}

function Welcome({ open }) {
  const stats = [
    { value: `${profile.projects.length}`, label: 'Projetos' },
    { value: `${profile.experience.length}`, label: 'Experiências' },
    { value: '15', label: 'Média · melhor aluno' },
  ]
  return (
    <div className="flex h-full items-center gap-8 px-2">
      {/* retrato #OpenToWork */}
      <div className="relative shrink-0">
        <div className="absolute -inset-3 rounded-full bg-success/20 blur-2xl" />
        <img src="/me/opentowork.png" alt={profile.name} className="relative h-[250px] w-[250px] rounded-full ring-2 ring-success/40" />
      </div>

      <div className="min-w-0 flex-1 space-y-4">
        <Chip color="success" variant="dot" className="border-success/40">
          Disponível para trabalho · #OpenToWork
        </Chip>
        <div>
          <p className="text-[15px] text-default-400">Olá, eu sou</p>
          <p className="text-[38px] font-extrabold leading-tight">{profile.name}</p>
          <p className="mt-1 flex items-center gap-2 text-[18px] text-primary">
            <Code size={18} /> {profile.role}
          </p>
          <p className="mt-1 flex items-center gap-2 text-[14px] text-default-500">
            <MapPin size={14} /> {profile.location}
            <span className="text-default-300">·</span>
            <GraduationCap size={14} /> Informática de Gestão
          </p>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {stats.map((st) => (
            <div key={st.label} className="rounded-xl border border-white/10 bg-white/5 px-3 py-2">
              <p className="text-[24px] font-bold leading-none text-white">{st.value}</p>
              <p className="mt-1 text-[12px] text-default-400">{st.label}</p>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap gap-2">
          <Button size="sm" color="primary" className="cursor-pointer" startContent={<User size={15} />} onPress={() => open('about')}>
            Sobre mim
          </Button>
          <Button size="sm" variant="flat" className="cursor-pointer" startContent={<FolderOpen size={15} />} onPress={() => open('projects')}>
            Projetos
          </Button>
          <Button size="sm" variant="flat" className="cursor-pointer" startContent={<Mail size={15} />} onPress={() => open('contact')}>
            Contactar
          </Button>
        </div>
      </div>
    </div>
  )
}

function About() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Avatar src="/me/avatar.jpg" className="h-16 w-16" isBordered color="primary" />
        <div>
          <p className="text-2xl font-bold">{profile.name}</p>
          <p className="flex items-center gap-1 text-primary">
            <Code size={16} /> {profile.role}
            <span className="text-default-400">·</span>
            <MapPin size={16} /> {profile.location}
          </p>
        </div>
      </div>
      <p className="leading-relaxed text-default-600">{profile.summary}</p>
      <div className="flex flex-wrap gap-2">
        {profile.languages.map((l) => (
          <Chip key={l.name} variant="flat" color="secondary" startContent={<Languages size={14} className="ml-1" />}>
            {l.name} · {l.level}
          </Chip>
        ))}
        {profile.soft.map((s) => (
          <Chip key={s} variant="flat" color="success">{s}</Chip>
        ))}
      </div>
    </div>
  )
}

function Projects() {
  return (
    <div className="grid grid-cols-2 gap-3">
      {profile.projects.map((p) => (
        <Card key={p.name} shadow="none" className="border border-default-200 bg-default-50">
          <CardBody className="gap-1 p-3">
            <p className="font-semibold leading-tight">{p.name}</p>
            <p className="text-xs text-primary">{p.tag}</p>
            <p className="text-sm leading-snug text-default-500">{p.desc}</p>
            {p.url && (
              <Link href={p.url} isExternal className="cursor-pointer" size="sm" color="warning" showAnchorIcon anchorIcon={<ExternalLink size={12} className="ml-1" />}>
                {p.url.replace('https://', '')}
              </Link>
            )}
          </CardBody>
        </Card>
      ))}
    </div>
  )
}

const GROUP_ICON = { Linguagens: Code, Frameworks: Layers, Áreas: Server }

function Skills() {
  const [sel, setSel] = useState({ ...profile.skills[0].items[0], group: profile.skills[0].group })
  const GIcon = GROUP_ICON[sel.group] || Code
  return (
    <div className="flex h-full gap-4">
      {/* lista vertical por grupo */}
      <div className="flex w-[170px] shrink-0 flex-col gap-3">
        {profile.skills.map((g) => {
          const Icon = GROUP_ICON[g.group] || Code
          return (
            <div key={g.group}>
              <p className="mb-1 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-default-400">
                <Icon size={13} /> {g.group}
              </p>
              <div className="flex flex-col gap-0.5">
                {g.items.map((s) => (
                  <button
                    key={s.name}
                    onClick={() => setSel({ ...s, group: g.group })}
                    className={`cursor-pointer rounded-lg px-3 py-1 text-left text-[14px] transition ${
                      sel.name === s.name ? 'bg-primary text-white' : 'text-default-600 hover:bg-white/10'
                    }`}
                  >
                    {s.name}
                  </button>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {/* descrição ocupa o resto da área */}
      <Card key={sel.name} shadow="none" className="window-pop min-h-0 flex-1 border border-primary-200/60 bg-gradient-to-br from-primary-50/50 to-transparent">
        <CardBody className="flex flex-col justify-center gap-4 p-8">
          <div className="flex items-center gap-4">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/20 text-primary">
              <GIcon size={28} />
            </span>
            <div>
              <p className="text-[34px] font-bold leading-none">{sel.name}</p>
              <Chip size="sm" variant="flat" color="primary" className="mt-2">{sel.group}</Chip>
            </div>
          </div>
          <p className="text-[20px] leading-relaxed text-default-600">{sel.desc}</p>
        </CardBody>
      </Card>
    </div>
  )
}

function Timeline({ items, Icon }) {
  return (
    <div className="space-y-4 border-l-2 border-primary/40 pl-6">
      {items.map((e) => (
        <div key={e.title} className="relative">
          <span className="absolute -left-[37px] top-0 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-white">
            <Icon size={13} />
          </span>
          <p className="font-semibold">{e.title}</p>
          <p className="text-sm text-primary">{e.org} · {e.period}</p>
          {e.points?.map((p) => (
            <p key={p} className="text-sm text-default-500">{p}</p>
          ))}
        </div>
      ))}
    </div>
  )
}

function Contact() {
  const row = 'flex items-center gap-3 rounded-xl border border-default-200 bg-default-50 p-4'
  return (
    <div className="space-y-3">
      <p className="text-xl font-semibold">Vamos conversar?</p>
      <a className={`${row} cursor-pointer hover:bg-default-100`} href={`mailto:${profile.email}`}>
        <Mail size={20} className="text-primary" /> {profile.email}
      </a>
      <a className={`${row} cursor-pointer hover:bg-default-100`} href={profile.linkedin} target="_blank" rel="noreferrer">
        <LinkedinIcon size={20} className="text-primary" /> {profile.linkedinLabel}
      </a>
      <p className={row}>
        <MapPin size={20} className="text-primary" /> {profile.location}
      </p>
    </div>
  )
}

const CONTENT = {
  welcome: (open) => <Welcome open={open} />,
  about: () => <About />,
  projects: () => <Projects />,
  skills: () => <Skills />,
  experience: () => <Timeline items={profile.experience} Icon={Briefcase} />,
  education: () => <Timeline items={profile.education_list} Icon={Award} />,
  contact: () => <Contact />,
}

export function ScreenUI() {
  const [win, setWin] = useState('welcome')
  const { screenRef } = usePortfolio()

  // posição do cursor no ecrã (0..1), invertendo a deformação perspetiva
  const onMove = (e) => {
    const el = screenRef.current
    if (!el?.__H) return
    const r = el.parentElement.getBoundingClientRect()
    const [u, v] = invertPoint(el.__H, e.clientX - r.left, e.clientY - r.top, PX_W, PX_H)
    interaction.u = u
    interaction.v = v
  }
  const onDown = (e) => {
    onMove(e)
    interaction.clickAt = performance.now() / 1000
  }

  const app = APPS.find((a) => a.id === win)

  return (
    // a transformação (matrix3d) é escrita a cada frame pelo Experience → encaixa nos cantos do monitor
    <div
      ref={screenRef}
      style={{ position: 'absolute', left: 0, top: 0, transformOrigin: '0 0', visibility: 'hidden', zIndex: 10 }}
    >
      <div
        onPointerMove={onMove}
        onPointerDownCapture={onDown}
        onWheel={(e) => e.stopPropagation()}
        style={{ width: PX_W, height: PX_H }}
        className="dark screen-fade relative flex select-none flex-col overflow-hidden bg-[radial-gradient(ellipse_at_top_left,#1e3a8a_0%,#0b1020_55%,#2a1446_100%)] text-[16px] text-foreground"
      >
        {/* barra superior */}
        <div className="flex h-8 shrink-0 items-center justify-between bg-black/40 px-4 text-[13px] text-default-500">
          <span className="flex items-center gap-1.5 font-semibold text-primary">
            <Code size={14} /> adjelritmos
          </span>
          <span>{profile.name} — {profile.role}</span>
          <span className="flex items-center gap-2">
            <Wifi size={14} /> <BatteryFull size={14} /> <Clock />
          </span>
        </div>

        <div className="flex min-h-0 flex-1 gap-3 p-3">
          {/* dock lateral */}
          <nav className="flex w-[62px] shrink-0 flex-col gap-1">
            {APPS.map((a) => (
              <button
                key={a.id}
                onClick={() => setWin(a.id)}
                title={a.label}
                className={`cursor-pointer flex flex-col items-center gap-0.5 rounded-xl py-1.5 text-[10px] leading-tight transition ${
                  win === a.id ? 'bg-primary/25 text-white ring-1 ring-primary/60' : 'text-default-500 hover:bg-white/10 hover:text-white'
                }`}
              >
                <a.Icon size={20} strokeWidth={1.7} />
                {a.label}
              </button>
            ))}
          </nav>

          {/* janela */}
          <div key={win} className="window-pop flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl bg-content1/90 shadow-2xl ring-1 ring-white/10 backdrop-blur">
            <div className="flex h-9 shrink-0 items-center gap-2 border-b border-white/5 px-3">
              <button onClick={() => setWin('welcome')} className="h-3 w-3 cursor-pointer rounded-full bg-danger" aria-label="Fechar" />
              <span className="h-3 w-3 rounded-full bg-warning" />
              <span className="h-3 w-3 rounded-full bg-success" />
              <span className="ml-3 text-[13px] text-default-400">~/{app ? app.file : 'bem-vindo.md'}</span>
            </div>
            <ScrollShadow className="screen-scroll min-h-0 flex-1 overflow-y-auto overscroll-contain p-5">
              {CONTENT[win](setWin)}
            </ScrollShadow>
          </div>
        </div>
      </div>
    </div>
  )
}
