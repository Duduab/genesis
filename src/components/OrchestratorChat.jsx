import { useState, useRef, useEffect, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  X,
  Paperclip,
  SendHorizonal,
  Minus,
  CheckCheck,
} from 'lucide-react'
import { useI18n } from '../i18n/I18nContext'
import { useOrchestratorBusinessId } from '../hooks/useOrchestratorBusinessId'
import { fetchChatMessages, postChatMessage } from '../api/genesis/businessChatApi'
import { POLL_MS_INTERACTIVE, refetchIntervalWithVisibilityAndBackoff } from '../lib/genesisPolling'
import AILoadingIndicator from './AILoadingIndicator'

const AI_AVATAR = '/logos/logo-icon.png'

function formatText(text) {
  return String(text || '')
    .split('\n')
    .map((line, i) => {
      const formatted = line
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/`(.+?)`/g, '<code class="rounded bg-genesis-100 px-1 py-0.5 text-xs font-mono text-genesis-700">$1</code>')

      return (
        <span key={i}>
          {i > 0 && <br />}
          <span dangerouslySetInnerHTML={{ __html: formatted }} />
        </span>
      )
    })
}

function formatMessageTime(iso, locale) {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleTimeString(locale === 'he' ? 'he-IL' : 'en-US', { hour: 'numeric', minute: '2-digit' })
}

function MessageBubble({ message }) {
  const isUser = message.role === 'user'

  if (isUser) {
    return (
      <div className="animate-slide-up-fade flex flex-col items-end gap-1">
        <div className="max-w-[80%] whitespace-pre-wrap rounded-2xl rounded-ee-sm bg-gradient-to-br from-genesis-700 to-genesis-600 px-4 py-3 text-sm leading-relaxed text-white shadow-md shadow-genesis-600/15">
          {formatText(message.text)}
        </div>
        <div className="flex items-center gap-1 pe-1">
          <span className="text-[10px] text-surface-400">{message.time}</span>
          <CheckCheck className="h-3 w-3 text-genesis-400" />
        </div>
      </div>
    )
  }

  return (
    <div className="animate-slide-up-fade flex items-end gap-2.5">
      <img
        src={AI_AVATAR}
        alt="Orchestrator Agent"
        className="h-7 w-7 shrink-0 rounded-full bg-genesis-50 object-contain p-0.5 ring-2 ring-genesis-200/60"
        style={{ aspectRatio: 'auto' }}
      />
      <div className="flex max-w-[80%] flex-col gap-1">
        <div className="whitespace-pre-wrap rounded-2xl rounded-es-sm bg-white px-4 py-3 text-sm leading-relaxed text-surface-700 shadow-sm ring-1 ring-surface-200/60">
          {formatText(message.text)}
        </div>
        <span className="ps-1 text-[10px] text-surface-400">{message.time}</span>
      </div>
    </div>
  )
}

