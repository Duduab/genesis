import { useI18n } from '../i18n/I18nContext'

const nodes = [
  { x: '20%', y: '25%', size: 10, delay: '0s', dur: '8s' },
  { x: '70%', y: '18%', size: 7, delay: '1s', dur: '10s' },
  { x: '45%', y: '55%', size: 12, delay: '0.5s', dur: '9s' },
  { x: '80%', y: '65%', size: 6, delay: '2s', dur: '7s' },
  { x: '30%', y: '75%', size: 9, delay: '1.5s', dur: '11s' },
  { x: '60%', y: '40%', size: 8, delay: '0.8s', dur: '8.5s' },
  { x: '15%', y: '50%', size: 5, delay: '3s', dur: '12s' },
]

const connections = [
  { x1: '20%', y1: '25%', x2: '45%', y2: '55%' },
  { x1: '45%', y1: '55%', x2: '70%', y2: '18%' },
  { x1: '70%', y1: '18%', x2: '80%', y2: '65%' },
  { x1: '30%', y1: '75%', x2: '45%', y2: '55%' },
  { x1: '60%', y1: '40%', x2: '80%', y2: '65%' },
  { x1: '15%', y1: '50%', x2: '30%', y2: '75%' },
  { x1: '20%', y1: '25%', x2: '60%', y2: '40%' },
]

export default function AuthHeroPanel() {
  const { t } = useI18n()

  const stats = [
    { label: t('auth.hero.stat1Label'), value: t('auth.hero.stat1Value') },
    { label: t('auth.hero.stat2Label'), value: t('auth.hero.stat2Value') },
    { label: t('auth.hero.stat3Label'), value: t('auth.hero.stat3Value') },
  ]

  return (
    <div className="landing-authora-mesh relative hidden h-full overflow-hidden lg:flex lg:flex-col lg:justify-between">
      {/* Gradient layers — cyan / blue / violet (Authora-style) */}
      <div className="pointer-events-none absolute inset-0">
        <div
          className="absolute h-[500px] w-[500px] rounded-full opacity-35 blur-[100px]"
          style={{ background: 'radial-gradient(circle, rgba(6, 182, 212, 0.55) 0%, transparent 70%)', top: '10%', left: '20%', animation: 'auth-float 12s ease-in-out infinite' }}
        />
        <div
          className="absolute h-[400px] w-[400px] rounded-full opacity-25 blur-[80px]"
          style={{ background: 'radial-gradient(circle, rgba(124, 58, 237, 0.45) 0%, transparent 70%)', bottom: '10%', right: '15%', animation: 'auth-float 15s ease-in-out infinite 2s' }}
        />
        <div
          className="absolute h-[300px] w-[300px] rounded-full opacity-20 blur-[60px]"
          style={{ background: 'radial-gradient(circle, rgba(59, 130, 246, 0.4) 0%, transparent 70%)', top: '50%', left: '60%', animation: 'auth-float 10s ease-in-out infinite 4s' }}
        />
      </div>

      {/* Network SVG */}
      <svg className="pointer-events-none absolute inset-0 h-full w-full">
        {connections.map((conn, i) => (
          <line
            key={i}
            x1={conn.x1} y1={conn.y1} x2={conn.x2} y2={conn.y2}
            stroke="#06b6d4"
            strokeWidth="1"
            opacity="0.15"
            strokeDasharray="6 4"
            style={{ animation: `auth-line-draw ${6 + i}s linear infinite`, strokeDashoffset: 0 }}
          />
        ))}
        {nodes.map((node, i) => (
          <g key={i}>
            <circle
              cx={node.x} cy={node.y} r={node.size + 8}
              fill="#0891b2"
              opacity="0.08"
              style={{ animation: `auth-pulse ${node.dur} ease-in-out infinite ${node.delay}` }}
            />
            <circle
              cx={node.x} cy={node.y} r={node.size}
              fill="#7c3aed"
              opacity="0.5"
              style={{ animation: `auth-pulse ${node.dur} ease-in-out infinite ${node.delay}` }}
            />
            <circle
              cx={node.x} cy={node.y} r={3}
              fill="#67e8f9"
              opacity="0.9"
            />
          </g>
        ))}
      </svg>

      {/* Orbiting dot */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="relative h-[240px] w-[240px]">
          <div
            className="absolute h-3 w-3 rounded-full bg-cyan-400 shadow-lg shadow-cyan-400/50"
            style={{ animation: 'auth-orbit 20s linear infinite', top: '50%', left: '50%', marginTop: '-6px', marginLeft: '-6px' }}
          />
          <div
            className="absolute h-2 w-2 rounded-full bg-violet-400"
            style={{ animation: 'auth-orbit 28s linear infinite reverse', top: '50%', left: '50%', marginTop: '-4px', marginLeft: '-4px' }}
          />
        </div>
      </div>

      {/* Content overlay */}
      <div className="relative z-10 flex flex-1 flex-col justify-between px-12 py-14 xl:px-16">
        <div className="flex items-center gap-3">
          {/* <img
            src="/logos/logo-primary.png"
            alt="Genesis Technologies"
            className="h-10 w-auto brightness-0 invert opacity-80 object-contain"
            style={{ aspectRatio: 'auto' }}
          /> */}
        </div>

        <div>
          <h1 className="whitespace-pre-line text-4xl font-bold leading-tight tracking-tight text-white xl:text-5xl">
            {t('auth.hero.headline')}
          </h1>
          <p className="mt-5 max-w-md text-base leading-relaxed text-genesis-200/80">
            {t('auth.hero.subtext')}
          </p>
        </div>

        <div className="flex gap-8">
          {stats.map((s) => (
            <div key={s.label}>
              <p className="text-2xl font-bold text-white">{s.value}</p>
              <p className="mt-0.5 text-xs text-genesis-300/70">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
