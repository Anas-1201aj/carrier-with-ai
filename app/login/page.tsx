'use client'

import Link from 'next/link'
import { useState } from 'react'
import { AuthInput, AuthShell, PasswordField } from '@/components/auth-shell'

export default function LoginPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  function submit(event: React.FormEvent<HTMLFormElement>) { event.preventDefault(); setError(''); setLoading(true); window.setTimeout(() => { setLoading(false); setError('Authentication is not connected yet. Add the backend API to sign in.'); }, 700) }
  return <AuthShell eyebrow="Welcome back" title="Continue your career journey."><p className="mt-3 text-sm leading-6 text-slate-500">Pick up where you left off and keep your next step in sight.</p><form onSubmit={submit} className="mt-8 flex flex-col gap-5" noValidate><AuthInput label="Email address" id="email" type="email" placeholder="you@example.com" /><PasswordField />{error && <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2.5 text-sm text-rose-700">{error}</p>}<div className="flex justify-end"><Link href="/forgot-password" className="text-sm font-semibold text-indigo-600 hover:text-indigo-800">Forgot password?</Link></div><button disabled={loading} className="rounded-xl bg-[#172554] px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-[#1e3a8a] disabled:cursor-wait disabled:opacity-60">{loading ? 'Checking details…' : 'Sign in'}</button></form><p className="mt-7 text-center text-sm text-slate-500">New to CareerPilot? <Link href="/register" className="font-semibold text-indigo-600 hover:text-indigo-800">Create an account</Link></p></AuthShell>
}
