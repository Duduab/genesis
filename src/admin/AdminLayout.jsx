import { Activity, ClipboardList, LogOut, Users } from 'lucide-react'
import { useRouter } from '../router'
import { useAdminAuth } from '../context/AdminAuthContext'

export default function AdminLayout({ active, children }) {
  const { navigate } = useRouter()
  const { logout } = useAdminAuth()

  const tab = (id, href, label, Icon) => {
    const on = active === id
    return (
      <button
        type="button"
        onClick={() => navigate(href)}
        className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
          on
            ? 'bg-genesis-600 text-white shadow-sm'
            : 'text-surface-600 hover:bg-surface-100 dark:text-surface-300 dark:hover:bg-surface-800'
        }`}
      >
        <Icon className="h-4 w-4 shrink-0" />
        {label}
      </button>
    )
  }

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-950">
      <header className="border-b border-surface-200 bg-white dark:border-surface-800 dark:bg-surface-900">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3">
          <div className="flex items-center gap-3">
            <span className="text-lg font-bold text-surface-900 dark:text-surface-50">Genesis Admin</span>
            <nav className="flex items-center gap-1">
              {tab('monitoring', '/admin/monitoring', 'Monitoring', Activity)}
              {tab('audit', '/admin/audit', 'Audit trail', ClipboardList)}
              {tab('users', '/admin/users', 'Users', Users)}
            </nav>
          </div>
          <button
            type="button"
            onClick={() => {
              logout()
              navigate('/admin')
            }}
            className="flex items-center gap-2 rounded-lg border border-surface-200 px-3 py-2 text-sm font-medium text-surface-700 hover:bg-surface-50 dark:border-surface-700 dark:text-surface-200 dark:hover:bg-surface-800"
          >
            <LogOut className="h-4 w-4" />
            Log out
          </button>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-6">{children}</main>
    </div>
  )
}
