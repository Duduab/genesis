import { Link } from '../router'
import AppVersionBadge from './AppVersionBadge'

/**
 * Logo + version badge for auth / registration screens.
 * @param {{ to?: string, logoClassName?: string, badgeVariant?: 'dark' | 'light' }} props
 */
export default function AuthPageBrand({
  to = '/login',
  logoClassName = 'animate-fade-in h-12 w-auto object-contain',
  badgeVariant = 'light',
}) {
  return (
    <Link to={to} className="flex items-center gap-2">
      <img
        src="/logos/logo-primary.png"
        alt="Genesis Technologies"
        className={logoClassName}
        style={{ aspectRatio: 'auto' }}
      />
      <AppVersionBadge variant={badgeVariant} />
    </Link>
  )
}
