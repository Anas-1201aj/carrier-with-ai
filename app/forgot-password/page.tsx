'use client'

import Link from 'next/link'
import { useState } from 'react'
import { AuthInput, AuthShell } from '@/components/auth-shell'

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false)
  function submit(event: React.FormEvent<HTMLFormElement>) { event.preventDefault(); setSent(true) }
  return <AuthShell eyebrow="Account recovery" title="Reset your password."><p className="mt-3 text-sm leading-6 text-slate-500">Enter your email and we&apos;ll help you get back to your roadmap.</p>{sent ? <div role="status" className="mt-8 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm leading-6 text-emerald-800">If an account exists for that email, recovery instructions will be sent once the backend email service is connected.</div> : <form onSubmit={submit} className="mt-8 flex flex-col gap-5"><AuthInput label="Email address" id="email" type="email" placeholder="you@example.com" /><button className="rounded-xl bg-[#172554] px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-[#1e3a8a]">Send recovery link</button></form>}<p className="mt-7 text-center text-sm text-slate-500"><Link href="/login" className="font-semibold text-indigo-600 hover:text-indigo-800">Back to sign in</Link></p></AuthShell>
}
