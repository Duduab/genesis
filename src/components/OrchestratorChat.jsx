import { useState, useRef, useEffect } from 'react'
import {
  X,
  Paperclip,
  SendHorizonal,
  Minus,
  CheckCheck,
} from 'lucide-react'
import { useI18n } from '../i18n/I18nContext'
import ActionApprovalCard, { mockActionCards } from './ActionApprovalCard'
import DocumentRequestCard, { mockDocRequests } from './DocumentRequestCard'
import AILoadingIndicator from './AILoadingIndicator'

const AI_AVATAR = '/logos/logo-icon.png'

const messageTemplate = [
  { id: 1, role: 'ai',          tKey: 'chatConversation.msg1', time: '10:30 AM' },
  { id: 2, role: 'user',        tKey: 'chatConversation.msg2', time: '10:31 AM' },
  { id: 3, role: 'ai',          tKey: 'chatConversation.msg3', time: '10:31 AM' },
  { id: 4, role: 'user',        tKey: 'chatConversation.msg4', time: '10:32 AM' },
  { id: 5, role: 'ai',          tKey: 'chatConversation.msg5', time: '10:32 AM' },
  { id: 6, role: 'ai',          tKey: 'chatConversation.msg6', time: '10:35 AM' },
  { id: 7, role: 'action-card', cardData: mockActionCards[0],  time: '10:35 AM' },
  { id: 8, role: 'ai',          tKey: 'chatConversation.msg7', time: '10:36 AM' },
  { id: 9, role: 'action-card', cardData: mockActionCards[1],  time: '10:36 AM' },
  { id: 10, role: 'ai',         tKey: 'chatConversation.msg8', time: '10:38 AM' },
  { id: 11, role: 'doc-request', docData: mockDocRequests[0],  time: '10:38 AM' },
]

function buildMessages(t) {
  return messageTemplate.map((msg) => {
    if (msg.tKey) return { ...msg, text: t(msg.tKey) }
    return msg
  })
}

