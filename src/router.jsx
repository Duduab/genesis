import { createContext, useContext, useState, useEffect, useCallback } from 'react'

const RouterContext = createContext()

function getPage() {
  const path = window.location.pathname.replace(/^\//, '').replace(/\/$/, '')
  return path || 'landing'
}

export function RouterProvider({ children }) {
  const [page, setPage] = useState(getPage)

  useEffect(() => {
    const onPop = () => setPage(getPage())
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])

  const navigate = useCallback((to) => {
    window.history.pushState(null, '', to)
    setPage(getPage())
  }, [])

  return (
    <RouterContext.Provider value={{ page, navigate }}>
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
