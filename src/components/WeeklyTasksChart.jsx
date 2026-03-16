import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { useI18n } from '../i18n/I18nContext'

const getChartData = (t) => [
  { day: t('chart.mon'), agent: 18, manual: 4 },
  { day: t('chart.tue'), agent: 24, manual: 6 },
  { day: t('chart.wed'), agent: 15, manual: 8 },
  { day: t('chart.thu'), agent: 30, manual: 5 },
  { day: t('chart.fri'), agent: 22, manual: 7 },
  { day: t('chart.sat'), agent: 8, manual: 2 },
  { day: t('chart.sun'), agent: 5, manual: 1 },
]

const COLORS = {
  agent: '#6344d6',
  manual: '#c4b8f6',
}

function CustomTooltip({ active, payload, label, t }) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border border-surface-200 bg-white px-3.5 py-2.5 shadow-lg">
      <p className="mb-1.5 text-xs font-semibold text-surface-700">{label}</p>
      {payload.map((entry) => (
        <div key={entry.dataKey} className="flex items-center gap-2 text-xs">
          <span
            className="h-2.5 w-2.5 rounded-sm"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-surface-500">
            {entry.dataKey === 'agent' ? t('chart.agentAutomations') : t('chart.manualActions')}:
          </span>
          <span className="font-semibold text-surface-800">{entry.value}</span>
        </div>
      ))}
    </div>
  )
}

export default function WeeklyTasksChart() {
  const { t } = useI18n()
  const data = getChartData(t)
  const totalAgent = data.reduce((s, d) => s + d.agent, 0)
  const totalManual = data.reduce((s, d) => s + d.manual, 0)

  return (
    <div className="rounded-xl border border-surface-200 bg-white shadow-sm">
      <div className="border-b border-surface-100 px-6 py-4">
        <h2 className="text-base font-semibold text-surface-900">{t('dashboard.weeklyTasks')}</h2>
        <p className="mt-0.5 text-sm text-surface-400">{t('dashboard.subAgentAutomations')}</p>
      </div>

      <div className="px-5 pt-5 pb-2">
        {/* Summary badges */}
        <div className="mb-4 flex gap-3">
          <div className="flex items-center gap-2 rounded-lg bg-genesis-50 px-3 py-1.5">
            <span className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: COLORS.agent }} />
            <span className="text-xs text-surface-500">{t('chart.agents')}</span>
            <span className="text-sm font-bold text-genesis-700">{totalAgent}</span>
          </div>
          <div className="flex items-center gap-2 rounded-lg bg-surface-100 px-3 py-1.5">
            <span className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: COLORS.manual }} />
            <span className="text-xs text-surface-500">{t('chart.manual')}</span>
            <span className="text-sm font-bold text-surface-700">{totalManual}</span>
          </div>
        </div>

        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={data} barGap={3} barCategoryGap="25%">
            <CartesianGrid strokeDasharray="3 3" stroke="#e4e7ef" vertical={false} />
            <XAxis
              dataKey="day"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#9ca3b8', fontSize: 12 }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#9ca3b8', fontSize: 12 }}
              width={30}
            />
            <Tooltip content={<CustomTooltip t={t} />} cursor={{ fill: '#f5f3fe', radius: 6 }} />
            <Bar
              dataKey="agent"
              name={t('chart.agentAutomations')}
              fill={COLORS.agent}
              radius={[5, 5, 0, 0]}
            />
            <Bar
              dataKey="manual"
              name={t('chart.manualActions')}
              fill={COLORS.manual}
              radius={[5, 5, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
