import { useEffect } from 'react'
import { useRouter } from '../router'
import { useAdminAuth } from '../context/AdminAuthContext'
import AdminLoginPage from './AdminLoginPage'
import AdminLayout from './AdminLayout'
import AdminMonitoringPage from './AdminMonitoringPage'
import AdminAuditTrailPage from './AdminAuditTrailPage'
import AdminUsersPage from './AdminUsersPage'

export default function AdminApp() {
  const { adminRoute, navigate } = useRouter()
  const { isAuthenticated } = useAdminAuth()

  useEffect(() => {
    if (!isAuthenticated && adminRoute !== 'home') {
      navigate('/admin')
    }
  }, [isAuthenticated, adminRoute, navigate])

  useEffect(() => {
    if (isAuthenticated && adminRoute === 'home') {
      navigate('/admin/monitoring')
    }
  }, [isAuthenticated, adminRoute, navigate])

  if (!isAuthenticated) {
    return <AdminLoginPage />
  }

  const layoutActive = adminRoute === 'audit' ? 'audit' : adminRoute === 'users' ? 'users' : 'monitoring'

  return (
    <AdminLayout active={layoutActive}>
      {adminRoute === 'audit' ? (
        <AdminAuditTrailPage />
      ) : adminRoute === 'users' ? (
        <AdminUsersPage />
      ) : (
        <AdminMonitoringPage />
      )}
    </AdminLayout>
  )
}
