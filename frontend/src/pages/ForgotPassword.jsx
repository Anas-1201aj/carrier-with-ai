import { useState } from 'react'
import { Link } from 'react-router-dom'
import AuthLayout from '../layouts/AuthLayout.jsx'
import { Button, Field, Alert } from '../components/ui.jsx'
import { authApi } from '../api/index.js'

export default function ForgotPassword() {
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [devNote, setDevNote] = useState('')
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const email = new FormData(e.currentTarget).get('email')
    try {
      const { data } = await authApi.forgotPassword(email)
      setSent(true)
      if (data.devNote) setDevNote(data.devNote)
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout
      eyebrow="Account recovery"
      title="Reset your password."
      subtitle="Enter your email and we'll help you get back to your roadmap."
    >
      {sent ? (
        <div className="space-y-4">
          <Alert type="success">
            If an account exists for that email, recovery instructions will be sent. Check your inbox (and spam folder).
          </Alert>
          {devNote && (
            <Alert type="info">
              <strong>Dev mode:</strong> {devNote}. The token was printed to the server console. Use it at{' '}
              <Link to="/reset-password" className="underline">
                /reset-password
              </Link>.
            </Alert>
          )}
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <Field label="Email address" id="email" name="email" type="email" placeholder="you@example.com" required autoComplete="email" />
          {error && <Alert type="error">{error}</Alert>}
          <Button type="submit" loading={loading} className="w-full">
            {loading ? 'Sending…' : 'Send recovery link'}
          </Button>
        </form>
      )}
      <p className="mt-7 text-center text-sm text-slate-500">
        <Link to="/login" className="font-semibold text-indigo-600">← Back to sign in</Link>
      </p>
    </AuthLayout>
  )
}
