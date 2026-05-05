import type { OrganizationMemberRow, OrganizationSummary } from '../../types/organization'
import { genesisGetJson, genesisListJson, genesisPostJson, genesisRequestJson } from './client'

export async function fetchOrganizationsList(): Promise<{ items: OrganizationSummary[] }> {
  const envelope = await genesisListJson<OrganizationSummary>('/api/v1/organizations')
  return { items: Array.isArray(envelope.data) ? envelope.data : [] }
}

export async function fetchOrganizationById(organizationId: string): Promise<OrganizationSummary> {
  const id = encodeURIComponent(organizationId.trim())
  const envelope = await genesisGetJson<OrganizationSummary>(`/api/v1/organizations/${id}`)
  if (!envelope.data?.organization_id) throw new Error('Invalid organization response')
  return envelope.data
}

export async function patchOrganizationName(organizationId: string, name: string): Promise<void> {
  const id = encodeURIComponent(organizationId.trim())
  await genesisRequestJson<unknown>({
    path: `/api/v1/organizations/${id}`,
    method: 'PATCH',
    body: { name: name.trim() },
  })
}

export async function fetchOrganizationMembers(organizationId: string): Promise<OrganizationMemberRow[]> {
  const id = encodeURIComponent(organizationId.trim())
  const envelope = await genesisListJson<OrganizationMemberRow>(`/api/v1/organizations/${id}/members`)
  return Array.isArray(envelope.data) ? envelope.data : []
}

export async function postOrganizationMember(
  organizationId: string,
  body: { email: string; role: 'owner' | 'member' },
): Promise<void> {
  const id = encodeURIComponent(organizationId.trim())
  const idempotencyKey =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `org-member-${Date.now()}`
  await genesisPostJson<unknown>(`/api/v1/organizations/${id}/members`, {
    body: { email: body.email.trim(), role: body.role },
    idempotencyKey,
  })
}

export async function deleteOrganizationMember(organizationId: string, memberUserId: string): Promise<void> {
  const oid = encodeURIComponent(organizationId.trim())
  const uid = encodeURIComponent(memberUserId.trim())
  await genesisRequestJson<unknown>({
    path: `/api/v1/organizations/${oid}/members/${uid}`,
    method: 'DELETE',
  })
}

export async function patchOrganizationMemberRole(
  organizationId: string,
  memberUserId: string,
  role: 'owner' | 'member',
): Promise<void> {
  const oid = encodeURIComponent(organizationId.trim())
  const uid = encodeURIComponent(memberUserId.trim())
  await genesisRequestJson<unknown>({
    path: `/api/v1/organizations/${oid}/members/${uid}`,
    method: 'PATCH',
    body: { role },
  })
}
