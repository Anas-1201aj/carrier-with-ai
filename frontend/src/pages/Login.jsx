import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import AuthLayout from '../layouts/AuthLayout.jsx'
import { Button, Field, Alert } from '../components/ui.jsx'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from?.pathname || '/dashboard'

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const fd = new FormData(e.currentTarget)
    try {
      await login({ email: fd.get('email'), password: fd.get('password') })
      navigate(from, { replace: true })
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to connect to the server.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout
      eyebrow="Welcome back"
      title="Continue your career journey."
      subtitle="Pick up where you left off and keep your next step in sight."
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <Field label="Email address" id="email" name="email" type="email" placeholder="you@example.com" required autoComplete="email" />
        <div className="flex flex-col gap-1.5">
          <Field label="Password" id="password" name="password" type="password" placeholder="Your password" required autoComplete="current-password" />
          <div className="flex justify-end">
            <Link to="/forgot-password" className="text-xs font-semibold text-indigo-600 hover:text-indigo-800">
              Forgot password?
            </Link>
          </div>
        </div>
        {error && <Alert type="error">{error}</Alert>}
        <Button type="submit" loading={loading} className="w-full">
          {loading ? 'Signing in…' : 'Sign in'}
        </Button>
      </form>
      <p className="mt-7 text-center text-sm text-slate-500">
        New to CareerPilot?{' '}
        <Link to="/register" className="font-semibold text-indigo-600">Create an account</Link>
      </p>
    </AuthLayout>
  )
}