function formatText(text) {
  return text.split('\n').map((line, i) => {
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

// TypingIndicator replaced by AILoadingIndicator

function MessageBubble({ message, onCardAction, onDocUploaded }) {
  const isUser = message.role === 'user'
  const isActionCard = message.role === 'action-card'
  const isDocRequest = message.role === 'doc-request'

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

  if (isActionCard) {
    return (
      <div className="animate-slide-up-fade flex items-end gap-2.5">
        <img
          src={AI_AVATAR}
          alt="Orchestrator Agent"
          className="h-7 w-7 shrink-0 rounded-full bg-genesis-50 object-contain p-0.5 ring-2 ring-genesis-200/60"
          style={{ aspectRatio: 'auto' }}
        />
        <div className="flex min-w-0 max-w-[88%] flex-col gap-1">
          <ActionApprovalCard data={message.cardData} onAction={onCardAction} />
          <span className="ps-1 text-[10px] text-surface-400">{message.time}</span>
        </div>
      </div>
    )
  }

  if (isDocRequest) {
    return (
      <div className="animate-slide-up-fade flex items-end gap-2.5">
        <img
          src={AI_AVATAR}
          alt="Orchestrator Agent"
          className="h-7 w-7 shrink-0 rounded-full bg-genesis-50 object-contain p-0.5 ring-2 ring-genesis-200/60"
          style={{ aspectRatio: 'auto' }}
        />
        <div className="flex min-w-0 max-w-[88%] flex-col gap-1">
          <DocumentRequestCard data={message.docData} onUploaded={onDocUploaded} />
          <span className="ps-1 text-[10px] text-surface-400">{message.time}</span>
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
  const [messages, setMessages] = useState(() => buildMessages(t))
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const scrollRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    setMessages(buildMessages(t))
  }, [locale, t])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, isTyping])

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 300)
    }
  }, [open])

  const getTimeStr = () =>
    new Date().toLocaleTimeString(locale === 'he' ? 'he-IL' : 'en-US', { hour: 'numeric', minute: '2-digit' })

  const handleDocUploaded = (docId, fileName) => {
    setIsTyping(true)
    setTimeout(() => {
      setIsTyping(false)
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          role: 'ai',
          text: t('chatConversation.responseDocReceived'),
          time: getTimeStr(),
        },
      ])
    }, 2000)
  }

  const handleCardAction = (action, cardId) => {
    const responseText = action === 'approved'
      ? t('chatConversation.responseApproved')
      : t('chatConversation.responseRejected')

    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { id: Date.now(), role: 'ai', text: responseText, time: getTimeStr() },
      ])
    }, 600)
  }

  const handleSend = () => {
    const trimmed = input.trim()
    if (!trimmed) return

    const userMsg = {
      id: Date.now(),
      role: 'user',
      text: trimmed,
      time: getTimeStr(),
    }

    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setIsTyping(true)

    setTimeout(() => {
      setIsTyping(false)
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          role: 'ai',
          text: t('chatConversation.responseGeneric'),
          time: getTimeStr(),
        },
      ])
    }, 2200)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-50 bg-black/30 backdrop-blur-sm transition-opacity duration-300 ${
          open ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className={`fixed end-0 top-0 z-50 flex h-full w-full flex-col bg-surface-50 shadow-2xl transition-transform duration-300 ease-out sm:w-[480px] ${
          open ? 'translate-x-0' : 'ltr:translate-x-full rtl:-translate-x-full'
        }`}
      >
        {/* Header */}
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
                <span className="text-xs text-surface-400">{t('chat.online')} — 3 {t('chat.agentsActive')}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-surface-400 transition-colors hover:bg-surface-100 hover:text-surface-600"
            >
              <Minus className="h-4 w-4" />
            </button>
            <button
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-surface-400 transition-colors hover:bg-surface-100 hover:text-surface-600"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto px-5 py-5"
        >
          {/* System welcome card */}
          <div className="mb-5 rounded-xl border border-genesis-200/60 bg-gradient-to-br from-genesis-50 to-white p-4 text-center">
            <div className="mx-auto mb-2 flex h-11 w-11 items-center justify-center rounded-full bg-genesis-50">
              <img src="/logos/logo-icon.png" alt="Orchestrator Agent" className="h-8 w-8 object-contain" style={{ aspectRatio: 'auto' }} />
            </div>
            <p className="text-xs font-semibold text-genesis-700">{t('chat.orchestratorTitle')}</p>
            <p className="mt-0.5 text-[11px] text-surface-400">
              {t('chat.assistantSubtitle')}
            </p>
          </div>

          <div className="flex flex-col gap-4">
            {messages.map((msg) => (
              <MessageBubble
                key={msg.id}
                message={msg}
                onCardAction={handleCardAction}
                onDocUploaded={handleDocUploaded}
              />
            ))}
            {isTyping && <AILoadingIndicator />}
          </div>
        </div>

        {/* Input area */}
        <div className="border-t border-surface-200 bg-white p-4">
          <div className="flex items-end gap-2">
            <button className="mb-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-surface-400 transition-colors hover:bg-surface-100 hover:text-surface-600">
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
                className="w-full resize-none rounded-xl border border-surface-200 bg-surface-50 px-4 py-2.5 pe-12 text-sm text-surface-700 placeholder:text-surface-400 outline-none transition-all focus:border-genesis-400 focus:bg-white focus:ring-2 focus:ring-genesis-100"
                style={{ maxHeight: '120px' }}
                onInput={(e) => {
                  e.target.style.height = 'auto'
                  e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px'
                }}
              />
            </div>

            <button
              onClick={handleSend}
              disabled={!input.trim()}
              className="btn-authora-gradient btn-authora-gradient--on-dark mb-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-all disabled:opacity-40 disabled:shadow-none"
            >
              <SendHorizonal className="h-[18px] w-[18px]" />
            </button>
          </div>
          <p className="mt-2 text-center text-[10px] text-surface-400">
            {t('chat.disclaimer')}
          </p>
        </div>
      </div>
    </>
  )
}
