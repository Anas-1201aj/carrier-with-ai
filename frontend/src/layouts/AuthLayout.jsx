import { Link } from 'react-router-dom'
import { Sparkles } from 'lucide-react'

function Brand() {
  return (
    <Link to="/" className="flex items-center gap-2.5 font-bold text-slate-900">
      <span className="grid size-9 place-items-center rounded-xl bg-[#172554] text-white">
        <Sparkles className="size-4" />
      </span>
      CareerPilot <span className="text-indigo-600">AI</span>
    </Link>
  )
}

export default function AuthLayout({ eyebrow, title, subtitle, children }) {
  return (
    <main className="grid min-h-screen place-items-center bg-[#fbfcff] px-5 py-10">
      <div className="w-full max-w-md">
        <Brand />
        <div className="mt-12">
          {eyebrow && (
            <p className="text-xs font-bold uppercase tracking-[.18em] text-indigo-600">{eyebrow}</p>
          )}
          <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-950">{title}</h1>
          {subtitle && (
            <p className="mt-3 text-sm leading-6 text-slate-500">{subtitle}</p>
          )}
          <div className="mt-8">{children}</div>
        </div>
      </div>
    </main>
  )
}
