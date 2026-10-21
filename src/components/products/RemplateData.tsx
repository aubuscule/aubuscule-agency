'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'

/* ── Data ─────────────────────────────────────────────────────────── */

export const DEVICES = [
  { id: 'rm2',   label: 'reMarkable 2',   dims: '1404 × 1872 px · 226 DPI' },
  { id: 'pure',  label: 'Paper Pure',     dims: '1404 × 1872 px · 226 DPI' },
  { id: 'pp',    label: 'Paper Pro',      dims: '1620 × 2160 px · 229 DPI' },
  { id: 'move',  label: 'Paper Pro Move', dims: '954 × 1696 px · 264 DPI' },
] as const

export const PACKS = [
  {
    id: 'future-log',
    tKey: 'future',
    type: 'single' as const,
    file: 'future-log.png',
  },
  {
    id: 'daily-log',
    tKey: 'daily',
    type: 'single' as const,
    file: 'daily-log.png',
  },
  {
    id: 'monthly-log-bundle',
    tKey: 'monthly',
    type: 'bundle' as const,
    files: [
      { file: 'monthly-log-28.png', tKey: '28' },
      { file: 'monthly-log-29.png', tKey: '29' },
      { file: 'monthly-log-30.png', tKey: '30' },
      { file: 'monthly-log-31.png', tKey: '31' },
      { file: 'monthly-actions.png', tKey: 'actions' },
    ],
  },
] as const

/* ── FAQ accordion ────────────────────────────────────────────────── */

export function FAQItem({
  question,
  answer,
  open,
  onToggle,
}: {
  question: React.ReactNode
  answer: React.ReactNode
  open: boolean
  onToggle: () => void
}) {
  return (
    <div className={`app-faq-item${open ? ' open' : ''}`}>
      <button
        type="button"
        className="app-faq-question"
        onClick={onToggle}
        aria-expanded={open}
      >
        <span>{question}</span>
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          className="app-faq-chevron"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      {open && (
        <div className="app-faq-answer">
          {answer}
        </div>
      )}
    </div>
  )
}

/* ── Template pack card ───────────────────────────────────────────── */

export function PackCard({
  pack,
  deviceId,
  onPreview,
}: {
  pack: (typeof PACKS)[number]
  deviceId: string
  onPreview: (src: string) => void
}) {
  const t = useTranslations('remplate.templates')
  const pathFor = (file: string) => `/apps/remplate/templates/${deviceId}/${file}`
  const [bundleOpen, setBundleOpen] = useState(false)

  const previewSrc = pack.type === 'single' ? pathFor(pack.file) : pathFor(pack.files[0].file)

  const title = t(`packs.${pack.tKey}.title`)
  const desc = t(`packs.${pack.tKey}.desc`)
  const meta = t.raw(`packs.${pack.tKey}.meta`) as string[]

  return (
    <article className="rmp-pack">
      <div className="rmp-pack-preview">
        {pack.type === 'single' ? (
          <>
            <span className="rmp-pack-tag">{t('tagSingle')}</span>
            <div className="rmp-pack-single">
              <img
                src={previewSrc}
                alt={`${title} preview`}
                className="rmp-pack-img"
                loading="lazy"
              />
            </div>
          </>
        ) : (
          <>
            <span className="rmp-pack-tag rmp-pack-tag--bundle">{t('tagBundle', { count: pack.files.length })}</span>
            <div className="rmp-pack-stack">
              {pack.files.map((f, i) => (
                <img
                  key={f.file}
                  src={pathFor(f.file)}
                  alt=""
                  className="rmp-pack-sheet"
                  style={{ zIndex: i + 1 }}
                  loading="lazy"
                />
              ))}
            </div>
            <span className="rmp-stack-count">{t('templateCount', { count: pack.files.length })}</span>
          </>
        )}
      </div>

      <div className="rmp-pack-body">
        <h3 className="rmp-pack-title">{title}</h3>
        <p className="rmp-pack-desc">{desc}</p>
        <div className="rmp-pack-meta">
          {meta.map(m => (
            <span key={m} className="rmp-meta-pill">{m}</span>
          ))}
          <span className="rmp-meta-pill">
            {DEVICES.find(d => d.id === deviceId)?.dims}
          </span>
        </div>
        <div className="rmp-pack-actions">
          {pack.type === 'single' ? (
            <a className="btn-primary" href={pathFor(pack.file)} download>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              {t('downloadPng')}
            </a>
          ) : (
            <button type="button" className="btn-primary" onClick={() => {
              pack.files.forEach((f, i) => {
                setTimeout(() => {
                  const a = document.createElement('a')
                  a.href = pathFor(f.file)
                  a.download = f.file
                  document.body.appendChild(a)
                  a.click()
                  a.remove()
                }, i * 200)
              })
            }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              {t('downloadPngs', { count: pack.files.length })}
            </button>
          )}
          <button
            type="button"
            className="btn-secondary"
            onClick={() => onPreview(previewSrc)}
            aria-label={t('lightboxLabel')}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          </button>
        </div>

        {pack.type === 'bundle' && (
          <>
            <button
              type="button"
              className={`rmp-bundle-toggle${bundleOpen ? ' open' : ''}`}
              onClick={() => setBundleOpen(o => !o)}
            >
              {t('viewAllTemplates', { count: pack.files.length })}
              <span className="rmp-bundle-arrow">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </span>
            </button>
            {bundleOpen && (
              <div className="rmp-bundle-list">
                {pack.files.map(f => (
                  <div key={f.file} className="rmp-bundle-item">
                    <div className="rmp-bundle-thumb">
                      <img src={pathFor(f.file)} alt="" loading="lazy" />
                    </div>
                    <div className="rmp-bundle-name">
                      {t(`packs.${pack.tKey}.files.${f.tKey}.name`)}
                      <span className="rmp-bundle-sub">{t(`packs.${pack.tKey}.files.${f.tKey}.sub`)}</span>
                    </div>
                    <a className="rmp-bundle-dl" href={pathFor(f.file)} download>
                      PNG
                    </a>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </article>
  )
}
