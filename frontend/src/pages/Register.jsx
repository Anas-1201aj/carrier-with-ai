import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import AuthLayout from '../layouts/AuthLayout.jsx'
import { Button, Field, Alert } from '../components/ui.jsx'

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const fd = new FormData(e.currentTarget)
    try {
      await register({ name: fd.get('name'), email: fd.get('email'), password: fd.get('password') })
      navigate('/onboarding')
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to create account. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout
      eyebrow="Start with clarity"
      title="Build your personal roadmap."
      subtitle="Create a free account and turn your goals into a plan you can actually follow."
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <Field label="Full name" id="name" name="name" placeholder="Alex Morgan" required minLength={2} autoComplete="name" />
        <Field label="Email address" id="email" name="email" type="email" placeholder="you@example.com" required autoComplete="email" />
        <Field label="Password" id="password" name="password" type="password" placeholder="At least 8 characters" required minLength={8} autoComplete="new-password" />
        <label className="flex items-start gap-3 text-xs leading-5 text-slate-500">
          <input type="checkbox" required className="mt-1 accent-indigo-600" />
          I agree to the terms and understand that CareerPilot uses my answers to personalise recommendations.
        </label>
        {error && <Alert type="error">{error}</Alert>}
        <Button type="submit" loading={loading} className="w-full">
          {loading ? 'Creating account…' : 'Create account'}
        </Button>
      </form>
      <p className="mt-7 text-center text-sm text-slate-500">
        Already have an account?{' '}
        <Link to="/login" className="font-semibold text-indigo-600">Sign in</Link>
      </p>
    </AuthLayout>
  )
}
