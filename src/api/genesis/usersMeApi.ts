import { getGenesisApiBaseUrl } from '../../config/genesisEnv'
import { assertGenesisJsonOk, genesisGetJson, genesisPutJson, genesisRequestJson, resolveGenesisBearerToken } from './client'
import type { GenesisEnvelopeSingle } from './types'
import type { GenesisMeProfile, UpdateMyProfileBody } from '../../types/genesisMeProfile'

function unwrapMe(envelope: GenesisEnvelopeSingle<GenesisMeProfile>): GenesisMeProfile {
  const d = envelope.data
  if (!d || typeof d !== 'object') throw new Error('Invalid users/me response')
  return d
}

export async function fetchMyProfile(): Promise<GenesisMeProfile> {
  const envelope = await genesisGetJson<GenesisMeProfile>('/api/v1/users/me')
  return unwrapMe(envelope)
}

export async function updateMyProfile(body: UpdateMyProfileBody): Promise<GenesisMeProfile> {
  const entries = Object.entries(body).filter(([, v]) => v !== undefined)
  const clean = Object.fromEntries(entries) as UpdateMyProfileBody
  const envelope = await genesisPutJson<GenesisMeProfile>('/api/v1/users/me', { body: clean })
  return unwrapMe(envelope)
}

export async function putMy2fa(enabled: boolean): Promise<void> {
  await genesisRequestJson<unknown>({
    path: '/api/v1/users/me/2fa',
    method: 'PUT',
    body: { enabled },
  })
}

export async function putMyPassword(newPassword: string): Promise<void> {
  await genesisRequestJson<unknown>({
    path: '/api/v1/users/me/password',
    method: 'PUT',
    body: { new_password: newPassword },
  })
}

/** POST multipart `file` — returns public avatar URL from envelope `data.avatar_url`. */
export async function uploadMyAvatar(file: File): Promise<string> {
  const url = `${getGenesisApiBaseUrl()}/api/v1/users/me/avatar`
  const token = await resolveGenesisBearerToken()
  const headers = new Headers()
  if (token) headers.set('Authorization', `Bearer ${token.trim()}`)

  const form = new FormData()
  form.append('file', file)

  const res = await fetch(url, { method: 'POST', body: form, headers })
  const payload = (await res.json().catch(() => null)) as Record<string, unknown> | null

  assertGenesisJsonOk(res, payload)

  const data = payload?.data as { avatar_url?: string } | undefined
  const avatarUrl = data?.avatar_url
  if (!avatarUrl || typeof avatarUrl !== 'string') throw new Error('Missing avatar_url in response')
  return avatarUrl
}
