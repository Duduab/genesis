import { useI18n } from '../i18n/I18nContext'
import heroImg from '../assets/hero.png'

const nodes = [
  { x: '22%', y: '22%', size: 9, delay: '0.2s', dur: '8.5s' },
  { x: '72%', y: '20%', size: 7, delay: '1.2s', dur: '10s' },
  { x: '48%', y: '52%', size: 11, delay: '0.4s', dur: '9s' },
  { x: '82%', y: '62%', size: 6, delay: '2.1s', dur: '7.5s' },
  { x: '28%', y: '72%', size: 8, delay: '1.6s', dur: '11s' },
  { x: '58%', y: '38%', size: 8, delay: '0.9s', dur: '8s' },
  { x: '14%', y: '48%', size: 5, delay: '3s', dur: '12s' },
]

const connections = [
  { x1: '22%', y1: '22%', x2: '48%', y2: '52%' },
  { x1: '48%', y1: '52%', x2: '72%', y2: '20%' },
  { x1: '72%', y1: '20%', x2: '82%', y2: '62%' },
  { x1: '28%', y1: '72%', x2: '48%', y2: '52%' },
  { x1: '58%', y1: '38%', x2: '82%', y2: '62%' },
  { x1: '14%', y1: '48%', x2: '28%', y2: '72%' },
  { x1: '22%', y1: '22%', x2: '58%', y2: '38%' },
]

/** Right-hand hero for `/admin` login — same visual language as {@link AuthHeroPanel}, different image and copy. */
export default function AdminAuthHeroPanel() {
  const { t } = useI18n()

  const stats = [
    { label: t('auth.adminHero.stat1Label'), value: t('auth.adminHero.stat1Value') },
    { label: t('auth.adminHero.stat2Label'), value: t('auth.adminHero.stat2Value') },
    { label: t('auth.adminHero.stat3Label'), value: t('auth.adminHero.stat3Value') },
  ]

  return (
    <div className="landing-authora-mesh relative hidden h-full overflow-hidden lg:flex lg:flex-col lg:justify-between">
      <div className="pointer-events-none absolute inset-0">
        <div
          className="absolute h-[480px] w-[480px] rounded-full opacity-30 blur-[100px]"
          style={{
            background: 'radial-gradient(circle, rgba(99, 102, 241, 0.5) 0%, transparent 70%)',
            top: '8%',
            left: '18%',
            animation: 'auth-float 13s ease-in-out infinite',
          }}
        />
        <div
          className="absolute h-[380px] w-[380px] rounded-full opacity-22 blur-[85px]"
          style={{
            background: 'radial-gradient(circle, rgba(6, 182, 212, 0.45) 0%, transparent 70%)',
            bottom: '12%',
            right: '12%',
            animation: 'auth-float 16s ease-in-out infinite 2s',
          }}
        />
        <div
          className="absolute h-[280px] w-[280px] rounded-full opacity-18 blur-[55px]"
          style={{
            background: 'radial-gradient(circle, rgba(139, 92, 246, 0.38) 0%, transparent 70%)',
            top: '48%',
            left: '55%',
            animation: 'auth-float 11s ease-in-out infinite 3s',
          }}
        />
      </div>

      <svg className="pointer-events-none absolute inset-0 h-full w-full">
        {connections.map((conn, i) => (
          <line
            key={i}
            x1={conn.x1}
            y1={conn.y1}
            x2={conn.x2}
            y2={conn.y2}
            stroke="#a78bfa"
            strokeWidth="1"
            opacity="0.14"
            strokeDasharray="6 4"
            style={{ animation: `auth-line-draw ${6 + i}s linear infinite`, strokeDashoffset: 0 }}
          />
        ))}
        {nodes.map((node, i) => (
          <g key={i}>
            <circle
              cx={node.x}
              cy={node.y}
              r={node.size + 8}
              fill="#6366f1"
              opacity="0.07"
              style={{ animation: `auth-pulse ${node.dur} ease-in-out infinite ${node.delay}` }}
            />
            <circle
              cx={node.x}
              cy={node.y}
              r={node.size}
              fill="#7c3aed"
              opacity="0.45"
              style={{ animation: `auth-pulse ${node.dur} ease-in-out infinite ${node.delay}` }}
            />
            <circle cx={node.x} cy={node.y} r={3} fill="#c4b5fd" opacity="0.9" />
          </g>
        ))}
      </svg>

      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="relative h-[220px] w-[220px]">
          <div
            className="absolute h-3 w-3 rounded-full bg-violet-400 shadow-lg shadow-violet-400/45"
            style={{
              animation: 'auth-orbit 22s linear infinite',
              top: '50%',
              left: '50%',
              marginTop: '-6px',
              marginLeft: '-6px',
            }}
          />
          <div
            className="absolute h-2 w-2 rounded-full bg-cyan-400"
            style={{
              animation: 'auth-orbit 30s linear infinite reverse',
              top: '50%',
              left: '50%',
              marginTop: '-4px',
              marginLeft: '-4px',
            }}
          />
        </div>
      </div>

      <div className="relative z-10 flex flex-1 flex-col justify-between px-12 py-14 xl:px-16">
        <div className="flex items-center gap-3">
          <img
            src="/logos/logo-specialty.png"
            alt={t('auth.adminLogin.consoleLogoAlt')}
            className="h-10 w-auto object-contain opacity-90 brightness-0 invert"
            style={{ aspectRatio: 'auto' }}
          />
        </div>

        <div className="max-w-lg">
          <div className="mb-8 overflow-hidden rounded-2xl border border-white/15 shadow-[0_24px_80px_rgba(0,0,0,0.35)] ring-1 ring-white/10">
            <img src={heroImg} alt={t('auth.adminLogin.heroImageAlt')} className="h-44 w-full object-cover sm:h-52" />
          </div>
          <h1 className="whitespace-pre-line text-4xl font-bold leading-tight tracking-tight text-white xl:text-5xl">
            {t('auth.adminHero.headline')}
          </h1>
          <p className="mt-5 max-w-md text-base leading-relaxed text-violet-100/85">{t('auth.adminHero.subtext')}</p>
        </div>

        <div className="flex gap-8">
          {stats.map((s) => (
            <div key={s.label}>
              <p className="text-2xl font-bold text-white">{s.value}</p>
              <p className="mt-0.5 text-xs text-violet-200/75">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
