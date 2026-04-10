'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'

import { Badge } from '@/components/ui/badge'
import type {
  ProductNoticePriority,
  ProductReleaseChannel,
  ProductWebsiteUpdateNotice,
} from '@/lib/obj15-product-website'

interface Obj15UpdateHintsProps {
  currentVersion: string
  notices: ProductWebsiteUpdateNotice[]
  checkedAt: string
}

const STORAGE_PREFIX = 'obj15.dismissed.notices'

const priorityBadgeClasses: Record<ProductNoticePriority, string> = {
  critical: 'border-rose-300 bg-rose-100 text-rose-900',
  important: 'border-amber-300 bg-amber-100 text-amber-900',
  info: 'border-sky-300 bg-sky-100 text-sky-900',
}

const priorityLabels: Record<ProductNoticePriority, string> = {
  critical: 'Kritisch',
  important: 'Wichtig',
  info: 'Info',
}

const channelLabels: Record<ProductReleaseChannel, string> = {
  released: 'Released (GA)',
  beta: 'Beta',
  preview: 'Preview',
}

function getStorageKey(version: string): string {
  return `${STORAGE_PREFIX}:${version}`
}

function readDismissedNoticeIds(version: string): Set<string> {
  if (typeof window === 'undefined') {
    return new Set()
  }

  try {
    const raw = window.localStorage.getItem(getStorageKey(version))
    if (!raw) {
      return new Set()
    }

    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed) || parsed.some((item) => typeof item !== 'string')) {
      window.localStorage.removeItem(getStorageKey(version))
      return new Set()
    }

    return new Set(parsed)
  } catch {
    window.localStorage.removeItem(getStorageKey(version))
    return new Set()
  }
}

function writeDismissedNoticeIds(version: string, ids: Set<string>): void {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.setItem(getStorageKey(version), JSON.stringify(Array.from(ids)))
}

export function Obj15UpdateHints({
  currentVersion,
  notices,
  checkedAt,
}: Obj15UpdateHintsProps) {
  const [dismissedNoticeIds, setDismissedNoticeIds] = useState<Set<string>>(new Set())

  useEffect(() => {
    setDismissedNoticeIds(readDismissedNoticeIds(currentVersion))
  }, [currentVersion])

  const visibleNotices = useMemo(() => {
    return notices.filter((notice) => {
      if (notice.priority === 'critical') {
        return true
      }

      return !dismissedNoticeIds.has(notice.id)
    })
  }, [dismissedNoticeIds, notices])

  const hasDismissedEntries = dismissedNoticeIds.size > 0

  const onDismissNotice = (noticeId: string) => {
    setDismissedNoticeIds((previous) => {
      const next = new Set(previous)
      next.add(noticeId)
      writeDismissedNoticeIds(currentVersion, next)
      return next
    })
  }

  const onResetDismissals = () => {
    setDismissedNoticeIds(() => {
      window.localStorage.removeItem(getStorageKey(currentVersion))
      return new Set()
    })
  }

  const checkedAtLabel = new Date(checkedAt).toLocaleString('de-CH', {
    dateStyle: 'medium',
    timeStyle: 'short',
  })

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-950">Globale Update-Hinweise</h2>
          <p className="mt-1 text-sm text-slate-600">
            Priorisierung: Kritisch, Wichtig, Info. Kritische Hinweise bleiben sichtbar,
            bis eine neue Version sie abloest.
          </p>
        </div>
        <p className="text-xs text-slate-500">Letzte Pruefung: {checkedAtLabel}</p>
      </div>

      {visibleNotices.length === 0 ? (
        <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
          Keine neuen Hinweise fuer diese Version.
        </div>
      ) : (
        <ul className="mt-4 space-y-3">
          {visibleNotices.map((notice) => (
            <li
              key={notice.id}
              className="rounded-xl border border-slate-200 bg-slate-50 p-4"
            >
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline" className={priorityBadgeClasses[notice.priority]}>
                  {priorityLabels[notice.priority]}
                </Badge>
                <Badge variant="outline">{channelLabels[notice.channel]}</Badge>
                <Badge variant="outline">{notice.version}</Badge>
              </div>

              <h3 className="mt-2 text-base font-semibold text-slate-900">{notice.title}</h3>
              <p className="mt-1 text-sm text-slate-600">{notice.summary}</p>

              <div className="mt-3 flex flex-wrap gap-3">
                <Link
                  href={notice.actionHref}
                  className="rounded-lg bg-slate-900 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-slate-700"
                >
                  {notice.actionLabel}
                </Link>
                {notice.dismissible ? (
                  <button
                    type="button"
                    onClick={() => onDismissNotice(notice.id)}
                    className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 transition-colors hover:border-slate-400 hover:bg-slate-100"
                  >
                    Lokal quittieren
                  </button>
                ) : (
                  <span className="rounded-lg border border-rose-300 bg-rose-50 px-3 py-1.5 text-sm font-medium text-rose-800">
                    Kritisch: nicht ausblendbar
                  </span>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      {hasDismissedEntries ? (
        <div className="mt-4">
          <button
            type="button"
            onClick={onResetDismissals}
            className="text-sm font-medium text-slate-700 underline decoration-slate-300 underline-offset-4 transition-colors hover:text-slate-900"
          >
            Lokale Quittierungen fuer diese Version zuruecksetzen
          </button>
        </div>
      ) : null}
    </section>
  )
}