export default function OrchestratorChat({ open, onClose }) {
  const { t, locale } = useI18n()
  const businessId = useOrchestratorBusinessId()
  const qc = useQueryClient()
  const [input, setInput] = useState('')
  const scrollRef = useRef(null)
  const inputRef = useRef(null)

  const messagesQuery = useQuery({
    queryKey: ['chat-messages', businessId],
    queryFn: () => fetchChatMessages(businessId, { limit: 100 }),
    enabled: Boolean(open && businessId),
    refetchInterval: open && businessId ? refetchIntervalWithVisibilityAndBackoff(POLL_MS_INTERACTIVE) : false,
  })

  const messages = useMemo(() => {
    const items = messagesQuery.data?.items ?? []
    const sorted = [...items].sort((a, b) => {
      const ta = new Date(a.created_at || 0).getTime()
      const tb = new Date(b.created_at || 0).getTime()
      return ta - tb
    })
    return sorted.map((m) => ({
      id: m.message_id,
      role: m.role === 'user' ? 'user' : 'ai',
      text: m.content || m.text || '',
      time: formatMessageTime(m.created_at, locale),
    }))
  }, [messagesQuery.data?.items, locale])

  const sendMutation = useMutation({
    mutationFn: (text) => postChatMessage(businessId, text),
    onSuccess: async () => {
      if (businessId) await qc.invalidateQueries({ queryKey: ['chat-messages', businessId] })
    },
  })

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, sendMutation.isPending, open])

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 300)
    }
  }, [open])

  const handleSend = () => {
    const trimmed = input.trim()
    if (!trimmed || !businessId) return
    setInput('')
    sendMutation.mutate(trimmed)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <>
      <div
        className={`fixed inset-0 z-50 bg-black/30 backdrop-blur-sm transition-opacity duration-300 ${
          open ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={onClose}
      />

      <div
        className={`fixed end-0 top-0 z-50 flex h-full w-full flex-col bg-surface-50 shadow-2xl transition-transform duration-300 ease-out sm:w-[480px] ${
          open ? 'translate-x-0' : 'ltr:translate-x-full rtl:-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between border-b border-surface-200 bg-white px-5 py-3.5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-genesis-50 shadow-lg shadow-genesis-500/15 ring-1 ring-genesis-200/60">
              <img src="/logos/logo-icon.png" alt="Orchestrator Agent" className="h-7 w-7 object-contain" style={{ aspectRatio: 'auto' }} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-surface-900">{t('chat.orchestratorTitle')}</h2>
              <div className="flex items-center gap-1.5">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                </span>
                <span className="text-xs text-surface-400">{t('chat.online')}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-surface-400 transition-colors hover:bg-surface-100 hover:text-surface-600"
            >
              <Minus className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-surface-400 transition-colors hover:bg-surface-100 hover:text-surface-600"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-5">
          <div className="mb-5 rounded-xl border border-genesis-200/60 bg-gradient-to-br from-genesis-50 to-white p-4 text-center">
            <div className="mx-auto mb-2 flex h-11 w-11 items-center justify-center rounded-full bg-genesis-50">
              <img src="/logos/logo-icon.png" alt="Orchestrator Agent" className="h-8 w-8 object-contain" style={{ aspectRatio: 'auto' }} />
            </div>
            <p className="text-xs font-semibold text-genesis-700">{t('chat.orchestratorTitle')}</p>
            <p className="mt-0.5 text-[11px] text-surface-400">{t('chat.assistantSubtitle')}</p>
          </div>

          {!businessId ? (
            <p className="rounded-lg border border-surface-200 bg-white px-3 py-2 text-center text-xs text-surface-500">{t('chat.selectBusiness')}</p>
          ) : null}

          {messagesQuery.isError ? (
            <p className="mt-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-center text-xs text-red-700">{t('chat.loadFailed')}</p>
          ) : null}

          <div className="flex flex-col gap-4">
            {messages.map((msg) => (
              <MessageBubble key={msg.id} message={msg} />
            ))}
            {sendMutation.isPending ? <AILoadingIndicator /> : null}
          </div>
        </div>

        <div className="border-t border-surface-200 bg-white p-4">
          <div className="flex items-end gap-2">
            <button
              type="button"
              className="mb-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-surface-400 transition-colors hover:bg-surface-100 hover:text-surface-600"
            >
              <Paperclip className="h-[18px] w-[18px]" />
            </button>

            <div className="relative flex-1">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={t('chat.typeMessage')}
                rows={1}
                disabled={!businessId || sendMutation.isPending}
                className="w-full resize-none rounded-xl border border-surface-200 bg-surface-50 px-4 py-2.5 pe-12 text-sm text-surface-700 placeholder:text-surface-400 outline-none transition-all focus:border-genesis-400 focus:bg-white focus:ring-2 focus:ring-genesis-100 disabled:opacity-50"
                style={{ maxHeight: '120px' }}
                onInput={(e) => {
                  e.target.style.height = 'auto'
                  e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`
                }}
              />
            </div>

            <button
              type="button"
              onClick={handleSend}
              disabled={!input.trim() || !businessId || sendMutation.isPending}
              className="btn-authora-gradient btn-authora-gradient--on-dark mb-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-all disabled:opacity-40 disabled:shadow-none"
            >
              <SendHorizonal className="h-[18px] w-[18px]" />
            </button>
          </div>
          <p className="mt-2 text-center text-[10px] text-surface-400">{t('chat.disclaimer')}</p>
        </div>
      </div>
    </>
  )
}
