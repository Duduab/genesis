import { useState, useRef } from 'react'
import {
  CloudUpload,
  FileText,
  CheckCircle2,
  Pause,
  Loader,
  X,
} from 'lucide-react'
import { useI18n } from '../i18n/I18nContext'

const phases = {
  idle: 'idle',
  dragover: 'dragover',
  uploading: 'uploading',
  success: 'success',
}

export default function DocumentRequestCard({ data, onUploaded }) {
  const { t } = useI18n()
  const [phase, setPhase] = useState(phases.idle)
  const [file, setFile] = useState(null)
  const inputRef = useRef(null)

  const processFile = (f) => {
    setFile(f)
    setPhase(phases.uploading)

    setTimeout(() => {
      setPhase(phases.success)
      onUploaded?.(data.id, f.name)
    }, 1800)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    const f = e.dataTransfer.files?.[0]
    if (f) processFile(f)
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setPhase(phases.dragover)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setPhase(phases.idle)
  }

  const handleBrowse = () => inputRef.current?.click()

  const handleFileChange = (e) => {
    const f = e.target.files?.[0]
    if (f) processFile(f)
  }

  const handleRemove = () => {
    setFile(null)
    setPhase(phases.idle)
    if (inputRef.current) inputRef.current.value = ''
  }

  const isInteractive = phase === phases.idle || phase === phases.dragover
  const fileSize = file ? (file.size / 1024).toFixed(0) + ' KB' : ''

  return (
    <div className="w-full overflow-hidden rounded-xl border border-amber-200 bg-white shadow-sm">
      {/* Warning accent bar */}
      <div className="h-1 w-full bg-gradient-to-r from-amber-400 to-orange-400" />

      <div className="p-4">
        {/* Header */}
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-50 ring-1 ring-amber-200">
            <Pause className="h-[18px] w-[18px] text-amber-600" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <h3 className="text-[13px] font-bold leading-snug text-surface-900">
                {data.title}
              </h3>
              <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-700 ring-1 ring-inset ring-amber-500/20">
                <Pause className="h-2.5 w-2.5" />
                {t('chat.paused')}
              </span>
            </div>
            <p className="mt-0.5 text-[11px] text-surface-400">{data.agent} · {data.entity}</p>
          </div>
        </div>

        {/* Description */}
        <div className="mt-3 rounded-lg border border-amber-100 bg-amber-50/50 px-3 py-2.5">
          <p className="text-xs leading-relaxed text-amber-800">{data.description}</p>
        </div>

        {/* Required document label */}
        <div className="mt-3 flex items-center gap-2">
          <FileText className="h-3.5 w-3.5 text-surface-400" />
          <span className="text-[11px] font-semibold uppercase tracking-wider text-surface-400">
            {t('documentRequest.requiredDocument')}
          </span>
        </div>
        <p className="mt-1 text-xs font-medium text-surface-600">{data.documentName}</p>
        {data.acceptedFormats && (
          <p className="mt-0.5 text-[10px] text-surface-400">
            {t('documentRequest.acceptedFormats')}: {data.acceptedFormats}
          </p>
        )}

        {/* Upload zone / success state */}
        <div className="mt-3">
          {isInteractive && (
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={handleBrowse}
              className={`group flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-4 py-5 transition-all ${
                phase === phases.dragover
                  ? 'border-genesis-400 bg-genesis-50/60'
                  : 'border-surface-300 bg-surface-50 hover:border-genesis-300 hover:bg-genesis-50/30'
              }`}
            >
              <input
                ref={inputRef}
                type="file"
                accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                className="hidden"
                onChange={handleFileChange}
              />
              <div className={`flex h-11 w-11 items-center justify-center rounded-full transition-colors ${
                phase === phases.dragover
                  ? 'bg-genesis-100 text-genesis-600'
                  : 'bg-surface-100 text-surface-400 group-hover:bg-genesis-100 group-hover:text-genesis-600'
              }`}>
                <CloudUpload className="h-5 w-5" />
              </div>
              <p className="mt-2 text-xs font-medium text-surface-600">
                {phase === phases.dragover ? t('chat.dropHere') : t('chat.dragDrop')}
              </p>
              {phase !== phases.dragover && (
                <p className="mt-0.5 text-xs">
                  <span className="font-semibold text-genesis-600 underline decoration-genesis-300 underline-offset-2">
                    {t('chat.clickBrowse')}
                  </span>
                </p>
              )}
              <p className="mt-1.5 text-[10px] text-surface-400">{t('documentRequest.maxSize')}</p>
            </div>
          )}

          {phase === phases.uploading && (
            <div className="flex items-center gap-3 rounded-xl border border-genesis-200 bg-genesis-50/50 px-4 py-3.5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-genesis-100">
                <FileText className="h-5 w-5 text-genesis-600" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-semibold text-surface-800">{file?.name}</p>
                <div className="mt-1.5 flex items-center gap-2">
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-genesis-200">
                    <div className="h-full w-2/3 animate-pulse rounded-full bg-genesis-500" />
                  </div>
                  <Loader className="h-3.5 w-3.5 animate-spin text-genesis-500" />
                </div>
                <p className="mt-1 text-[10px] text-surface-400">{t('documentRequest.uploading')}</p>
              </div>
            </div>
          )}

          {phase === phases.success && (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-3.5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white ring-1 ring-emerald-200">
                  <FileText className="h-5 w-5 text-red-500" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-semibold text-surface-800">{file?.name}</p>
                  <p className="mt-0.5 text-[10px] text-surface-400">{fileSize}</p>
                </div>
                <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-500" />
                <button
                  onClick={handleRemove}
                  className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-surface-400 transition-colors hover:bg-surface-100 hover:text-surface-600"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
              <div className="mt-2.5 flex items-center gap-2 rounded-lg bg-emerald-100/60 px-2.5 py-1.5">
                <div className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                </div>
                <p className="text-[11px] font-medium text-emerald-700">
                  {t('documentRequest.docReceived')}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export const mockDocRequests = [
  {
    id: 'doc-1',
    title: 'Action Paused: Missing Document',
    agent: 'TaxFin-Agent',
    entity: 'Apex Dynamics Ltd.',
    description:
      'VAT registration cannot proceed without a valid lease agreement for the registered business address. Please upload the signed lease to resume processing.',
    documentName: 'Lease Agreement (Registered Address)',
    acceptedFormats: 'PDF, DOC, DOCX — Max 10 MB',
  },
]
