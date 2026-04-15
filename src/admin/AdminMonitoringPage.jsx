import { useQuery } from '@tanstack/react-query'
import { useEffect, useMemo, useState } from 'react'
import {
  fetchAgentHealth,
  fetchAgentMetrics,
  fetchAgentMetricsById,
  fetchBusinessCostBreakdown,
  fetchMonitoringOverview,
} from '../api/genesis/monitoringApi'
import { isGenesisApiError } from '../api/genesis/errors'

const poll = { refetchInterval: 30_000 }

function StatCard({ title, value, sub }) {
  return (
    <div className="rounded-xl border border-surface-200 bg-white p-4 shadow-sm dark:border-surface-800 dark:bg-surface-900">
      <p className="text-xs font-medium uppercase tracking-wide text-surface-500 dark:text-surface-400">{title}</p>
      <p className="mt-1 text-2xl font-bold tabular-nums text-surface-900 dark:text-surface-50">{value}</p>
      {sub ? <p className="mt-1 text-xs text-surface-400">{sub}</p> : null}
    </div>
  )
}

function healthDotClass(status) {
  const s = String(status || '').toUpperCase()
  if (s === 'HEALTHY') return 'bg-emerald-500'
  if (s === 'DEGRADED') return 'bg-amber-500'
  if (s === 'STUCK') return 'bg-red-600'
  return 'bg-surface-400'
}

function fmtNum(n) {
  if (n == null || Number.isNaN(Number(n))) return '—'
  return String(n)
}

function fmtUsd(v) {
  if (v == null || v === '') return '—'
  const n = Number(v)
  if (Number.isNaN(n)) return String(v)
  return n.toLocaleString(undefined, { style: 'currency', currency: 'USD', maximumFractionDigits: 2 })
}

