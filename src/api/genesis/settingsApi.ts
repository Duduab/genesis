import { genesisGetJson, genesisPostJson, genesisPutJson } from './client'
import { parseGenesisGuardrails, parseNotificationPrefs } from './settingsApiHelpers'
import type { BillingUpgradeBody, GenesisGuardrails, NotificationPrefs } from '../../types/tenantSettings'

function requireDataObject<T extends Record<string, unknown>>(data: unknown, label: string): T {
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    throw new Error(`Invalid ${label} response`)
  }
  return data as T
}

/** GET/PUT `/api/v1/settings/guardrails` */
export async function fetchSettingsGuardrails(): Promise<GenesisGuardrails> {
  const envelope = await genesisGetJson<Record<string, unknown>>('/api/v1/settings/guardrails')
  return parseGenesisGuardrails(requireDataObject(envelope.data, 'guardrails'))
}

export async function putSettingsGuardrails(body: GenesisGuardrails): Promise<GenesisGuardrails> {
  const envelope = await genesisPutJson<Record<string, unknown>>('/api/v1/settings/guardrails', { body })
  return parseGenesisGuardrails(requireDataObject(envelope.data, 'guardrails update'))
}

/** GET/PUT `/api/v1/settings/notification-prefs` */
export async function fetchNotificationPrefs(): Promise<NotificationPrefs> {
  const envelope = await genesisGetJson<Record<string, unknown>>('/api/v1/settings/notification-prefs')
  return parseNotificationPrefs(requireDataObject(envelope.data, 'notification prefs'))
}

export async function putNotificationPrefs(body: NotificationPrefs): Promise<NotificationPrefs> {
  const envelope = await genesisPutJson<Record<string, unknown>>('/api/v1/settings/notification-prefs', { body })
  return parseNotificationPrefs(requireDataObject(envelope.data, 'notification prefs update'))
}

/** GET `/api/v1/settings/billing` */
export async function fetchSettingsBilling(): Promise<Record<string, unknown>> {
  const envelope = await genesisGetJson<Record<string, unknown>>('/api/v1/settings/billing')
  return requireDataObject(envelope.data, 'billing')
}

/** GET `/api/v1/settings/billing/plan` */
export async function fetchBillingPlan(): Promise<Record<string, unknown>> {
  const envelope = await genesisGetJson<Record<string, unknown>>('/api/v1/settings/billing/plan')
  return requireDataObject(envelope.data, 'billing plan')
}

/** POST `/api/v1/settings/billing/upgrade` */
export async function postBillingUpgrade(body: BillingUpgradeBody): Promise<Record<string, unknown>> {
  const envelope = await genesisPostJson<Record<string, unknown>>('/api/v1/settings/billing/upgrade', { body })
  if (envelope.data != null && typeof envelope.data === 'object' && !Array.isArray(envelope.data)) {
    return envelope.data as Record<string, unknown>
  }
  return {}
}
