import { useEffect, useMemo, useState } from 'react'
import { useI18n } from '../i18n/I18nContext'
import { useTheme } from '../theme/ThemeContext'
import { loadEffectiveBusinessProfile } from '../dashboard/loadEffectiveBusinessProfile'
import { formatNisFull } from '../utils/formatNis'
import type { RevenueHistoryPoint } from '../types/revenueChart'

function interpolate(template: string, vars: Record<string, string>) {
  return Object.entries(vars).reduce((acc, [k, v]) => acc.replaceAll(`{{${k}}}`, v), template)
}

function hashStr(s: string): number {
  let h = 0
  for (let i = 0; i < s.length; i++) h = Math.imul(31, h) + s.charCodeAt(i)
  return Math.abs(h)
}

/** Full-width path from x=0 to x=width; `phase` advances over time so peaks move without sliding the whole stroke. */
function anchoredWavePath(
  width: number,
  height: number,
  amplitude: number,
  cyclesAcrossWidth: number,
  phase: number,
  verticalShift: number,
  samples: number,
): string {
  const mid = height * 0.52
  const parts: string[] = []
  for (let i = 0; i <= samples; i++) {
    const x = (i / samples) * width
    const t = (x / width) * Math.PI * 2 * cyclesAcrossWidth + phase
    const y = mid + verticalShift + amplitude * Math.sin(t)
    parts.push(i === 0 ? `M ${x.toFixed(2)} ${y.toFixed(2)}` : `L ${x.toFixed(2)} ${y.toFixed(2)}`)
  }
  return parts.join(' ')
}

type Props = {
  /** When wired to API, pass points; otherwise baseline from wizard is used. */
  revenueHistory?: RevenueHistoryPoint[]
}

