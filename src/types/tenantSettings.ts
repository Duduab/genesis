/** GET/PUT `/api/v1/settings/notification-prefs` */
export interface NotificationPrefs {
  email_on_approval: boolean
  email_on_completion: boolean
  email_on_error: boolean
  push_enabled: boolean
}

/** GET/PUT `/api/v1/settings/guardrails` */
export interface GenesisGuardrails {
  max_messages_per_agent: Record<string, number>
  max_budget_per_stage_ils: number
  require_approval_above_ils: number
  blocked_agents: string[]
}

export interface BillingUpgradeBody {
  plan: string
}
