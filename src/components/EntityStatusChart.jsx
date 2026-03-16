import { PieChart, Pie, Cell, ResponsiveContainer, Sector } from 'recharts'
import { useState } from 'react'
import { useI18n } from '../i18n/I18nContext'

const rawData = [
  { tKey: 'entities.statusActive', value: 5, color: '#10b981' },
  { tKey: 'chart.pendingRegistration', value: 3, color: '#6344d6' },
  { tKey: 'entities.statusPendingVat', value: 2, color: '#f59e0b' },
  { tKey: 'entities.statusUnderReview', value: 1, color: '#3b82f6' },
  { tKey: 'entities.statusDormant', value: 1, color: '#9ca3b8' },
]

function renderActiveShape(props) {
  const {
    cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, payload, value,
  } = props

  return (
    <g>
      <text x={cx} y={cy - 8} textAnchor="middle" fill="#111827" fontSize={22} fontWeight={700}>
        {value}
      </text>
      <text x={cx} y={cy + 12} textAnchor="middle" fill="#9ca3b8" fontSize={11}>
        {payload.name}
      </text>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 6}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
        cornerRadius={4}
      />
    </g>
  )
}

export default function EntityStatusChart() {
  const { t } = useI18n()
  const [activeIndex, setActiveIndex] = useState(0)
  const data = rawData.map((item) => ({ ...item, name: t(item.tKey) }))
  const total = data.reduce((s, d) => s + d.value, 0)

  return (
    <div className="rounded-xl border border-surface-200 bg-white shadow-sm">
      <div className="border-b border-surface-100 px-6 py-4">
        <h2 className="text-base font-semibold text-surface-900">{t('dashboard.entityStatus')}</h2>
        <p className="mt-0.5 text-sm text-surface-400">{t('dashboard.subPhaseBreakdown')}</p>
      </div>

      <div className="flex flex-col items-center gap-4 p-5 sm:flex-row sm:items-start">
        {/* Donut chart */}
        <div className="h-[200px] w-[200px] shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={58}
                outerRadius={80}
                paddingAngle={3}
                dataKey="value"
                activeIndex={activeIndex}
                activeShape={renderActiveShape}
                onMouseEnter={(_, index) => setActiveIndex(index)}
                cornerRadius={4}
                stroke="none"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Legend */}
        <div className="flex flex-1 flex-col gap-2.5 sm:pt-2">
          {data.map((item, idx) => {
            const pct = Math.round((item.value / total) * 100)
            return (
              <div
                key={item.tKey}
                className={`flex cursor-default items-center gap-3 rounded-lg px-3 py-2 transition-colors ${
                  idx === activeIndex ? 'bg-surface-50' : 'hover:bg-surface-50/60'
                }`}
                onMouseEnter={() => setActiveIndex(idx)}
              >
                <span
                  className="h-3 w-3 shrink-0 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="flex-1 text-sm text-surface-600">{item.name}</span>
                <span className="text-sm font-bold text-surface-800">{item.value}</span>
                <span className="w-10 text-end text-xs text-surface-400">{pct}%</span>
              </div>
            )
          })}

          <div className="mt-1 border-t border-surface-100 pt-2.5">
            <div className="flex items-center justify-between px-3">
              <span className="text-sm font-medium text-surface-500">{t('chart.totalEntities')}</span>
              <span className="text-base font-bold text-surface-900">{total}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
