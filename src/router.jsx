import { createContext, useContext, useState, useEffect, useCallback } from 'react'

const RouterContext = createContext()

function looksLikeUuid(s) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(String(s || ''))
}

export function parseRoute() {
  const raw = window.location.pathname.replace(/^\//, '').replace(/\/$/, '')
  const path = raw || 'landing'
  if (path === 'admin' || path.startsWith('admin/')) {
    if (path === 'admin') {
      return { page: 'admin', pathBusinessId: null, adminRoute: 'home' }
    }
    const rest = path.slice('admin/'.length)
    const seg = rest.split('/')[0] || ''
    if (seg === 'monitoring') return { page: 'admin', pathBusinessId: null, adminRoute: 'monitoring' }
    if (seg === 'audit') return { page: 'admin', pathBusinessId: null, adminRoute: 'audit' }
    if (seg === 'users') return { page: 'admin', pathBusinessId: null, adminRoute: 'users' }
    return { page: 'admin', pathBusinessId: null, adminRoute: 'home' }
  }
  if (path === 'businesses' || path === 'entities') {
    return { page: 'entities', pathBusinessId: null, adminRoute: null }
  }
  if (path.startsWith('businesses/')) {
    const id = path.slice('businesses/'.length).split('/')[0] || ''
    const pathBusinessId = looksLikeUuid(id) ? id : null
    return { page: 'entities', pathBusinessId, adminRoute: null }
  }
  return { page: path, pathBusinessId: null, adminRoute: null }
}

export function RouterProvider({ children }) {
  const [route, setRoute] = useState(parseRoute)

  useEffect(() => {
    const onPop = () => setRoute(parseRoute())
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])

  const navigate = useCallback((to) => {
    window.history.pushState(null, '', to)
    setRoute(parseRoute())
  }, [])

  return (
    <RouterContext.Provider
      value={{ page: route.page, pathBusinessId: route.pathBusinessId, adminRoute: route.adminRoute ?? null, navigate }}
    >
      {children}
    </RouterContext.Provider>
  )
}

export function useRouter() {
  const ctx = useContext(RouterContext)
  if (!ctx) throw new Error('useRouter must be used within RouterProvider')
  return ctx
}

export function Link({ to, children, className, onClick: external, ...rest }) {
  const { navigate } = useRouter()
  const handleClick = (e) => {
    if (external) external(e)
    if (e.defaultPrevented || e.metaKey || e.ctrlKey) return
    e.preventDefault()
    navigate(to)
  }
  return (
    <a href={to} onClick={handleClick} className={className} {...rest}>
      {children}
    </a>
  )
}
