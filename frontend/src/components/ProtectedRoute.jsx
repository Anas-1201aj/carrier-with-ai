import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

// Spinner used while session is being verified
function FullPageSpinner() {
  return (
    <div className="grid min-h-screen place-items-center bg-[#fbfcff]">
      <div className="flex flex-col items-center gap-4">
        <div className="size-10 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600" />
        <p className="text-sm text-slate-500">Loading…</p>
      </div>
    </div>
  )
}

/** Wrap any student-only route with this */
export function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  const location = useLocation()
  if (loading) return <FullPageSpinner />
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />
  return children
}

/** Wrap any admin-only route with this */
export function AdminRoute({ children }) {
  const { user, loading } = useAuth()
  const location = useLocation()
  if (loading) return <FullPageSpinner />
  if (!user || user.role !== 'superadmin') return <Navigate to="/admin/login" state={{ from: location }} replace />
  return children
}
