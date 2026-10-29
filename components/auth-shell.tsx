'use client'

import Link from 'next/link'
import { ArrowLeft, Eye, EyeOff, Sparkles } from 'lucide-react'
import { useState } from 'react'

export function BrandMark() {
  return <Link href="/" className="flex items-center gap-2.5 font-semibold tracking-tight text-slate-950"><span className="grid size-9 place-items-center rounded-xl bg-[#172554] text-white shadow-sm"><Sparkles className="size-4" /></span><span className="text-[17px]">CareerPilot <span className="text-indigo-600">AI</span></span></Link>
}

export function AuthShell({ children, title, eyebrow }: { children: React.ReactNode; title: string; eyebrow: string }) {
  return <main className="min-h-screen bg-[#fbfcff] px-5 py-6 text-slate-900 sm:px-8"><div className="mx-auto flex max-w-6xl items-center justify-between"><BrandMark /><Link href="/" className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900"><ArrowLeft className="size-4" /> Back home</Link></div><div className="mx-auto flex max-w-md flex-col justify-center py-14 sm:py-20"><p className="text-xs font-bold uppercase tracking-[.18em] text-indigo-600">{eyebrow}</p><h1 className="mt-3 text-3xl font-semibold tracking-[-.035em] text-slate-950 sm:text-4xl">{title}</h1>{children}</div></main>
}

export function PasswordField({ label = 'Password', id = 'password' }: { label?: string; id?: string }) {
  const [visible, setVisible] = useState(false)
  return <label htmlFor={id} className="flex flex-col gap-2 text-sm font-medium text-slate-700">{label}<span className="relative"><input id={id} name={id} type={visible ? 'text' : 'password'} required minLength={8} className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 pr-11 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100" placeholder="At least 8 characters" /><button type="button" aria-label={visible ? 'Hide password' : 'Show password'} onClick={() => setVisible(!visible)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700">{visible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}</button></span></label>
}

export function AuthInput({ label, id, type = 'text', placeholder }: { label: string; id: string; type?: string; placeholder?: string }) {
  return <label htmlFor={id} className="flex flex-col gap-2 text-sm font-medium text-slate-700">{label}<input id={id} name={id} type={type} required className="rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100" placeholder={placeholder} /></label>
}
