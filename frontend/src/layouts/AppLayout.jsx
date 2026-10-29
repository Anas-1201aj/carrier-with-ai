import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  Sparkles, LayoutDashboard, Target, Map, FileText, Briefcase, Brain,
  ClipboardList, MessageCircle, FolderOpen, Bell, Settings, LogOut, Menu, X,
  ChevronRight,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext.jsx'

const NAV_ITEMS = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/career-assessment', icon: Target, label: 'Career Assessment' },
  { to: '/roadmap', icon: Map, label: 'My Roadmap' },
  { to: '/resume', icon: FileText, label: 'Resume' },
  { to: '/job-match', icon: Briefcase, label: 'Job Match' },
  { to: '/skill-assessment', icon: ClipboardList, label: 'Skill Practice' },
  { to: '/mock-interview', icon: Brain, label: 'Mock Interview' },
  { to: '/mentor', icon: MessageCircle, label: 'AI Mentor' },
  { to: '/projects', icon: FolderOpen, label: 'Projects' },
  { to: '/jobs', icon: Briefcase, label: 'Job Tracker' },
]

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

function NavItem({ to, icon: Icon, label, onClick }) {
  const { pathname } = useLocation()
  const active = pathname === to || (to !== '/dashboard' && pathname.startsWith(to))
  return (
    <Link
      to={to}
      onClick={onClick}
      className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
        active
          ? 'bg-indigo-50 text-indigo-700'
          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
      }`}
    >
      <Icon className="size-4 flex-shrink-0" />
      {label}
      {active && <ChevronRight className="ml-auto size-3.5 text-indigo-400" />}
    </Link>
  )
}

export default function AppLayout({ children }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)

  const close = () => setOpen(false)

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : '?'

  return (
    <div className="flex min-h-screen bg-[#f8faff]">
      {/* Overlay */}
      {open && (
        <div className="fixed inset-0 z-30 bg-slate-900/40 lg:hidden" onClick={close} />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-slate-200 bg-white transition-transform lg:static lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-16 items-center justify-between px-5 border-b border-slate-100">
          <Brand />
          <button className="lg:hidden text-slate-500" onClick={close}><X className="size-5" /></button>
        </div>

        <nav className="flex flex-col gap-1 flex-1 overflow-y-auto px-3 py-4">
          {NAV_ITEMS.map((item) => (
            <NavItem key={item.to} {...item} onClick={close} />
          ))}
        </nav>

        <div className="border-t border-slate-100 p-3 space-y-1">
          <NavItem to="/notifications" icon={Bell} label="Notifications" onClick={close} />
          <NavItem to="/profile" icon={Settings} label="Settings" onClick={close} />
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-rose-500 transition hover:bg-rose-50"
          >
            <LogOut className="size-4" />
            Sign out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col min-w-0">
        {/* Top bar */}
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-5 lg:px-8">
          <button className="lg:hidden text-slate-500" onClick={() => setOpen(true)}>
            <Menu className="size-5" />
          </button>
          <div className="hidden lg:block" />
          <div className="flex items-center gap-3">
            <Link to="/notifications" className="grid size-9 place-items-center rounded-xl text-slate-500 hover:bg-slate-100">
              <Bell className="size-5" />
            </Link>
            <Link to="/profile" className="grid size-9 place-items-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-700">
              {initials}
            </Link>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 px-5 py-6 lg:px-8 lg:py-8">
          {children}
        </main>
      </div>
    </div>
  )
}
