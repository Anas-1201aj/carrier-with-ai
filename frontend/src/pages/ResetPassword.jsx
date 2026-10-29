import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import AuthLayout from '../layouts/AuthLayout.jsx'
import { Button, Field, Alert } from '../components/ui.jsx'
import { authApi } from '../api/index.js'

export default function ResetPassword() {
  const [params] = useSearchParams()
  const token = params.get('token') || ''
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const fd = new FormData(e.currentTarget)
    const password = fd.get('password')
    const confirm = fd.get('confirm')
    if (password !== confirm) {
      setError('Passwords do not match.')
      setLoading(false)
      return
    }
    try {
      await authApi.resetPassword(token, password)
      setDone(true)
      setTimeout(() => navigate('/login'), 3000)
    } catch (err) {
      setError(err.response?.data?.message || 'Reset link is invalid or has expired.')
    } finally {
      setLoading(false)
    }
  }

  if (!token) {
    return (
      <AuthLayout eyebrow="Password reset" title="Invalid link.">
        <Alert type="error">This reset link is missing a token. Please request a new one.</Alert>
        <p className="mt-7 text-center text-sm text-slate-500">
          <Link to="/forgot-password" className="font-semibold text-indigo-600">Request a new link</Link>
        </p>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout
      eyebrow="Password reset"
      title="Set a new password."
      subtitle="Choose a strong password to secure your CareerPilot account."
    >
      {done ? (
        <div className="space-y-4">
          <Alert type="success">
            Your password has been reset. Redirecting you to sign in…
          </Alert>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <Field label="New password" id="password" name="password" type="password" placeholder="At least 8 characters" required minLength={8} autoComplete="new-password" />
          <Field label="Confirm new password" id="confirm" name="confirm" type="password" placeholder="Repeat your new password" required minLength={8} autoComplete="new-password" />
          {error && <Alert type="error">{error}</Alert>}
          <Button type="submit" loading={loading} className="w-full">
            {loading ? 'Resetting…' : 'Reset password'}
          </Button>
        </form>
      )}
      <p className="mt-7 text-center text-sm text-slate-500">
        <Link to="/login" className="font-semibold text-indigo-600">← Back to sign in</Link>
      </p>
    </AuthLayout>
  )
}
