// Shared UI primitive components

export function Button({ children, variant = 'primary', size = 'md', loading = false, className = '', ...props }) {
  const base = 'inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition focus-visible:outline-2 focus-visible:outline-indigo-500 disabled:cursor-not-allowed disabled:opacity-60'
  const variants = {
    primary: 'bg-[#172554] text-white hover:bg-[#1e3a8a]',
    secondary: 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50',
    danger: 'bg-rose-600 text-white hover:bg-rose-700',
    ghost: 'bg-transparent text-indigo-600 hover:bg-indigo-50',
    indigo: 'bg-indigo-600 text-white hover:bg-indigo-700',
  }
  const sizes = {
    sm: 'px-3 py-2 text-xs',
    md: 'px-5 py-3 text-sm',
    lg: 'px-6 py-3.5 text-sm',
  }
  return (
    <button className={`${base} ${variants[variant]} ${sizes[size]} ${className}`} disabled={loading || props.disabled} {...props}>
      {loading && <span className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />}
      {children}
    </button>
  )
}

export function Field({ label, error, id, className = '', ...props }) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && <label htmlFor={id} className="text-sm font-semibold text-slate-700">{label}</label>}
      <input
        id={id}
        {...props}
        className={`rounded-xl border px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:ring-4 ${
          error ? 'border-rose-300 bg-rose-50 focus:border-rose-400 focus:ring-rose-100' : 'border-slate-200 bg-white focus:border-indigo-400 focus:ring-indigo-100'
        }`}
      />
      {error && <p className="text-xs text-rose-600">{error}</p>}
    </div>
  )
}

export function Textarea({ label, error, id, className = '', ...props }) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && <label htmlFor={id} className="text-sm font-semibold text-slate-700">{label}</label>}
      <textarea
        id={id}
        rows={4}
        {...props}
        className={`rounded-xl border px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:ring-4 resize-none ${
          error ? 'border-rose-300 bg-rose-50 focus:border-rose-400 focus:ring-rose-100' : 'border-slate-200 bg-white focus:border-indigo-400 focus:ring-indigo-100'
        }`}
      />
      {error && <p className="text-xs text-rose-600">{error}</p>}
    </div>
  )
}

export function Card({ children, className = '', ...props }) {
  return (
    <div className={`rounded-2xl border border-slate-200 bg-white p-6 ${className}`} {...props}>
      {children}
    </div>
  )
}

export function Badge({ children, color = 'indigo' }) {
  const colors = {
    indigo: 'bg-indigo-50 text-indigo-700',
    green: 'bg-emerald-50 text-emerald-700',
    red: 'bg-rose-50 text-rose-700',
    amber: 'bg-amber-50 text-amber-700',
    slate: 'bg-slate-100 text-slate-600',
    blue: 'bg-blue-50 text-blue-700',
  }
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${colors[color] || colors.indigo}`}>
      {children}
    </span>
  )
}

export function Spinner({ size = 'md', className = '' }) {
  const sizes = { sm: 'size-4', md: 'size-6', lg: 'size-10' }
  return (
    <div className={`animate-spin rounded-full border-2 border-indigo-200 border-t-indigo-600 ${sizes[size]} ${className}`} />
  )
}

export function PageLoader() {
  return (
    <div className="grid min-h-[50vh] place-items-center">
      <Spinner size="lg" />
    </div>
  )
}

export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center gap-4 py-16 text-center">
      {Icon && <div className="grid size-14 place-items-center rounded-2xl bg-indigo-50 text-indigo-400"><Icon className="size-7" /></div>}
      <div>
        <p className="text-base font-semibold text-slate-700">{title}</p>
        {description && <p className="mt-1 text-sm text-slate-500">{description}</p>}
      </div>
      {action}
    </div>
  )
}

export function Alert({ type = 'info', children }) {
  const styles = {
    info: 'border-blue-200 bg-blue-50 text-blue-800',
    success: 'border-emerald-200 bg-emerald-50 text-emerald-800',
    error: 'border-rose-200 bg-rose-50 text-rose-700',
    warning: 'border-amber-200 bg-amber-50 text-amber-800',
  }
  return (
    <div role={type === 'error' ? 'alert' : 'status'} className={`rounded-xl border px-4 py-3 text-sm leading-6 ${styles[type]}`}>
      {children}
    </div>
  )
}

export function ProgressBar({ value = 0, max = 100, label, color = 'indigo' }) {
  const pct = Math.max(0, Math.min(100, Math.round((value / max) * 100)))
  const colors = {
    indigo: 'bg-indigo-500',
    green: 'bg-emerald-500',
    amber: 'bg-amber-400',
  }
  return (
    <div className="space-y-1">
      {label && (
        <div className="flex justify-between text-xs text-slate-500">
          <span>{label}</span>
          <span>{pct}%</span>
        </div>
      )}
      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
        <div className={`h-full rounded-full transition-all ${colors[color] || colors.indigo}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

export function Select({ label, error, id, options = [], className = '', ...props }) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && <label htmlFor={id} className="text-sm font-semibold text-slate-700">{label}</label>}
      <select
        id={id}
        {...props}
        className={`rounded-xl border px-4 py-3 text-sm outline-none transition bg-white focus:ring-4 ${
          error ? 'border-rose-300 focus:border-rose-400 focus:ring-rose-100' : 'border-slate-200 focus:border-indigo-400 focus:ring-indigo-100'
        }`}
      >
        {options.map((opt) => (
          <option key={opt.value ?? opt} value={opt.value ?? opt}>{opt.label ?? opt}</option>
        ))}
      </select>
      {error && <p className="text-xs text-rose-600">{error}</p>}
    </div>
  )
}

export function Modal({ open, onClose, title, children }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" />
      <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        {title && <h3 className="mb-4 text-lg font-semibold text-slate-900">{title}</h3>}
        {children}
      </div>
    </div>
  )
}
