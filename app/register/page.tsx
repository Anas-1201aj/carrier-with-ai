'use client'

import Link from 'next/link'
import { useState } from 'react'
import { AuthInput, AuthShell, PasswordField } from '@/components/auth-shell'

export default function RegisterPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  function submit(event: React.FormEvent<HTMLFormElement>) { event.preventDefault(); setError(''); setLoading(true); window.setTimeout(() => { setLoading(false); setError('Registration API is not connected yet. Your details were not submitted.'); }, 700) }
  return <AuthShell eyebrow="Start with clarity" title="Build your personal roadmap."><p className="mt-3 text-sm leading-6 text-slate-500">Create a free account and turn your goals into a plan you can actually follow.</p><form onSubmit={submit} className="mt-8 flex flex-col gap-5"><AuthInput label="Full name" id="name" placeholder="Alex Morgan" /><AuthInput label="Email address" id="email" type="email" placeholder="you@example.com" /><PasswordField /><label className="flex items-start gap-3 text-xs leading-5 text-slate-500"><input type="checkbox" required className="mt-1 accent-indigo-600" />I agree to the terms and understand that CareerPilot uses my answers to personalize recommendations.</label>{error && <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2.5 text-sm text-rose-700">{error}</p>}<button disabled={loading} className="rounded-xl bg-[#172554] px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-[#1e3a8a] disabled:cursor-wait disabled:opacity-60">{loading ? 'Creating account…' : 'Create account'}</button></form><p className="mt-7 text-center text-sm text-slate-500">Already have an account? <Link href="/login" className="font-semibold text-indigo-600 hover:text-indigo-800">Sign in</Link></p></AuthShell>
}
