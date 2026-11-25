import { Armchair, Hand, MousePointerClick } from 'lucide-react'

const BUBBLES = {
  hello: { Icon: Hand, text: 'Olá! Bem-vindo!' },
  invite: { Icon: Armchair, text: 'Vem comigo!' },
  click: { Icon: MousePointerClick, text: 'Clica no que quiseres saber!' },
}

export function SpeechBubble({ id }) {
  const b = BUBBLES[id]
  if (!b) return null
  return (
    <div key={id} className="bubble-pop relative flex items-center gap-2 whitespace-nowrap rounded-2xl bg-white px-4 py-2 text-sm font-semibold text-slate-900 shadow-xl">
      <b.Icon size={16} className="text-blue-600" />
      {b.text}
      <span className="absolute -bottom-1.5 left-1/2 h-3 w-3 -translate-x-1/2 rotate-45 bg-white" />
    </div>
  )
}