export default function LiveRevenueFlowChart({ revenueHistory }: Props) {
  void revenueHistory
  const { dark } = useTheme()
  const { t, locale, dir } = useI18n()

  const wave = useMemo(
    () =>
      dark
        ? {
            blur: 3.2,
            cyanU: '#22d3ee',
            cyanLine: '#5eead4',
            cyanUnder: 0.32,
            purpleU: '#c4b5fd',
            purpleLine: '#a78bfa',
            purpleUnder: 0.28,
            orangeU: '#fdba74',
            orangeLine: '#fb923c',
            orangeUnder: 0.3,
            sharpW: 2.25,
          }
        : {
            blur: 1.8,
            cyanU: '#06b6d4',
            cyanLine: '#0e7490',
            cyanUnder: 0.1,
            purpleU: '#7c3aed',
            purpleLine: '#6d28d9',
            purpleUnder: 0.09,
            orangeU: '#ea580c',
            orangeLine: '#c2410c',
            orangeUnder: 0.1,
            sharpW: 2.5,
          },
    [dark],
  )
  const profile = useMemo(() => loadEffectiveBusinessProfile(t), [t, locale])
  const baseline = profile.expectedMonthlyRevenueNis

  const seed = useMemo(() => hashStr(`${profile.categoryId}-${profile.subTypeId}-${baseline}`), [profile, baseline])

  const metrics = useMemo(() => {
    const h = seed
    const peakInt = 92 + (h % 7)
    const peakDec = h % 10
    const peakDisplay = `${peakInt}.${peakDec}%`
    const delta = 10 + (h % 12) + ((h >> 4) % 10) / 10
    const accuracy = 98.8 + (h % 2) * 0.2
    const dataPoints = 11000 + (h % 4000)
    const barPct = 62 + (h % 28)
    return {
      peakDisplay,
      deltaStr: delta.toFixed(1),
      accuracyStr: `${accuracy.toFixed(1)}%`,
      dataPointsStr: dataPoints.toLocaleString(locale === 'he' ? 'he-IL' : 'en-US'),
      barPct,
    }
  }, [seed, locale])

  const revenueFormatted = useMemo(() => formatNisFull(baseline, locale), [baseline, locale])

  const [reduceMotion, setReduceMotion] = useState(() =>
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  )
  const [elapsedSec, setElapsedSec] = useState(0)

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const sync = () => setReduceMotion(mq.matches)
    sync()
    mq.addEventListener('change', sync)
    return () => mq.removeEventListener('change', sync)
  }, [])

  useEffect(() => {
    if (reduceMotion) return
    let id: number
    const tick = () => {
      setElapsedSec(performance.now() / 1000)
      id = requestAnimationFrame(tick)
    }
    id = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(id)
  }, [reduceMotion])

  const unit = 400
  const chartW = unit * 3
  const vbH = 320
  const ampBase = 22 + (baseline / 5000) % 18
  const waveSamples = 144
  const tPhase = reduceMotion ? 0 : elapsedSec * 2.35
  const dCyan = anchoredWavePath(chartW, vbH, ampBase, 3 * 1.15, tPhase, (seed % 6) - 3, waveSamples)
  const dPurple = anchoredWavePath(chartW, vbH, ampBase * 0.85, 3 * 1.4, tPhase * 0.9 + 1.7, 8 + (seed % 5), waveSamples)
  const dOrange = anchoredWavePath(chartW, vbH, ampBase * 0.75, 3 * 0.95, tPhase * -0.82 + 3.1, -10 - (seed % 4), waveSamples)

  const peakSub = interpolate(t('dashboard.liveChart.peakSub'), { delta: metrics.deltaStr })

  return (
    <div
      dir={dir}
      className={
        dark
          ? 'relative mb-8 min-h-[min(360px,70vw)] w-full overflow-hidden rounded-2xl border border-white/[0.08] bg-gradient-to-b from-[#030308] via-[#0a0614] to-[#150a24] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]'
          : 'relative mb-8 min-h-[min(360px,70vw)] w-full overflow-hidden rounded-2xl border border-slate-200/90 bg-gradient-to-b from-white via-slate-50 to-slate-100/95 shadow-sm'
      }
    >
      {/* Grid — light: subtle slate; dark: dim grid */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          opacity: dark ? 0.22 : 0.45,
          backgroundImage: dark
            ? `linear-gradient(rgba(148,163,184,0.12) 1px, transparent 1px),
               linear-gradient(90deg, rgba(148,163,184,0.12) 1px, transparent 1px)`
            : `linear-gradient(rgba(15,23,42,0.07) 1px, transparent 1px),
               linear-gradient(90deg, rgba(15,23,42,0.07) 1px, transparent 1px)`,
          backgroundSize: '22px 22px',
        }}
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-0 dark:opacity-[0.15]"
        style={{
          backgroundImage: `radial-gradient(circle at 20% 30%, rgba(124,58,237,0.12) 0%, transparent 45%),
            radial-gradient(circle at 80% 70%, rgba(6,182,212,0.08) 0%, transparent 40%)`,
        }}
      />
      {/* Subtle “stars” (dark) */}
      <div
        className="pointer-events-none absolute inset-0 opacity-0 dark:opacity-40"
        style={{
          backgroundImage: `radial-gradient(1px 1px at 10% 20%, rgba(255,255,255,0.35), transparent),
            radial-gradient(1px 1px at 80% 40%, rgba(255,255,255,0.25), transparent),
            radial-gradient(1px 1px at 35% 85%, rgba(255,255,255,0.2), transparent),
            radial-gradient(1px 1px at 92% 88%, rgba(255,255,255,0.3), transparent),
            radial-gradient(1px 1px at 55% 12%, rgba(255,255,255,0.2), transparent)`,
        }}
      />

      <svg
        className="absolute inset-0 h-full w-full min-h-[300px]"
        viewBox={`0 0 ${chartW} ${vbH}`}
        preserveAspectRatio="xMidYMid slice"
        aria-hidden
      >
        <defs>
          <filter id="live-chart-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation={wave.blur} result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <g>
          <path
            d={dCyan}
            fill="none"
            stroke={wave.cyanU}
            strokeWidth={dark ? 10 : 8}
            strokeLinecap="round"
            opacity={wave.cyanUnder}
            filter="url(#live-chart-glow)"
          />
          <path
            d={dPurple}
            fill="none"
            stroke={wave.purpleU}
            strokeWidth={dark ? 10 : 8}
            strokeLinecap="round"
            opacity={wave.purpleUnder}
            filter="url(#live-chart-glow)"
          />
          <path
            d={dOrange}
            fill="none"
            stroke={wave.orangeU}
            strokeWidth={dark ? 10 : 8}
            strokeLinecap="round"
            opacity={wave.orangeUnder}
            filter="url(#live-chart-glow)"
          />
          <path
            d={dCyan}
            fill="none"
            stroke={wave.cyanLine}
            strokeWidth={wave.sharpW}
            strokeLinecap="round"
            style={{
              filter: dark ? 'drop-shadow(0 0 10px rgba(34,211,238,0.75))' : 'drop-shadow(0 0 4px rgba(8,145,178,0.35))',
            }}
          />
          <path
            d={dPurple}
            fill="none"
            stroke={wave.purpleLine}
            strokeWidth={dark ? 2 : 2.25}
            strokeLinecap="round"
            style={{
              filter: dark ? 'drop-shadow(0 0 9px rgba(167,139,250,0.7))' : 'drop-shadow(0 0 4px rgba(109,40,217,0.3))',
            }}
          />
          <path
            d={dOrange}
            fill="none"
            stroke={wave.orangeLine}
            strokeWidth={dark ? 2 : 2.25}
            strokeLinecap="round"
            style={{
              filter: dark ? 'drop-shadow(0 0 9px rgba(251,146,60,0.65))' : 'drop-shadow(0 0 4px rgba(194,65,12,0.32))',
            }}
          />
        </g>
      </svg>

      {/* Live badge — always a dark pill (surface tokens invert in .dark) */}
      <div
        className={
          dark
            ? 'pointer-events-none absolute start-1/2 top-3 z-20 flex -translate-x-1/2 items-center gap-2 rounded-full border border-red-500/45 bg-black/70 px-3 py-1.5 shadow-lg backdrop-blur-sm'
            : 'pointer-events-none absolute start-1/2 top-3 z-20 flex -translate-x-1/2 items-center gap-2 rounded-full border border-red-200 bg-slate-800 px-3 py-1.5 shadow-md'
        }
      >
        <span className="text-[10px] font-bold uppercase tracking-wider text-white">{t('dashboard.liveChart.live_data_label')}</span>
        <span className="relative flex h-2 w-2">
          <span className="live-data-dot absolute inset-0 rounded-full bg-red-500 shadow-[0_0_8px_#ef4444]" />
        </span>
      </div>

      {/* Legend — start = top “left” in LTR, top “right” in RTL */}
      <div className="absolute start-3 top-12 z-20 flex flex-col gap-2 sm:start-4 sm:top-14">
        <div
          className={
            dark
              ? 'flex items-center gap-2 text-[11px] font-semibold text-white/88'
              : 'flex items-center gap-2 text-[11px] font-semibold text-slate-800'
          }
        >
          <span
            className={
              dark
                ? 'h-0.5 w-6 rounded-full bg-cyan-400 shadow-[0_0_12px_rgba(34,211,238,0.85)]'
                : 'h-0.5 w-6 rounded-full bg-cyan-600 shadow-[0_0_6px_rgba(8,145,178,0.45)]'
            }
          />
          <span>{t('dashboard.liveChart.legendRevenue')}</span>
        </div>
        <div
          className={
            dark
              ? 'flex items-center gap-2 text-[11px] font-semibold text-white/88'
              : 'flex items-center gap-2 text-[11px] font-semibold text-slate-800'
          }
        >
          <span
            className={
              dark
                ? 'h-0.5 w-6 rounded-full bg-violet-400 shadow-[0_0_12px_rgba(167,139,250,0.8)]'
                : 'h-0.5 w-6 rounded-full bg-violet-600 shadow-[0_0_6px_rgba(124,58,237,0.4)]'
            }
          />
          <span>{t('dashboard.liveChart.legendScenario')}</span>
        </div>
        <div
          className={
            dark
              ? 'flex items-center gap-2 text-[11px] font-semibold text-white/88'
              : 'flex items-center gap-2 text-[11px] font-semibold text-slate-800'
          }
        >
          <span
            className={
              dark
                ? 'h-0.5 w-6 rounded-full bg-orange-400 shadow-[0_0_12px_rgba(251,146,60,0.8)]'
                : 'h-0.5 w-6 rounded-full bg-orange-600 shadow-[0_0_6px_rgba(234,88,12,0.4)]'
            }
          />
          <span>{t('dashboard.liveChart.legendEmployees')}</span>
        </div>
      </div>

      {/* Peak — end = top right in LTR */}
      <div
        className={
          dark
            ? 'absolute end-3 top-12 z-20 w-[min(100%,200px)] rounded-xl border border-cyan-400/30 bg-[#0e131c]/90 p-3 shadow-[0_8px_32px_rgba(0,0,0,0.45)] backdrop-blur-md sm:end-4 sm:top-14 sm:p-3.5'
            : 'absolute end-3 top-12 z-20 w-[min(100%,200px)] rounded-xl border border-cyan-200/90 bg-white/95 p-3 shadow-md backdrop-blur-sm sm:end-4 sm:top-14 sm:p-3.5'
        }
      >
        <p className={dark ? 'text-[10px] font-medium text-white/50' : 'text-[10px] font-medium text-slate-500'}>
          {t('dashboard.liveChart.peakTitle')}
        </p>
        <p className={dark ? 'mt-1 text-2xl font-bold tabular-nums text-white' : 'mt-1 text-2xl font-bold tabular-nums text-slate-900'}>
          {metrics.peakDisplay}
        </p>
        <p className={dark ? 'mt-1 text-[11px] font-medium text-emerald-400' : 'mt-1 text-[11px] font-medium text-emerald-600'}>{peakSub}</p>
      </div>

      {/* Metrics — bottom start */}
      <div
        className={
          dark
            ? 'absolute bottom-3 start-3 z-20 flex w-[min(100%,240px)] gap-0 rounded-xl border border-violet-500/28 bg-[#0e131c]/90 shadow-[0_8px_32px_rgba(0,0,0,0.45)] backdrop-blur-md sm:bottom-4 sm:start-4'
            : 'absolute bottom-3 start-3 z-20 flex w-[min(100%,240px)] gap-0 rounded-xl border border-violet-200/90 bg-white/95 shadow-md backdrop-blur-sm sm:bottom-4 sm:start-4'
        }
      >
        <div
          className={
            dark
              ? 'flex flex-1 flex-col border-e border-white/10 px-3 py-2.5'
              : 'flex flex-1 flex-col border-e border-slate-200 px-3 py-2.5'
          }
        >
          <span className={dark ? 'text-[10px] font-medium text-white/45' : 'text-[10px] font-medium text-slate-500'}>
            {t('dashboard.liveChart.accuracyLabel')}
          </span>
          <span className={dark ? 'mt-0.5 text-lg font-bold tabular-nums text-cyan-300' : 'mt-0.5 text-lg font-bold tabular-nums text-cyan-700'}>
            {metrics.accuracyStr}
          </span>
        </div>
        <div className="flex flex-1 flex-col px-3 py-2.5">
          <span className={dark ? 'text-[10px] font-medium text-white/45' : 'text-[10px] font-medium text-slate-500'}>
            {t('dashboard.liveChart.dataPointsLabel')}
          </span>
          <span className={dark ? 'mt-0.5 text-lg font-bold tabular-nums text-white' : 'mt-0.5 text-lg font-bold tabular-nums text-slate-900'}>
            {metrics.dataPointsStr}
          </span>
        </div>
      </div>

      {/* Average — bottom end */}
      <div
        className={
          dark
            ? 'absolute bottom-3 end-3 z-20 w-[min(100%,200px)] rounded-xl border border-orange-400/35 bg-[#0e131c]/90 p-3 shadow-[0_8px_32px_rgba(0,0,0,0.45)] backdrop-blur-md sm:bottom-4 sm:end-4 sm:p-3.5'
            : 'absolute bottom-3 end-3 z-20 w-[min(100%,200px)] rounded-xl border border-orange-200/90 bg-white/95 p-3 shadow-md backdrop-blur-sm sm:bottom-4 sm:end-4 sm:p-3.5'
        }
      >
        <p className={dark ? 'text-[10px] font-medium text-white/50' : 'text-[10px] font-medium text-slate-500'}>
          {t('dashboard.liveChart.averageTitle')}
        </p>
        <p
          className={
            dark
              ? 'mt-1 truncate text-xl font-bold tabular-nums text-white'
              : 'mt-1 truncate text-xl font-bold tabular-nums text-slate-900'
          }
          title={revenueFormatted}
        >
          {revenueFormatted}
        </p>
        <div className="mt-2 flex items-center gap-2">
          <span className={dark ? 'text-[10px] font-semibold tabular-nums text-orange-400' : 'text-[10px] font-semibold tabular-nums text-orange-600'}>
            {metrics.barPct}%
          </span>
          <div className={dark ? 'h-1 flex-1 overflow-hidden rounded-full bg-white/12' : 'h-1 flex-1 overflow-hidden rounded-full bg-slate-200'}>
            <div
              className="h-full rounded-full bg-gradient-to-r from-orange-500 to-cyan-500"
              style={{ width: `${metrics.barPct}%` }}
            />
          </div>
        </div>
      </div>

      {/* Section title for a11y */}
      <span className="sr-only">{t('dashboard.liveChart.a11yTitle')}</span>
    </div>
  )
}
