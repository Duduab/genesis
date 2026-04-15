import { genesisRequestJson } from './client'
import { resolveAdminPanelApiBearerToken } from './adminBearer'
import type { GenesisApiMeta, GenesisEnvelopeSingle } from './types'

async function bearer() {
  return (await resolveAdminPanelApiBearerToken()) ?? undefined
}

export type AdminUserRole = 'admin' | 'operator' | 'entrepreneur'

export type AdminUserListRow = {
  user_id: string
  email?: string | null
  display_name?: string | null
  role?: string | null
  last_login?: string | null
  phone?: string | null
  language?: string | null
  created_at?: string | null
}

export type UsersListResponse = {
  data: AdminUserListRow[]
  meta: GenesisApiMeta
  pagination?: {
    next_cursor?: string | null
    has_more?: boolean
    count?: number
  }
}

export async function fetchUsersList(params: { limit?: number; offset?: number }): Promise<UsersListResponse> {
  const sp = new URLSearchParams()
  if (params.limit != null) sp.set('limit', String(params.limit))
  if (params.offset != null) sp.set('offset', String(params.offset))
  const qs = sp.toString()
  return genesisRequestJson<UsersListResponse>({
    path: `/api/v1/users${qs ? `?${qs}` : ''}`,
    method: 'GET',
    bearerToken: await bearer(),
  })
}

export type AdminUserDetail = AdminUserListRow & {
  dark_mode?: boolean
}

export async function fetchUserById(userId: string): Promise<GenesisEnvelopeSingle<AdminUserDetail>> {
  return genesisRequestJson<GenesisEnvelopeSingle<AdminUserDetail>>({
    path: `/api/v1/users/${encodeURIComponent(userId)}`,
    method: 'GET',
    bearerToken: await bearer(),
  })
}

export type InviteUserBody = { email: string; display_name?: string }

export async function inviteUser(
  body: InviteUserBody,
): Promise<GenesisEnvelopeSingle<{ action?: string; resource_id?: string; status?: string }>> {
  return genesisRequestJson({
    path: '/api/v1/users/invite',
    method: 'POST',
    body,
    bearerToken: await bearer(),
  })
}

export async function putUserRole(
  userId: string,
  role: AdminUserRole,
): Promise<GenesisEnvelopeSingle<{ action?: string; resource_id?: string; status?: string; role?: string }>> {
  return genesisRequestJson({
    path: `/api/v1/users/${encodeURIComponent(userId)}/role`,
    method: 'PUT',
    body: { role },
    bearerToken: await bearer(),
  })
}

export async function deleteUser(userId: string): Promise<void> {
  await genesisRequestJson<unknown>({
    path: `/api/v1/users/${encodeURIComponent(userId)}`,
    method: 'DELETE',
    bearerToken: await bearer(),
  })
}
