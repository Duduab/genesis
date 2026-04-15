export type AgentPresentation = {
  tKey: string | null
  label?: string
  gradient: string
  avatar: string
}

/** Keys align with API agent_id enum (`orchestrator`, `agent_*`). */
const AGENT_PRESENTATION: Record<string, Omit<AgentPresentation, 'label'>> = {
  agent_prompter: { tKey: 'activity.agentPrompter', gradient: 'from-indigo-600 to-violet-500', avatar: 'Prompter' },
  agent_financial: { tKey: 'activity.agentTaxFin', gradient: 'from-amber-600 to-orange-400', avatar: 'TaxFin' },
  agent_spatial: { tKey: 'activity.agentSpatial', gradient: 'from-cyan-600 to-blue-500', avatar: 'Spatial' },
  agent_real_estate: { tKey: 'activity.agentRealEstate', gradient: 'from-emerald-600 to-teal-500', avatar: 'RealEstate' },
  agent_negotiation: { tKey: 'activity.agentNegotiation', gradient: 'from-violet-600 to-fuchsia-500', avatar: 'Negotiation' },
  agent_legal: { tKey: 'activity.agentGovReg', gradient: 'from-genesis-600 to-genesis-400', avatar: 'GovReg' },
  agent_renovation: { tKey: 'activity.agentRenovation', gradient: 'from-orange-600 to-rose-500', avatar: 'Renovation' },
  agent_licensing: { tKey: 'activity.agentLicensing', gradient: 'from-sky-600 to-blue-600', avatar: 'Licensing' },
  agent_procurement: { tKey: 'activity.agentProcurement', gradient: 'from-lime-600 to-emerald-600', avatar: 'Procurement' },
  agent_hr: { tKey: 'activity.agentOpsHR', gradient: 'from-blue-600 to-cyan-400', avatar: 'OpsHR' },
  agent_liaison: { tKey: 'activity.agentLiaison', gradient: 'from-slate-600 to-zinc-500', avatar: 'Liaison' },
}

const FALLBACK_GRADIENTS = [
  'from-genesis-600 to-genesis-400',
  'from-amber-600 to-orange-400',
  'from-blue-600 to-cyan-400',
  'from-violet-600 to-fuchsia-500',
  'from-emerald-600 to-teal-400',
]

function gradientForAgentId(id: string): string {
  let h = 0
  for (let i = 0; i < id.length; i++) h = Math.imul(31, h) + id.charCodeAt(i)
  return FALLBACK_GRADIENTS[Math.abs(h) % FALLBACK_GRADIENTS.length]
}

function humanizeAgentId(agentKey: string): string {
  return agentKey
    .replace(/^agent_/, '')
    .split('_')
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ')
}

export function getAgentPresentation(agentKey: string): AgentPresentation {
  if (agentKey === 'orchestrator') {
    return { tKey: 'activity.agentOrchestrator', gradient: 'from-genesis-600 to-genesis-400', avatar: 'Orchestrator' }
  }
  const known = AGENT_PRESENTATION[agentKey]
  if (known) return { ...known }
  return {
    tKey: null,
    label: humanizeAgentId(agentKey),
    gradient: gradientForAgentId(agentKey),
    avatar: agentKey.replace(/^agent_/, '').replace(/_/g, '') || 'Agent',
  }
}