export default function AdminMonitoringPage() {
  const [selectedAgentId, setSelectedAgentId] = useState(null)
  const [businessId, setBusinessId] = useState('')

  const overviewQ = useQuery({ queryKey: ['admin', 'monitoring', 'overview'], queryFn: fetchMonitoringOverview, ...poll })
  const metricsQ = useQuery({ queryKey: ['admin', 'monitoring', 'agent-metrics'], queryFn: fetchAgentMetrics, ...poll })
  const healthQ = useQuery({ queryKey: ['admin', 'monitoring', 'agent-health'], queryFn: fetchAgentHealth, ...poll })

  const agentDetailQ = useQuery({
    queryKey: ['admin', 'monitoring', 'agent-metrics', selectedAgentId],
    queryFn: () => fetchAgentMetricsById(selectedAgentId),
    enabled: Boolean(selectedAgentId),
    ...poll,
  })

  const overview = overviewQ.data
  const costRows = overview?.cost_by_business ?? []

  useEffect(() => {
    if (!businessId && costRows.length > 0) {
      setBusinessId(costRows[0].business_id)
    }
  }, [businessId, costRows])

  const costQ = useQuery({
    queryKey: ['admin', 'monitoring', 'business-cost', businessId],
    queryFn: () => fetchBusinessCostBreakdown(businessId),
    enabled: Boolean(businessId),
    ...poll,
  })

  const err =
    (overviewQ.error && (isGenesisApiError(overviewQ.error) ? overviewQ.error.message : String(overviewQ.error))) ||
    (metricsQ.error && (isGenesisApiError(metricsQ.error) ? metricsQ.error.message : String(metricsQ.error))) ||
    (healthQ.error && (isGenesisApiError(healthQ.error) ? healthQ.error.message : String(healthQ.error))) ||
    null

  const agentRows = useMemo(() => metricsQ.data ?? [], [metricsQ.data])
  const healthRows = useMemo(() => healthQ.data ?? [], [healthQ.data])

  const totalAgents = healthRows.length || agentRows.length
  const degradedOrStuck = (overview?.agents_degraded ?? 0) + (overview?.agents_stuck ?? 0)
  const errorRateLabel =
    totalAgents > 0 ? `${(((degradedOrStuck) / totalAgents) * 100).toFixed(0)}% agents not healthy` : '—'

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-surface-900 dark:text-surface-50">System health</h1>
        <p className="mt-1 text-sm text-surface-500 dark:text-surface-400">Observability overview, agents, and business cost.</p>
      </div>

      {err ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200">
          {err}
        </div>
      ) : null}

      <section>
        <h2 className="mb-3 text-sm font-semibold text-surface-800 dark:text-surface-200">Overview</h2>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard title="Active businesses" value={fmtNum(overview?.total_active_businesses)} sub={`${fmtNum(overview?.total_active_tasks)} active tasks`} />
          <StatCard
            title="LLM cost (today)"
            value={fmtUsd(overview?.total_llm_cost_usd_today)}
            sub={overview?.total_llm_cost_usd_month != null ? `Month: ${fmtUsd(overview.total_llm_cost_usd_month)}` : undefined}
          />
          <StatCard
            title="Agent health"
            value={`${fmtNum(overview?.agents_healthy)} ok`}
            sub={`${fmtNum(overview?.agents_degraded)} degraded · ${fmtNum(overview?.agents_stuck)} stuck`}
          />
          <StatCard title="Risk exposure" value={errorRateLabel} sub="Share of agents not fully healthy" />
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold text-surface-800 dark:text-surface-200">Agent status</h2>
        <div className="overflow-x-auto rounded-xl border border-surface-200 bg-white dark:border-surface-800 dark:bg-surface-900">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-surface-200 bg-surface-50 text-xs uppercase text-surface-500 dark:border-surface-800 dark:bg-surface-800/50 dark:text-surface-400">
              <tr>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Agent</th>
                <th className="px-3 py-2">Active tasks</th>
                <th className="px-3 py-2">Avg duration (min)</th>
                <th className="px-3 py-2">Failure rate (1h)</th>
                <th className="px-3 py-2">Token budget left</th>
                <th className="px-3 py-2">Last activity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-100 dark:divide-surface-800">
              {healthRows.map((row) => (
                <tr key={row.agent_id} className="text-surface-800 dark:text-surface-200">
                  <td className="px-3 py-2">
                    <span className="inline-flex items-center gap-2">
                      <span className={`h-2.5 w-2.5 rounded-full ${healthDotClass(row.status)}`} title={row.status} />
                      <span className="text-xs font-medium">{row.status ?? '—'}</span>
                    </span>
                  </td>
                  <td className="px-3 py-2 font-mono text-xs">{row.agent_id}</td>
                  <td className="px-3 py-2 tabular-nums">{fmtNum(row.active_tasks)}</td>
                  <td className="px-3 py-2 tabular-nums">{row.avg_task_duration_minutes != null ? row.avg_task_duration_minutes.toFixed(1) : '—'}</td>
                  <td className="px-3 py-2 tabular-nums">
                    {row.failure_rate_last_hour != null ? `${(row.failure_rate_last_hour * 100).toFixed(1)}%` : '—'}
                  </td>
                  <td className="px-3 py-2 tabular-nums">
                    {row.token_budget_remaining_pct != null ? `${(row.token_budget_remaining_pct * 100).toFixed(0)}%` : '—'}
                  </td>
                  <td className="px-3 py-2 text-xs text-surface-500">{row.last_activity ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {healthQ.isLoading ? <p className="px-3 py-4 text-sm text-surface-500">Loading…</p> : null}
          {!healthQ.isLoading && healthRows.length === 0 ? <p className="px-3 py-4 text-sm text-surface-500">No health rows.</p> : null}
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold text-surface-800 dark:text-surface-200">Agent metrics</h2>
        <div className="overflow-x-auto rounded-xl border border-surface-200 bg-white dark:border-surface-800 dark:bg-surface-900">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-surface-200 bg-surface-50 text-xs uppercase text-surface-500 dark:border-surface-800 dark:bg-surface-800/50 dark:text-surface-400">
              <tr>
                <th className="px-3 py-2">Agent</th>
                <th className="px-3 py-2">Calls</th>
                <th className="px-3 py-2">Input tokens</th>
                <th className="px-3 py-2">Output tokens</th>
                <th className="px-3 py-2">Cost (USD)</th>
                <th className="px-3 py-2">Success rate</th>
                <th className="px-3 py-2">Avg latency (ms)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-100 dark:divide-surface-800">
              {agentRows.map((row) => {
                const on = selectedAgentId === row.agent_id
                return (
                  <tr
                    key={row.agent_id}
                    className={`cursor-pointer text-surface-800 dark:text-surface-200 ${on ? 'bg-genesis-50 dark:bg-genesis-950/30' : 'hover:bg-surface-50 dark:hover:bg-surface-800/40'}`}
                    onClick={() => setSelectedAgentId(row.agent_id)}
                  >
                    <td className="px-3 py-2 font-mono text-xs">{row.agent_id}</td>
                    <td className="px-3 py-2 tabular-nums">{fmtNum(row.total_calls)}</td>
                    <td className="px-3 py-2 tabular-nums">{fmtNum(row.total_input_tokens)}</td>
                    <td className="px-3 py-2 tabular-nums">{fmtNum(row.total_output_tokens)}</td>
                    <td className="px-3 py-2 tabular-nums">{fmtUsd(row.total_cost_usd)}</td>
                    <td className="px-3 py-2 tabular-nums">{row.success_rate != null ? `${(row.success_rate * 100).toFixed(1)}%` : '—'}</td>
                    <td className="px-3 py-2 tabular-nums">{row.avg_latency_ms != null ? row.avg_latency_ms.toFixed(0) : '—'}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          {metricsQ.isLoading ? <p className="px-3 py-4 text-sm text-surface-500">Loading…</p> : null}
        </div>

        {selectedAgentId ? (
          <div className="mt-4 rounded-xl border border-surface-200 bg-surface-50 p-4 dark:border-surface-800 dark:bg-surface-900">
            <h3 className="text-sm font-semibold text-surface-900 dark:text-surface-50">Drill-down: {selectedAgentId}</h3>
            {agentDetailQ.isLoading ? <p className="mt-2 text-sm text-surface-500">Loading detail…</p> : null}
            {agentDetailQ.data ? (
              <pre className="mt-2 max-h-64 overflow-auto rounded-lg bg-white p-3 text-xs dark:bg-surface-950">{JSON.stringify(agentDetailQ.data, null, 2)}</pre>
            ) : null}
            {agentDetailQ.error ? (
              <p className="mt-2 text-sm text-red-600">{isGenesisApiError(agentDetailQ.error) ? agentDetailQ.error.message : String(agentDetailQ.error)}</p>
            ) : null}
          </div>
        ) : (
          <p className="mt-2 text-xs text-surface-500">Select a row to load GET /api/v1/monitoring/agent-metrics/{'{id}'}</p>
        )}
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold text-surface-800 dark:text-surface-200">Business cost breakdown</h2>
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <label className="block text-xs font-medium text-surface-600 dark:text-surface-400" htmlFor="biz-cost">
              Business
            </label>
            <select
              id="biz-cost"
              className="mt-1 min-w-[240px] rounded-lg border border-surface-200 bg-white px-3 py-2 text-sm dark:border-surface-700 dark:bg-surface-950"
              value={businessId}
              onChange={(e) => setBusinessId(e.target.value)}
            >
              {costRows.map((b) => (
                <option key={b.business_id} value={b.business_id}>
                  {(b.entrepreneur_name || b.business_id).slice(0, 48)} — {b.business_type ?? '—'}
                </option>
              ))}
            </select>
          </div>
        </div>
        {costQ.isLoading ? <p className="mt-3 text-sm text-surface-500">Loading cost…</p> : null}
        {costQ.data ? (
          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <div className="rounded-xl border border-surface-200 bg-white p-4 dark:border-surface-800 dark:bg-surface-900">
              <p className="text-xs font-medium text-surface-500">Totals</p>
              <p className="mt-1 text-sm text-surface-800 dark:text-surface-200">
                LLM (USD): <span className="font-mono">{String(costQ.data.total_llm_cost_usd ?? '—')}</span>
              </p>
              <p className="mt-1 text-sm text-surface-800 dark:text-surface-200">
                Budget spent (ILS): <span className="font-mono">{String(costQ.data.total_budget_spent_ils ?? '—')}</span>
              </p>
            </div>
            <div className="rounded-xl border border-surface-200 bg-white p-4 dark:border-surface-800 dark:bg-surface-900">
              <p className="text-xs font-medium text-surface-500">Cost by agent</p>
              <pre className="mt-2 max-h-48 overflow-auto text-xs">{JSON.stringify(costQ.data.cost_by_agent ?? {}, null, 2)}</pre>
            </div>
            <div className="rounded-xl border border-surface-200 bg-white p-4 lg:col-span-2 dark:border-surface-800 dark:bg-surface-900">
              <p className="text-xs font-medium text-surface-500">Token usage by agent</p>
              <pre className="mt-2 max-h-48 overflow-auto text-xs">{JSON.stringify(costQ.data.token_usage_by_agent ?? {}, null, 2)}</pre>
            </div>
          </div>
        ) : null}
        {costQ.error ? (
          <p className="mt-2 text-sm text-red-600">{isGenesisApiError(costQ.error) ? costQ.error.message : String(costQ.error)}</p>
        ) : null}
      </section>
    </div>
  )
}
